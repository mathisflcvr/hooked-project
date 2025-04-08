import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider monté, initialisation de l'authentification");
    
    // Vérifier si l'utilisateur est déjà connecté
    const checkUser = async () => {
      try {
        console.log("Vérification de l'utilisateur actuel...");
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          setUser(null);
        } else {
          console.log("Utilisateur récupéré:", data.user);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erreur de vérification de l\'utilisateur:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // S'abonner aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Changement d'état d'authentification:", event, session?.user?.email);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      console.log("Nettoyage du listener d'authentification");
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    console.log(`Tentative de connexion avec email: ${email}`);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Erreur d'authentification:", error);
        throw error;
      }
      
      console.log("Connexion réussie, utilisateur:", data.user);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const signUp = async (email, password, username) => {
    console.log(`Tentative d'inscription avec email: ${email}, username: ${username}`);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        console.error("Erreur d'inscription:", error);
        throw error;
      }
      
      console.log("Inscription réussie, utilisateur:", data.user);
      
      // Créer un profil utilisateur
      if (data?.user) {
        console.log("Création du profil utilisateur...");
        try {
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

          if (profileError) {
            console.error("Erreur de création du profil:", profileError);
            throw profileError;
          }
          console.log("Profil utilisateur créé avec succès");
        } catch (profileError) {
          console.error("Erreur lors de la création du profil:", profileError);
          throw profileError;
        }
      }
      
      return data;
    } catch (error) {
      console.error("Erreur complète lors de l'inscription:", error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log("Tentative de déconnexion");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur de déconnexion:", error);
        throw error;
      }
      console.log("Déconnexion réussie");
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    console.log(`Tentative de réinitialisation du mot de passe pour: ${email}`);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Erreur de réinitialisation du mot de passe:", error);
        throw error;
      }
      console.log("Email de réinitialisation envoyé avec succès");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getCurrentUser: async () => {
      console.log("Récupération de l'utilisateur actuel");
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return null;
      }
      return data.user;
    },
    getUserProfile: async (userId) => {
      console.log(`Récupération du profil pour userId: ${userId}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error("Erreur de récupération du profil:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        throw error;
      }
    },
    updateProfile: async (userId, updates) => {
      console.log(`Mise à jour du profil pour userId: ${userId}`, updates);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (error) {
          console.error("Erreur de mise à jour du profil:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        throw error;
      }
    }
  };

  console.log("État actuel du AuthContext - user:", user?.email, "loading:", loading);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Chargement...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 