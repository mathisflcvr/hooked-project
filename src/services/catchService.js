import { supabase } from '../lib/supabase';

export const catchService = {
  /**
   * Récupère toutes les captures d'un utilisateur
   * @param {string} userId - ID de l'utilisateur (optionnel, utilise l'utilisateur actuel par défaut)
   * @returns {Promise<Array>} Liste des captures
   */
  async getUserCatches(userId = null) {
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
      
      const { data, error } = await supabase
        .from('catches')
        .select(`
          *,
          spots(id, name, location, water_type)
        `)
        .eq('user_id', targetUserId)
        .order('catch_date', { ascending: false });
      
      if (error) {
        console.error(`Erreur lors de la récupération des captures pour l'utilisateur ${targetUserId}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur dans getUserCatches:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les captures pour un spot spécifique
   * @param {string} spotId - ID du spot
   * @returns {Promise<Array>} Liste des captures
   */
  async getSpotCatches(spotId) {
    try {
      const { data, error } = await supabase
        .from('catches')
        .select(`
          *,
          profiles(id, username, avatar_url)
        `)
        .eq('spot_id', spotId)
        .order('catch_date', { ascending: false });
      
      if (error) {
        console.error(`Erreur lors de la récupération des captures pour le spot ${spotId}:`, error);
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
          profiles(id, username, avatar_url),
          spots(id, name, location, water_type)
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
   * Crée une nouvelle capture
   * @param {Object} catchData - Données de la capture
   * @returns {Promise<Object>} Capture créée
   */
  async createCatch(catchData) {
    try {
      // Vérifier que l'utilisateur est connecté
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Ajouter l'ID de l'utilisateur
      const newCatch = {
        ...catchData,
        user_id: userData.user.id
      };
      
      const { data, error } = await supabase
        .from('catches')
        .insert([newCatch])
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création de la capture:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans createCatch:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour une capture existante
   * @param {string} catchId - ID de la capture
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<Object>} Capture mise à jour
   */
  async updateCatch(catchId, updates) {
    try {
      const { data, error } = await supabase
        .from('catches')
        .update(updates)
        .eq('id', catchId)
        .select()
        .single();
      
      if (error) {
        console.error(`Erreur lors de la mise à jour de la capture ${catchId}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans updateCatch:', error);
      throw error;
    }
  },
  
  /**
   * Supprime une capture
   * @param {string} catchId - ID de la capture
   * @returns {Promise<void>}
   */
  async deleteCatch(catchId) {
    try {
      const { error } = await supabase
        .from('catches')
        .delete()
        .eq('id', catchId);
      
      if (error) {
        console.error(`Erreur lors de la suppression de la capture ${catchId}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteCatch:', error);
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
        if (catchItem.spot_id) {
          stats.spotsVisited.add(catchItem.spot_id);
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
        if (catchItem.spot_id && !recentSpotsSet.has(catchItem.spot_id)) {
          recentSpotsSet.add(catchItem.spot_id);
          
          if (catchItem.spots) {
            stats.recentSpots.push(catchItem.spots);
          }
          
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