// Service de stockage local pour l'application Hooked

const STORAGE_KEYS = {
  FISHING_SPOTS: 'hooked_fishing_spots',
  CATCHES: 'hooked_catches',
  USER_PROFILE: 'hooked_user_profile'
};

export const storageService = {
  // Gestion des spots de pêche
  getFishingSpots: () => {
    const spots = localStorage.getItem(STORAGE_KEYS.FISHING_SPOTS);
    return spots ? JSON.parse(spots) : [];
  },

  saveFishingSpot: (spot) => {
    const spots = storageService.getFishingSpots();
    spots.push(spot);
    localStorage.setItem(STORAGE_KEYS.FISHING_SPOTS, JSON.stringify(spots));
    return spot;
  },

  // Gestion des prises
  getCatches: () => {
    const catches = localStorage.getItem(STORAGE_KEYS.CATCHES);
    return catches ? JSON.parse(catches) : [];
  },

  saveCatch: (catchData) => {
    const catches = storageService.getCatches();
    catches.push(catchData);
    localStorage.setItem(STORAGE_KEYS.CATCHES, JSON.stringify(catches));
    return catchData;
  },

  // Gestion du profil utilisateur
  getUserProfile: () => {
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : {
      id: 'local-user',
      name: 'Local User',
      catches: [],
      favoriteSpots: []
    };
  },

  updateUserProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  }
}; 