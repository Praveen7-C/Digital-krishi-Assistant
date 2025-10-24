'use client';

import { useState } from 'react';
import { Bug, Upload, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Crop {
  id: string;
  crop_name: string;
  crop_type: string;
}

export function DiseaseDetection({ crops }: { crops: Crop[] }) {
  const { farmer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer || !selectedCrop) {
      toast.error('Please select a crop');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('disease_records').insert({
      crop_id: selectedCrop,
      disease_name: diseaseName,
      severity,
      notes,
      treatment_status: 'pending',
    });

    if (error) {
      toast.error('Failed to record disease: ' + error.message);
    } else {
      toast.success('Disease recorded successfully!');

      await supabase.from('crops').update({
        health_status: severity === 'low' ? 'at_risk' : 'diseased'
      }).eq('id', selectedCrop);

      await supabase.from('notifications').insert({
        farmer_id: farmer.id,
        title: 'Disease Detected',
        message: `${diseaseName} detected in your crop. Severity: ${severity}`,
        type: 'disease',
        priority: severity === 'high' ? 'high' : 'medium',
      });

      setDiseaseName('');
      setNotes('');
      setSelectedCrop('');
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="h-5 w-5 mr-2" />
          Disease Detection & Pest Control
        </CardTitle>
        <CardDescription>Report and track crop diseases and pests</CardDescription>
      </CardHeader>
      <CardContent>
        {crops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add crops first to track diseases
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

            <div className="space-y-2">
              <Label htmlFor="diseaseName">Disease/Pest Name</Label>
              <input
                id="diseaseName"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., Leaf Blight, Aphids"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <Badge className="bg-yellow-100 text-yellow-800 mr-2">Low</Badge>
                      Minor damage
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <Badge className="bg-orange-100 text-orange-800 mr-2">Medium</Badge>
                      Moderate damage
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <Badge className="bg-red-100 text-red-800 mr-2">High</Badge>
                      Severe damage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe symptoms, affected area, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">AI-Powered Detection Coming Soon</p>
                  <p>Upload crop images for automatic disease detection using AI</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Recording...' : 'Record Disease/Pest Issue'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
