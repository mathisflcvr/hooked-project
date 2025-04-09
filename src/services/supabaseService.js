import { createClient } from '@supabase/supabase-js';

// Informations de connexion Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://votre-project-id.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'votre-clé-anonyme';

// Initialiser le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Service pour gérer les spots de pêche
const spotService = {
  // Récupérer tous les spots
  getAllSpots: async () => {
    const { data, error } = await supabase
      .from('spots')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération des spots:', error);
      throw error;
    }
    
    return data;
  },

  // Récupérer les spots d'un utilisateur
  getUserSpots: async (userId) => {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('created_by', userId);
    
    if (error) {
      console.error('Erreur lors de la récupération des spots utilisateur:', error);
      throw error;
    }
    
    return data;
  },

  // Ajouter un spot
  addSpot: async (spot) => {
    const { data, error } = await supabase
      .from('spots')
      .insert([
        {
          name: spot.name,
          description: spot.description,
          type: spot.type,
          location: spot.location,
          address: spot.address,
          image: spot.image,
          water_type: spot.waterType,
          fish_types: spot.fishTypes,
          created_at: new Date().toISOString(),
          created_by: spot.createdBy
        }
      ])
      .select();
    
    if (error) {
      console.error('Erreur lors de l\'ajout du spot:', error);
      throw error;
    }
    
    return data[0];
  },

  // Mettre à jour un spot
  updateSpot: async (spot) => {
    const { data, error } = await supabase
      .from('spots')
      .update({
        name: spot.name,
        description: spot.description,
        type: spot.type,
        location: spot.location,
        address: spot.address,
        image: spot.image,
        water_type: spot.waterType,
        fish_types: spot.fishTypes
      })
      .eq('id', spot.id)
      .select();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du spot:', error);
      throw error;
    }
    
    return data[0];
  },

  // Supprimer un spot
  deleteSpot: async (spotId) => {
    const { error } = await supabase
      .from('spots')
      .delete()
      .eq('id', spotId);
    
    if (error) {
      console.error('Erreur lors de la suppression du spot:', error);
      throw error;
    }
    
    return true;
  }
};

// Service pour gérer les captures
const catchService = {
  // Récupérer toutes les captures
  getAllCatches: async () => {
    const { data, error } = await supabase
      .from('catches')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération des captures:', error);
      throw error;
    }
    
    return data;
  },

  // Récupérer les captures d'un utilisateur
  getUserCatches: async (userId) => {
    const { data, error } = await supabase
      .from('catches')
      .select('*')
      .eq('created_by', userId);
    
    if (error) {
      console.error('Erreur lors de la récupération des captures utilisateur:', error);
      throw error;
    }
    
    return data;
  },

  // Ajouter une capture
  addCatch: async (catchData) => {
    const { data, error } = await supabase
      .from('catches')
      .insert([
        {
          spot_id: catchData.spotId,
          fishes: catchData.fishes,
          bait: catchData.bait,
          fishing_type: catchData.fishingType,
          weather: catchData.weather,
          water_type: catchData.waterType,
          photo: catchData.photo,
          notes: catchData.notes,
          catch_date: catchData.catchDate,
          created_at: new Date().toISOString(),
          created_by: catchData.createdBy
        }
      ])
      .select();
    
    if (error) {
      console.error('Erreur lors de l\'ajout de la capture:', error);
      throw error;
    }
    
    return data[0];
  },

  // Mettre à jour une capture
  updateCatch: async (catchData) => {
    const { data, error } = await supabase
      .from('catches')
      .update({
        spot_id: catchData.spotId,
        fishes: catchData.fishes,
        bait: catchData.bait,
        fishing_type: catchData.fishingType,
        weather: catchData.weather,
        water_type: catchData.waterType,
        photo: catchData.photo,
        notes: catchData.notes,
        catch_date: catchData.catchDate
      })
      .eq('id', catchData.id)
      .select();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de la capture:', error);
      throw error;
    }
    
    return data[0];
  },

  // Supprimer une capture
  deleteCatch: async (catchId) => {
    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('id', catchId);
    
    if (error) {
      console.error('Erreur lors de la suppression de la capture:', error);
      throw error;
    }
    
    return true;
  }
};

// Service pour gérer les profils utilisateurs
const profileService = {
  // Récupérer le profil d'un utilisateur
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
    
    return data;
  },

  // Mettre à jour le profil d'un utilisateur
  updateUserProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        fishing_styles: profile.fishingStyles,
        favorite_spots: profile.favoriteSpots,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
    
    return data[0];
  },

  // Créer un profil utilisateur
  createUserProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatarUrl,
          bio: profile.bio,
          fishing_styles: profile.fishingStyles,
          favorite_spots: profile.favoriteSpots,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
    
    return data[0];
  }
};

// Service pour gérer l'authentification
const authService = {
  // S'inscrire avec email et mot de passe
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
    
    return data;
  },

  // Se connecter avec email et mot de passe
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
    
    return data;
  },

  // Se déconnecter
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
    
    return true;
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
    
    return data.user;
  },

  // Récupérer la session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      throw error;
    }
    
    return data.session;
  },

  // Réinitialiser le mot de passe
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
    
    return true;
  },

  // Mettre à jour le mot de passe
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
    
    return true;
  }
};

export { 
  supabase, 
  spotService, 
  catchService, 
  profileService, 
  authService 
}; 