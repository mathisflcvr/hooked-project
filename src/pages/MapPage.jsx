import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Form, Input, Select, Button, Modal } from 'antd';
import { storageService } from '../services/storageService';
import { createFishingSpot, FISHING_TYPES, FISH_TYPES } from '../models/dataModels';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Traduction des types de poissons
const FISH_TYPES_FR = {
  [FISH_TYPES.PIKE]: 'Brochet',
  [FISH_TYPES.ZANDER]: 'Sandre',
  [FISH_TYPES.TROUT]: 'Truite',
  [FISH_TYPES.BASS]: 'Bar',
  [FISH_TYPES.CARP]: 'Carpe',
  [FISH_TYPES.CATFISH]: 'Silure'
};

const MapPage = () => {
  const [spots, setSpots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [position, setPosition] = useState([48.8566, 2.3522]); // Paris par défaut

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

  const handleAddSpot = () => {
    form.validateFields().then((values) => {
      const newSpot = createFishingSpot({
        ...values,
        location: {
          lat: position[0],
          lng: position[1]
        },
        createdBy: 'currentUser', // À remplacer par l'ID de l'utilisateur connecté
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });

      storageService.addSpot(newSpot);
      setSpots([...spots, newSpot]);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ marginBottom: 16, borderRadius: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Form.Item label="Type de pêche" style={{ margin: 0, minWidth: '200px' }}>
            <Select placeholder="Filtrer par type">
              <Select.Option value="">Tous les types</Select.Option>
              {Object.entries(FISHING_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Type de poisson" style={{ margin: 0, minWidth: '200px' }}>
            <Select placeholder="Filtrer par poisson">
              <Select.Option value="">Tous les poissons</Select.Option>
              {Object.entries(FISH_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            style={{ marginLeft: 'auto' }}
          >
            Ajouter un spot
          </Button>
        </div>
      </Card>

      <div style={{ flex: 1, overflow: 'hidden', borderRadius: '8px' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {spots.map((spot) => (
            <Marker key={spot.id} position={[spot.location.lat, spot.location.lng]}>
              <Popup>
                <div>
                  <h3>{spot.name}</h3>
                  <p>{spot.description}</p>
                  <p>Type de pêche: {FISHING_TYPES_FR[spot.fishingType] || spot.fishingType}</p>
                  <p>Poissons: {
                    Array.isArray(spot.fishTypes) 
                      ? spot.fishTypes.map(type => FISH_TYPES_FR[type] || type).join(', ')
                      : ''
                  }</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <Modal
        title="Ajouter un spot de pêche"
        open={isModalVisible}
        onOk={handleAddSpot}
        onCancel={() => setIsModalVisible(false)}
      >
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
              {Object.entries(FISH_TYPES_FR).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MapPage; 