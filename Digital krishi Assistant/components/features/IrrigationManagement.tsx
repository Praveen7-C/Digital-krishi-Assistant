'use client';

import { useState } from 'react';
import { Droplets, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Crop {
  id: string;
  crop_name: string;
  crop_type: string;
}

interface IrrigationSchedule {
  id: string;
  crop_id: string;
  scheduled_date: string;
  water_amount: number;
  soil_moisture_level: number;
  completed: boolean;
  notes: string;
}

export function IrrigationManagement({ crops, schedules, onUpdate }: {
  crops: Crop[];
  schedules: IrrigationSchedule[];
  onUpdate?: () => void;
}) {
  const { farmer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  const [soilMoisture, setSoilMoisture] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer || !selectedCrop) {
      toast.error('Please select a crop');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('irrigation_schedules').insert({
      crop_id: selectedCrop,
      scheduled_date: scheduledDate,
      water_amount: parseFloat(waterAmount),
      soil_moisture_level: parseFloat(soilMoisture),
      completed: false,
    });

    if (error) {
      toast.error('Failed to schedule irrigation: ' + error.message);
    } else {
      toast.success('Irrigation scheduled successfully!');
      setSelectedCrop('');
      setScheduledDate('');
      setWaterAmount('');
      setSoilMoisture('');
      onUpdate?.();
    }

    setLoading(false);
  };

  const handleToggleComplete = async (scheduleId: string, completed: boolean) => {
    const { error } = await supabase
      .from('irrigation_schedules')
      .update({ completed: !completed })
      .eq('id', scheduleId);

    if (error) {
      toast.error('Failed to update schedule');
    } else {
      toast.success(completed ? 'Marked as incomplete' : 'Marked as complete');
      onUpdate?.();
    }
  };

  const upcomingSchedules = schedules
    .filter(s => !s.completed)
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="h-5 w-5 mr-2" />
            Irrigation Management
          </CardTitle>
          <CardDescription>Schedule and track irrigation for your crops</CardDescription>
        </CardHeader>
        <CardContent>
          {crops.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add crops first to schedule irrigation
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Select Crop</Label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.crop_name} ({crop.crop_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterAmount">Water Amount (liters)</Label>
                  <Input
                    id="waterAmount"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5000"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilMoisture">Soil Moisture Level (%)</Label>
                <Input
                  id="soilMoisture"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 45"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Irrigation'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Irrigation
            </CardTitle>
            <CardDescription>Your scheduled irrigation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedules.map((schedule) => {
                const crop = crops.find(c => c.id === schedule.crop_id);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={schedule.completed}
                        onCheckedChange={() => handleToggleComplete(schedule.id, schedule.completed)}
                      />
                      <div>
                        <p className="font-medium text-sm">{crop?.crop_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(schedule.scheduled_date).toLocaleDateString()} - {schedule.water_amount}L
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{schedule.soil_moisture_level}%</p>
                      <p className="text-xs text-muted-foreground">Soil Moisture</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
