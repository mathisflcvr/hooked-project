import { supabase } from '../lib/supabase';
import { createUserProfile } from '../models/profileModel';

export const userProfileService = {
  /**
   * Récupère le profil de l'utilisateur actuel
   * @returns {Promise<Object>} Profil utilisateur
   */
  async getCurrentUserProfile() {
    try {
      // Récupérer l'utilisateur actuel
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Récupérer le profil de l'utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        
        // Si le profil n'existe pas, le créer
        if (error.code === 'PGRST116') { // Code "No rows found"
          return this.createProfile({
            id: authData.user.id,
            username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0],
            email: authData.user.email
          });
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans getCurrentUserProfile:', error);
      throw error;
    }
  },
  
  /**
   * Récupère le profil d'un utilisateur par son ID
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Profil utilisateur
   */
  async getUserProfileById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error(`Erreur lors de la récupération du profil pour l'utilisateur ${userId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans getUserProfileById:', error);
      throw error;
    }
  },
  
  /**
   * Crée un nouveau profil utilisateur
   * @param {Object} profileData - Données du profil
   * @returns {Promise<Object>} Profil créé
   */
  async createProfile(profileData) {
    try {
      // Formatter les données selon le modèle
      const newProfile = createUserProfile(profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création du profil:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans createProfile:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour le profil de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Profil mis à jour
   */
  async updateProfile(userId, updates) {
    try {
      // Ajouter la date de mise à jour
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error(`Erreur lors de la mise à jour du profil pour l'utilisateur ${userId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans updateProfile:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour l'avatar de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {File} file - Fichier image
   * @returns {Promise<Object>} Profil mis à jour avec le nouvel avatar
   */
  async updateAvatar(userId, file) {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Uploader le fichier
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Erreur lors de l\'upload de l\'avatar:', uploadError);
        throw uploadError;
      }
      
      // Générer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);
      
      // Mettre à jour le profil avec la nouvelle URL
      return this.updateProfile(userId, { avatar_url: publicUrl });
    } catch (error) {
      console.error('Erreur dans updateAvatar:', error);
      throw error;
    }
  },
  
  /**
   * Ajoute ou met à jour les préférences de pêche de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} preferences - Préférences de pêche
   * @returns {Promise<Object>} Profil mis à jour
   */
  async updateFishingPreferences(userId, preferences) {
    try {
      // Récupérer d'abord le profil actuel
      const currentProfile = await this.getUserProfileById(userId);
      
      // Fusionner avec les préférences existantes
      const updatedPreferences = {
        ...currentProfile.fishing_preferences,
        ...preferences
      };
      
      // Mettre à jour le profil
      return this.updateProfile(userId, { fishing_preferences: updatedPreferences });
    } catch (error) {
      console.error('Erreur dans updateFishingPreferences:', error);
      throw error;
    }
  },
  
  /**
   * Récupère la liste des spots favoris de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des IDs de spots favoris
   */
  async getFavoriteSpotIds(userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('spot_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error(`Erreur lors de la récupération des favoris pour l'utilisateur ${userId}:`, error);
        throw error;
      }
      
      return data ? data.map(fav => fav.spot_id) : [];
    } catch (error) {
      console.error('Erreur dans getFavoriteSpotIds:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si l'utilisateur actuel existe dans la base de données
   * @returns {Promise<boolean>} true si l'utilisateur existe
   */
  async userExists() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Erreur dans userExists:', error);
      return false;
    }
  },
  
  /**
   * Synchronise les données du profil utilisateur avec Supabase
   * @returns {Promise<Object>} Profil synchronisé
   */
  async syncUserProfile() {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Vérifier si le profil existe déjà
      const exists = await this.userExists();
      
      if (!exists) {
        // Créer un nouveau profil
        return this.createProfile({
          id: authData.user.id,
          username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0],
          email: authData.user.email
        });
      } else {
        // Récupérer le profil existant
        return this.getUserProfileById(authData.user.id);
      }
    } catch (error) {
      console.error('Erreur dans syncUserProfile:', error);
      throw error;
    }
  }
}; 