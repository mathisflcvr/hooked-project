import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, message, Empty, Tag, Upload, Popconfirm, Space, Tabs, Progress, Tooltip, Row, Col, Divider, Statistic } from 'antd';
import { PlusOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined, CloudOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { userService } from '../services/userService';
import { imageService } from '../services/imageService';
import { geocodingService } from '../services/geocodingService';
import { weatherService } from '../services/weatherService';
import { createSpot } from '../models/dataModels';
import { FISH_TYPES, FISH_TYPES_FR } from '../models/dataModels';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const { TextArea } = Input;
const { Option } = Select;

// Composant pour sélectionner un emplacement sur la carte
const LocationPicker = ({ value, onChange }) => {
  const [position, setPosition] = useState(value || [48.8566, 2.3522]); // Paris par défaut

  useEffect(() => {
    if (value) {
      setPosition(value);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setPosition(newPos);
          onChange && onChange({ lat: newPos[0], lng: newPos[1] });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }, [value]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onChange && onChange({ lat, lng });
      },
    });
    return null;
  };

  return (
    <div style={{ height: 300, width: '100%', marginBottom: 16 }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <MapClickHandler />
      </MapContainer>
      <div style={{ marginTop: 8 }}>
        <small>Cliquez sur la carte pour définir la localisation précise de votre spot.</small>
      </div>
    </div>
  );
};

const SpotsPage = () => {
  const [spots, setSpots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(null);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [favorites, setFavorites] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [customLocation, setCustomLocation] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [spotForecasts, setSpotForecasts] = useState({});
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastDetails, setForecastDetails] = useState(null);
  const [isForecastModalVisible, setIsForecastModalVisible] = useState(false);

  useEffect(() => {
    loadSpots();
  }, []);
  
  const loadSpots = () => {
    const loadedSpots = storageService.getSpots();
    setSpots(loadedSpots);
    
    // Charger les favoris
    loadFavorites();
    
    // Charger les prévisions météo pour tous les spots
    loadSpotForecasts(loadedSpots);
  };
  
  const loadFavorites = () => {
    // Créer un objet avec spotId -> isFavorite
    const userFavorites = {};
    const favSpots = userService.getUserFavorites();
    
    favSpots.forEach(spot => {
      userFavorites[spot.id] = true;
    });
    
    setFavorites(userFavorites);
  };

  const toggleFavorite = (spotId) => {
    try {
      const isFavorite = favorites[spotId];
      
      if (isFavorite) {
        userService.removeFavorite(spotId);
        message.success('Spot retiré des favoris');
      } else {
        userService.addFavorite(spotId);
        message.success('Spot ajouté aux favoris');
      }
      
      // Mettre à jour l'état local
      setFavorites(prev => ({
        ...prev,
        [spotId]: !isFavorite
      }));
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      message.error('Impossible de gérer les favoris');
    }
  };

  const handleEditSpot = (spot) => {
    setCurrentSpot(spot);
    setIsEditMode(true);
    setImageUrl(spot.image || '');
    setCustomLocation(spot.location);
    
    // Remplir le formulaire avec les données du spot
    form.setFieldsValue({
      name: spot.name,
      description: spot.description,
      type: spot.type,
      fishTypes: spot.fishTypes
    });
    
    // Remplir l'adresse si disponible
    if (spot.address) {
      addressForm.setFieldsValue({
        address: spot.address
      });
    }
    
    setIsModalVisible(true);
  };

  const handleDeleteSpot = (spotId) => {
    try {
      storageService.deleteSpot(spotId);
      message.success('Spot supprimé avec succès');
      // Recharger la liste des spots
      loadSpots();
    } catch (error) {
      console.error('Erreur lors de la suppression du spot:', error);
      message.error('Impossible de supprimer le spot');
    }
  };
  
  const handleAddressSearch = async () => {
    try {
      setIsSearching(true);
      setAddressError('');
      
      const address = addressForm.getFieldValue('address');
      if (!address || address.trim() === '') {
        setAddressError('Veuillez entrer une adresse');
        setIsSearching(false);
        return;
      }
      
      const result = await geocodingService.geocodeAddress(address);
      
      if (result) {
        setCustomLocation({ lat: result.lat, lng: result.lng });
        message.success('Adresse trouvée !');
      } else {
        setAddressError('Adresse non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      setAddressError('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };
  
  const updateAddressFromCoordinates = async (lat, lng) => {
    try {
      const result = await geocodingService.reverseGeocode(lat, lng);
      if (result) {
        addressForm.setFieldsValue({ 
          address: result.displayName
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
    }
  };

  const handleAddSpot = () => {
    form.validateFields().then((values) => {
      const currentUser = userService.getCurrentUser();
      
      if (isEditMode && currentSpot) {
        // Mode édition
        const updatedSpot = {
          ...currentSpot,
          name: values.name,
          description: values.description,
          type: values.type,
          fishTypes: values.fishTypes,
          image: imageUrl || currentSpot.image,
          location: customLocation || currentSpot.location,
          address: addressForm.getFieldValue('address') || currentSpot.address
        };
        
        storageService.updateSpot(updatedSpot);
        message.success('Spot mis à jour avec succès !');
        
        // Mettre à jour la liste locale
        setSpots(spots.map(s => s.id === updatedSpot.id ? updatedSpot : s));
      } else {
        // Mode ajout
        const newSpot = createSpot({
          name: values.name,
          description: values.description,
          type: values.type,
          fishTypes: values.fishTypes,
          createdBy: currentUser.id,
          image: imageUrl,
          location: customLocation,
          address: addressForm.getFieldValue('address')
        });

        storageService.addSpot(newSpot);
        setSpots([...spots, newSpot]);
        message.success('Spot ajouté avec succès !');
      }

      // Réinitialiser
      setIsModalVisible(false);
      setIsEditMode(false);
      setCurrentSpot(null);
      setImageUrl('');
      setCustomLocation(null);
      form.resetFields();
      addressForm.resetFields();
    });
  };

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      
      // Valider l'image
      const validation = imageService.validateImage(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => message.error(error));
        return false;
      }
      
      // Convertir en base64
      const result = await imageService.uploadImage(file);
      
      if (result.success) {
        setImageUrl(result.url);
        message.success('Image téléchargée avec succès');
      } else {
        message.error(result.error || 'Erreur lors du téléchargement de l\'image');
      }
      
      return false; // Empêcher le comportement par défaut d'antd Upload
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      message.error('Erreur lors du téléchargement de l\'image');
      return false;
    } finally {
      setImageLoading(false);
    }
  };
  
  const handleLocationChange = (location) => {
    setCustomLocation(location);
    
    // Mise à jour automatique de l'adresse à partir des coordonnées
    if (location) {
      updateAddressFromCoordinates(location.lat, location.lng);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Télécharger</div>
    </div>
  );

  // Regrouper les spots par type
  const spotsByType = spots.reduce((acc, spot) => {
    acc[spot.type] = acc[spot.type] || [];
    acc[spot.type].push(spot);
    return acc;
  }, {});

  // Nouvelle fonction pour charger les prévisions météo
  const loadSpotForecasts = async (spotsToForecast) => {
    try {
      setForecastLoading(true);
      
      // Vérifier si des spots sont disponibles
      if (!spotsToForecast || spotsToForecast.length === 0) {
        console.log('Aucun spot à analyser pour les prévisions météo');
        return;
      }

      console.log(`Chargement des prévisions pour ${spotsToForecast.length} spots...`);
      
      // Récupérer les prévisions pour chaque spot (10 à la fois max pour éviter de surcharger l'API)
      const forecasts = {};
      const maxConcurrentRequests = 5;
      
      for (let i = 0; i < spotsToForecast.length; i += maxConcurrentRequests) {
        const batch = spotsToForecast.slice(i, i + maxConcurrentRequests);
        console.log(`Traitement du lot ${i / maxConcurrentRequests + 1}, ${batch.length} spots`);
        
        try {
          const results = await Promise.all(
            batch.map(spot => {
              console.log(`Récupération prévision pour spot: ${spot.name}`);
              return weatherService.getFishingForecast(spot)
                .catch(error => {
                  console.error(`Erreur pour le spot ${spot.name}:`, error);
                  return { 
                    spot: spot.id, 
                    error: true,
                    evaluation: { score: 0, recommendation: 'Erreur de chargement' }
                  };
                });
            })
          );
          
          results.forEach(result => {
            if (result && result.spot) {
              forecasts[result.spot] = result;
            }
          });
        } catch (batchError) {
          console.error('Erreur lors du traitement d\'un lot de spots:', batchError);
        }
      }
      
      console.log('Prévisions chargées:', Object.keys(forecasts).length);
      setSpotForecasts(forecasts);
      message.success(`Prévisions chargées pour ${Object.keys(forecasts).length} spots`);
    } catch (error) {
      console.error('Erreur lors du chargement des prévisions météo:', error);
      message.error('Impossible de charger les prévisions météo');
    } finally {
      setForecastLoading(false);
    }
  };
  
  // Fonction pour ouvrir le modal avec les détails de la prévision
  const showForecastDetails = (forecast, spot) => {
    setForecastDetails({ ...forecast, spot });
    setIsForecastModalVisible(true);
  };

  // Fonction pour fermer le modal de détails
  const handleForecastModalClose = () => {
    setIsForecastModalVisible(false);
    setForecastDetails(null);
  };
  
  // Rendu du modal de détails de la prévision
  const renderForecastDetailsModal = () => {
    if (!forecastDetails) return null;
    
    try {
      const { evaluation, weather, marine, spot } = forecastDetails;
      const { score, recommendation, details } = evaluation;
      
      return (
        <Modal
          title={`Prévision de pêche pour ${spot.name}`}
          open={isForecastModalVisible}
          onCancel={handleForecastModalClose}
          footer={[
            <Button key="close" onClick={handleForecastModalClose}>
              Fermer
            </Button>
          ]}
          width={800}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Progress
              type="dashboard"
              percent={score * 10}
              format={percent => `${Math.round(percent / 10)}/10`}
              width={120}
              strokeColor={forecastDetails.colorCode}
            />
            <h3 style={{ marginTop: '10px', color: forecastDetails.colorCode }}>{recommendation}</h3>
          </div>
          
          <Divider orientation="left">Conditions actuelles</Divider>
          
          <Row gutter={[16, 16]}>
            {/* Température */}
            <Col span={8}>
              <Card size="small" title="Température">
                <Statistic
                  title="Air"
                  value={details.temperature.air}
                  precision={1}
                  suffix="°C"
                  valueStyle={{ color: '#1890ff' }}
                />
                <Statistic
                  title="Eau"
                  value={details.temperature.water}
                  precision={1}
                  suffix="°C"
                  valueStyle={{ color: '#0050b3' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <Progress 
                    percent={details.temperature.score * 10} 
                    size="small"
                    strokeColor={details.temperature.score >= 7 ? '#52c41a' : details.temperature.score >= 4 ? '#faad14' : '#f5222d'}
                  />
                  <small>Impact sur le score</small>
                </div>
              </Card>
            </Col>
            
            {/* Vent */}
            <Col span={8}>
              <Card size="small" title="Vent">
                <Statistic
                  title="Vitesse"
                  value={details.wind.speed}
                  precision={1}
                  suffix="km/h"
                  valueStyle={{ color: '#722ed1' }}
                />
                {details.wind.direction && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          transform: `rotate(${details.wind.direction}deg)`,
                          fontSize: '24px',
                          display: 'inline-block'
                        }}
                      >
                        ↑
                      </span>
                      <div>Direction: {details.wind.direction}°</div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '10px' }}>
                  <Progress 
                    percent={details.wind.score * 10} 
                    size="small"
                    strokeColor={details.wind.score >= 7 ? '#52c41a' : details.wind.score >= 4 ? '#faad14' : '#f5222d'}
                  />
                  <small>Impact sur le score</small>
                </div>
              </Card>
            </Col>
            
            {/* Précipitations */}
            <Col span={8}>
              <Card size="small" title="Précipitations">
                <Statistic
                  title="Type"
                  value={details.precipitation.type || 'Aucune'}
                  valueStyle={{ color: '#13c2c2' }}
                />
                {details.precipitation.amount > 0 && (
                  <Statistic
                    title="Intensité"
                    value={details.precipitation.amount}
                    precision={1}
                    suffix="mm"
                    valueStyle={{ color: '#13c2c2' }}
                  />
                )}
                <Statistic
                  title="Nuages"
                  value={details.precipitation.cloudCover}
                  suffix="%"
                  valueStyle={{ color: '#8c8c8c' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <Progress 
                    percent={details.precipitation.score * 10} 
                    size="small"
                    strokeColor={details.precipitation.score >= 7 ? '#52c41a' : details.precipitation.score >= 4 ? '#faad14' : '#f5222d'}
                  />
                  <small>Impact sur le score</small>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {/* Pression */}
            <Col span={8}>
              <Card size="small" title="Pression">
                <Statistic
                  title="Pression atmosph."
                  value={details.pressure.value}
                  suffix="hPa"
                  valueStyle={{ color: '#eb2f96' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <Progress 
                    percent={details.pressure.score * 10} 
                    size="small"
                    strokeColor={details.pressure.score >= 7 ? '#52c41a' : details.pressure.score >= 4 ? '#faad14' : '#f5222d'}
                  />
                  <small>Impact sur le score</small>
                </div>
              </Card>
            </Col>
            
            {/* Vagues - seulement si en eau salée */}
            {spot.waterType === 'salt' && details.wave && (
              <Col span={8}>
                <Card size="small" title="Vagues">
                  <Statistic
                    title="Hauteur"
                    value={marine.waveHeight}
                    precision={1}
                    suffix="m"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  {marine.wavePeriod && (
                    <Statistic
                      title="Période"
                      value={marine.wavePeriod}
                      precision={1}
                      suffix="s"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  )}
                  <div style={{ marginTop: '10px' }}>
                    <Progress 
                      percent={details.wave.score * 10} 
                      size="small"
                      strokeColor={details.wave.score >= 7 ? '#52c41a' : details.wave.score >= 4 ? '#faad14' : '#f5222d'}
                    />
                    <small>Impact sur le score</small>
                  </div>
                </Card>
              </Col>
            )}
            
            {/* Marée - seulement si en eau salée */}
            {spot.waterType === 'salt' && details.tide && (
              <Col span={8}>
                <Card size="small" title="Marée">
                  <Statistic
                    title="État actuel"
                    value={details.tide.status}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <small>Prochaine marée haute:</small>
                    <div>{new Date(marine.tide.nextHighTide).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <small>Prochaine marée basse:</small>
                    <div>{new Date(marine.tide.nextLowTide).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <Progress 
                      percent={details.tide.score * 10} 
                      size="small"
                      strokeColor={details.tide.score >= 7 ? '#52c41a' : details.tide.score >= 4 ? '#faad14' : '#f5222d'}
                    />
                    <small>Impact sur le score</small>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
          
          <Divider orientation="left">Recommandations</Divider>
          <Card>
            <p style={{ fontSize: '16px' }}>{recommendation}</p>
            
            <div style={{ marginTop: '16px' }}>
              <h4>Types de poissons présents dans ce spot:</h4>
              <div>
                {spot.fishTypes.map(fishType => (
                  <Tag color="blue" key={fishType}>
                    {FISH_TYPES_FR[fishType] || fishType}
                  </Tag>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h4>Dernière mise à jour:</h4>
              <p>{new Date(forecastDetails.timestamp).toLocaleString()}</p>
            </div>
          </Card>
        </Modal>
      );
    } catch (error) {
      console.error('Erreur lors du rendu du modal de détails:', error);
      setIsForecastModalVisible(false);
      setForecastDetails(null);
      message.error('Impossible d\'afficher les détails de la prévision');
      return null;
    }
  };
  
  // Mise à jour de la fonction renderFishingScore pour permettre de cliquer sur le score
  const renderFishingScore = (spot) => {
    const forecast = spotForecasts[spot.id];
    
    if (!forecast) {
      return null;
    }
    
    if (forecast.error) {
      return (
        <div style={{ marginTop: '12px' }}>
          <Tag icon={<CloudOutlined />} color="default">
            Prévision indisponible
          </Tag>
        </div>
      );
    }
    
    const { score, recommendation } = forecast.evaluation;
    const { colorCode } = forecast;
    
    let statusColor;
    if (score >= 8) statusColor = 'success';
    else if (score >= 6) statusColor = 'processing';
    else if (score >= 4) statusColor = 'warning';
    else statusColor = 'error';
    
    return (
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ marginBottom: '8px' }}>Prévision de pêche</h4>
        
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.3s',
            ':hover': { backgroundColor: '#f5f5f5' }
          }}
          onClick={() => showForecastDetails(forecast, spot)}
        >
          <Tooltip title={`Score de pêche: ${score}/10 - Cliquez pour plus de détails`}>
            <Progress
              type="circle"
              percent={score * 10}
              width={60}
              format={percent => Math.round(percent / 10)}
              status={statusColor}
              strokeColor={colorCode}
              style={{ marginRight: '16px' }}
            />
          </Tooltip>
          
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: colorCode }}>
              Score: {score}/10
            </div>
            <div style={{ fontSize: '12px', color: '#666', maxWidth: '200px' }}>
              {recommendation}
            </div>
          </div>
        </div>
        
        {forecast.marine && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {spot.waterType === 'salt' && forecast.marine.waveHeight && (
              <Tag color="blue">Vagues: {forecast.marine.waveHeight.toFixed(1)}m</Tag>
            )}
            {forecast.marine.waterTemperature && (
              <Tag color="cyan">Eau: {forecast.marine.waterTemperature.toFixed(1)}°C</Tag>
            )}
            {forecast.weather && forecast.weather.wind && (
              <Tag color="purple">Vent: {forecast.weather.wind.speed} km/h</Tag>
            )}
            {spot.waterType === 'salt' && forecast.marine.tide && (
              <Tag color="geekblue">Marée: {forecast.marine.tide.type} {forecast.marine.tide.direction}</Tag>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Card
        title="Mes Spots de Pêche"
        extra={
          <Space>
            <Button 
              icon={<CloudOutlined />} 
              onClick={() => loadSpotForecasts(spots)} 
              loading={forecastLoading}
            >
              Actualiser prévisions
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setIsEditMode(false);
              setCurrentSpot(null);
              setImageUrl('');
              setCustomLocation(null);
              form.resetFields();
              addressForm.resetFields();
              setIsModalVisible(true);
            }}>
              Ajouter un spot
            </Button>
          </Space>
        }
        style={{ borderRadius: '8px' }}
      >
        {spots.length === 0 ? (
          <Empty
            description="Vous n'avez pas encore enregistré de spots"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          Object.entries(spotsByType).map(([type, typeSpots]) => (
            <div key={type} style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '16px 0' }}>{type}</h3>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={typeSpots}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      title={item.name}
                      style={{ borderRadius: '8px' }}
                      cover={item.image ? <img alt={item.name} src={item.image} style={{ height: 160, objectFit: 'cover' }} /> : null}
                      extra={
                        <Button 
                          type="text"
                          icon={favorites[item.id] ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                          onClick={() => toggleFavorite(item.id)}
                        />
                      }
                      actions={[
                        <EditOutlined key="edit" onClick={() => handleEditSpot(item)} />,
                        <Popconfirm
                          title="Supprimer ce spot"
                          description="Êtes-vous sûr de vouloir supprimer ce spot ?"
                          onConfirm={() => handleDeleteSpot(item.id)}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <DeleteOutlined key="delete" />
                        </Popconfirm>,
                        <a
                          href={`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <EnvironmentOutlined /> Voir sur la carte
                        </a>
                      ]}
                    >
                      <p>{item.description}</p>
                      {item.address && <p><strong>Adresse:</strong> {item.address}</p>}
                      
                      <div style={{ marginTop: '12px' }}>
                        {Array.isArray(item.fishTypes) && item.fishTypes.map((fishType) => (
                          <Tag color="blue" key={fishType}>
                            {FISH_TYPES_FR[fishType] || fishType}
                          </Tag>
                        ))}
                      </div>
                      
                      {renderFishingScore(item)}
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          ))
        )}
      </Card>

      <Modal
        title={isEditMode ? "Modifier le spot" : "Ajouter un spot"}
        open={isModalVisible}
        onOk={handleAddSpot}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setCurrentSpot(null);
          setCustomLocation(null);
          form.resetFields();
          addressForm.resetFields();
        }}
        width={800}
      >
        <Tabs 
          defaultActiveKey="1" 
          activeKey={activeTabKey}
          onChange={key => setActiveTabKey(key)}
        >
          <Tabs.TabPane tab="Informations" key="1">
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Nom du spot"
                rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Veuillez entrer une description' }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="type"
                label="Type de spot"
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select>
                  <Option value="Rivière">Rivière</Option>
                  <Option value="Lac">Lac</Option>
                  <Option value="Étang">Étang</Option>
                  <Option value="Mer">Mer</Option>
                  <Option value="Port">Port</Option>
                  <Option value="Autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="fishTypes"
                label="Types de poissons présents"
                rules={[{ required: true, message: 'Veuillez sélectionner au moins un type de poisson' }]}
              >
                <Select mode="multiple" placeholder="Sélectionnez les types de poissons">
                  {Object.entries(FISH_TYPES_FR).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Localisation" key="2">
            <Form form={addressForm} layout="vertical">
              <Form.Item 
                name="address" 
                label="Adresse" 
                validateStatus={addressError ? 'error' : ''}
                help={addressError}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Input 
                    placeholder="Entrez une adresse" 
                    style={{ width: 'calc(100% - 46px)' }}
                  />
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleAddressSearch}
                    loading={isSearching}
                  >
                    {!isSearching && "Rechercher"}
                  </Button>
                </Space.Compact>
              </Form.Item>
              
              <div style={{ marginTop: 8, marginBottom: 16, textAlign: 'center' }}>
                <small>Ou sélectionnez l'emplacement précis sur la carte</small>
              </div>
              
              <LocationPicker 
                onChange={handleLocationChange} 
                value={customLocation ? [customLocation.lat, customLocation.lng] : null} 
              />
            </Form>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Photo" key="3">
            <Form.Item label="Image du spot">
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={handleImageUpload}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="spot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
              <div style={{ marginTop: 8 }}>
                <small>Format JPG/PNG, taille maximale 50MB</small>
              </div>
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
      
      {/* Ajout du modal pour les détails de la prévision */}
      {renderForecastDetailsModal()}
    </div>
  );
};

export default SpotsPage; 