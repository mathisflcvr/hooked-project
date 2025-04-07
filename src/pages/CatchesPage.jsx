import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Upload, message, Empty, Tabs, Radio, Space } from 'antd';
import { UploadOutlined, CameraOutlined, PlusOutlined, EnvironmentOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { imageService } from '../services/imageService';
import { geocodingService } from '../services/geocodingService';
import { createCatch } from '../models/dataModels';
import { 
  FISH_TYPES, 
  FISH_TYPES_FR, 
  WATER_TYPES, 
  WATER_TYPES_FR, 
  FISH_BY_WATER_TYPE 
} from '../models/dataModels';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { userService } from '../services/userService';

const { TextArea } = Input;
const { TabPane } = Tabs;

const LocationPicker = ({ value, onChange }) => {
  const [position, setPosition] = useState(value || [48.8566, 2.3522]); // Paris par défaut

  useEffect(() => {
    if (navigator.geolocation) {
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
  }, []);

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
        <small>Cliquez sur la carte pour définir la localisation précise de votre capture.</small>
      </div>
    </div>
  );
};

const CatchesPage = () => {
  const [catches, setCatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [waterType, setWaterType] = useState(WATER_TYPES.FRESH);
  const [showCustomFishInput, setShowCustomFishInput] = useState(false);
  const [customLocation, setCustomLocation] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    const loadedCatches = storageService.getCatches();
    setCatches(loadedCatches);
  }, []);

  const handleWaterTypeChange = (e) => {
    setWaterType(e.target.value);
    // Réinitialiser le type de poisson sélectionné
    form.setFieldsValue({ fishType: undefined });
    setShowCustomFishInput(false);
  };

  const handleFishTypeChange = (value) => {
    setShowCustomFishInput(value === 'custom');
  };

  const getCustomFishLabel = (waterType) => {
    switch (waterType) {
      case WATER_TYPES.FRESH:
        return "Autre poisson d'eau douce";
      case WATER_TYPES.SALT:
        return "Autre poisson d'eau salée";
      case WATER_TYPES.BRACKISH:
        return "Autre poisson d'eau saumâtre";
      default:
        return "Autre poisson";
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

  const handleAddCatch = () => {
    try {
      // Vérifier si un spot de pêche est sélectionné
      const formValues = form.getFieldsValue();
      if (!formValues.spotId) {
        message.error('Veuillez sélectionner un spot de pêche');
        return;
      }
      
      // Vérifier si un type de poisson est sélectionné
      if (!formValues.fishType) {
        message.error('Veuillez sélectionner un type de poisson');
        return;
      }
      
      // Vérifier si les champs requis sont remplis
      if (!formValues.bait) {
        message.error('Veuillez indiquer l\'appât utilisé');
        return;
      }
      
      if (!formValues.technique) {
        message.error('Veuillez indiquer la technique utilisée');
        return;
      }
      
      if (!formValues.weather) {
        message.error('Veuillez indiquer les conditions météo');
        return;
      }
      
      // Si c'est un poisson custom, vérifier que le nom est indiqué
      if (formValues.fishType === 'custom' && !formValues.customFishType) {
        message.error('Veuillez indiquer le nom du poisson personnalisé');
        return;
      }
      
      // Préparer les données du poisson
      let fishTypeData = {};
      
      if (formValues.fishType === 'custom') {
        // Si c'est un poisson personnalisé, on sauvegarde d'abord le type personnalisé
        const customFish = storageService.addCustomFishType(formValues.customFishType, waterType);
        fishTypeData = {
          fishType: 'custom',
          customFishType: formValues.customFishType
        };
      } else {
        fishTypeData = {
          fishType: formValues.fishType
        };
      }
      
      const currentUser = userService.getCurrentUser();
      
      // Créer la nouvelle capture
      const newCatch = createCatch({
        ...formValues,
        ...fishTypeData,
        location: customLocation,
        address: addressForm.getFieldValue('address'),
        createdBy: currentUser.id,
        photo: imageUrl
      });

      // Enregistrer dans le stockage
      storageService.addCatch(newCatch);
      setCatches([...catches, newCatch]);
      
      // Réinitialiser le formulaire et fermer la modal
      setIsModalVisible(false);
      form.resetFields();
      addressForm.resetFields();
      setWaterType(WATER_TYPES.FRESH);
      setShowCustomFishInput(false);
      setCustomLocation(null);
      setImageUrl('');
      message.success('Capture ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la capture:', error);
      message.error('Une erreur est survenue lors de l\'ajout de la capture');
    }
  };

  const getSpotName = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.name : 'Spot inconnu';
  };

  const getFishName = (fishType, customFishType) => {
    if (fishType === 'custom' && customFishType) {
      return customFishType;
    }
    return FISH_TYPES_FR[fishType] || fishType;
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

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Télécharger</div>
    </div>
  );

  return (
    <div>
      <Card
        title="Mes Captures"
        extra={
          <Button type="primary" icon={<CameraOutlined />} onClick={() => setIsModalVisible(true)}>
            Ajouter une capture
          </Button>
        }
        style={{ borderRadius: '8px' }}
      >
        {catches.length === 0 ? (
          <Empty
            description="Vous n'avez pas encore enregistré de captures"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={catches}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{ 
                  background: '#f9f9f9', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px' 
                }}
                extra={
                  item.photo && (
                    <img
                      width={200}
                      alt="capture de poisson"
                      src={item.photo}
                      style={{ borderRadius: '8px' }}
                    />
                  )
                }
              >
                <List.Item.Meta
                  title={`${getFishName(item.fishType, item.customFishType)} - ${new Date(item.createdAt).toLocaleDateString()}`}
                  description={
                    <>
                      <p><strong>Spot:</strong> {getSpotName(item.spotId)}</p>
                      {item.address && <p><strong>Adresse:</strong> {item.address}</p>}
                      {item.location && (
                        <p>
                          <strong>Localisation précise:</strong> 
                          <a 
                            href={`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: 8 }}
                          >
                            <EnvironmentOutlined /> Voir sur la carte
                          </a>
                        </p>
                      )}
                      <p><strong>Appât:</strong> {item.bait}</p>
                      <p><strong>Technique:</strong> {item.technique}</p>
                      <p><strong>Météo:</strong> {item.weather}</p>
                      {item.weight && <p><strong>Poids:</strong> {item.weight} kg</p>}
                      {item.length && <p><strong>Taille:</strong> {item.length} cm</p>}
                      {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                    </>
                  }
                />
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
            }}
          />
        )}
      </Card>

      <Modal
        title="Ajouter une capture"
        open={isModalVisible}
        onOk={handleAddCatch}
        onCancel={() => {
          setIsModalVisible(false);
          setWaterType(WATER_TYPES.FRESH);
          setShowCustomFishInput(false);
          setCustomLocation(null);
          setImageUrl('');
          form.resetFields();
          addressForm.resetFields();
        }}
        width={800}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Informations" key="1">
            <Form form={form} layout="vertical">
              <Form.Item label="Type d'eau" required>
                <Radio.Group value={waterType} onChange={handleWaterTypeChange}>
                  {Object.entries(WATER_TYPES_FR).map(([key, value]) => (
                    <Radio.Button key={key} value={key}>{value}</Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="fishType"
                label="Type de poisson"
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select onChange={handleFishTypeChange}>
                  <Select.OptGroup label={WATER_TYPES_FR[waterType]}>
                    {FISH_BY_WATER_TYPE[waterType].map((fishType) => (
                      <Select.Option key={fishType} value={fishType}>
                        {FISH_TYPES_FR[fishType]}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  <Select.Option value="custom">
                    {getCustomFishLabel(waterType)}
                  </Select.Option>
                </Select>
              </Form.Item>

              {showCustomFishInput && (
                <Form.Item
                  name="customFishType"
                  label="Nom du poisson personnalisé"
                  rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
                >
                  <Input placeholder="Entrez le nom du poisson" />
                </Form.Item>
              )}

              <Form.Item
                name="spotId"
                label="Spot de pêche"
                rules={[{ required: true, message: 'Veuillez sélectionner un spot' }]}
              >
                <Select>
                  {storageService.getSpots().map((spot) => (
                    <Select.Option key={spot.id} value={spot.id}>
                      {spot.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="bait"
                label="Appât utilisé"
                rules={[{ required: true, message: 'Veuillez entrer l\'appât utilisé' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="technique"
                label="Technique utilisée"
                rules={[{ required: true, message: 'Veuillez entrer la technique utilisée' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="weather"
                label="Conditions météo"
                rules={[{ required: true, message: 'Veuillez entrer les conditions météo' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="weight" label="Poids (kg)">
                <Input type="number" step="0.1" />
              </Form.Item>

              <Form.Item name="length" label="Taille (cm)">
                <Input type="number" />
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <TextArea rows={4} />
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
            
            <div style={{ marginTop: 8, marginBottom: 16, textAlign: 'center' }}>
              <small>Ou sélectionnez l'emplacement précis sur la carte</small>
            </div>
            
            <LocationPicker onChange={setCustomLocation} />
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="Photo" key="3">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Upload
                name="photo"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={handleImageUpload}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="capture"
                    style={{ width: '100%', maxHeight: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
              <div style={{ marginTop: 8 }}>
                <small>Format JPG/PNG, taille maximale 2MB</small>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default CatchesPage; 