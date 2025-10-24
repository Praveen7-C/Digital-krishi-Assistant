import { supabase } from './supabase';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { error: authError };
    }

    const { error: profileError } = await supabase.from('farmers').insert({
      user_id: authData.user.id,
      full_name: fullName,
    });

    if (profileError) {
      return { error: profileError };
    }

    return { data: authData, error: null };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async getCurrentFarmer() {
    const { user } = await this.getCurrentUser();
    if (!user) return { farmer: null, error: new Error('Not authenticated') };

    const { data: farmer, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return { farmer, error };
  },
};
