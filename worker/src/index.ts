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

    // Endpoint: /api/simulate
    if (request.method === 'POST' && url.pathname === '/api/simulate') {
      try {
        console.log("Starting simulation request...");

        // 0. Validate Environment
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

        // Initialize Supabase
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // 1. Upload image to Supabase Storage
        // Blobs might not have a name, so we use a fallback
        const originalName = (imageFile as File).name || 'image.jpg';
        const fileExt = originalName.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const imageBuffer = await imageFile.arrayBuffer();
        
        console.log(`Uploading image to Supabase: ${fileName}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(fileName, imageBuffer, {
            contentType: imageFile.type || 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          throw new Error(`Supabase Error: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage.from('nail-images').getPublicUrl(fileName);
        console.log("Image uploaded successfully:", publicUrl);

        const prompt = `You are a high-precision computer vision specialist for a beauty app. 
        Your task is to identify and outline EVERY fingernail visible in the image with extreme accuracy.

        COORDINATE SYSTEM:
        - Use a normalized coordinate system from 0 to 1000 for both axes.
        - [0, 0] is the top-left corner of the image.
        - [1000, 1000] is the bottom-right corner.
        - Output coordinates as [y, x] pairs.

        GUIDELINES:
        1. Zoom in mentally on the hand. Identify the 5 fingers if possible.
        2. For each nail, provide a dense polygon (at least 15-20 points) that follows the EXACT curve of the nail bed and the tip.
        3. Ensure the polygon stays strictly within the nail boundaries.
        4. Analyze the requested shape "${shape}" and color "${color}" and describe how they would look on this specific hand.

        OUTPUT FORMAT (JSON ONLY):
        {
          "analysis": "Professional analysis of the look...",
          "nails": [
            { "polygon": [[y1, x1], [y2, x2], ..., [y20, x20]] },
            ... (for each nail)
          ]
        }`;
        
        // 2. Call Gemini for AI analysis
        console.log("Calling Gemini AI...");
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: imageFile.type || 'image/jpeg'
            }
          }
        ]);

        if (!result || !result.response) {
          throw new Error('Failed to get response from Gemini');
        }

        const aiResponse = result.response.text();
        console.log("AI Response received");

        // Extract JSON from potential markdown blocks
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        let simulationData;
        try {
          simulationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: aiResponse, nails: [] };
        } catch (e) {
          console.warn("JSON Parse Warning, using raw response as analysis");
          simulationData = { analysis: aiResponse, nails: [] };
        }

        // 3. Store in D1
        const userId = "anonymous";
        if (env.DB) {
          try {
            await env.DB.prepare(
              "INSERT INTO simulations (user_id, image_url, shape, color, ai_response, created_at) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(userId, publicUrl, shape, color, simulationData.analysis || aiResponse, new Date().toISOString()).run();
            console.log("Result saved to D1");
          } catch (dbError: any) {
            console.error("D1 Error (non-fatal):", dbError.message);
          }
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
        return new Response(JSON.stringify({ 
          error: error.message,
          stack: error.stack // Helpful for debugging
        }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ message: 'ThayNails API is active' }), { status: 200, headers: corsHeaders });
  },
};

