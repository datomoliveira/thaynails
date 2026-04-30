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
        console.log("Starting Image-to-Image simulation...");

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
        
        // 1. USE CLOUDFLARE AI for Image-to-Image (Stable Diffusion)
        console.log("Generating realistic image with Stable Diffusion...");
        
        const prompt = `A professional close-up photo of a hand with nails perfectly painted in ${color} color and ${shape} shape. High fashion nail photography, realistic textures, cinematic lighting, 8k resolution.`;
        
        const aiResponse = await env.AI.run(
          "@cf/stabilityai/stable-diffusion-xl-base-1.0",
          {
            prompt: prompt,
            image: [...new Uint8Array(imageBuffer)],
            strength: 0.6, // How much to change the original image (0.6 is good for keeping the hand but changing nails)
            num_steps: 30
          }
        );

        // 2. Upload the NEW image to Supabase
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const fileName = `sim-${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(fileName, aiResponse, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) throw new Error(`Supabase Error: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from('nail-images').getPublicUrl(fileName);

        // 3. Optional: Use Gemini just for the textual analysis
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const analysisResult = await model.generateContent([
          { text: `Analyze this nail simulation: Shape ${shape}, Color ${color}. Provide a short professional compliment.` },
          { inlineData: { data: Buffer.from(imageBuffer).toString('base64'), mimeType: 'image/jpeg' } }
        ]);

        return new Response(JSON.stringify({
          success: true,
          imageUrl: publicUrl, // This is the NEW generated image
          analysis: analysisResult.response.text(),
          nails: [], // No more polygons needed!
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


