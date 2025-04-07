const STORAGE_KEYS = {
  SPOTS: 'fishing_spots',
  CATCHES: 'catches',
  INTERACTIONS: 'interactions',
  USERS: 'users',
  CUSTOM_FISH_TYPES: 'custom_fish_types'
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
  }
}; 