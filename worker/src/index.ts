import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Endpoint: /api/simulate
    if (request.method === 'POST' && url.pathname === '/api/simulate') {
      try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;
        const shape = formData.get('shape') as string;
        const color = formData.get('color') as string;

        if (!imageFile) {
          return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400, headers: corsHeaders });
        }

        // 1. Upload image to Supabase Storage
        let supabaseUrl = env.SUPABASE_URL.trim();
        try {
          const urlObj = new URL(supabaseUrl);
          supabaseUrl = `${urlObj.protocol}//${urlObj.host}`;
        } catch (e) {
          supabaseUrl = supabaseUrl.replace(/\/$/, "");
        }
        
        const supabase = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY);
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const imageBuffer = await imageFile.arrayBuffer();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(fileName, imageBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw new Error(`Supabase Error: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from('nail-images').getPublicUrl(fileName);

        const prompt = `You are a professional nail technician AI. Analyze the hand in the image. 
        1. Identify each fingernail accurately.
        2. For each nail, provide a precise polygon (list of [y, x] points, normalized 0-1000) that outlines the nail perfectly.
        3. Provide a professional analysis of how the shape "${shape}" and color "${color}" would look.
        Return ONLY a JSON object with this structure: { "analysis": "string", "nails": [ { "polygon": [[y, x], ...] } ] }`;
        
        // 2. Call Gemini for AI analysis
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64Image = b64encode(imageBuffer);

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: imageFile.type || 'image/jpeg'
            }
          }
        ]);

        const aiResponse = result.response.text();
        // Extract JSON from potential markdown blocks
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const simulationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: aiResponse, nails: [] };

        // 3. Store in D1
        const userId = "anonymous";
        await env.DB.prepare(
          "INSERT INTO simulations (user_id, image_url, shape, color, ai_response, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(userId, publicUrl, shape, color, simulationData.analysis, new Date().toISOString()).run();

        return new Response(JSON.stringify({
          success: true,
          imageUrl: publicUrl,
          analysis: simulationData.analysis,
          nails: simulationData.nails,
          shape,
          color
        }), { status: 200, headers: corsHeaders });

      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ message: 'ThayNails API is active' }), { status: 200, headers: corsHeaders });
  },
};

// Helper to encode array buffer to base64
function b64encode(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
