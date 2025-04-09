// Service de météo pour l'application Hooked

// Clé API OpenWeatherMap
const API_KEY = 'b0de98e9dae92edbbd894af0ed57a9cf';

// Configuration de l'API StormGlass (pour les données marines)
const STORMGLASS_API_KEY = '86da0a3c-0f05-11ef-a6c1-0242ac130002-86da0b18-0f05-11ef-a6c1-0242ac130002';
const STORMGLASS_ENDPOINT = 'https://api.stormglass.io/v2';

export const weatherService = {
  /**
   * Récupère la météo actuelle pour une localisation
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Données météo
   */
  async getCurrentWeather(lat, lng) {
    try {
      console.log(`Récupération des données météo pour: ${lat}, ${lng}`);
      
      // Utilisation directe de fetch au lieu d'OpenWeatherMap-js
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=fr&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      // Renvoyer un objet météo simulé en cas d'échec pour éviter les erreurs
      return {
        main: {
          temp: 20,
          pressure: 1013
        },
        wind: {
          speed: 10,
          deg: 180
        },
        clouds: {
          all: 50
        },
        weather: [
          {
            id: 800,
            description: 'Ciel dégagé'
          }
        ]
      };
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
      // Utilisation directe de fetch au lieu d'OpenWeatherMap-js
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&lang=fr&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des prévisions:', error);
      return {
        list: [] // Retourne une liste vide en cas d'erreur
      };
    }
  },

  /**
   * Récupère les données marines (vagues, marées, etc.) pour un spot
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Données marines
   */
  async getMarineData(lat, lng) {
    try {
      const params = {
        lat,
        lng,
        params: 'waveHeight,waveDirection,wavePeriod,windSpeed,windDirection,waterTemperature,seaLevel,currentSpeed,currentDirection',
      };
      
      // Simulation des données marines pour le développement (pour éviter de consommer l'API)
      const simulatedData = this._simulateMarineData(lat, lng);
      return simulatedData;
      
      // Implémentation réelle avec StormGlass API
      /* 
      const response = await fetch(
        `${STORMGLASS_ENDPOINT}/weather/point?${new URLSearchParams(params).toString()}`,
        {
          headers: {
            'Authorization': STORMGLASS_API_KEY
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Erreur lors de la récupération des données marines:', error);
      // Retourner des données simulées en cas d'erreur
      return this._simulateMarineData(lat, lng);
    }
  },
  
  /**
   * Simule des données marines pour le développement
   * @private
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Object} Données marines simulées
   */
  _simulateMarineData(lat, lng) {
    // Génère des valeurs pseudo-aléatoires basées sur la latitude et la longitude
    const seed = Math.abs(Math.sin(lat * lng) * 10000);
    const randomVal = (min, max) => min + ((seed * Math.random()) % (max - min));
    
    // Simuler des données différentes mais cohérentes pour différents lieux
    const waveHeight = randomVal(0.2, 2.5); // en mètres
    const waterTemp = randomVal(12, 25); // en °C
    const windSpeed = randomVal(3, 30); // en km/h
    const wavePeriod = randomVal(3, 14); // en secondes
    
    // Détermine si le spot est près de la côte ou non (pour les marées)
    const isCoastal = Math.abs(lng) < 10 || Math.abs(lat) < 10; // Simplification
    
    // Simuler le cycle des marées si le spot est côtier
    const currentHour = new Date().getHours();
    const tideHeight = isCoastal 
      ? Math.sin((currentHour / 12) * Math.PI) * 2 + 2 
      : null;
    
    const tideType = tideHeight 
      ? (tideHeight > 3 ? 'haute' : 'basse')
      : null;
    
    const tideDirection = tideHeight 
      ? (Math.sin((currentHour / 6) * Math.PI) > 0 ? 'montante' : 'descendante')
      : null;
    
    return {
      waveHeight,
      waveDirection: Math.floor(randomVal(0, 360)),
      wavePeriod,
      windSpeed,
      windDirection: Math.floor(randomVal(0, 360)),
      waterTemperature: waterTemp,
      tide: isCoastal ? {
        height: tideHeight,
        type: tideType,
        direction: tideDirection,
        nextHighTide: new Date(Date.now() + (6 - (currentHour % 6)) * 3600 * 1000),
        nextLowTide: new Date(Date.now() + (12 - (currentHour % 12)) * 3600 * 1000)
      } : null,
      currentSpeed: randomVal(0, 5), // en nœuds
      currentDirection: Math.floor(randomVal(0, 360))
    };
  },

  /**
   * Évalue les conditions de pêche avec un système de scoring avancé
   * @param {Object} weatherData - Données météo
   * @param {Object} marineData - Données marines
   * @param {Array} fishTypes - Types de poissons présents dans le spot
   * @param {string} waterType - Type d'eau (douce, salée, saumâtre)
   * @returns {Object} Évaluation des conditions de pêche avec scoring sur 10
   */
  evaluateFishingConditionsAdvanced(weatherData, marineData, fishTypes, waterType) {
    if (!weatherData) {
      return {
        score: 0,
        recommendation: 'Données météo insuffisantes'
      };
    }

    // Paramètres météo
    const temp = weatherData.main?.temp || 0;
    const windSpeed = weatherData.wind?.speed || 0;
    const cloudCover = weatherData.clouds?.all || 0;
    const rain = weatherData.rain?.['1h'] || 0;
    const pressure = weatherData.main?.pressure || 1013;
    const weatherId = weatherData.weather?.[0]?.id || 800;
    const weatherDesc = weatherData.weather?.[0]?.description || '';
    
    // Paramètres marins (si disponibles)
    const waveHeight = marineData?.waveHeight || 0;
    const wavePeriod = marineData?.wavePeriod || 0;
    const waterTemp = marineData?.waterTemperature || temp;
    const currentSpeed = marineData?.currentSpeed || 0;
    const tide = marineData?.tide || null;
    
    // Scores par catégorie (0-10)
    let tempScore = 5;
    let windScore = 5;
    let precipScore = 5;
    let pressureScore = 5;
    let waveScore = 5;
    let tideScore = 5;
    let generalScore = 5;
    
    // 1. Score température (eau et air)
    if (waterType === 'salt') {
      // En eau salée, les températures optimales sont différentes
      if (waterTemp < 8) tempScore = 2;
      else if (waterTemp < 12) tempScore = 4;
      else if (waterTemp >= 12 && waterTemp <= 22) tempScore = 8;
      else if (waterTemp > 22 && waterTemp <= 27) tempScore = 6;
      else tempScore = 3;
    } else {
      // En eau douce
      if (waterTemp < 5) tempScore = 1;
      else if (waterTemp < 10) tempScore = 3;
      else if (waterTemp >= 10 && waterTemp <= 20) tempScore = 9;
      else if (waterTemp > 20 && waterTemp <= 25) tempScore = 7;
      else tempScore = 4;
    }
    
    // Ajustement en fonction de la température de l'air
    if (Math.abs(temp - waterTemp) > 10) {
      tempScore -= 2; // Forte différence entre eau et air = défavorable
    }
    
    // 2. Score vent
    if (windSpeed < 5) windScore = 8; // Idéal
    else if (windSpeed < 10) windScore = 7;
    else if (windSpeed < 20) windScore = 5;
    else if (windSpeed < 30) windScore = 3;
    else windScore = 1; // Très venteux
    
    // 3. Score précipitations
    if (rain === 0 && weatherId >= 800) {
      if (cloudCover < 30) precipScore = 6; // Ensoleillé
      else if (cloudCover < 70) precipScore = 8; // Partiellement nuageux - idéal
      else precipScore = 7; // Couvert
    } else if (rain < 1) {
      precipScore = 7; // Légère pluie - peut être bénéfique
    } else if (rain < 3) {
      precipScore = 5; // Pluie modérée
    } else if (rain < 7) {
      precipScore = 3; // Forte pluie
    } else {
      precipScore = 1; // Très forte pluie
    }
    
    // 4. Score pression atmosphérique
    const isIncreasing = pressure > 1013; // Simplification
    
    if (Math.abs(pressure - 1013) < 5) {
      pressureScore = 5; // Pression stable
    } else if (isIncreasing) {
      pressureScore = 7; // Pression en hausse = généralement bon
    } else {
      pressureScore = 3; // Pression en baisse = généralement mauvais
    }
    
    // 5. Score vagues (pour eau salée principalement)
    if (waterType === 'salt') {
      if (waveHeight < 0.3) waveScore = 8; // Mer calme
      else if (waveHeight < 0.5) waveScore = 9; // Légèrement agitée - idéale
      else if (waveHeight < 1) waveScore = 7;
      else if (waveHeight < 1.5) waveScore = 5;
      else if (waveHeight < 2.5) waveScore = 3;
      else waveScore = 1; // Très agitée
      
      // Ajustement par période des vagues
      if (wavePeriod > 8) waveScore += 1; // Longues périodes = meilleur
    }
    
    // 6. Score marée (eau salée uniquement)
    if (waterType === 'salt' && tide) {
      const tideDirection = tide.direction;
      if (tideDirection === 'montante') {
        tideScore = 8; // Marée montante généralement favorable
      } else if (tideDirection === 'descendante') {
        tideScore = 6; // Marée descendante
      }
      
      // Meilleur moment : début de marée montante ou fin de marée descendante
      if (tide.height < 1 && tideDirection === 'montante') {
        tideScore = 9; // Début de marée montante - moment idéal
      }
    }
    
    // 7. Ajustements pour conditions spéciales
    if (weatherId >= 200 && weatherId < 300) {
      generalScore = 1; // Orages
    } else if (weatherId >= 500 && weatherId < 600) {
      generalScore = weatherId < 520 ? 4 : 2; // Pluie légère à forte
    } else if (weatherId >= 700 && weatherId < 800) {
      generalScore = 3; // Brouillard, brume
    } else if (weatherId === 800) {
      generalScore = 6; // Ciel clair
    } else if (weatherId > 800 && weatherId < 803) {
      generalScore = 8; // Partiellement nuageux - idéal
    } else {
      generalScore = 5; // Nuageux
    }
    
    // Poids des différents facteurs selon le type d'eau
    let weights = {
      temp: 0.2,
      wind: 0.15,
      precip: 0.15,
      pressure: 0.1,
      wave: 0,
      tide: 0,
      general: 0.4
    };
    
    if (waterType === 'salt') {
      weights = {
        temp: 0.15,
        wind: 0.15,
        precip: 0.1,
        pressure: 0.1,
        wave: 0.2,
        tide: 0.1,
        general: 0.2
      };
    }
    
    // Calcul du score final pondéré
    const weightedScore = 
      tempScore * weights.temp +
      windScore * weights.wind +
      precipScore * weights.precip +
      pressureScore * weights.pressure +
      waveScore * weights.wave +
      tideScore * weights.tide +
      generalScore * weights.general;
    
    // Arrondir à l'entier le plus proche et limiter entre 0 et 10
    const finalScore = Math.max(0, Math.min(10, Math.round(weightedScore)));
    
    // Génération de la recommandation
    let recommendation = '';
    let factors = [];
    
    // Ajouter les facteurs positifs
    if (tempScore >= 7) factors.push('température de l\'eau idéale');
    if (windScore >= 7) factors.push('vent faible');
    if (precipScore >= 7) factors.push('conditions météo favorables');
    if (pressureScore >= 7) factors.push('pression atmosphérique stable');
    if (waterType === 'salt' && waveScore >= 7) factors.push('mer calme');
    if (waterType === 'salt' && tideScore >= 8) factors.push('marée favorable');
    
    // Ajouter les facteurs négatifs
    if (tempScore <= 3) factors.push('température défavorable');
    if (windScore <= 3) factors.push('vent fort');
    if (precipScore <= 3) factors.push('fortes précipitations');
    if (waterType === 'salt' && waveScore <= 3) factors.push('mer agitée');
    
    if (finalScore >= 8) {
      recommendation = `Excellentes conditions de pêche ! ${factors.length > 0 ? factors.join(', ') : 'Tout est optimal pour une belle session.'}`;
    } else if (finalScore >= 6) {
      recommendation = `Bonnes conditions. ${factors.length > 0 ? factors.join(', ') : 'La plupart des paramètres sont favorables.'}`;
    } else if (finalScore >= 4) {
      recommendation = `Conditions moyennes. ${factors.length > 0 ? factors.join(', ') : 'Certains paramètres sont à surveiller.'}`;
    } else if (finalScore >= 2) {
      recommendation = `Conditions médiocres. ${factors.length > 0 ? factors.join(', ') : 'Plusieurs facteurs défavorables.'}`;
    } else {
      recommendation = `Mauvaises conditions. ${factors.length > 0 ? factors.join(', ') : 'La pêche est fortement déconseillée aujourd\'hui.'}`;
    }
    
    return {
      score: finalScore,
      recommendation,
      details: {
        temperature: {
          air: temp,
          water: waterTemp,
          score: tempScore
        },
        wind: {
          speed: windSpeed,
          direction: weatherData.wind?.deg,
          score: windScore
        },
        precipitation: {
          type: weatherDesc,
          amount: rain,
          cloudCover,
          score: precipScore
        },
        pressure: {
          value: pressure,
          score: pressureScore
        },
        wave: waterType === 'salt' ? {
          height: waveHeight,
          period: wavePeriod,
          score: waveScore
        } : null,
        tide: tide ? {
          status: `${tide.type} ${tide.direction}`,
          nextHigh: tide.nextHighTide,
          nextLow: tide.nextLowTide,
          score: tideScore
        } : null
      }
    };
  },

  /**
   * Méthode complète pour récupérer la prévision de pêche pour un spot
   * Combine toutes les données nécessaires et génère un score
   * @param {Object} spot - Le spot de pêche
   * @returns {Promise<Object>} Prévision complète avec scoring
   */
  async getFishingForecast(spot) {
    try {
      if (!spot || !spot.location) {
        console.log('Spot invalide:', spot);
        throw new Error('Spot invalide ou sans localisation');
      }
      
      console.log('Récupération des données pour le spot:', spot.name);
      
      // Simuler des données de météo et marines pour éviter les appels API en développement
      // Décommenter le code ci-dessous pour utiliser de vraies données
      /*
      // Récupérer les données météo et marines
      const [weatherData, marineData] = await Promise.all([
        this.getCurrentWeather(spot.location.lat, spot.location.lng),
        this.getMarineData(spot.location.lat, spot.location.lng)
      ]);
      */
      
      // Utiliser des données simulées pour le développement
      const weatherData = this._simulateWeatherData(spot.location.lat, spot.location.lng);
      const marineData = this._simulateMarineData(spot.location.lat, spot.location.lng);
      
      // Déterminer le type d'eau (par défaut eau douce)
      const waterType = spot.waterType || 'fresh';
      
      // Générer l'évaluation des conditions de pêche
      const evaluation = this.evaluateFishingConditionsAdvanced(
        weatherData,
        marineData,
        spot.fishTypes || [],
        waterType
      );
      
      return {
        spot: spot.id,
        timestamp: new Date().toISOString(),
        weather: weatherData,
        marine: marineData,
        evaluation,
        // Ajouter une couleur basée sur le score pour l'UI
        colorCode: this._getScoreColorCode(evaluation.score)
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la prévision pour le spot ${spot?.name || 'inconnu'}:`, error);
      
      // Retourner un objet valide avec un score par défaut
      return {
        spot: spot?.id || 'unknown',
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: error.message,
        evaluation: {
          score: 5,
          recommendation: 'Données temporairement indisponibles, score estimé moyen'
        },
        colorCode: '#FFC107', // Orange/Jaune pour indiquer un état incertain
        weather: this._simulateWeatherData(spot?.location?.lat || 48.8566, spot?.location?.lng || 2.3522),
        marine: this._simulateMarineData(spot?.location?.lat || 48.8566, spot?.location?.lng || 2.3522)
      };
    }
  },
  
  /**
   * Simule des données météo pour le développement
   * @private
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Object} Données météo simulées
   */
  _simulateWeatherData(lat, lng) {
    // Génère des valeurs pseudo-aléatoires basées sur la latitude et la longitude
    const seed = Math.abs(Math.sin(lat * lng) * 10000);
    const randomVal = (min, max) => min + ((seed * Math.random()) % (max - min));
    
    const temp = randomVal(10, 25); // Température entre 10 et 25°C
    const pressure = randomVal(990, 1030); // Pression entre 990 et 1030 hPa
    const windSpeed = randomVal(0, 30); // Vitesse du vent entre 0 et 30 km/h
    const windDeg = randomVal(0, 360); // Direction du vent
    const cloudCover = randomVal(0, 100); // Couverture nuageuse entre 0 et 100%
    
    // Choisir un type de météo (ciel dégagé, nuageux, pluie, etc.)
    const weatherTypes = [
      { id: 800, description: 'Ciel dégagé' },
      { id: 801, description: 'Quelques nuages' },
      { id: 802, description: 'Nuages épars' },
      { id: 803, description: 'Nuages fragmentés' },
      { id: 500, description: 'Pluie légère' }
    ];
    
    const weatherIndex = Math.floor(randomVal(0, weatherTypes.length));
    
    return {
      main: {
        temp,
        pressure,
        humidity: randomVal(30, 90)
      },
      wind: {
        speed: windSpeed,
        deg: windDeg
      },
      clouds: {
        all: cloudCover
      },
      weather: [weatherTypes[weatherIndex]],
      rain: weatherTypes[weatherIndex].id >= 500 && weatherTypes[weatherIndex].id < 600 
        ? { '1h': randomVal(0.1, 5) } 
        : {}
    };
  },

  /**
   * Obtient un code couleur basé sur le score de pêche
   * @private
   * @param {number} score - Score de 0 à 10
   * @returns {string} Code couleur hexadécimal
   */
  _getScoreColorCode(score) {
    if (score >= 8) return '#4CAF50'; // Vert - Excellentes conditions
    if (score >= 6) return '#8BC34A'; // Vert clair - Bonnes conditions
    if (score >= 4) return '#FFC107'; // Orange - Conditions moyennes
    if (score >= 2) return '#FF9800'; // Orange foncé - Conditions médiocres
    return '#F44336'; // Rouge - Mauvaises conditions
  },

  /**
   * Méthode originale d'évaluation des conditions de pêche (gardée pour compatibilité)
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