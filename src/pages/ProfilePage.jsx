import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Tabs, Form, Input, Upload, message, List, Space, Modal, Switch } from 'antd';
import { UserOutlined, EditOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, CameraOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { imageService } from '../services/imageService';
import { storageService } from '../services/storageService';
import { FISH_TYPES, FISH_TYPES_FR } from '../models/dataModels';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [userCatches, setUserCatches] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      setLoading(true);
      
      // Charger les données de l'utilisateur
      const currentUser = userService.getCurrentUser();
      setUser(currentUser);
      
      // Configurer le formulaire avec les données actuelles
      form.setFieldsValue({
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio,
        notifications: currentUser.preferences?.notifications
      });
      
      // Charger les spots favoris
      const favorites = userService.getUserFavorites();
      setFavoriteSpots(favorites);
      
      // Charger les captures de l'utilisateur
      const catches = userService.getUserCatches();
      setUserCatches(catches);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      message.error('Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (values) => {
    try {
      const updatedUser = userService.updateUserProfile({
        username: values.username,
        email: values.email,
        bio: values.bio,
        preferences: {
          notifications: values.notifications
        }
      });
      
      setUser(updatedUser);
      setEditMode(false);
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      message.error('Impossible de mettre à jour le profil');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setImageLoading(true);
      
      // Valider l'image
      const validation = imageService.validateImage(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => message.error(error));
        return false;
      }
      
      // Convertir et enregistrer
      const result = await imageService.uploadImage(file);
      
      if (result.success) {
        // Mettre à jour l'avatar dans le profil utilisateur
        const updatedUser = userService.updateUserAvatar(result.url);
        setUser(updatedUser);
        message.success('Avatar mis à jour avec succès');
      } else {
        message.error(result.error || 'Erreur lors du téléchargement de l\'avatar');
      }
      
      return false; // Empêcher le comportement par défaut d'antd Upload
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
      message.error('Erreur lors du téléchargement de l\'avatar');
      return false;
    } finally {
      setImageLoading(false);
    }
  };

  const toggleFavoriteSpot = (spotId) => {
    try {
      const isFavorite = userService.isSpotFavorite(spotId);
      
      if (isFavorite) {
        userService.removeFavorite(spotId);
        message.success('Spot retiré des favoris');
      } else {
        userService.addFavorite(spotId);
        message.success('Spot ajouté aux favoris');
      }
      
      // Recharger les favoris
      const updatedFavorites = userService.getUserFavorites();
      setFavoriteSpots(updatedFavorites);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      message.error('Impossible de gérer les favoris');
    }
  };

  const getFishName = (fishType, customFishType) => {
    if (fishType === 'custom' && customFishType) {
      return customFishType;
    }
    
    return FISH_TYPES_FR[fishType] || fishType;
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Télécharger</div>
    </div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><LoadingOutlined style={{ fontSize: 24 }} spin /></div>;
  }

  return (
    <div className="profile-page">
      <Card 
        style={{ borderRadius: '8px', marginBottom: '24px' }}
        bordered={false}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '24px', position: 'relative' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={user?.avatar} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
            >
              <Button 
                type="primary" 
                shape="circle" 
                icon={<CameraOutlined />} 
                size="small"
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' 
                }}
              />
            </Upload>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{user?.username}</h2>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </div>
            <p style={{ color: '#666', margin: '8px 0' }}>{user?.email}</p>
            <p>{user?.bio || 'Aucune bio'}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Profil" key="1">
          {editMode ? (
            <Card style={{ borderRadius: '8px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleProfileUpdate}
                initialValues={{
                  username: user?.username,
                  email: user?.email,
                  bio: user?.bio,
                  notifications: user?.preferences?.notifications
                }}
              >
                <Form.Item
                  name="username"
                  label="Nom d'utilisateur"
                  rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Veuillez entrer votre email' },
                    { type: 'email', message: 'Format d\'email invalide' }
                  ]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <Input.TextArea rows={4} placeholder="Parlez-nous de vous et de votre passion pour la pêche" />
                </Form.Item>
                
                <Form.Item name="notifications" valuePropName="checked" label="Notifications">
                  <Switch />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Enregistrer
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          ) : (
            <Card style={{ borderRadius: '8px' }}>
              <h3>Statistiques</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', margin: '16px 0' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userCatches.length}</div>
                  <div>Captures</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{favoriteSpots.length}</div>
                  <div>Spots favoris</div>
                </div>
              </div>
              
              <h3>À propos</h3>
              <p>{user?.bio || 'Aucune bio'}</p>
              
              <h3>Préférences</h3>
              <p>
                <strong>Notifications:</strong> {user?.preferences?.notifications ? 'Activées' : 'Désactivées'}
              </p>
              <p>
                <strong>Thème:</strong> {user?.preferences?.theme === 'dark' ? 'Sombre' : 'Clair'}
              </p>
            </Card>
          )}
        </TabPane>
        
        <TabPane tab="Spots favoris" key="2">
          <Card style={{ borderRadius: '8px' }}>
            {favoriteSpots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p>Vous n'avez pas encore de spots favoris</p>
                <p>Explorez la carte et ajoutez des spots à vos favoris</p>
              </div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={favoriteSpots}
                renderItem={spot => (
                  <List.Item
                    key={spot.id}
                    actions={[
                      <Button 
                        type="text" 
                        icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                        onClick={() => toggleFavoriteSpot(spot.id)}
                      >
                        Retirer
                      </Button>,
                      <a
                        href={`https://www.google.com/maps?q=${spot.location.lat},${spot.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <EnvironmentOutlined /> Carte
                      </a>
                    ]}
                  >
                    <List.Item.Meta
                      title={spot.name}
                      description={
                        <>
                          <p>{spot.description}</p>
                          <p>Type: {spot.type}</p>
                          {spot.address && <p>Adresse: {spot.address}</p>}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="Mes captures" key="3">
          <Card style={{ borderRadius: '8px' }}>
            {userCatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p>Vous n'avez pas encore enregistré de captures</p>
                <p>Ajoutez votre première capture pour commencer votre journal</p>
              </div>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={userCatches}
                renderItem={item => (
                  <List.Item
                    key={item.id}
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
                          <p><strong>Spot:</strong> {storageService.getSpots().find(s => s.id === item.spotId)?.name}</p>
                          {item.address && <p><strong>Adresse:</strong> {item.address}</p>}
                          <p><strong>Appât:</strong> {item.bait}</p>
                          <p><strong>Technique:</strong> {item.technique}</p>
                          {item.weight && <p><strong>Poids:</strong> {item.weight} kg</p>}
                          {item.length && <p><strong>Taille:</strong> {item.length} cm</p>}
                        </>
                      }
                    />
                  </List.Item>
                )}
                pagination={{ pageSize: 3 }}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 