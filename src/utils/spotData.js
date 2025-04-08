import { createSpot } from '../models/dataModels';
import { FISH_TYPES, WATER_TYPES, FISHING_TYPES } from '../models/dataModels';

// Fonction pour générer un ID unique basé sur le nom
const generateIdFromName = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

// Données des spots de pêche
export const spotData = [
  // Eau douce - Carnassiers
  {
    name: "Lac du Der (Marne)",
    description: "Réputé pour les carnassiers, le lac du Der est l'un des plus grands lacs artificiels d'Europe. Idéal pour la pêche du brochet et du sandre.",
    type: "Lac",
    fishTypes: [FISH_TYPES.PIKE, FISH_TYPES.ZANDER, FISH_TYPES.PERCH],
    address: "Lac du Der, 51290 Giffaumont-Champaubert",
    location: { lat: 48.5722, lng: 4.7484 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.CASTING
  },
  {
    name: "Lac de Vassivière (Haute-Vienne)",
    description: "Perches et brochets très présents dans ce lac naturel de 1000 hectares. Pêche en barque recommandée.",
    type: "Lac",
    fishTypes: [FISH_TYPES.PIKE, FISH_TYPES.PERCH],
    address: "Lac de Vassivière, 87470 Peyrat-le-Château",
    location: { lat: 45.8006, lng: 1.8451 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Lac de Pareloup (Aveyron)",
    description: "Très bon spot pour sandres. Ce lac de barrage offre d'excellentes opportunités pour les pêcheurs de carnassiers.",
    type: "Lac",
    fishTypes: [FISH_TYPES.ZANDER, FISH_TYPES.PIKE, FISH_TYPES.PERCH],
    address: "Lac de Pareloup, 12410 Salles-Curan",
    location: { lat: 44.1958, lng: 2.7806 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.CASTING
  },
  {
    name: "Canal du Midi (Toulouse - Béziers)",
    description: "Perche et sandre en abondance dans ce canal historique. Les zones proches des écluses sont particulièrement poissonneuses.",
    type: "Canal",
    fishTypes: [FISH_TYPES.PERCH, FISH_TYPES.ZANDER],
    address: "Canal du Midi, 31000 Toulouse",
    location: { lat: 43.6047, lng: 1.4442 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.COARSE
  },
  {
    name: "Lac Léman (Haute-Savoie)",
    description: "Brochets records dans le plus grand lac d'Europe occidentale. La pêche en traîne y est particulièrement efficace.",
    type: "Lac",
    fishTypes: [FISH_TYPES.PIKE],
    address: "Lac Léman, 74500 Évian-les-Bains",
    location: { lat: 46.4003, lng: 6.5757 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.TROLLING
  },
  
  // Eau douce - Truites
  {
    name: "Rivière la Loue (Doubs)",
    description: "Rivière de première catégorie, parfaite pour truite sauvage. Les eaux cristallines de cette rivière calcaire offrent des conditions idéales.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.BROWN_TROUT, FISH_TYPES.RAINBOW_TROUT],
    address: "La Loue, 25290 Ornans",
    location: { lat: 47.1028, lng: 6.1431 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.FLY
  },
  {
    name: "La Sioule (Auvergne)",
    description: "Idéale pour la pêche à la mouche de la truite fario. La Sioule traverse des gorges magnifiques et offre des parcours variés.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.BROWN_TROUT],
    address: "La Sioule, 63440 Saint-Pardoux",
    location: { lat: 46.0167, lng: 2.9333 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.FLY
  },
  {
    name: "Le Gave d'Oloron (Pyrénées-Atlantiques)",
    description: "Réputé pour ses truites et saumons, ce gave offre des sensations fortes aux pêcheurs à la mouche.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.BROWN_TROUT, FISH_TYPES.RAINBOW_TROUT],
    address: "Gave d'Oloron, 64400 Oloron-Sainte-Marie",
    location: { lat: 43.1947, lng: -0.6042 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.FLY
  },
  {
    name: "Rivière Dordogne (Corrèze)",
    description: "Belles truites et ombres dans un cadre naturel exceptionnel. La Dordogne offre des secteurs variés adaptés à tous les niveaux.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.BROWN_TROUT, FISH_TYPES.RAINBOW_TROUT],
    address: "Dordogne, 19400 Argentat",
    location: { lat: 45.0934, lng: 1.9394 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.FLY
  },
  {
    name: "L'Ain (Jura)",
    description: "Eau claire, parfaite pour la pêche de la truite en nymphe. La rivière d'Ain est bordée de falaises calcaires spectaculaires.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.BROWN_TROUT, FISH_TYPES.RAINBOW_TROUT],
    address: "Rivière d'Ain, 39130 Patornay",
    location: { lat: 46.6511, lng: 5.6531 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.FLY
  },
  
  // Eau douce - Cyprinidés
  {
    name: "Étang de la Horre (Aube)",
    description: "Carpes massives dans cet étang naturel classé réserve nationale. Un spot mythique pour les carpistes.",
    type: "Étang",
    fishTypes: [FISH_TYPES.CARP, FISH_TYPES.TENCH, FISH_TYPES.BREAM],
    address: "Étang de la Horre, 10500 Lentilles",
    location: { lat: 48.4822, lng: 4.6517 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.COARSE
  },
  {
    name: "Lac de Saint-Cassien (Var)",
    description: "Spot carpe légendaire en France, connu pour ses spécimens exceptionnels et son cadre méditerranéen.",
    type: "Lac",
    fishTypes: [FISH_TYPES.CARP],
    address: "Lac de Saint-Cassien, 83440 Montauroux",
    location: { lat: 43.5639, lng: 6.7794 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.COARSE
  },
  {
    name: "Canal de Bourgogne",
    description: "Pêche au coup classique, gardons et brèmes en abondance. Idéal pour les débutants et la pêche familiale.",
    type: "Canal",
    fishTypes: [FISH_TYPES.ROACH, FISH_TYPES.BREAM],
    address: "Canal de Bourgogne, 21000 Dijon",
    location: { lat: 47.3220, lng: 5.0415 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.COARSE
  },
  {
    name: "Étang des Landes (Creuse)",
    description: "Réserve naturelle riche en carpe et poissons blancs. La plus grande zone humide naturelle du Limousin.",
    type: "Étang",
    fishTypes: [FISH_TYPES.CARP, FISH_TYPES.ROACH, FISH_TYPES.TENCH, FISH_TYPES.BREAM],
    address: "Étang des Landes, 23170 Lussat",
    location: { lat: 46.1880, lng: 2.3336 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.COARSE
  },
  
  // Eau douce - Silures
  {
    name: "Le Rhône (Vienne à Arles)",
    description: "Silures énormes dans ce fleuve puissant. La région entre Lyon et Valence offre d'excellents postes.",
    type: "Fleuve",
    fishTypes: [FISH_TYPES.CATFISH, FISH_TYPES.PIKE, FISH_TYPES.ZANDER],
    address: "Le Rhône, 26000 Valence",
    location: { lat: 44.9334, lng: 4.8924 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.CASTING
  },
  {
    name: "La Saône (Lyon à Chalon)",
    description: "Pêche de nuit au silure productive. La Saône est connue pour ses spécimens de taille exceptionnelle.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.CATFISH, FISH_TYPES.ZANDER],
    address: "La Saône, 71100 Chalon-sur-Saône",
    location: { lat: 46.7798, lng: 4.8529 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.CASTING
  },
  {
    name: "Le Tarn (Albi, Gaillac)",
    description: "Très bons coins pour les gros silures, dans un cadre naturel et historique remarquable.",
    type: "Rivière",
    fishTypes: [FISH_TYPES.CATFISH, FISH_TYPES.CARP],
    address: "Le Tarn, 81000 Albi",
    location: { lat: 43.9289, lng: 2.1486 },
    waterType: WATER_TYPES.FRESH,
    fishingType: FISHING_TYPES.CASTING
  },
  
  // Eau salée - Bar
  {
    name: "Baie du Mont-Saint-Michel (Manche)",
    description: "Spot exceptionnel pour la pêche du bar, au pied d'un des sites les plus visités de France.",
    type: "Mer",
    fishTypes: [FISH_TYPES.BASS, FISH_TYPES.MULLET],
    address: "Baie du Mont-Saint-Michel, 50170 Le Mont-Saint-Michel",
    location: { lat: 48.6361, lng: -1.5115 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SURF
  },
  {
    name: "Presqu'île de Quiberon (Morbihan)",
    description: "Excellente pêche du bar en surfcasting ou aux leurres. La côte sauvage offre des postes variés.",
    type: "Mer",
    fishTypes: [FISH_TYPES.BASS, FISH_TYPES.SEA_BREAM],
    address: "Presqu'île de Quiberon, 56170 Quiberon",
    location: { lat: 47.4867, lng: -3.1252 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SURF
  },
  {
    name: "Étang de Thau (Hérault)",
    description: "Spot réputé pour le bar et les daurades, dans cette lagune méditerranéenne peu profonde.",
    type: "Étang",
    fishTypes: [FISH_TYPES.BASS, FISH_TYPES.SEA_BREAM],
    address: "Étang de Thau, 34140 Bouzigues",
    location: { lat: 43.4467, lng: 3.6408 },
    waterType: WATER_TYPES.BRACKISH,
    fishingType: FISHING_TYPES.CASTING
  },
  {
    name: "Golfe du Morbihan (56)",
    description: "Pêche au leurre du bord productive, dans ce golfe aux nombreuses îles et courants.",
    type: "Mer",
    fishTypes: [FISH_TYPES.BASS, FISH_TYPES.SEA_BREAM],
    address: "Golfe du Morbihan, 56000 Vannes",
    location: { lat: 47.5583, lng: -2.7600 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.CASTING
  },
  
  // Eau salée - Sparidés
  {
    name: "Port-Camargue (Gard)",
    description: "Spot prisé pour la dorade et le sar, dans le plus grand port de plaisance d'Europe.",
    type: "Port",
    fishTypes: [FISH_TYPES.SEA_BREAM, FISH_TYPES.BLACK_SEABREAM, FISH_TYPES.RED_PORGY],
    address: "Port-Camargue, 30240 Le Grau-du-Roi",
    location: { lat: 43.5214, lng: 4.1331 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.HANDLINE
  },
  {
    name: "Sète (Hérault)",
    description: "La pêche des sparidés y est productive toute l'année, notamment depuis les digues du port.",
    type: "Port",
    fishTypes: [FISH_TYPES.SEA_BREAM, FISH_TYPES.BLACK_SEABREAM],
    address: "Port de Sète, 34200 Sète",
    location: { lat: 43.4016, lng: 3.6928 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.HANDLINE
  },
  {
    name: "Bandol / Sanary (Var)",
    description: "Spots réputés pour la dorade royale et le sar, dans un cadre méditerranéen exceptionnel.",
    type: "Mer",
    fishTypes: [FISH_TYPES.SEA_BREAM, FISH_TYPES.BLACK_SEABREAM, FISH_TYPES.RED_PORGY],
    address: "Bandol, 83150 Bandol",
    location: { lat: 43.1361, lng: 5.7542 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SURF
  },
  {
    name: "Bassin d'Arcachon (Gironde)",
    description: "La pêche des sparidés y est productive, notamment au printemps et en automne.",
    type: "Mer",
    fishTypes: [FISH_TYPES.SEA_BREAM, FISH_TYPES.BLACK_SEABREAM],
    address: "Bassin d'Arcachon, 33120 Arcachon",
    location: { lat: 44.6622, lng: -1.1681 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.CASTING
  },
  
  // Eau salée - Poissons du Nord
  {
    name: "Saint-Malo (Ille-et-Vilaine)",
    description: "Spot réputé pour le maquereau et le lieu, accessible depuis les digues et remparts.",
    type: "Mer",
    fishTypes: [FISH_TYPES.MACKEREL, FISH_TYPES.POLLACK, FISH_TYPES.COD],
    address: "Saint-Malo, 35400 Saint-Malo",
    location: { lat: 48.6493, lng: -2.0257 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SURF
  },
  {
    name: "Douarnenez (Finistère)",
    description: "La baie de Douarnenez est connue pour ses bancs de maquereaux et ses lieus.",
    type: "Mer",
    fishTypes: [FISH_TYPES.MACKEREL, FISH_TYPES.POLLACK],
    address: "Douarnenez, 29100 Douarnenez",
    location: { lat: 48.0967, lng: -4.3303 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Dieppe (Seine-Maritime)",
    description: "Pêche en bateau productive pour le cabillaud et le maquereau, au départ de ce port historique.",
    type: "Port",
    fishTypes: [FISH_TYPES.COD, FISH_TYPES.MACKEREL],
    address: "Port de Dieppe, 76200 Dieppe",
    location: { lat: 49.9289, lng: 1.0824 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "La Turballe (Loire-Atlantique)",
    description: "Pêche en mer profonde pour lieu, cabillaud et maquereau, au départ de ce port de pêche actif.",
    type: "Port",
    fishTypes: [FISH_TYPES.POLLACK, FISH_TYPES.COD, FISH_TYPES.MACKEREL],
    address: "Port de La Turballe, 44420 La Turballe",
    location: { lat: 47.3483, lng: -2.5128 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  
  // Eau salée - Gros poissons pélagiques
  {
    name: "Port-Vendres (Pyrénées-Orientales)",
    description: "Spot renommé pour la pêche du thon rouge en Méditerranée. Sorties en bateau très productives.",
    type: "Port",
    fishTypes: [FISH_TYPES.TUNA],
    address: "Port-Vendres, 66660 Port-Vendres",
    location: { lat: 42.5179, lng: 3.1069 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Capbreton (Landes)",
    description: "Connu pour la pêche au gros, notamment le thon et le marlin. Le gouf de Capbreton attire de nombreuses espèces.",
    type: "Port",
    fishTypes: [FISH_TYPES.TUNA, FISH_TYPES.BONITO],
    address: "Port de Capbreton, 40130 Capbreton",
    location: { lat: 43.6519, lng: -1.4467 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Biarritz / Hendaye",
    description: "La côte basque offre d'excellentes conditions pour la pêche du thon et de la bonite.",
    type: "Mer",
    fishTypes: [FISH_TYPES.TUNA, FISH_TYPES.BONITO],
    address: "Biarritz, 64200 Biarritz",
    location: { lat: 43.4832, lng: -1.5586 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Ajaccio / Propriano (Corse)",
    description: "Spots réputés pour le thon rouge et l'espadon en Méditerranée occidentale.",
    type: "Mer",
    fishTypes: [FISH_TYPES.TUNA],
    address: "Ajaccio, 20000 Ajaccio",
    location: { lat: 41.9192, lng: 8.7386 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.TROLLING
  },
  {
    name: "Côtes marseillaises (Bouches-du-Rhône)",
    description: "Spots excellents pour la pêche sous-marine, riches en variété de poissons méditerranéens.",
    type: "Mer",
    fishTypes: [FISH_TYPES.SEA_BREAM, FISH_TYPES.RED_MULLET, FISH_TYPES.SCORPIONFISH],
    address: "Calanques, 13008 Marseille",
    location: { lat: 43.2155, lng: 5.3695 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SPEARFISHING
  },
  {
    name: "Corse - Porto Vecchio",
    description: "Eaux cristallines idéales pour la pêche au harpon, sar et dorades accessibles près des côtes.",
    type: "Mer",
    fishTypes: [FISH_TYPES.BLACK_SEABREAM, FISH_TYPES.RED_MULLET],
    address: "Porto Vecchio, 20137 Corse",
    location: { lat: 41.5912, lng: 9.2756 },
    waterType: WATER_TYPES.SALT,
    fishingType: FISHING_TYPES.SPEARFISHING
  }
];

// Fonction pour créer les spots avec le format attendu par l'application
export const createInitialSpots = () => {
  return spotData.map(spot => createSpot({
    id: generateIdFromName(spot.name),
    name: spot.name,
    description: spot.description,
    type: spot.type,
    fishTypes: spot.fishTypes,
    address: spot.address,
    location: spot.location,
    waterType: spot.waterType,
    fishingType: spot.fishingType,
    createdBy: 'default-user',
    createdAt: new Date().toISOString()
  }));
}; 