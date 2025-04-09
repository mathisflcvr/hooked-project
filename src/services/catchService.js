import { supabase } from '../lib/supabase';
import { createCatch } from '../models/dataModels';

/**
 * Service pour gérer les captures avec Supabase
 */
export const catchService = {
  /**
   * Récupère toutes les captures
   * @returns {Promise<Array>} Liste des captures
   */
  async getAllCatches() {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des captures:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getAllCatches:', error);
      return [];
    }
  },

  /**
   * Récupère les captures de l'utilisateur connecté
   * @returns {Promise<Array>} Liste des captures de l'utilisateur
   */
  async getCurrentUserCatches() {
    try {
      // Récupérer l'utilisateur actuel
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('created_by', authData.user.id);
      
      if (error) {
        console.error('Erreur lors de la récupération des captures utilisateur:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getCurrentUserCatches:', error);
      return [];
    }
  },

  /**
   * Récupère les captures d'un utilisateur par son ID
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des captures de l'utilisateur
   */
  async getUserCatches(userId) {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select('*')
        .eq('created_by', userId);
      
      if (error) {
        console.error(`Erreur lors de la récupération des captures pour l'utilisateur ${userId}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getUserCatches:', error);
      return [];
    }
  },

  /**
   * Ajoute une nouvelle capture
   * @param {Object} catchData - Données de la capture
   * @returns {Promise<Object>} Capture créée
   */
  async addCatch(catchData) {
    try {
      // Récupérer l'utilisateur actuel
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Créer la nouvelle capture avec l'ID utilisateur de Supabase
      const newCatch = createCatch({
        ...catchData,
        createdBy: authData.user.id
      });

      // Insérer dans la base de données Supabase
      const { data, error } = await supabase
        .from('catches')
        .insert([
          {
            spot_name: newCatch.spotId,
            fishes: newCatch.fishes,
            bait: newCatch.bait,
            fishing_type: newCatch.fishingType,
            weather: newCatch.weather,
            water_type: newCatch.waterType,
            photo: newCatch.photo,
            notes: newCatch.notes,
            catch_date: newCatch.catchDate,
            created_at: newCatch.createdAt,
            created_by: authData.user.id
          }
        ])
        .select();
      
      if (error) {
        console.error('Erreur lors de l\'ajout de la capture:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Erreur dans addCatch:', error);
      throw error;
    }
  },

  /**
   * Met à jour une capture existante
   * @param {Object} catchData - Données de la capture à mettre à jour
   * @returns {Promise<Object>} Capture mise à jour
   */
  async updateCatch(catchData) {
    try {
      // Récupérer l'utilisateur actuel pour vérification
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier si la capture appartient à l'utilisateur
      const { data: catchCheck, error: checkError } = await supabase
        .from('catches')
        .select('created_by')
        .eq('id', catchData.id)
        .single();
      
      if (checkError) {
        console.error('Erreur lors de la vérification de la capture:', checkError);
        throw checkError;
      }

      // Sécurité: vérifier que l'utilisateur actuel est bien le propriétaire de la capture
      if (catchCheck && catchCheck.created_by !== authData.user.id) {
        throw new Error('Vous n\'êtes pas autorisé à modifier cette capture');
      }

      // Mettre à jour la capture
      const { data, error } = await supabase
        .from('catches')
        .update({
          spot_name: catchData.spotId,
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
    } catch (error) {
      console.error('Erreur dans updateCatch:', error);
      throw error;
    }
  },

  /**
   * Supprime une capture
   * @param {string} catchId - ID de la capture à supprimer
   * @returns {Promise<boolean>} true si la suppression a réussi
   */
  async deleteCatch(catchId) {
    try {
      // Récupérer l'utilisateur actuel pour vérification
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier si la capture appartient à l'utilisateur
      const { data: catchCheck, error: checkError } = await supabase
        .from('catches')
        .select('created_by')
        .eq('id', catchId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // Ignorer l'erreur "No rows found"
        console.error('Erreur lors de la vérification de la capture:', checkError);
        throw checkError;
      }

      // Sécurité: vérifier que l'utilisateur actuel est bien le propriétaire de la capture
      if (catchCheck && catchCheck.created_by !== authData.user.id) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer cette capture');
      }

      // Supprimer la capture
      const { error } = await supabase
        .from('catches')
        .delete()
        .eq('id', catchId);
      
      if (error) {
        console.error('Erreur lors de la suppression de la capture:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur dans deleteCatch:', error);
      throw error;
    }
  },

  /**
   * Récupère les captures pour un spot spécifique
   * @param {string} spotName - Nom du spot
   * @returns {Promise<Array>} Liste des captures
   */
  async getSpotCatches(spotName) {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select(`
          *,
          profiles(id, username, avatar_url)
        `)
        .eq('spot_name', spotName)
        .order('catch_date', { ascending: false });
      
      if (error) {
        console.error(`Erreur lors de la récupération des captures pour le spot ${spotName}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getSpotCatches:', error);
      throw error;
    }
  },
  
  /**
   * Récupère une capture par son ID
   * @param {string} catchId - ID de la capture
   * @returns {Promise<Object>} Détails de la capture
   */
  async getCatchById(catchId) {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select(`
          *,
          profiles(id, username, avatar_url)
        `)
        .eq('id', catchId)
        .single();
      
      if (error) {
        console.error(`Erreur lors de la récupération de la capture ${catchId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans getCatchById:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les captures à proximité d'une localisation
   * @param {Object} location - Coordonnées {lat, lng}
   * @param {number} radius - Rayon en kilomètres (défaut: 50)
   * @returns {Promise<Array>} Liste des captures
   */
  async getCatchesNearLocation(location, radius = 50) {
    try {
      // Cette fonction nécessite une extension PostGIS sur Supabase
      // ou un calcul de distance côté client
      
      // Récupérer toutes les captures qui ont une localisation
      const { data, error } = await supabase
        .from('catches')
        .select(`
          *,
          profiles(id, username, avatar_url),
          spots(id, name, location, water_type)
        `)
        .not('location', 'is', null)
        .order('catch_date', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des captures avec localisation:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Calcul de distance côté client
      // Formule de Haversine pour calculer la distance entre deux points
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      // Filtrer les captures dans le rayon spécifié
      const catchesInRadius = data.filter(catchItem => {
        const catchLat = catchItem.location?.lat || catchItem.spots?.location?.lat;
        const catchLng = catchItem.location?.lng || catchItem.spots?.location?.lng;
        
        if (!catchLat || !catchLng) return false;
        
        const distance = calculateDistance(
          location.lat, 
          location.lng, 
          catchLat, 
          catchLng
        );
        
        return distance <= radius;
      });
      
      return catchesInRadius;
    } catch (error) {
      console.error('Erreur dans getCatchesNearLocation:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les statistiques de captures d'un utilisateur
   * @param {string} userId - ID de l'utilisateur (optionnel, utilise l'utilisateur actuel par défaut)
   * @returns {Promise<Object>} Statistiques des captures
   */
  async getUserCatchStats(userId = null) {
    try {
      // Si aucun userId n'est fourni, utiliser l'utilisateur actuel
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('Utilisateur non connecté');
        }
        targetUserId = userData.user.id;
      }
      
      // Récupérer toutes les captures de l'utilisateur
      const catches = await this.getUserCatches(targetUserId);
      
      if (!catches || catches.length === 0) {
        return {
          totalCatches: 0,
          fishTypeStats: {},
          averageWeight: 0,
          averageLength: 0,
          catchesPerMonth: {},
          largestCatch: null,
          recentSpots: []
        };
      }
      
      // Calculer les statistiques
      const stats = {
        totalCatches: catches.length,
        fishTypeStats: {},
        catchesPerMonth: {},
        spotsVisited: new Set(),
        totalWeight: 0,
        weighedCatches: 0,
        totalLength: 0,
        measuredCatches: 0,
        largestCatch: null,
        recentSpots: []
      };
      
      // Traiter chaque capture
      catches.forEach(catchItem => {
        // Statistiques par type de poisson
        const fishType = catchItem.fish_type === 'custom' 
          ? catchItem.custom_fish_type 
          : catchItem.fish_type;
        
        if (!stats.fishTypeStats[fishType]) {
          stats.fishTypeStats[fishType] = 0;
        }
        stats.fishTypeStats[fishType]++;
        
        // Statistiques par mois
        const catchDate = new Date(catchItem.catch_date || catchItem.created_at);
        const monthKey = `${catchDate.getFullYear()}-${catchDate.getMonth() + 1}`;
        if (!stats.catchesPerMonth[monthKey]) {
          stats.catchesPerMonth[monthKey] = 0;
        }
        stats.catchesPerMonth[monthKey]++;
        
        // Spots visités
        if (catchItem.spot_name) {
          stats.spotsVisited.add(catchItem.spot_name);
        }
        
        // Poids et taille
        if (catchItem.weight) {
          stats.totalWeight += parseFloat(catchItem.weight);
          stats.weighedCatches++;
          
          // Mise à jour de la plus grosse prise
          if (!stats.largestCatch || parseFloat(catchItem.weight) > parseFloat(stats.largestCatch.weight)) {
            stats.largestCatch = catchItem;
          }
        }
        
        if (catchItem.length) {
          stats.totalLength += parseFloat(catchItem.length);
          stats.measuredCatches++;
        }
      });
      
      // Calculer les moyennes
      stats.averageWeight = stats.weighedCatches > 0 
        ? stats.totalWeight / stats.weighedCatches 
        : 0;
      
      stats.averageLength = stats.measuredCatches > 0 
        ? stats.totalLength / stats.measuredCatches 
        : 0;
      
      // Récupérer les spots récents (limité à 5)
      const recentSpotsSet = new Set();
      for (const catchItem of catches) {
        if (catchItem.spot_name && !recentSpotsSet.has(catchItem.spot_name)) {
          recentSpotsSet.add(catchItem.spot_name);
          
          // Créer un objet de spot simplifié à partir du nom du spot
          stats.recentSpots.push({
            name: catchItem.spot_name
          });
          
          if (stats.recentSpots.length >= 5) break;
        }
      }
      
      // Finaliser les stats
      return {
        totalCatches: stats.totalCatches,
        fishTypeStats: stats.fishTypeStats,
        averageWeight: stats.averageWeight,
        averageLength: stats.averageLength,
        catchesPerMonth: stats.catchesPerMonth,
        spotsVisited: stats.spotsVisited.size,
        largestCatch: stats.largestCatch,
        recentSpots: stats.recentSpots
      };
    } catch (error) {
      console.error('Erreur dans getUserCatchStats:', error);
      throw error;
    }
  }
}; 