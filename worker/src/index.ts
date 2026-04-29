import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from 'node:buffer';

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
        const fileExt = imageFile.name?.split('.').pop() || 'jpg';
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
        
        // 2. Call Gemini for AI analysis with Retry Mechanism
        if (!env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY is not configured in the worker environment.');
        }

        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // Only one attempt as requested
        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: imageFile.type || 'image/jpeg'
            }
          }
        ]);

        if (!result) throw new Error('Failed to get response from Gemini');

        const aiResponse = result.response.text();
        console.log("AI Response:", aiResponse);

        // Extract JSON from potential markdown blocks
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        let simulationData;
        try {
          simulationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: aiResponse, nails: [] };
        } catch (e) {
          console.error("JSON Parse Error:", e);
          simulationData = { analysis: aiResponse, nails: [] };
        }

        // 3. Store in D1
        const userId = "anonymous";
        try {
          await env.DB.prepare(
            "INSERT INTO simulations (user_id, image_url, shape, color, ai_response, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(userId, publicUrl, shape, color, simulationData.analysis || aiResponse, new Date().toISOString()).run();
        } catch (dbError) {
          console.error("D1 Error:", dbError);
          // Don't fail the whole request if DB storage fails
        }

        return new Response(JSON.stringify({
          success: true,
          imageUrl: publicUrl,
          analysis: simulationData.analysis || aiResponse,
          nails: simulationData.nails || [],
          shape,
          color
        }), { status: 200, headers: corsHeaders });

      } catch (error: any) {
        console.error("Worker Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ message: 'ThayNails API is active' }), { status: 200, headers: corsHeaders });
  },
};
