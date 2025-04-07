import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Card, Form, Input, Select, Button, Modal, Radio, message, Tooltip, Spin, Space, Divider, Tabs } from 'antd';
import { PlusOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { geocodingService } from '../services/geocodingService';
import { createSpot, FISHING_TYPES, WATER_TYPES, WATER_TYPES_FR, FISH_TYPES, FISH_TYPES_FR, FISH_BY_WATER_TYPE } from '../models/dataModels';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { userService } from '../services/userService';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Traduction des types de pêche
const FISHING_TYPES_FR = {
  [FISHING_TYPES.CASTING]: 'Lancer',
  [FISHING_TYPES.FLY]: 'Mouche',
  [FISHING_TYPES.COARSE]: 'Au coup',
  [FISHING_TYPES.SURF]: 'Surfcasting',
  [FISHING_TYPES.ICE]: 'Sous glace'
};

// Composant pour centrer la carte sur un point
const MapFlyTo = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);
  
  return null;
};

const MapPage = () => {
  const [spots, setSpots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [position, setPosition] = useState([48.8566, 2.3522]); // Paris par défaut
  const [filters, setFilters] = useState({
    fishingType: '',
    fishType: '',
    waterType: ''
  });
  const [waterType, setWaterType] = useState(WATER_TYPES.FRESH);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [activeTabKey, setActiveTabKey] = useState('map');
  const mapRef = useRef(null);

  useEffect(() => {
    // Charger les spots depuis le stockage local
    const loadedSpots = storageService.getSpots();
    setSpots(loadedSpots);

    // Obtenir la position de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        // Lorsque l'utilisateur clique sur la carte, on enregistre la position
        const newLocation = [e.latlng.lat, e.latlng.lng];
        setSelectedLocation(newLocation);
        
        // Mise à jour du formulaire d'adresse avec les coordonnées
        updateAddressFromCoordinates(newLocation[0], newLocation[1]);
        
        // Si le modal est ouvert, on met à jour le formulaire
        if (isModalVisible) {
          message.info('Position sélectionnée pour le nouveau spot');
        }
      },
    });

    return selectedLocation ? (
      <Marker position={selectedLocation}>
        <Popup>Emplacement sélectionné pour votre spot</Popup>
      </Marker>
    ) : null;
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
        setSearchedLocation([result.lat, result.lng]);
        setSelectedLocation([result.lat, result.lng]);
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

  const handleAddSpot = () => {
    if (!selectedLocation) {
      message.error('Veuillez sélectionner un emplacement ou rechercher une adresse');
      return;
    }

    form.validateFields().then((values) => {
      const currentUser = userService.getCurrentUser();
      
      const newSpot = createSpot({
        ...values,
        location: {
          lat: selectedLocation[0],
          lng: selectedLocation[1]
        },
        address: addressForm.getFieldValue('address'),
        waterType: waterType,
        createdBy: currentUser.id,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });

      storageService.addSpot(newSpot);
      setSpots([...spots, newSpot]);
      setIsModalVisible(false);
      setSelectedLocation(null);
      setSearchedLocation(null);
      form.resetFields();
      addressForm.resetFields();
      message.success('Spot ajouté avec succès !');
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleWaterTypeChange = (e) => {
    setWaterType(e.target.value);
    // Réinitialiser les fishTypes sélectionnés
    form.setFieldsValue({ fishTypes: [] });
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  const filteredSpots = spots.filter(spot => {
    return (
      (!filters.fishingType || spot.fishingType === filters.fishingType) &&
      (!filters.fishType || (spot.fishTypes && spot.fishTypes.includes(filters.fishType))) &&
      (!filters.waterType || spot.waterType === filters.waterType)
    );
  });

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ marginBottom: 16, borderRadius: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Form.Item label="Type d'eau" style={{ margin: 0, minWidth: '200px' }}>
            <Select 
              placeholder="Filtrer par type d'eau"
              allowClear
              onChange={(value) => handleFilterChange('waterType', value)}
            >
              {Object.entries(WATER_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Type de pêche" style={{ margin: 0, minWidth: '200px' }}>
            <Select 
              placeholder="Filtrer par type de pêche"
              allowClear
              onChange={(value) => handleFilterChange('fishingType', value)}
            >
              {Object.entries(FISHING_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Type de poisson" style={{ margin: 0, minWidth: '200px' }}>
            <Select 
              placeholder="Filtrer par poisson"
              allowClear
              onChange={(value) => handleFilterChange('fishType', value)}
            >
              {Object.entries(FISH_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Tooltip title="Ajoutez un nouveau spot de pêche">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{ marginLeft: 'auto' }}
            >
              Ajouter un spot
            </Button>
          </Tooltip>
        </div>
      </Card>

      <div style={{ flex: 1, overflow: 'hidden', borderRadius: '8px' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredSpots.map((spot) => (
            <Marker key={spot.id} position={[spot.location.lat, spot.location.lng]}>
              <Popup>
                <div>
                  <h3>{spot.name}</h3>
                  <p>{spot.description}</p>
                  {spot.address && <p><strong>Adresse:</strong> {spot.address}</p>}
                  <p><strong>Type d'eau:</strong> {WATER_TYPES_FR[spot.waterType] || 'Non spécifié'}</p>
                  <p><strong>Type de pêche:</strong> {FISHING_TYPES_FR[spot.fishingType] || spot.fishingType}</p>
                  <p><strong>Poissons:</strong> {
                    Array.isArray(spot.fishTypes) 
                      ? spot.fishTypes.map(type => FISH_TYPES_FR[type] || type).join(', ')
                      : ''
                  }</p>
                  <p>
                    <a 
                      href={`https://www.google.com/maps?q=${spot.location.lat},${spot.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <EnvironmentOutlined /> Voir sur Google Maps
                    </a>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
          {searchedLocation && <MapFlyTo position={searchedLocation} />}
        </MapContainer>
      </div>

      <Modal
        title="Ajouter un spot de pêche"
        open={isModalVisible}
        onOk={handleAddSpot}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedLocation(null);
          setSearchedLocation(null);
          form.resetFields();
          addressForm.resetFields();
          setAddressError('');
        }}
        width={700}
      >
        <Tabs 
          defaultActiveKey="map" 
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={[
            {
              key: 'map',
              label: 'Localisation',
              children: (
                <>
                  <Form form={addressForm} layout="vertical">
                    <Form.Item 
                      name="address" 
                      label="Adresse" 
                      validateStatus={addressError ? 'error' : ''}
                      help={addressError}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input 
                          placeholder="Entrez une adresse pour localiser le spot" 
                          value={searchAddress}
                          onChange={e => setSearchAddress(e.target.value)}
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
                  </Form>
                  
                  <div style={{ margin: '10px 0', textAlign: 'center' }}>
                    <small>Ou cliquez directement sur la carte pour choisir un emplacement</small>
                  </div>
                  
                  <div style={{ height: '250px', width: '100%', marginBottom: '16px' }}>
                    <MapContainer
                      center={position}
                      zoom={11}
                      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker />
                      {searchedLocation && <MapFlyTo position={searchedLocation} />}
                    </MapContainer>
                  </div>
                  
                  <div className="map-instruction" style={{ marginBottom: 16, background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                    <p style={{ margin: 0 }}><strong>Emplacement :</strong> {selectedLocation ? 
                      `Latitude: ${selectedLocation[0].toFixed(5)}, Longitude: ${selectedLocation[1].toFixed(5)}` : 
                      'Aucun emplacement sélectionné'}</p>
                  </div>
                </>
              ),
            },
            {
              key: 'details',
              label: 'Détails du spot',
              children: (
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
                    <Input.TextArea />
                  </Form.Item>

                  <Form.Item label="Type d'eau" required>
                    <Radio.Group value={waterType} onChange={handleWaterTypeChange}>
                      {Object.entries(WATER_TYPES_FR).map(([key, value]) => (
                        <Radio.Button key={key} value={key}>{value}</Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="fishingType"
                    label="Type de pêche"
                    rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                  >
                    <Select>
                      {Object.entries(FISHING_TYPES_FR).map(([key, value]) => (
                        <Select.Option key={key} value={key}>{value}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="fishTypes"
                    label="Types de poissons"
                    rules={[{ required: true, message: 'Veuillez sélectionner au moins un type' }]}
                  >
                    <Select mode="multiple">
                      {FISH_BY_WATER_TYPE[waterType].map((fishType) => (
                        <Select.Option key={fishType} value={fishType}>
                          {FISH_TYPES_FR[fishType]}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default MapPage; 