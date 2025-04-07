import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, message, Empty, Tag, Upload, Popconfirm, Space, Tabs } from 'antd';
import { PlusOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { userService } from '../services/userService';
import { imageService } from '../services/imageService';
import { geocodingService } from '../services/geocodingService';
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

  useEffect(() => {
    loadSpots();
  }, []);
  
  const loadSpots = () => {
    const loadedSpots = storageService.getSpots();
    setSpots(loadedSpots);
    
    // Charger les favoris
    loadFavorites();
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

  return (
    <div>
      <Card
        title="Mes Spots de Pêche"
        extra={
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
    </div>
  );
};

export default SpotsPage; 