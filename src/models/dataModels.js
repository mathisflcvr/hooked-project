// Types de pêche disponibles
export const FISHING_TYPES = {
  CASTING: 'casting',
  FLY: 'fly',
  COARSE: 'coarse',
  SURF: 'surf',
  ICE: 'ice'
};

// Types d'eau
export const WATER_TYPES = {
  FRESH: 'fresh',
  SALT: 'salt',
  BRACKISH: 'brackish'
};

// Types de poissons
export const FISH_TYPES = {
  // Poissons d'eau douce
  PIKE: 'pike',
  PERCH: 'perch',
  ZANDER: 'zander',
  BROWN_TROUT: 'brown_trout',
  RAINBOW_TROUT: 'rainbow_trout',
  CARP: 'carp',
  ROACH: 'roach',
  BREAM: 'bream',
  CATFISH: 'catfish',
  CHUB: 'chub',
  TENCH: 'tench',
  EEL: 'eel',
  RUDD: 'rudd',
  
  // Poissons d'eau salée
  BASS: 'bass',
  SEA_BREAM: 'sea_bream',
  MACKEREL: 'mackerel',
  POLLACK: 'pollack',
  COD: 'cod',
  TUNA: 'tuna',
  BONITO: 'bonito',
  MULLET: 'mullet',
  BLACK_SEABREAM: 'black_seabream',
  RED_PORGY: 'red_porgy',
  TURBOT: 'turbot',
  SOLE: 'sole',
  RED_MULLET: 'red_mullet',
  SCORPIONFISH: 'scorpionfish',
  
  // Poissons d'eau saumâtre
  // Note: certains sont déjà inclus comme le bar (BASS), le mulet (MULLET) et l'anguille (EEL)
  SUNFISH: 'sunfish'
};

// Groupes de poissons par type d'eau
export const FISH_BY_WATER_TYPE = {
  [WATER_TYPES.FRESH]: [
    FISH_TYPES.PIKE,
    FISH_TYPES.PERCH,
    FISH_TYPES.ZANDER,
    FISH_TYPES.BROWN_TROUT,
    FISH_TYPES.RAINBOW_TROUT,
    FISH_TYPES.CARP,
    FISH_TYPES.ROACH,
    FISH_TYPES.BREAM,
    FISH_TYPES.CATFISH,
    FISH_TYPES.CHUB,
    FISH_TYPES.TENCH,
    FISH_TYPES.EEL,
    FISH_TYPES.RUDD
  ],
  [WATER_TYPES.SALT]: [
    FISH_TYPES.BASS,
    FISH_TYPES.SEA_BREAM,
    FISH_TYPES.MACKEREL,
    FISH_TYPES.POLLACK,
    FISH_TYPES.COD,
    FISH_TYPES.TUNA,
    FISH_TYPES.BONITO,
    FISH_TYPES.MULLET,
    FISH_TYPES.BLACK_SEABREAM,
    FISH_TYPES.RED_PORGY,
    FISH_TYPES.TURBOT,
    FISH_TYPES.SOLE,
    FISH_TYPES.RED_MULLET,
    FISH_TYPES.SCORPIONFISH
  ],
  [WATER_TYPES.BRACKISH]: [
    FISH_TYPES.MULLET,
    FISH_TYPES.BASS,
    FISH_TYPES.EEL,
    FISH_TYPES.SUNFISH
  ]
};

// Traduction des types de poissons
export const FISH_TYPES_FR = {
  // Poissons d'eau douce
  [FISH_TYPES.PIKE]: 'Brochet',
  [FISH_TYPES.PERCH]: 'Perche',
  [FISH_TYPES.ZANDER]: 'Sandre',
  [FISH_TYPES.BROWN_TROUT]: 'Truite fario',
  [FISH_TYPES.RAINBOW_TROUT]: 'Truite arc-en-ciel',
  [FISH_TYPES.CARP]: 'Carpe',
  [FISH_TYPES.ROACH]: 'Gardon',
  [FISH_TYPES.BREAM]: 'Brème',
  [FISH_TYPES.CATFISH]: 'Silure',
  [FISH_TYPES.CHUB]: 'Chevesne',
  [FISH_TYPES.TENCH]: 'Tanche',
  [FISH_TYPES.EEL]: 'Anguille',
  [FISH_TYPES.RUDD]: 'Rotengle',
  
  // Poissons d'eau salée
  [FISH_TYPES.BASS]: 'Bar (loup de mer)',
  [FISH_TYPES.SEA_BREAM]: 'Dorade',
  [FISH_TYPES.MACKEREL]: 'Maquereau',
  [FISH_TYPES.POLLACK]: 'Lieu',
  [FISH_TYPES.COD]: 'Morue (cabillaud)',
  [FISH_TYPES.TUNA]: 'Thon',
  [FISH_TYPES.BONITO]: 'Bonite',
  [FISH_TYPES.MULLET]: 'Mulet',
  [FISH_TYPES.BLACK_SEABREAM]: 'Sar',
  [FISH_TYPES.RED_PORGY]: 'Pagre',
  [FISH_TYPES.TURBOT]: 'Turbot',
  [FISH_TYPES.SOLE]: 'Sole',
  [FISH_TYPES.RED_MULLET]: 'Rouget',
  [FISH_TYPES.SCORPIONFISH]: 'Rascasse',
  
  // Poissons d'eau saumâtre
  [FISH_TYPES.SUNFISH]: 'Perche soleil'
};

// Traduction des types d'eau
export const WATER_TYPES_FR = {
  [WATER_TYPES.FRESH]: 'Eau douce',
  [WATER_TYPES.SALT]: 'Eau salée',
  [WATER_TYPES.BRACKISH]: 'Eau saumâtre'
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
  waterType: data.waterType || WATER_TYPES.FRESH,
  fishingType: data.fishingType,
  fishTypes: data.fishTypes,
  createdAt: data.createdAt,
  createdBy: data.createdBy
});

// Modèle pour une capture
export const createCatch = (data) => ({
  id: data.id,
  spotId: data.spotId,
  location: data.location || null, // Emplacement spécifique de la capture
  fishType: data.fishType,
  customFishType: data.customFishType || null, // Type de poisson personnalisé
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