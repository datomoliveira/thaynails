import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from 'node:buffer';

export interface Env {
  DB: D1Database;
  AI: any;
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

    // Endpoint: /api/simulate
    if (request.method === 'POST' && url.pathname === '/api/simulate') {
      try {
        console.log("Starting Gemini-only simulation...");

        const requiredEnv = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
        const missingEnv = requiredEnv.filter(key => !env[key as keyof Env]);
        if (missingEnv.length > 0) {
          throw new Error(`Environment variables missing: ${missingEnv.join(', ')}`);
        }

        const formData = await request.formData();
        const imageFile = formData.get('image') as File | Blob;
        const shape = formData.get('shape') as string;
        const color = formData.get('color') as string;

        if (!imageFile) {
          return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400, headers: corsHeaders });
        }

        const imageBuffer = await imageFile.arrayBuffer();
        
        // 1. Upload original image to Supabase
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const fileName = `${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(fileName, imageBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw new Error(`Supabase Error: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from('nail-images').getPublicUrl(fileName);

        // 2. Call Gemini for high-precision coordinates
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Task: Nail Segmentation. 
        Detect the 5 nails in the image. They should be aligned with the template slots.
        Return ONLY a JSON with { "nails": [ { "polygon": [[y,x],...] } ] }. 
        Use 0-1000 normalized coordinates. Be extremely precise.`;

        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { data: Buffer.from(imageBuffer).toString('base64'), mimeType: 'image/jpeg' } }
        ]);

        const aiResponse = result.response.text();
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const simulationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { nails: [] };

        return new Response(JSON.stringify({
          success: true,
          imageUrl: publicUrl,
          analysis: "",
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


