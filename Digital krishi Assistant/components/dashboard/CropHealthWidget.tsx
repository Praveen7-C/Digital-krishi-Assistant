'use client';

import { Sprout, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Crop {
  id: string;
  crop_name: string;
  crop_type: string;
  current_stage: string;
  health_status: string;
  planting_date: string;
  expected_harvest_date: string;
  area: number;
}

export function CropHealthWidget({ crops }: { crops: Crop[] }) {
  if (!crops || crops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Health</CardTitle>
          <CardDescription>No crops registered yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your crops to track their health and receive personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const healthyCount = crops.filter(c => c.health_status === 'healthy').length;
  const atRiskCount = crops.filter(c => c.health_status === 'at_risk').length;
  const diseasedCount = crops.filter(c => c.health_status === 'diseased').length;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'diseased':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Sprout className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'at_risk':
        return 'bg-yellow-500';
      case 'diseased':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateDaysUntilHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Crop Health Overview</CardTitle>
          <CardDescription>Status of all your crops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-2xl font-bold">{healthyCount}</span>
              <span className="text-sm text-muted-foreground">Healthy</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg bg-yellow-50">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-2xl font-bold">{atRiskCount}</span>
              <span className="text-sm text-muted-foreground">At Risk</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <span className="text-2xl font-bold">{diseasedCount}</span>
              <span className="text-sm text-muted-foreground">Diseased</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Crops</CardTitle>
          <CardDescription>Detailed information about each crop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crops.map((crop) => {
              const daysUntilHarvest = calculateDaysUntilHarvest(crop.expected_harvest_date);
              const plantingDate = new Date(crop.planting_date);
              const harvestDate = new Date(crop.expected_harvest_date);
              const totalDays = Math.ceil((harvestDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
              const daysElapsed = totalDays - daysUntilHarvest;
              const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

              return (
                <div key={crop.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getHealthIcon(crop.health_status)}
                      <div>
                        <h4 className="font-semibold">{crop.crop_name}</h4>
                        <p className="text-sm text-muted-foreground">{crop.crop_type} - {crop.area} acres</p>
                      </div>
                    </div>
                    <Badge variant={crop.health_status === 'healthy' ? 'default' : 'destructive'}>
                      {crop.health_status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Growth Stage: {crop.current_stage}</span>
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysUntilHarvest > 0 ? `${daysUntilHarvest} days until harvest` : 'Ready to harvest'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getHealthColor(crop.health_status)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
