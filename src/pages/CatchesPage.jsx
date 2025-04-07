import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Upload, message, Empty, Tabs, Radio, Space } from 'antd';
import { UploadOutlined, CameraOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
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
  const [waterType, setWaterType] = useState(WATER_TYPES.FRESH);
  const [showCustomFishInput, setShowCustomFishInput] = useState(false);
  const [customLocation, setCustomLocation] = useState(null);

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

  const handleAddCatch = () => {
    form.validateFields().then((values) => {
      let fishTypeData = {};
      
      if (values.fishType === 'custom') {
        // Si c'est un poisson personnalisé, on sauvegarde d'abord le type personnalisé
        const customFish = storageService.addCustomFishType(values.customFishType, waterType);
        fishTypeData = {
          fishType: 'custom',
          customFishType: values.customFishType
        };
      } else {
        fishTypeData = {
          fishType: values.fishType
        };
      }
      
      const newCatch = createCatch({
        ...values,
        ...fishTypeData,
        location: customLocation,
        createdBy: 'currentUser', // À remplacer par l'ID de l'utilisateur connecté
        photo: values.photo?.[0]?.thumbUrl || null
      });

      storageService.addCatch(newCatch);
      setCatches([...catches, newCatch]);
      setIsModalVisible(false);
      form.resetFields();
      setWaterType(WATER_TYPES.FRESH);
      setShowCustomFishInput(false);
      setCustomLocation(null);
      message.success('Capture ajoutée avec succès !');
    });
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

  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    listType: 'picture',
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG !');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('L\'image doit être inférieure à 2MB !');
      }
      return isJpgOrPng && isLt2M;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} téléchargé avec succès`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement.`);
      }
    },
  };

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
          form.resetFields();
        }}
        width={800}
      >
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

          <Form.Item label="Localisation précise de la capture">
            <LocationPicker onChange={setCustomLocation} />
          </Form.Item>

          <Form.Item
            name="photo"
            label="Photo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Télécharger une photo</Button>
            </Upload>
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
      </Modal>
    </div>
  );
};

export default CatchesPage; 