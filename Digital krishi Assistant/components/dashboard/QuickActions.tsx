'use client';

import { Sprout, Bug, Droplets, TrendingUp, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    { id: 'add-crop', label: 'Add Crop', icon: Plus, color: 'bg-green-500' },
    { id: 'crop-planning', label: 'Crop Planning', icon: Sprout, color: 'bg-emerald-500' },
    { id: 'pest-control', label: 'Pest Control', icon: Bug, color: 'bg-red-500' },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets, color: 'bg-blue-500' },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp, color: 'bg-amber-500' },
    { id: 'ai-chat', label: 'Ask AI', icon: MessageSquare, color: 'bg-purple-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Access key features quickly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary"
              onClick={() => onActionClick(action.id)}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
