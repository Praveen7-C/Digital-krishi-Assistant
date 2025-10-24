'use client';

import { MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationPromptProps {
  onRequestLocation: () => void;
  error?: string | null;
  loading?: boolean;
}

export function LocationPrompt({ onRequestLocation, error, loading }: LocationPromptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Access Required
        </CardTitle>
        <CardDescription>
          We need your location to provide accurate weather data and personalized farming recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={onRequestLocation} disabled={loading} className="w-full">
          {loading ? 'Getting Location...' : 'Allow Location Access'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Your location is only used to fetch local weather data and is not stored or shared
        </p>
      </CardContent>
    </Card>
  );
}
