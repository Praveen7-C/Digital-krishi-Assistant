import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeatherRequest {
  latitude: number;
  longitude: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { latitude, longitude }: WeatherRequest = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
    
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max&timezone=auto&forecast_days=7`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data from Open-Meteo');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    const weatherData = {
      current: {
        temperature: currentData.current.temperature_2m,
        humidity: currentData.current.relative_humidity_2m,
        rainfall: currentData.current.precipitation,
        windSpeed: currentData.current.wind_speed_10m,
        weatherCode: currentData.current.weather_code,
        time: currentData.current.time,
      },
      forecast: forecastData.daily.time.map((date: string, index: number) => ({
        date,
        tempMax: forecastData.daily.temperature_2m_max[index],
        tempMin: forecastData.daily.temperature_2m_min[index],
        precipitation: forecastData.daily.precipitation_sum[index],
        windSpeed: forecastData.daily.wind_speed_10m_max[index],
        weatherCode: forecastData.daily.weather_code[index],
      })),
      location: {
        latitude: currentData.latitude,
        longitude: currentData.longitude,
        timezone: currentData.timezone,
      },
    };

    return new Response(
      JSON.stringify(weatherData),
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