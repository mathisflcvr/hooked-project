import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Tooltip, Spin, Tag } from 'antd';
import { weatherService } from '../services/weatherService';
import { CloudOutlined, ThunderboltOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Composant d'affichage météo pour un spot de pêche
 * @param {Object} props.location - Coordonnées du spot {lat, lng}
 * @param {Array} props.fishTypes - Types de poissons présents sur le spot
 * @param {Function} props.onRecommendationsReady - Callback lorsque les recommandations sont prêtes
 */
const WeatherDisplay = ({ location, fishTypes, onRecommendationsReady = () => {} }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conditions, setConditions] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location || !location.lat || !location.lng) {
        setError('Localisation non disponible');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Récupérer les données météo
        const data = await weatherService.getCurrentWeather(location.lat, location.lng);
        setWeatherData(data);

        // Évaluer les conditions de pêche
        if (fishTypes && fishTypes.length > 0) {
          const evaluatedConditions = weatherService.evaluateFishingConditions(data, fishTypes);
          setConditions(evaluatedConditions);
          // Informer le parent que les données sont prêtes
          onRecommendationsReady(evaluatedConditions);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données météo:', err);
        setError('Impossible de charger les données météo');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location, fishTypes]);

  // Fonction pour déterminer l'icône météo à afficher
  const getWeatherIcon = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return <CloudOutlined />;
    }

    const weatherId = weatherData.weather[0].id;
    
    // Groupes: 2xx = orages, 3xx = bruine, 5xx = pluie, 6xx = neige, 7xx = atmosphère, 800 = clair, 80x = nuages
    if (weatherId >= 200 && weatherId < 300) {
      return <ThunderboltOutlined style={{ color: '#faad14' }} />;
    } else if (weatherId >= 300 && weatherId < 700) {
      return <CloudOutlined style={{ color: '#8c8c8c' }} />;
    } else if (weatherId === 800) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <CloudOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // Fonction pour obtenir la couleur du tag de recommandation
  const getRecommendationColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'processing';
    if (score >= 4) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Card size="small" title="Météo" style={{ marginBottom: 8 }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Spin size="small" />
          <Text style={{ marginLeft: 8 }}>Chargement des données météo...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="small" title="Météo" style={{ marginBottom: 8 }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          <Text type="danger" style={{ marginLeft: 8 }}>{error}</Text>
        </div>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card 
      size="small" 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Météo</span>
          {conditions && (
            <Tag 
              color={getRecommendationColor(conditions.score)} 
              style={{ marginLeft: 8 }}
            >
              {conditions.score}/10
            </Tag>
          )}
        </div>
      } 
      style={{ marginBottom: 8 }}
    >
      <Row gutter={[8, 8]} align="middle">
        <Col span={6}>
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {getWeatherIcon()}
          </div>
        </Col>
        <Col span={18}>
          <div>
            <Text strong>{weatherData.weather[0].description}</Text>
          </div>
          <div>
            <Text>{Math.round(weatherData.main.temp)}°C</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {Math.round(weatherData.wind.speed)} km/h
            </Text>
          </div>
        </Col>

        {conditions && (
          <Col span={24}>
            <Tooltip title="Évaluation basée sur les conditions météo actuelles et les types de poissons présents">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {conditions.recommendation}
              </Text>
            </Tooltip>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default WeatherDisplay; 