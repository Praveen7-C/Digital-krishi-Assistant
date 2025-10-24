import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AdvisoryRequest {
  query: string;
  context?: {
    cropType?: string;
    soilType?: string;
    location?: { lat: number; lon: number };
    weather?: any;
    farmSize?: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { query, context }: AdvisoryRequest = await req.json();

    const systemPrompt = `You are a Digital Krishi Assistant, an AI agricultural advisor helping farmers in India with personalized farming guidance. Provide practical, actionable advice based on:
- Local weather conditions
- Soil type and crop requirements
- Pest and disease management
- Irrigation scheduling
- Market trends and pricing
- Sustainable farming practices

Provide concise, farmer-friendly responses in simple language.`;

    let userPrompt = query;
    if (context) {
      userPrompt += `\n\nContext:\n`;
      if (context.cropType) userPrompt += `- Crop: ${context.cropType}\n`;
      if (context.soilType) userPrompt += `- Soil Type: ${context.soilType}\n`;
      if (context.farmSize) userPrompt += `- Farm Size: ${context.farmSize} acres\n`;
      if (context.weather) userPrompt += `- Weather: Temp ${context.weather.temperature}°C, Humidity ${context.weather.humidity}%\n`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return new Response(
      JSON.stringify({
        response: aiResponse,
        query,
        context,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});