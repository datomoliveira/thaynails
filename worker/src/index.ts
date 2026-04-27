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

        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: true
          });

        if (uploadError) throw new Error(`Supabase Upload Error: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from('nail-images').getPublicUrl(fileName);

        // 2. Call Gemini for AI analysis (Simulation description or logic)
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imageBuffer = await imageFile.arrayBuffer();
        const base64Image = b64encode(imageBuffer);

        const prompt = `Analyze this hand and simulate how the nails would look with the shape "${shape}" and the color "${color}". Provide a descriptive result for the simulator.`;
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: imageFile.type
            }
          }
        ]);

        const aiResponse = result.response.text();

        // 3. Store in D1
        const userId = "anonymous"; // Replace with auth if needed
        await env.DB.prepare(
          "INSERT INTO simulations (user_id, image_url, shape, color, ai_response, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(userId, publicUrl, shape, color, aiResponse, new Date().toISOString()).run();

        return new Response(JSON.stringify({
          success: true,
          imageUrl: publicUrl,
          analysis: aiResponse,
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
