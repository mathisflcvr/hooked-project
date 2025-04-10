const STORAGE_KEYS = {
  SPOTS: 'fishing_spots',
  CATCHES: 'catches',
  INTERACTIONS: 'interactions',
  USERS: 'users',
  CUSTOM_FISH_TYPES: 'custom_fish_types',
  FAVORITES: 'favorites',
  CURRENT_USER: 'current_user',
  SYNC_ENABLED: 'sync_enabled'
};

// Utilisateur par défaut
const DEFAULT_USER = {
  id: 'currentUser',
  name: 'Utilisateur',
  email: 'utilisateur@example.com',
  avatar: null,
  bio: 'Pêcheur passionné',
  preferences: {
    theme: 'light',
    notifications: true
  },
  createdAt: new Date().toISOString()
};

export const storageService = {
  // Méthodes génériques
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      // Si l'item existe, on le parse
      if (item !== null) {
        return JSON.parse(item);
      }
      // Sinon on retourne un tableau vide et on initialise la clé
      console.log(`Initialisation de la clé ${key} dans le localStorage`);
      this.setItem(key, []);
      return [];
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return [];
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de ${key}:`, error);
    }
  },

  // Méthodes spécifiques pour les spots
  getSpots() {
    return this.getItem(STORAGE_KEYS.SPOTS);
  },

  addSpot(spot) {
    const spots = this.getSpots();
    const newSpot = {
      ...spot,
      id: spot.id || Date.now().toString(),
      createdAt: spot.createdAt || new Date().toISOString()
    };
    spots.push(newSpot);
    this.setItem(STORAGE_KEYS.SPOTS, spots);
    return newSpot;
  },

  updateSpot(updatedSpot) {
    const spots = this.getSpots();
    const index = spots.findIndex(spot => spot.id === updatedSpot.id);
    if (index !== -1) {
      spots[index] = updatedSpot;
      this.setItem(STORAGE_KEYS.SPOTS, spots);
      return updatedSpot;
    }
    return null;
  },
  
  deleteSpot(spotId) {
    const spots = this.getSpots();
    const filteredSpots = spots.filter(spot => spot.id !== spotId);
    
    if (filteredSpots.length !== spots.length) {
      this.setItem(STORAGE_KEYS.SPOTS, filteredSpots);
      
      // Supprimer également les favoris associés
      const favorites = this.getItem(STORAGE_KEYS.FAVORITES);
      const updatedFavorites = favorites.filter(fav => fav.spotId !== spotId);
      this.setItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
      
      return true;
    }
    
    return false;
  },

  // Méthodes spécifiques pour les captures
  getCatches() {
    return this.getItem(STORAGE_KEYS.CATCHES);
  },

  addCatch(catchData) {
    const catches = this.getCatches();
    const newCatch = {
      ...catchData,
      id: catchData.id || Date.now().toString(),
      createdAt: catchData.createdAt || new Date().toISOString()
    };
    catches.push(newCatch);
    this.setItem(STORAGE_KEYS.CATCHES, catches);
    return newCatch;
  },

  updateCatch(updatedCatch) {
    const catches = this.getCatches();
    const index = catches.findIndex(c => c.id === updatedCatch.id);
    if (index !== -1) {
      catches[index] = updatedCatch;
      this.setItem(STORAGE_KEYS.CATCHES, catches);
      return updatedCatch;
    }
    return null;
  },
  
  deleteCatch(catchId) {
    const catches = this.getCatches();
    const filteredCatches = catches.filter(c => c.id !== catchId);
    
    if (filteredCatches.length !== catches.length) {
      this.setItem(STORAGE_KEYS.CATCHES, filteredCatches);
      return true;
    }
    
    return false;
  },

  // Méthodes spécifiques pour les interactions
  getInteractions() {
    return this.getItem(STORAGE_KEYS.INTERACTIONS);
  },

  addInteraction(interaction) {
    const interactions = this.getInteractions();
    const newInteraction = {
      ...interaction,
      id: interaction.id || Date.now().toString(),
      createdAt: interaction.createdAt || new Date().toISOString()
    };
    interactions.push(newInteraction);
    this.setItem(STORAGE_KEYS.INTERACTIONS, interactions);
    return newInteraction;
  },

  // Méthodes pour les types de poissons personnalisés
  getCustomFishTypes() {
    return this.getItem(STORAGE_KEYS.CUSTOM_FISH_TYPES);
  },

  addCustomFishType(name, waterType) {
    const customFishTypes = this.getCustomFishTypes();
    const newFishType = {
      id: Date.now().toString(),
      name,
      waterType,
      createdAt: new Date().toISOString()
    };
    customFishTypes.push(newFishType);
    this.setItem(STORAGE_KEYS.CUSTOM_FISH_TYPES, customFishTypes);
    return newFishType;
  },
  
  // Méthodes pour la gestion des favoris
  getFavorites(userId = 'currentUser') {
    const favorites = this.getItem(STORAGE_KEYS.FAVORITES);
    return favorites.filter(fav => fav.userId === userId);
  },
  
  addFavorite(spotId, userId = 'currentUser') {
    const favorites = this.getItem(STORAGE_KEYS.FAVORITES);
    
    // Vérifier si le spot est déjà en favori
    const existingFavorite = favorites.find(fav => 
      fav.spotId === spotId && fav.userId === userId
    );
    
    if (existingFavorite) {
      return existingFavorite; // Déjà en favori
    }
    
    // Ajouter aux favoris
    const newFavorite = {
      id: Date.now().toString(),
      userId,
      spotId,
      createdAt: new Date().toISOString()
    };
    
    favorites.push(newFavorite);
    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    return newFavorite;
  },
  
  removeFavorite(spotId, userId = 'currentUser') {
    const favorites = this.getItem(STORAGE_KEYS.FAVORITES);
    const filteredFavorites = favorites.filter(fav => 
      !(fav.spotId === spotId && fav.userId === userId)
    );
    
    this.setItem(STORAGE_KEYS.FAVORITES, filteredFavorites);
    return true;
  },
  
  isSpotFavorite(spotId, userId = 'currentUser') {
    const favorites = this.getItem(STORAGE_KEYS.FAVORITES);
    return favorites.some(fav => fav.spotId === spotId && fav.userId === userId);
  },
  
  getFavoriteSpots(userId = 'currentUser') {
    const favorites = this.getFavorites(userId);
    const spots = this.getSpots();
    
    return favorites.map(fav => {
      const spot = spots.find(spot => spot.id === fav.spotId);
      return spot;
    }).filter(Boolean); // Filtrer les spots non trouvés
  },
  
  // Méthodes pour la gestion des utilisateurs
  getUsers() {
    const users = this.getItem(STORAGE_KEYS.USERS);
    
    // S'il n'y a pas d'utilisateurs, créer l'utilisateur par défaut
    if (users.length === 0) {
      this.setItem(STORAGE_KEYS.USERS, [DEFAULT_USER]);
      return [DEFAULT_USER];
    }
    
    return users;
  },
  
  addUser(user) {
    const users = this.getUsers();
    // Éviter les doublons
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex !== -1) {
      return users[existingIndex]; // L'utilisateur existe déjà
    }
    
    users.push(user);
    this.setItem(STORAGE_KEYS.USERS, users);
    return user;
  },
  
  updateUser(updatedUser) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      this.setItem(STORAGE_KEYS.USERS, users);
      
      // Si c'est l'utilisateur actuel, mettre à jour aussi
      const currentUser = this.getCurrentUser();
      if (currentUser.id === updatedUser.id) {
        this.setCurrentUser(updatedUser);
      }
      
      return updatedUser;
    }
    
    // Si l'utilisateur n'existe pas, l'ajouter
    return this.addUser(updatedUser);
  },
  
  getCurrentUser() {
    // Récupérer l'utilisateur actuel ou utiliser l'utilisateur par défaut
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    // Vérifier si l'utilisateur par défaut existe, sinon le créer
    const users = this.getUsers();
    const defaultUser = users.find(user => user.id === 'currentUser') || DEFAULT_USER;
    
    this.setCurrentUser(defaultUser);
    return defaultUser;
  },
  
  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },
  
  updateCurrentUser(updates) {
    const currentUser = this.getCurrentUser();
    const updatedUser = { ...currentUser, ...updates };
    
    // Mettre à jour dans la liste des utilisateurs
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      this.setItem(STORAGE_KEYS.USERS, users);
    }
    
    // Mettre à jour l'utilisateur courant
    this.setCurrentUser(updatedUser);
    return updatedUser;
  },
  
  // Méthode pour réinitialiser complètement le stockage (utile pour le débogage)
  resetStorage() {
    console.log('Réinitialisation complète du localStorage');
    
    // Supprimer toutes les clés pertinentes
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log(`Clé supprimée: ${key}`);
    });
    
    // Réinitialiser chaque stockage avec un tableau vide
    this.setItem(STORAGE_KEYS.SPOTS, []);
    this.setItem(STORAGE_KEYS.CATCHES, []);
    this.setItem(STORAGE_KEYS.INTERACTIONS, []);
    this.setItem(STORAGE_KEYS.FAVORITES, []);
    this.setItem(STORAGE_KEYS.CUSTOM_FISH_TYPES, []);
    
    // Réinitialiser l'utilisateur par défaut
    this.setItem(STORAGE_KEYS.USERS, [DEFAULT_USER]);
    this.setCurrentUser(DEFAULT_USER);
    
    console.log('Réinitialisation terminée');
    return true;
  },
  
  // Méthode pour vérifier l'état du localStorage
  checkStorage() {
    const storageState = {};
    
    // Vérifier chaque clé
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key);
      let data = null;
      
      try {
        data = value ? JSON.parse(value) : null;
      } catch (e) {
        data = { error: "Impossible de parser les données" };
      }
      
      storageState[name] = {
        exists: value !== null,
        length: data && Array.isArray(data) ? data.length : 0,
        isEmpty: !data || (Array.isArray(data) && data.length === 0)
      };
    });
    
    console.log('État du localStorage:', storageState);
    return storageState;
  },
  
  /**
   * Vérifie si la synchronisation est activée
   * @returns {boolean} L'état de la synchronisation
   */
  isSyncEnabled() {
    try {
      const syncEnabled = localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED);
      return syncEnabled === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'état de synchronisation:', error);
      return false;
    }
  },
  
  /**
   * Active ou désactive la synchronisation
   * @param {boolean} enabled - État de la synchronisation
   */
  setSyncEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Erreur lors de la définition de l\'état de synchronisation:', error);
    }
  },
  
  /**
   * Ajoute un spot avec synchronisation possible
   * @param {Object} spot - Le spot à ajouter
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {Object} Le spot ajouté
   */
  async addSpotWithSync(spot, shouldSync = true) {
    // Ajouter localement
    const newSpot = this.addSpot(spot);
    
    // Synchroniser si activé et demandé
    if (shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après ajout de spot:', error);
      }
    }
    
    return newSpot;
  },
  
  /**
   * Met à jour un spot avec synchronisation possible
   * @param {Object} updatedSpot - Le spot mis à jour
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {Object} Le spot mis à jour ou null
   */
  async updateSpotWithSync(updatedSpot, shouldSync = true) {
    // Mettre à jour localement
    const result = this.updateSpot(updatedSpot);
    
    // Synchroniser si activé et demandé
    if (result && shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après mise à jour de spot:', error);
      }
    }
    
    return result;
  },
  
  /**
   * Supprime un spot avec synchronisation possible
   * @param {string} spotId - ID du spot à supprimer
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {boolean} Succès de l'opération
   */
  async deleteSpotWithSync(spotId, shouldSync = true) {
    // Supprimer localement
    const result = this.deleteSpot(spotId);
    
    // Synchroniser si activé et demandé
    if (result && shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après suppression de spot:', error);
      }
    }
    
    return result;
  },
  
  /**
   * Ajoute une capture avec synchronisation possible
   * @param {Object} catchData - La capture à ajouter
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {Object} La capture ajoutée
   */
  async addCatchWithSync(catchData, shouldSync = true) {
    // Ajouter localement
    const newCatch = this.addCatch(catchData);
    
    // Synchroniser si activé et demandé
    if (shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après ajout de capture:', error);
      }
    }
    
    return newCatch;
  },
  
  /**
   * Met à jour une capture avec synchronisation possible
   * @param {Object} updatedCatch - La capture mise à jour
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {Object} La capture mise à jour ou null
   */
  async updateCatchWithSync(updatedCatch, shouldSync = true) {
    // Mettre à jour localement
    const result = this.updateCatch(updatedCatch);
    
    // Synchroniser si activé et demandé
    if (result && shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après mise à jour de capture:', error);
      }
    }
    
    return result;
  },
  
  /**
   * Supprime une capture avec synchronisation possible
   * @param {string} catchId - ID de la capture à supprimer
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {boolean} Succès de l'opération
   */
  async deleteCatchWithSync(catchId, shouldSync = true) {
    // Supprimer localement
    const result = this.deleteCatch(catchId);
    
    // Synchroniser si activé et demandé
    if (result && shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après suppression de capture:', error);
      }
    }
    
    return result;
  },
  
  /**
   * Ajoute un favori avec synchronisation possible
   * @param {string} spotId - ID du spot à mettre en favori
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {Object} Le favori ajouté
   */
  async addFavoriteWithSync(spotId, userId = 'currentUser', shouldSync = true) {
    // Ajouter localement
    const result = this.addFavorite(spotId, userId);
    
    // Synchroniser si activé et demandé
    if (shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après ajout de favori:', error);
      }
    }
    
    return result;
  },
  
  /**
   * Supprime un favori avec synchronisation possible
   * @param {string} spotId - ID du spot à retirer des favoris
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} shouldSync - Si true, tente de synchroniser avec Supabase
   * @returns {boolean} Succès de l'opération
   */
  async removeFavoriteWithSync(spotId, userId = 'currentUser', shouldSync = true) {
    // Supprimer localement
    const result = this.removeFavorite(spotId, userId);
    
    // Synchroniser si activé et demandé
    if (result && shouldSync && this.isSyncEnabled()) {
      try {
        const { userService } = require('./userService');
        await userService.syncLocalDataToSupabase();
      } catch (error) {
        console.error('Erreur lors de la synchronisation après suppression de favori:', error);
      }
    }
    
    return result;
  },
}; 