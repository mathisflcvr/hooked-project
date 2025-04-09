// Types de pêche disponibles
export const FISHING_TYPES = {
  CASTING: 'casting',
  FLY: 'fly',
  COARSE: 'coarse',
  SURF: 'surf',
  ICE: 'ice',
  TROLLING: 'trolling',      // Pêche à la traîne
  SPEARFISHING: 'spearfishing', // Pêche au harpon
  HANDLINE: 'handline',      // Pêche à la ligne à main
  LONGLINE: 'longline',      // Pêche à la palangre
  JIGGING: 'jigging'         // Pêche au jig
};

// Traduction des types de pêche
export const FISHING_TYPES_FR = {
  [FISHING_TYPES.CASTING]: 'Lancer',
  [FISHING_TYPES.FLY]: 'Mouche',
  [FISHING_TYPES.COARSE]: 'Coup',
  [FISHING_TYPES.SURF]: 'Surfcasting',
  [FISHING_TYPES.ICE]: 'Glace',
  [FISHING_TYPES.TROLLING]: 'Traîne',
  [FISHING_TYPES.SPEARFISHING]: 'Harpon',
  [FISHING_TYPES.HANDLINE]: 'Ligne à main',
  [FISHING_TYPES.LONGLINE]: 'Palangre',
  [FISHING_TYPES.JIGGING]: 'Jig'
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
export const createSpot = (data) => ({
  id: data.id || Date.now().toString(),
  name: data.name,
  description: data.description,
  type: data.type || 'Autre',
  location: data.location || {
    lat: 48.8566, 
    lng: 2.3522
  }, // Paris par défaut
  address: data.address || null,
  image: data.image || null,
  waterType: data.waterType || getDefaultWaterType(data.type), // Détermine automatiquement le type d'eau
  fishTypes: data.fishTypes || [],
  createdAt: data.createdAt || new Date().toISOString(),
  createdBy: data.createdBy
});

/**
 * Détermine le type d'eau par défaut en fonction du type de spot
 * @param {string} spotType - Type de spot (Lac, Rivière, Mer, etc.)
 * @returns {string} Type d'eau (fresh, salt, brackish)
 */
const getDefaultWaterType = (spotType) => {
  if (!spotType) return WATER_TYPES.FRESH;
  
  const saltWaterTypes = ['Mer', 'Océan', 'Port', 'Plage', 'Baie'];
  const brackishWaterTypes = ['Estuaire', 'Delta'];
  
  if (saltWaterTypes.some(type => spotType.includes(type))) {
    return WATER_TYPES.SALT;
  }
  
  if (brackishWaterTypes.some(type => spotType.includes(type))) {
    return WATER_TYPES.BRACKISH;
  }
  
  // Par défaut, eau douce
  return WATER_TYPES.FRESH;
};

// Modèle pour un poisson capturé
export const createCaughtFish = (data) => ({
  id: data.id || Date.now().toString() + Math.floor(Math.random() * 1000),
  fishType: data.fishType,
  customFishType: data.customFishType || null, // Type de poisson personnalisé
  name: data.name || null, // Nom personnalisé donné au poisson
  weight: data.weight,
  length: data.length
});

// Modèle pour une capture
export const createCatch = (data) => ({
  id: data.id || Date.now().toString(),
  spotId: data.spotId, // Conservé pour compatibilité, mais contient maintenant le nom du spot
  // La localisation vient maintenant du spot associé
  address: data.address || null, // Adresse textuelle (optionnelle)
  fishes: data.fishes || [], // Liste des poissons capturés
  waterType: data.waterType || WATER_TYPES.FRESH, // Type d'eau
  photo: data.photo,
  bait: data.bait,
  technique: data.technique,
  weather: data.weather,
  notes: data.notes,
  catchDate: data.catchDate || new Date().toISOString(), // Date de la capture
  createdAt: data.createdAt || new Date().toISOString(),
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