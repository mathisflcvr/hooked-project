import { supabase } from '../lib/supabase';
import { weatherService } from './weatherService';

export const spotService = {
  /**
   * Récupère tous les spots de pêche
   * @returns {Promise<Array>} Liste des spots
   */
  async getAllSpots() {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des spots:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getAllSpots:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un spot par son ID
   * @param {string} spotId - ID du spot
   * @returns {Promise<Object>} Détails du spot
   */
  async getSpotById(spotId) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single();
      
      if (error) {
        console.error(`Erreur lors de la récupération du spot ${spotId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans getSpotById:', error);
      throw error;
    }
  },
  
  /**
   * Crée un nouveau spot
   * @param {Object} spotData - Données du spot
   * @returns {Promise<Object>} Spot créé
   */
  async createSpot(spotData) {
    try {
      // Vérifier que l'utilisateur est connecté
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Ajouter l'ID de l'utilisateur comme créateur
      const newSpot = {
        ...spotData,
        created_by: userData.user.id
      };
      
      const { data, error } = await supabase
        .from('spots')
        .insert([newSpot])
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création du spot:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans createSpot:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour un spot existant
   * @param {string} spotId - ID du spot
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Spot mis à jour
   */
  async updateSpot(spotId, updates) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .update(updates)
        .eq('id', spotId)
        .select()
        .single();
      
      if (error) {
        console.error(`Erreur lors de la mise à jour du spot ${spotId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans updateSpot:', error);
      throw error;
    }
  },
  
  /**
   * Supprime un spot
   * @param {string} spotId - ID du spot
   * @returns {Promise<void>}
   */
  async deleteSpot(spotId) {
    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spotId);
      
      if (error) {
        console.error(`Erreur lors de la suppression du spot ${spotId}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteSpot:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les spots favoris d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des spots favoris
   */
  async getUserFavorites(userId) {
    try {
      // Récupérer les IDs des spots favoris
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('spot_id')
        .eq('user_id', userId);
      
      if (favoritesError) {
        console.error(`Erreur lors de la récupération des favoris pour l'utilisateur ${userId}:`, favoritesError);
        throw favoritesError;
      }
      
      if (!favoritesData || favoritesData.length === 0) {
        return [];
      }
      
      // Extraire les IDs des spots
      const spotIds = favoritesData.map(fav => fav.spot_id);
      
      // Récupérer les détails des spots
      const { data: spotsData, error: spotsError } = await supabase
        .from('spots')
        .select('*')
        .in('id', spotIds);
      
      if (spotsError) {
        console.error('Erreur lors de la récupération des détails des spots favoris:', spotsError);
        throw spotsError;
      }
      
      return spotsData || [];
    } catch (error) {
      console.error('Erreur dans getUserFavorites:', error);
      throw error;
    }
  },
  
  /**
   * Ajoute un spot aux favoris
   * @param {string} spotId - ID du spot
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Favori créé
   */
  async addFavorite(spotId, userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([
          { user_id: userId, spot_id: spotId }
        ])
        .select()
        .single();
      
      if (error) {
        console.error(`Erreur lors de l'ajout du spot ${spotId} aux favoris:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans addFavorite:', error);
      throw error;
    }
  },
  
  /**
   * Supprime un spot des favoris
   * @param {string} spotId - ID du spot
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  async removeFavorite(spotId, userId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('spot_id', spotId);
      
      if (error) {
        console.error(`Erreur lors de la suppression du spot ${spotId} des favoris:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans removeFavorite:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si un spot est dans les favoris d'un utilisateur
   * @param {string} spotId - ID du spot
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<boolean>} true si le spot est un favori
   */
  async isSpotFavorite(spotId, userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('spot_id', spotId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows returned
        console.error(`Erreur lors de la vérification des favoris pour le spot ${spotId}:`, error);
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Erreur dans isSpotFavorite:', error);
      throw error;
    }
  },
  
  /**
   * Récupère des spots recommandés en fonction des conditions météo
   * @param {string} currentSpotId - ID du spot actuel
   * @returns {Promise<Array>} Liste des spots recommandés
   */
  async getRecommendedSpots(currentSpotId) {
    try {
      // Récupérer le spot actuel
      const currentSpot = await this.getSpotById(currentSpotId);
      if (!currentSpot) {
        throw new Error('Spot actuel non trouvé');
      }
      
      // Récupérer les conditions météo actuelles
      const currentWeather = await weatherService.getCurrentWeather(
        currentSpot.location.lat,
        currentSpot.location.lng
      );
      
      // Récupérer tous les autres spots
      const allSpots = await this.getAllSpots();
      const otherSpots = allSpots.filter(spot => spot.id !== currentSpotId);
      
      // Récupérer les recommandations
      const recommendations = await weatherService.suggestAlternativeSpots(
        otherSpots,
        currentWeather,
        currentSpot.fish_types
      );
      
      return recommendations;
    } catch (error) {
      console.error('Erreur dans getRecommendedSpots:', error);
      throw error;
    }
  }
}; 