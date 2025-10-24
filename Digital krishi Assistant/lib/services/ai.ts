interface AIContext {
  cropType?: string;
  soilType?: string;
  location?: { lat: number; lon: number };
  weather?: any;
  farmSize?: number;
}

export async function getAIAdvisory(query: string, context?: AIContext): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/gemini-ai-advisor`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, context }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get AI advisory');
  }

  const data = await response.json();
  return data.response;
}
