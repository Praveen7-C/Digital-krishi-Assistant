'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';

interface Farmer {
  id: string;
  user_id: string;
  full_name: string;
  phone_number?: string;
  location?: any;
  land_size?: number;
  soil_type?: string;
  language_preference: string;
}

interface AuthContextType {
  user: User | null;
  farmer: Farmer | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { farmer } = await authService.getCurrentFarmer();
        setFarmer(farmer);
      }

      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { farmer } = await authService.getCurrentFarmer();
          setFarmer(farmer);
        } else {
          setFarmer(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await authService.signUp(email, password, fullName);
    if (!result.error && result.data?.user) {
      const { farmer } = await authService.getCurrentFarmer();
      setFarmer(farmer);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (!result.error && result.data?.user) {
      const { farmer } = await authService.getCurrentFarmer();
      setFarmer(farmer);
    }
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setFarmer(null);
  };

  return (
    <AuthContext.Provider value={{ user, farmer, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
