import { WorkerEntrypoint } from 'cloudflare:workers';

export interface Env {
  // Bindings can go here
  // R2_BUCKET: R2Bucket;
  // D1_DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/simulate') {
      try {
        const formData = await request.formData();
        const image = formData.get('image');
        const shape = formData.get('shape'); // e.g. 'almond', 'stiletto', 'square'
        const color = formData.get('color'); // hex color

        if (!image) {
          return new Response(JSON.stringify({ error: 'Image is required' }), {
            status: 400,
            headers: corsHeaders()
          });
        }

        // Mock external AI Vision API call
        console.log(`Processing image for shape: ${shape}, color: ${color}`);
        
        // Emulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For now, we will just return a mock success response.
        // In the future, this will return the processed image URL from R2 or base64.
        return new Response(JSON.stringify({
          success: true,
          message: 'Simulation completed successfully',
          mockResultUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=600&auto=format&fit=crop', // Temporary mock image
          shape,
          color
        }), {
          status: 200,
          headers: corsHeaders()
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    return new Response(JSON.stringify({ message: 'ThayNails API Worker is running' }), {
      status: 200,
      headers: corsHeaders()
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
}
