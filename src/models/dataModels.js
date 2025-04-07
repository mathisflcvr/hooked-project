// Types de pêche disponibles
export const FISHING_TYPES = {
  CASTING: 'casting',
  FLY: 'fly',
  COARSE: 'coarse',
  SURF: 'surf',
  ICE: 'ice'
};

// Types de poissons disponibles
export const FISH_TYPES = {
  PIKE: 'pike',
  ZANDER: 'zander',
  TROUT: 'trout',
  BASS: 'bass',
  CARP: 'carp',
  CATFISH: 'catfish'
};

// Modèle pour un spot de pêche
export const createFishingSpot = (data) => ({
  id: data.id,
  name: data.name,
  description: data.description,
  location: {
    lat: data.location.lat,
    lng: data.location.lng
  },
  fishingType: data.fishingType,
  fishTypes: data.fishTypes,
  createdAt: data.createdAt,
  createdBy: data.createdBy
});

// Modèle pour une capture
export const createCatch = (data) => ({
  id: data.id,
  spotId: data.spotId,
  fishType: data.fishType,
  photo: data.photo,
  bait: data.bait,
  technique: data.technique,
  weather: data.weather,
  weight: data.weight,
  length: data.length,
  notes: data.notes,
  createdAt: data.createdAt,
  createdBy: data.createdBy
});

// Modèle pour une interaction (like/commentaire)
export const createInteraction = (data) => ({
  id: data.id,
  type: data.type, // 'like' ou 'comment'
  catchId: data.catchId,
  userId: data.userId,
  content: data.content, // Pour les commentaires
  createdAt: data.createdAt
}); 