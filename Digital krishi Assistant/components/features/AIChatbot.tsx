'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getAIAdvisory } from '@/lib/services/ai';
import { toast } from 'sonner';

interface Message {
  id: string;
  message: string;
  is_farmer: boolean;
  response?: string;
  created_at: string;
}

export function AIChatbot({ weather, crops }: { weather?: any; crops?: any[] }) {
  const { farmer } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (farmer) {
      fetchChatHistory();
    }
  }, [farmer]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    if (!farmer) return;

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('farmer_id', farmer.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !farmer) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      message: userMessage,
      is_farmer: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const context = {
        cropType: crops?.[0]?.crop_name,
        soilType: farmer.soil_type,
        location: farmer.location,
        weather: weather?.current,
        farmSize: farmer.land_size,
      };

      const aiResponse = await getAIAdvisory(userMessage, context);

      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          farmer_id: farmer.id,
          message: userMessage,
          is_farmer: true,
          response: aiResponse,
          context,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempMessage.id),
        data,
        {
          id: 'ai-' + Date.now(),
          message: aiResponse,
          is_farmer: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      toast.error('Failed to get response: ' + error.message);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'What should I plant this season?',
    'How do I control pests naturally?',
    'When should I irrigate my crops?',
    'What are the best fertilizers for rice?',
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          AI Krishi Assistant
        </CardTitle>
        <CardDescription>Get personalized farming advice powered by AI</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ask me anything about farming! Here are some suggestions:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto py-3 px-4"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_farmer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.is_farmer
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    {msg.response && !msg.is_farmer && (
                      <p className="text-sm mt-2 whitespace-pre-wrap">{msg.response}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-accent rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask about crops, weather, pests, market prices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-auto"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
