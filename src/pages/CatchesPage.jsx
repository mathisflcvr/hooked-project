import { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Upload, message, Empty, Tabs, Radio, Space, Popconfirm, DatePicker, Divider } from 'antd';
import { UploadOutlined, CameraOutlined, PlusOutlined, EnvironmentOutlined, LoadingOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { imageService } from '../services/imageService';
import { geocodingService } from '../services/geocodingService';
import { createCatch, createCaughtFish } from '../models/dataModels';
import { 
  FISH_TYPES, 
  FISH_TYPES_FR, 
  WATER_TYPES, 
  WATER_TYPES_FR, 
  FISH_BY_WATER_TYPE,
  FISHING_TYPES,
  FISHING_TYPES_FR
} from '../models/dataModels';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { userService } from '../services/userService';
import locale from 'antd/es/date-picker/locale/fr_FR';
import moment from 'moment';
import 'moment/locale/fr';

const { TextArea } = Input;
const { TabPane } = Tabs;

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
        <small>Cliquez sur la carte pour définir la localisation précise de votre capture.</small>
      </div>
    </div>
  );
};

const CatchesPage = () => {
  const [catches, setCatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCatch, setCurrentCatch] = useState(null);
  const [form] = Form.useForm();
  const [fishForm] = Form.useForm();
  const [waterType, setWaterType] = useState(WATER_TYPES.FRESH);
  const [showCustomFishInput, setShowCustomFishInput] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fishList, setFishList] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState('1');

  useEffect(() => {
    loadCatches();
  }, []);
  
  const loadCatches = () => {
    const loadedCatches = storageService.getCatches();
    setCatches(loadedCatches);
  };

  const handleWaterTypeChange = (e) => {
    setWaterType(e.target.value);
    // Réinitialiser le type de poisson sélectionné
    fishForm.setFieldsValue({ fishType: undefined });
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

  const handleEditCatch = (catchItem) => {
    setCurrentCatch(catchItem);
    setIsEditMode(true);
    setImageUrl(catchItem.photo || '');
    setWaterType(catchItem.waterType || WATER_TYPES.FRESH);
    setFishList(catchItem.fishes || []);
    
    // Remplir le formulaire avec les données existantes
    form.setFieldsValue({
      spotId: catchItem.spotId,
      bait: catchItem.bait,
      technique: catchItem.technique,
      weather: catchItem.weather,
      notes: catchItem.notes,
      catchDate: catchItem.catchDate ? moment(catchItem.catchDate) : undefined
    });
    
    setIsModalVisible(true);
  };
  
  const handleDeleteCatch = (catchId) => {
    try {
      storageService.deleteCatch(catchId);
      message.success('Capture supprimée avec succès');
      // Recharger les captures
      loadCatches();
    } catch (error) {
      console.error('Erreur lors de la suppression de la capture:', error);
      message.error('Impossible de supprimer la capture');
    }
  };

  const handleAddFish = () => {
    try {
      fishForm.validateFields().then((values) => {
        // Préparer les données du poisson
        let fishData = {
          fishType: values.fishType,
          customFishType: values.customFishType,
          name: values.fishName,
          weight: values.weight,
          length: values.length
        };
        
        const newFish = createCaughtFish(fishData);
        setFishList([...fishList, newFish]);
        fishForm.resetFields();
        setShowCustomFishInput(false);
        message.success('Poisson ajouté à la capture');
        
        // Passer à l'onglet des informations après avoir ajouté un poisson
        setActiveTabKey('1');
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du poisson:', error);
      message.error('Une erreur est survenue lors de l\'ajout du poisson');
    }
  };

  const handleRemoveFish = (fishId) => {
    const updatedFishList = fishList.filter(fish => fish.id !== fishId);
    setFishList(updatedFishList);
    message.success('Poisson retiré de la capture');
  };

  const handleAddCatch = () => {
    try {
      // Vérifier si un spot de pêche est sélectionné
      const formValues = form.getFieldsValue();
      if (!formValues.spotId) {
        message.error('Veuillez sélectionner un spot de pêche');
        return;
      }
      
      // Vérifier si au moins un poisson a été ajouté
      if (fishList.length === 0) {
        message.error('Veuillez ajouter au moins un poisson à votre capture');
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
      
      const currentUser = userService.getCurrentUser();
      
      if (isEditMode && currentCatch) {
        // Mode édition
        const updatedCatch = {
          ...currentCatch,
          ...formValues,
          fishes: fishList,
          photo: imageUrl || currentCatch.photo,
          waterType: waterType
        };
        
        storageService.updateCatch(updatedCatch);
        // Mettre à jour l'état local
        setCatches(catches.map(c => c.id === updatedCatch.id ? updatedCatch : c));
        message.success('Capture mise à jour avec succès !');
      } else {
        // Mode ajout
        // Créer la nouvelle capture
        const newCatch = createCatch({
          ...formValues,
          fishes: fishList,
          createdBy: currentUser.id,
          photo: imageUrl,
          waterType: waterType
        });

        // Enregistrer dans le stockage
        storageService.addCatch(newCatch);
        setCatches([...catches, newCatch]);
        message.success('Capture ajoutée avec succès !');
      }
      
      // Réinitialiser le formulaire et fermer la modal
      setIsModalVisible(false);
      setIsEditMode(false);
      setCurrentCatch(null);
      form.resetFields();
      fishForm.resetFields();
      setWaterType(WATER_TYPES.FRESH);
      setShowCustomFishInput(false);
      setImageUrl('');
      setFishList([]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la capture:', error);
      message.error('Une erreur est survenue lors de l\'ajout de la capture');
    }
  };

  const getSpotName = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.name : 'Spot inconnu';
  };

  const getSpotLocation = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.location : null;
  };

  const getFishName = (fishType, customFishType, fishName) => {
    if (fishName) {
      return fishName;
    }
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

  const renderFishList = () => {
    if (fishList.length === 0) {
      return (
        <Empty
          description="Aucun poisson ajouté à cette capture"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={fishList}
        renderItem={fish => (
          <List.Item
            actions={[
              <Button 
                type="text" 
                danger 
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemoveFish(fish.id)}
              >
                Retirer
              </Button>
            ]}
          >
            <List.Item.Meta
              title={getFishName(fish.fishType, fish.customFishType, fish.name)}
              description={
                <>
                  {fish.weight && <div>Poids: {fish.weight} kg</div>}
                  {fish.length && <div>Taille: {fish.length} cm</div>}
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div>
      <Card
        title="Mes Captures"
        extra={
          <Button type="primary" icon={<CameraOutlined />} onClick={() => {
            setIsEditMode(false);
            setCurrentCatch(null);
            setImageUrl('');
            setFishList([]);
            form.resetFields();
            fishForm.resetFields();
            setWaterType(WATER_TYPES.FRESH);
            setShowCustomFishInput(false);
            setIsModalVisible(true);
          }}>
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
                actions={[
                  <Button icon={<EditOutlined />} onClick={() => handleEditCatch(item)}>
                    Modifier
                  </Button>,
                  <Popconfirm
                    title="Supprimer cette capture"
                    description="Êtes-vous sûr de vouloir supprimer cette capture ?"
                    onConfirm={() => handleDeleteCatch(item.id)}
                    okText="Oui"
                    cancelText="Non"
                  >
                    <Button icon={<DeleteOutlined />} danger>
                      Supprimer
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={`Capture du ${new Date(item.createdAt).toLocaleDateString()}`}
                  description={
                    <>
                      <p><strong>Spot:</strong> {getSpotName(item.spotId)}</p>
                      {item.address && <p><strong>Adresse:</strong> {item.address}</p>}
                      {getSpotLocation(item.spotId) && (
                        <p>
                          <strong>Localisation:</strong> 
                          <a 
                            href={`https://www.google.com/maps?q=${getSpotLocation(item.spotId).lat},${getSpotLocation(item.spotId).lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: 8 }}
                          >
                            <EnvironmentOutlined /> Voir sur la carte
                          </a>
                        </p>
                      )}
                      <p><strong>Date de capture:</strong> {item.catchDate ? new Date(item.catchDate).toLocaleDateString() : 'Non spécifiée'}</p>
                      <p><strong>Appât:</strong> {item.bait}</p>
                      <p><strong>Technique:</strong> {item.technique}</p>
                      <p><strong>Météo:</strong> {item.weather}</p>
                      {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                      
                      <Divider orientation="left">Poissons capturés</Divider>
                      <List
                        itemLayout="horizontal"
                        dataSource={item.fishes || []}
                        renderItem={fish => (
                          <List.Item>
                            <List.Item.Meta
                              title={getFishName(fish.fishType, fish.customFishType, fish.name)}
                              description={
                                <>
                                  {fish.weight && <span style={{ marginRight: '10px' }}>Poids: {fish.weight} kg</span>}
                                  {fish.length && <span>Taille: {fish.length} cm</span>}
                                </>
                              }
                            />
                          </List.Item>
                        )}
                      />
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
        title={isEditMode ? "Modifier la capture" : "Ajouter une capture"}
        open={isModalVisible}
        onOk={handleAddCatch}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setCurrentCatch(null);
          setWaterType(WATER_TYPES.FRESH);
          setShowCustomFishInput(false);
          setImageUrl('');
          setFishList([]);
          form.resetFields();
          fishForm.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
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

          <Form.Item 
            name="catchDate" 
            label="Date de la capture"
            rules={[{ required: true, message: 'Veuillez sélectionner la date de capture' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              placeholder="Sélectionnez une date" 
              style={{ width: '100%' }}
              locale={locale}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>

        <Divider orientation="left">Photo de la capture</Divider>
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
                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
          <div style={{ marginTop: 8 }}>
            <small>Format JPG/PNG, taille maximale 50MB</small>
          </div>
        </div>

        <Divider orientation="left">Ajouter un poisson</Divider>
        <Form form={fishForm} layout="vertical">
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
            name="fishName"
            label="Nom du poisson (optionnel)"
          >
            <Input placeholder="Donnez un nom à votre poisson" />
          </Form.Item>

          <Space>
            <Form.Item name="weight" label="Poids (kg)" style={{ marginBottom: 0 }}>
              <Input type="number" step="0.1" />
            </Form.Item>

            <Form.Item name="length" label="Taille (cm)" style={{ marginBottom: 0 }}>
              <Input type="number" />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFish}>
              Ajouter ce poisson
            </Button>
          </Form.Item>
        </Form>

        <Divider orientation="left">Poissons capturés</Divider>
        {renderFishList()}
      </Modal>
    </div>
  );
};

export default CatchesPage; 