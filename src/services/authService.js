import { supabase } from '../lib/supabase';

export const authService = {
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;

    // Créer un profil utilisateur
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            username,
            full_name: '',
            avatar_url: '',
          },
        ]);

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    
    return data?.user || null;
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}; 