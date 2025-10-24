'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface MarketPrice {
  id: string;
  crop_name: string;
  region: string;
  price_per_kg: number;
  market_demand: string;
  trend: string;
  recorded_at: string;
}

export function MarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setPrices(data);
    }
    setLoading(false);
  };

  const filteredPrices = prices.filter(price =>
    price.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPrices = filteredPrices.reduce((acc, price) => {
    if (!acc[price.crop_name]) {
      acc[price.crop_name] = [];
    }
    acc[price.crop_name].push(price);
    return acc;
  }, {} as Record<string, MarketPrice[]>);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Market Prices & Trends
        </CardTitle>
        <CardDescription>Current market prices for various crops</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops or regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading market data...
            </p>
          ) : Object.keys(groupedPrices).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No results found' : 'No market data available'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Market prices will be updated regularly
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPrices).map(([cropName, cropPrices]) => (
                <div key={cropName} className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg capitalize">{cropName}</h3>
                  <div className="space-y-2">
                    {cropPrices.map((price) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{price.region}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(price.recorded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">₹{price.price_per_kg}</p>
                            <p className="text-xs text-muted-foreground">per kg</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(price.trend)}
                            <Badge className={getDemandColor(price.market_demand)}>
                              {price.market_demand}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
