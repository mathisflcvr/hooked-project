const STORAGE_KEYS = {
  SPOTS: 'fishing_spots',
  CATCHES: 'catches',
  INTERACTIONS: 'interactions',
  USERS: 'users'
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
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    spots.push(newSpot);
    this.setItem(STORAGE_KEYS.SPOTS, spots);
    return newSpot;
  },

  // Méthodes spécifiques pour les captures
  getCatches() {
    return this.getItem(STORAGE_KEYS.CATCHES);
  },

  addCatch(catchData) {
    const catches = this.getCatches();
    const newCatch = {
      ...catchData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    catches.push(newCatch);
    this.setItem(STORAGE_KEYS.CATCHES, catches);
    return newCatch;
  },

  // Méthodes spécifiques pour les interactions
  getInteractions() {
    return this.getItem(STORAGE_KEYS.INTERACTIONS);
  },

  addInteraction(interaction) {
    const interactions = this.getInteractions();
    const newInteraction = {
      ...interaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    interactions.push(newInteraction);
    this.setItem(STORAGE_KEYS.INTERACTIONS, interactions);
    return newInteraction;
  }
}; 