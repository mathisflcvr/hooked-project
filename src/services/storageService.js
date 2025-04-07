const STORAGE_KEYS = {
  SPOTS: 'fishing_spots',
  CATCHES: 'catches',
  INTERACTIONS: 'interactions',
  USERS: 'users',
  CUSTOM_FISH_TYPES: 'custom_fish_types',
  FAVORITES: 'favorites',
  CURRENT_USER: 'current_user'
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
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  },

  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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
  }
}; 