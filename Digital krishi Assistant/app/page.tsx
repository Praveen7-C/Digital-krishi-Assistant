'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import { LogOut, Home as HomeIcon, Sprout, Bug, Droplets, TrendingUp, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationPrompt } from '@/components/LocationPrompt';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { CropHealthWidget } from '@/components/dashboard/CropHealthWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { CropPlanning } from '@/components/features/CropPlanning';
import { DiseaseDetection } from '@/components/features/DiseaseDetection';
import { IrrigationManagement } from '@/components/features/IrrigationManagement';
import { MarketPrices } from '@/components/features/MarketPrices';
import { AIChatbot } from '@/components/features/AIChatbot';
import { fetchWeatherData, WeatherData } from '@/lib/services/weather';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Home() {
  const { user, farmer, loading: authLoading, signOut } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [irrigationSchedules, setIrrigationSchedules] = useState<any[]>([]);

  useEffect(() => {
    if (latitude && longitude) {
      loadWeatherData();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (farmer) {
      loadFarmerData();
    }
  }, [farmer]);

  const loadWeatherData = async () => {
    if (!latitude || !longitude) return;

    try {
      const data = await fetchWeatherData(latitude, longitude);
      setWeather(data);
    } catch (error: any) {
      toast.error('Failed to load weather data');
    }
  };

  const loadFarmerData = async () => {
    if (!farmer) return;

    const [cropsResult, notificationsResult, schedulesResult] = await Promise.all([
      supabase.from('crops').select('*').eq('farmer_id', farmer.id).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('farmer_id', farmer.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('irrigation_schedules').select('*').order('scheduled_date', { ascending: true }),
    ]);

    if (cropsResult.data) setCrops(cropsResult.data);
    if (notificationsResult.data) setNotifications(notificationsResult.data);
    if (schedulesResult.data) {
      const farmerCropIds = cropsResult.data?.map(c => c.id) || [];
      const farmerSchedules = schedulesResult.data.filter(s => farmerCropIds.includes(s.crop_id));
      setIrrigationSchedules(farmerSchedules);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-crop':
      case 'crop-planning':
        setActiveTab('crop-planning');
        break;
      case 'pest-control':
        setActiveTab('disease-detection');
        break;
      case 'irrigation':
        setActiveTab('irrigation');
        break;
      case 'market-prices':
        setActiveTab('market-prices');
        break;
      case 'ai-chat':
        setActiveTab('ai-chat');
        break;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">Digital Krishi Assistant</h1>
            <p className="text-lg text-green-700">AI-Powered Smart Farming Advisory System</p>
          </div>
          {authMode === 'login' ? (
            <LoginForm onToggle={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onToggle={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md">
          <LocationPrompt
            onRequestLocation={requestLocation}
            error={geoError}
            loading={geoLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Digital Krishi Assistant</h1>
            <p className="text-sm text-green-700">Welcome, {farmer?.full_name}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="dashboard">
              <HomeIcon className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="crop-planning">
              <Sprout className="h-4 w-4 mr-2" />
              Crops
            </TabsTrigger>
            <TabsTrigger value="disease-detection">
              <Bug className="h-4 w-4 mr-2" />
              Disease
            </TabsTrigger>
            <TabsTrigger value="irrigation">
              <Droplets className="h-4 w-4 mr-2" />
              Irrigation
            </TabsTrigger>
            <TabsTrigger value="market-prices">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger value="ai-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <WeatherWidget weather={weather} />
                <CropHealthWidget crops={crops} />
              </div>
              <div className="space-y-6">
                <QuickActions onActionClick={handleQuickAction} />
                <NotificationsPanel
                  notifications={notifications.slice(0, 5)}
                  onMarkAsRead={handleMarkAsRead}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crop-planning">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CropPlanning onComplete={loadFarmerData} />
              <CropHealthWidget crops={crops} />
            </div>
          </TabsContent>

          <TabsContent value="disease-detection">
            <div className="max-w-2xl mx-auto">
              <DiseaseDetection crops={crops} />
            </div>
          </TabsContent>

          <TabsContent value="irrigation">
            <div className="max-w-3xl mx-auto">
              <IrrigationManagement
                crops={crops}
                schedules={irrigationSchedules}
                onUpdate={loadFarmerData}
              />
            </div>
          </TabsContent>

          <TabsContent value="market-prices">
            <div className="max-w-4xl mx-auto">
              <MarketPrices />
            </div>
          </TabsContent>

          <TabsContent value="ai-chat">
            <div className="max-w-4xl mx-auto">
              <AIChatbot weather={weather} crops={crops} />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="max-w-3xl mx-auto">
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
