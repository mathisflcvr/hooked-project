import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Divider, 
  Spin, 
  Empty, 
  notification,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined, 
  HeartOutlined, 
  HeartFilled,
  EditOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import WeatherDisplay from '../components/WeatherDisplay';
import SpotRecommendations from '../components/SpotRecommendations';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { 
  FISH_TYPES_FR, 
  WATER_TYPES_FR,
  FISHING_TYPES_FR 
} from '../models/dataModels';

const { Title, Text } = Typography;

/**
 * Page de détail d'un spot de pêche
 */
const SpotDetailPage = () => {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [allSpots, setAllSpots] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const loadSpotData = async () => {
      try {
        setLoading(true);
        
        // Charger le spot spécifique
        const spotData = await storageService.getSpotById(spotId);
        if (!spotData) {
          throw new Error('Spot non trouvé');
        }
        setSpot(spotData);
        
        // Vérifier si l'utilisateur a mis ce spot en favori
        if (user) {
          const userFavorites = await storageService.getUserFavorites(user.id);
          setIsFavorite(userFavorites.includes(spotId));
        }
        
        // Charger tous les spots pour les recommandations
        const allSpotsData = await storageService.getAllSpots();
        setAllSpots(allSpotsData);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du spot:', error);
        notification.error({
          message: 'Erreur',
          description: 'Impossible de charger les détails du spot'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSpotData();
  }, [spotId, user]);

  const handleBack = () => {
    navigate('/spots');
  };

  const handleEditSpot = () => {
    navigate(`/spots/edit/${spotId}`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      notification.info({
        message: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter des spots à vos favoris.'
      });
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        await storageService.removeFavorite(spotId, user.id);
        notification.success({
          message: 'Favori supprimé',
          description: 'Ce spot a été retiré de vos favoris'
        });
      } else {
        await storageService.addFavorite(spotId, user.id);
        notification.success({
          message: 'Favori ajouté',
          description: 'Ce spot a été ajouté à vos favoris'
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      notification.error({
        message: 'Erreur',
        description: 'Impossible de modifier les favoris'
      });
    }
  };

  const handleWeatherDataReady = (data) => {
    setWeatherData(data);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>Chargement des détails du spot...</Text>
      </div>
    );
  }

  if (!spot) {
    return (
      <Empty
        description="Spot non trouvé"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={handleBack}>
          Retour à la liste des spots
        </Button>
      </Empty>
    );
  }

  return (
    <div className="spot-detail-page">
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Retour
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>{spot.name}</Title>
              <Space>
                <Button 
                  type="text"
                  icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                />
                {user && spot.createdBy === user.id && (
                  <Button 
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEditSpot}
                  />
                )}
                <Button 
                  type="text"
                  icon={<ShareAltOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    notification.success({
                      message: 'Lien copié',
                      description: 'Le lien vers ce spot a été copié dans le presse-papiers'
                    });
                  }}
                />
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Tag color="blue">{WATER_TYPES_FR[spot.waterType]}</Tag>
                <Tag color="green">{spot.type}</Tag>
                {spot.fishingType && (
                  <Tag color="purple">{FISHING_TYPES_FR[spot.fishingType]}</Tag>
                )}
              </Space>
            </div>

            {spot.image && (
              <div style={{ marginBottom: 16 }}>
                <img 
                  src={spot.image} 
                  alt={spot.name} 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            <Descriptions title="Détails" column={1} bordered>
              <Descriptions.Item label="Description">
                {spot.description}
              </Descriptions.Item>
              <Descriptions.Item label="Adresse">
                <Space>
                  <EnvironmentOutlined />
                  {spot.address || 'Non spécifiée'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Poissons présents">
                <Space wrap>
                  {spot.fishTypes.map(fishType => (
                    <Tag key={fishType} color="cyan">
                      {FISH_TYPES_FR[fishType] || fishType}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ height: '400px', marginBottom: 16 }}>
              <MapContainer
                center={[spot.location.lat, spot.location.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[spot.location.lat, spot.location.lng]}>
                  <Popup>
                    <div>
                      <strong>{spot.name}</strong><br />
                      {spot.address}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Affichage météo */}
          <WeatherDisplay 
            location={spot.location} 
            fishTypes={spot.fishTypes}
            onRecommendationsReady={handleWeatherDataReady}
          />
          
          {/* Recommandations de spots similaires avec de meilleures conditions météo */}
          {weatherData && (
            <SpotRecommendations 
              currentSpot={spot}
              currentWeather={weatherData}
              allSpots={allSpots}
            />
          )}
          
          {/* Carte des captures récentes à ce spot */}
          <Card 
            title="Captures récentes" 
            style={{ marginTop: 16 }}
            extra={
              <Button 
                type="primary" 
                size="small"
                onClick={() => navigate('/catches/new', { state: { spotId: spot.id } })}
              >
                Ajouter
              </Button>
            }
          >
            {/* Cette partie sera implémentée plus tard pour afficher les captures récentes */}
            <Empty 
              description="Aucune capture récente" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SpotDetailPage; 