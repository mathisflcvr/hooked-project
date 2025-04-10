import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';
import { supabase } from '../lib/supabase';

// Clé d'utilisateur par défaut (pour le mode démo)
const DEFAULT_USER_ID = 'default-user';

/**
 * Service de gestion des utilisateurs
 */
export const userService = {
  /**
   * Récupère l'utilisateur actuel
   * Dans une application réelle, cela vérifierait les cookies/session
   * @returns {Object} L'utilisateur actuel
   */
  getCurrentUser() {
    // En démo, on retourne toujours l'utilisateur par défaut
    const users = storageService.getUsers();
    
    // Si aucun utilisateur n'existe, on crée l'utilisateur par défaut
    if (users.length === 0) {
      const defaultUser = this.createDefaultUser();
      return defaultUser;
    }
    
    // Dans une vraie app, on vérifierait quel utilisateur est connecté
    // Ici, on retourne toujours le premier utilisateur
    return users[0];
  },
  
  /**
   * Crée l'utilisateur par défaut
   * @returns {Object} L'utilisateur par défaut
   */
  createDefaultUser() {
    const defaultUser = {
      id: DEFAULT_USER_ID,
      username: 'Demo User',
      email: 'demo@example.com',
      avatar: null, // URL de l'avatar
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      createdAt: new Date().toISOString()
    };
    
    storageService.addUser(defaultUser);
    return defaultUser;
  },
  
  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} userData - Les données à mettre à jour
   * @returns {Object} L'utilisateur mis à jour
   */
  updateUserProfile(userData) {
    const currentUser = this.getCurrentUser();
    const updatedUser = {
      ...currentUser,
      ...userData,
      // On évite d'écraser certaines propriétés sensibles
      id: currentUser.id,
      createdAt: currentUser.createdAt
    };
    
    if (userData.preferences) {
      updatedUser.preferences = {
        ...currentUser.preferences,
        ...userData.preferences
      };
    }
    
    storageService.updateUser(updatedUser);
    return updatedUser;
  },
  
  /**
   * Met à jour l'avatar de l'utilisateur
   * @param {string} avatarUrl - L'URL de l'avatar
   * @returns {Object} L'utilisateur mis à jour
   */
  updateUserAvatar(avatarUrl) {
    return this.updateUserProfile({
      avatar: avatarUrl
    });
  },
  
  /**
   * Récupère les spots favoris de l'utilisateur
   * @returns {Array} Liste des spots favoris
   */
  getUserFavorites() {
    const currentUser = this.getCurrentUser();
    return storageService.getFavoriteSpots(currentUser.id);
  },
  
  /**
   * Vérifie si un spot est dans les favoris de l'utilisateur
   * @param {string} spotId - ID du spot à vérifier
   * @returns {boolean} true si le spot est un favori
   */
  isSpotFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.isSpotFavorite(spotId, currentUser.id);
  },
  
  /**
   * Ajoute un spot aux favoris
   * @param {string} spotId - ID du spot à ajouter aux favoris
   * @returns {boolean} true si l'ajout a réussi
   */
  addFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.addFavorite(spotId, currentUser.id);
  },
  
  /**
   * Retire un spot des favoris
   * @param {string} spotId - ID du spot à retirer des favoris
   * @returns {boolean} true si le retrait a réussi
   */
  removeFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.removeFavorite(spotId, currentUser.id);
  },
  
  /**
   * Récupère les captures de l'utilisateur
   * @returns {Array} Liste des captures de l'utilisateur
   */
  getUserCatches() {
    const currentUser = this.getCurrentUser();
    return storageService.getCatches().filter(c => c.createdBy === currentUser.id);
  },
  
  /**
   * Synchronise les données locales avec Supabase
   * @returns {Promise<boolean>} Succès de la synchronisation
   */
  async syncLocalDataToSupabase() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.error('Impossible de synchroniser les données : utilisateur non connecté');
        return false;
      }

      // Récupérer les données locales
      const spots = storageService.getSpots();
      const catches = storageService.getCatches();
      const favorites = storageService.getFavorites(currentUser.id);

      // Mettre à jour le profil utilisateur dans Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          stored_spots: spots,
          stored_catches: catches,
          stored_favorites: favorites
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Erreur lors de la synchronisation des données:', error);
        return false;
      }

      console.log('Données synchronisées avec succès dans Supabase');
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des données:', error);
      return false;
    }
  },

  /**
   * Récupère les données stockées dans Supabase et les fusionne avec les données locales
   * @returns {Promise<boolean>} Succès de la récupération
   */
  async fetchDataFromSupabase() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.error('Impossible de récupérer les données : utilisateur non connecté');
        return false;
      }

      // Récupérer le profil de l'utilisateur depuis Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('stored_spots, stored_catches, stored_favorites, bio')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return false;
      }

      if (!data) {
        console.error('Aucun profil trouvé pour cet utilisateur');
        return false;
      }

      // Mettre à jour les données locales
      if (data.stored_spots && Array.isArray(data.stored_spots)) {
        // Fusionner les spots existants avec ceux de Supabase
        const localSpots = storageService.getSpots();
        const combinedSpots = this.mergeArraysById(localSpots, data.stored_spots);
        storageService.setItem(STORAGE_KEYS.SPOTS, combinedSpots);
      }

      if (data.stored_catches && Array.isArray(data.stored_catches)) {
        // Fusionner les captures existantes avec celles de Supabase
        const localCatches = storageService.getCatches();
        const combinedCatches = this.mergeArraysById(localCatches, data.stored_catches);
        storageService.setItem(STORAGE_KEYS.CATCHES, combinedCatches);
      }

      if (data.stored_favorites && Array.isArray(data.stored_favorites)) {
        // Fusionner les favoris existants avec ceux de Supabase
        const localFavorites = storageService.getFavorites(currentUser.id);
        const combinedFavorites = this.mergeArraysById(localFavorites, data.stored_favorites);
        storageService.setItem(STORAGE_KEYS.FAVORITES, combinedFavorites);
      }

      // Mettre à jour la bio de l'utilisateur si elle existe
      if (data.bio) {
        // Mettre à jour l'utilisateur local
        const updatedUser = { ...currentUser, bio: data.bio };
        this.setCurrentUser(updatedUser);
      }

      console.log('Données récupérées avec succès depuis Supabase');
      return true;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return false;
    }
  },

  /**
   * Fusionne deux tableaux d'objets en se basant sur l'ID
   * @param {Array} localArray Tableau local
   * @param {Array} remoteArray Tableau distant
   * @returns {Array} Tableau fusionné
   */
  mergeArraysById(localArray, remoteArray) {
    // Créer un map des éléments locaux
    const localMap = new Map(localArray.map(item => [item.id, item]));

    // Ajouter ou mettre à jour avec les éléments distants
    remoteArray.forEach(remoteItem => {
      // Si l'élément distant existe déjà localement, prendre le plus récent
      if (localMap.has(remoteItem.id)) {
        const localItem = localMap.get(remoteItem.id);
        const localDate = new Date(localItem.updatedAt || localItem.createdAt);
        const remoteDate = new Date(remoteItem.updatedAt || remoteItem.createdAt);

        // Si la version distante est plus récente, la remplacer
        if (remoteDate > localDate) {
          localMap.set(remoteItem.id, remoteItem);
        }
      } else {
        // Si l'élément n'existe pas localement, l'ajouter
        localMap.set(remoteItem.id, remoteItem);
      }
    });

    // Convertir le map en tableau
    return Array.from(localMap.values());
  },

  /**
   * Met à jour la bio de l'utilisateur dans Supabase
   * @param {string} bio Nouvelle bio
   * @returns {Promise<boolean>} Succès de la mise à jour
   */
  async updateUserBio(bio) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.error('Impossible de mettre à jour la bio : utilisateur non connecté');
        return false;
      }

      // Mettre à jour la bio dans Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Erreur lors de la mise à jour de la bio:', error);
        return false;
      }

      // Mettre à jour l'utilisateur local
      const updatedUser = { ...currentUser, bio };
      this.setCurrentUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la bio:', error);
      return false;
    }
  }
}; 