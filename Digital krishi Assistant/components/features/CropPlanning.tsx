'use client';

import { useState } from 'react';
import { Calendar, Sprout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CropPlanning({ onComplete }: { onComplete?: () => void }) {
  const { farmer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    cropType: '',
    plantingDate: '',
    expectedHarvestDate: '',
    area: '',
  });

  const cropTypes = [
    'Cereal',
    'Vegetable',
    'Fruit',
    'Pulse',
    'Oilseed',
    'Cash Crop',
    'Spice',
    'Fodder',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('crops').insert({
      farmer_id: farmer.id,
      crop_name: formData.cropName,
      crop_type: formData.cropType,
      planting_date: formData.plantingDate,
      expected_harvest_date: formData.expectedHarvestDate,
      area: parseFloat(formData.area),
    });

    if (error) {
      toast.error('Failed to add crop: ' + error.message);
    } else {
      toast.success('Crop added successfully!');
      setFormData({
        cropName: '',
        cropType: '',
        plantingDate: '',
        expectedHarvestDate: '',
        area: '',
      });
      onComplete?.();
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sprout className="h-5 w-5 mr-2" />
          Crop Planning
        </CardTitle>
        <CardDescription>Add and plan your crops</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cropName">Crop Name</Label>
            <Input
              id="cropName"
              placeholder="e.g., Rice, Wheat, Tomato"
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cropType">Crop Type</Label>
            <Select
              value={formData.cropType}
              onValueChange={(value) => setFormData({ ...formData, cropType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input
                id="plantingDate"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedHarvestDate">Expected Harvest</Label>
              <Input
                id="expectedHarvestDate"
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area (acres)</Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              placeholder="e.g., 5.5"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding Crop...' : 'Add Crop'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
