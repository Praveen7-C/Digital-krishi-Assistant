'use client';

import { Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherData, getWeatherDescription } from '@/lib/services/weather';

export function WeatherWidget({ weather }: { weather: WeatherData | null }) {
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { current, forecast } = weather;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>{getWeatherDescription(current.weatherCode)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <ThermometerSun className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{current.temperature}°C</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{current.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{current.rainfall}mm</p>
                <p className="text-xs text-muted-foreground">Rainfall</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{current.windSpeed}</p>
                <p className="text-xs text-muted-foreground">Wind km/h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Weather predictions for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {forecast.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getWeatherDescription(day.weatherCode)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    <span className="font-bold">{Math.round(day.tempMax)}°</span>
                    <span className="text-muted-foreground"> / {Math.round(day.tempMin)}°</span>
                  </span>
                  {day.precipitation > 0 && (
                    <span className="text-sm text-blue-600 flex items-center">
                      <Droplets className="h-3 w-3 mr-1" />
                      {day.precipitation}mm
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
