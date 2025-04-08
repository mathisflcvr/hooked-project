// Service de météo pour l'application Hooked
import OpenWeatherMap from 'openweathermap-js';

// Clé API OpenWeatherMap
const API_KEY = 'b0de98e9dae92edbbd894af0ed57a9cf';

// Initialisation du client OpenWeatherMap
const openWeatherClient = new OpenWeatherMap({
  apiKey: API_KEY,
  units: 'metric', // Utilisation du système métrique (Celsius)
  language: 'fr' // Langue française pour les descriptions
});

export const weatherService = {
  /**
   * Récupère la météo actuelle pour une localisation
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Données météo
   */
  async getCurrentWeather(lat, lng) {
    try {
      const response = await openWeatherClient.getCurrentWeatherByGeoCoordinates(lat, lng);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      throw error;
    }
  },

  /**
   * Récupère les prévisions météo pour une localisation
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Données de prévision
   */
  async getForecast(lat, lng) {
    try {
      const response = await openWeatherClient.getThreeHourForecastByGeoCoordinates(lat, lng);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des prévisions:', error);
      throw error;
    }
  },

  /**
   * Détermine si les conditions météo sont favorables pour la pêche
   * @param {Object} weatherData - Données météo
   * @param {Array} fishTypes - Types de poissons présents dans le spot
   * @returns {Object} Évaluation des conditions de pêche
   */
  evaluateFishingConditions(weatherData, fishTypes) {
    if (!weatherData || !fishTypes) {
      return {
        score: 0,
        recommendation: 'Données insuffisantes'
      };
    }

    // Paramètres météo importants pour la pêche
    const temp = weatherData.main?.temp || 0;
    const windSpeed = weatherData.wind?.speed || 0;
    const cloudCover = weatherData.clouds?.all || 0;
    const rain = weatherData.rain?.['1h'] || 0;
    const weatherId = weatherData.weather?.[0]?.id || 800;

    // Score initial
    let score = 5; // Score moyen par défaut (0-10)
    
    // Vérifications des conditions
    // 1. Température
    if (temp < 5) score -= 2; // Trop froid
    else if (temp > 30) score -= 2; // Trop chaud
    else if (temp >= 15 && temp <= 25) score += 2; // Idéal
    
    // 2. Vent
    if (windSpeed > 30) score -= 3; // Très venteux
    else if (windSpeed > 20) score -= 2; // Venteux
    else if (windSpeed < 5) score += 1; // Peu venteux
    
    // 3. Couverture nuageuse (les poissons sont souvent plus actifs par temps couvert)
    if (cloudCover >= 30 && cloudCover <= 70) score += 1; // Partiellement nuageux
    else if (cloudCover > 90) score -= 1; // Complètement couvert
    
    // 4. Pluie
    if (rain > 5) score -= 2; // Forte pluie
    else if (rain > 0 && rain <= 2) score += 1; // Légère pluie peut être bénéfique
    
    // 5. Conditions spéciales (orages, etc.)
    if (weatherId >= 200 && weatherId < 300) score -= 3; // Orage
    
    // Limiter le score entre 0 et 10
    score = Math.max(0, Math.min(10, score));
    
    // Recommandation
    let recommendation = '';
    if (score >= 8) {
      recommendation = 'Excellentes conditions de pêche!';
    } else if (score >= 6) {
      recommendation = 'Bonnes conditions de pêche';
    } else if (score >= 4) {
      recommendation = 'Conditions moyennes, mais pêche possible';
    } else if (score >= 2) {
      recommendation = 'Conditions médiocres, prudence recommandée';
    } else {
      recommendation = 'Mauvaises conditions, pêche déconseillée';
    }
    
    return {
      score,
      recommendation,
      details: {
        temperature: temp,
        wind: windSpeed,
        cloudCover,
        rain,
        weatherCondition: weatherData.weather?.[0]?.description || 'Inconnu'
      }
    };
  },
  
  /**
   * Suggère des spots alternatifs basés sur les conditions météo
   * @param {Array} spots - Liste des spots disponibles
   * @param {Object} currentSpotWeather - Conditions météo du spot actuel
   * @param {Array} currentFishTypes - Types de poissons du spot actuel
   * @returns {Promise<Array>} Spots alternatifs recommandés
   */
  async suggestAlternativeSpots(spots, currentSpotWeather, currentFishTypes) {
    // Si les conditions sont déjà bonnes, pas besoin d'alternatives
    const currentConditions = this.evaluateFishingConditions(currentSpotWeather, currentFishTypes);
    if (currentConditions.score >= 7) {
      return [];
    }
    
    // Filtrer les spots qui ont des types de poissons similaires
    const spotsWithSimilarFish = spots.filter(spot => {
      const hasCommonFish = spot.fishTypes.some(fishType => 
        currentFishTypes.includes(fishType)
      );
      return hasCommonFish && spot.location; // Le spot doit avoir une localisation
    });
    
    // Récupérer la météo pour chaque spot filtré
    const spotsWithWeather = await Promise.all(
      spotsWithSimilarFish.map(async (spot) => {
        try {
          const weather = await this.getCurrentWeather(spot.location.lat, spot.location.lng);
          const conditions = this.evaluateFishingConditions(weather, spot.fishTypes);
          return {
            ...spot,
            weather,
            conditions
          };
        } catch (error) {
          console.error(`Erreur météo pour le spot ${spot.name}:`, error);
          return null;
        }
      })
    );
    
    // Filtrer les nulls et trier par score de conditions
    return spotsWithWeather
      .filter(spot => spot !== null && spot.conditions.score > currentConditions.score)
      .sort((a, b) => b.conditions.score - a.conditions.score)
      .slice(0, 3); // Retourner les 3 meilleurs spots
  }
}; 