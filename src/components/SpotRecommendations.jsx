import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Button, Spin, Empty, Tag } from 'antd';
import { CompassOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { weatherService } from '../services/weatherService';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

/**
 * Composant d'affichage des recommandations de spots alternatifs
 * @param {Object} props.currentSpot - Spot actuel
 * @param {Object} props.currentWeather - Données météo du spot actuel
 * @param {Array} props.allSpots - Liste de tous les spots disponibles
 */
const SpotRecommendations = ({ currentSpot, currentWeather, allSpots }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentSpot || !currentWeather || !allSpots || allSpots.length === 0) {
        return;
      }

      try {
        setLoading(true);
        
        // Ne pas inclure le spot actuel dans les recommandations
        const otherSpots = allSpots.filter(spot => spot.id !== currentSpot.id);
        
        // Obtenir les recommandations
        const recommendedSpots = await weatherService.suggestAlternativeSpots(
          otherSpots,
          currentWeather,
          currentSpot.fishTypes
        );
        
        setRecommendations(recommendedSpots);
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentSpot, currentWeather, allSpots]);

  const handleNavigateToSpot = (spotId) => {
    navigate(`/spots/${spotId}`);
  };

  // Si aucun spot actuel ou données météo, ne rien afficher
  if (!currentSpot || !currentWeather) {
    return null;
  }
  
  // Évaluer les conditions du spot actuel
  const currentConditions = weatherService.evaluateFishingConditions(
    currentWeather,
    currentSpot.fishTypes
  );
  
  // Si les conditions sont déjà bonnes (>= 7), ne pas afficher de recommandations
  if (currentConditions.score >= 7) {
    return null;
  }
  
  // Fonction pour obtenir la couleur du tag de score
  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'processing';
    if (score >= 4) return 'warning';
    return 'error';
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CompassOutlined style={{ marginRight: 8 }} />
          <span>Spots alternatifs recommandés</span>
        </div>
      }
      style={{ marginTop: 16 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Spin />
          <Text style={{ display: 'block', marginTop: 8 }}>Recherche de spots alternatifs...</Text>
        </div>
      ) : recommendations.length === 0 ? (
        <Empty 
          description="Aucun spot alternatif trouvé avec de meilleures conditions" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={recommendations}
          renderItem={spot => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleNavigateToSpot(spot.id)}
                >
                  Voir
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {spot.name}
                    <Tag 
                      color={getScoreColor(spot.conditions.score)}
                      style={{ marginLeft: 8 }}
                    >
                      {spot.conditions.score}/10
                    </Tag>
                  </div>
                }
                description={
                  <>
                    <div>{spot.conditions.details.weatherCondition}, {Math.round(spot.conditions.details.temperature)}°C</div>
                    <div><Text type="secondary">{spot.conditions.recommendation}</Text></div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default SpotRecommendations; 