import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Tabs, Form, Input, message, List, Space, Modal, Switch, Row, Col, Divider, Alert } from 'antd';
import { UserOutlined, EditOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, CameraOutlined, LoadingOutlined, SyncOutlined, CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { imageService } from '../services/imageService';
import { storageService } from '../services/storageService';
import { FISH_TYPES, FISH_TYPES_FR } from '../models/dataModels';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const { TabPane } = Tabs;

// Collection d'avatars de poissons prédéfinis
const FISH_AVATARS = [
  { id: 1, url: 'https://img.icons8.com/color/96/null/fish.png', name: 'Poisson coloré' },
  { id: 2, url: 'https://img.icons8.com/color/96/null/clown-fish.png', name: 'Poisson clown' },
  { id: 3, url: 'https://img.icons8.com/color/96/null/koi-fish.png', name: 'Poisson koi' },
  { id: 4, url: 'https://img.icons8.com/color/96/null/fish-food.png', name: 'Poisson tropical' },
  { id: 5, url: 'https://img.icons8.com/color/96/null/shark.png', name: 'Requin' },
  { id: 6, url: 'https://img.icons8.com/color/96/null/bream.png', name: 'Dorade' },
];

const ProfilePage = () => {
  const { user: authUser, getUserProfile, updateProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [userCatches, setUserCatches] = useState([]);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadUserData();
    
    // Vérifier l'état de la synchronisation
    const syncState = storageService.isSyncEnabled();
    setSyncEnabled(syncState);
  }, [authUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!authUser) {
        // Si l'utilisateur n'est pas connecté, on charge les données de la démo
        const demoUser = userService.getCurrentUser();
        setUser(demoUser);
        setUserProfile(demoUser);
        
        // Configurer le formulaire avec les données de démo
        form.setFieldsValue({
          username: demoUser.username,
          email: demoUser.email,
          bio: demoUser.bio || '',
          notifications: demoUser.preferences?.notifications || false
        });
        
        // Charger les spots favoris et captures
        const favorites = userService.getUserFavorites();
        setFavoriteSpots(favorites);
        
        const catches = userService.getUserCatches();
        setUserCatches(catches);
        
        return;
      }
      
      // Charger les données de l'utilisateur authentifié
      setUser(authUser);
      
      // Récupérer le profil utilisateur depuis la base de données
      try {
        const profile = await getUserProfile(authUser.id);
        setUserProfile(profile);
      } catch (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        // Créer un profil par défaut si non trouvé
        setUserProfile({
          username: authUser.user_metadata?.username || authUser.email,
          bio: '',
          notifications: false
        });
      }
      
      // Utiliser soit le profil récupéré, soit les données de l'utilisateur
      const displayName = userProfile?.username || authUser.user_metadata?.username || authUser.email;
      const userBio = userProfile?.bio || '';
      const userNotifications = userProfile?.notifications || false;
      
      // Configurer le formulaire avec les données actuelles
      form.setFieldsValue({
        username: displayName,
        email: authUser.email,
        bio: userBio,
        notifications: userNotifications
      });
      
      // Charger les spots favoris et captures
      const favorites = userService.getUserFavorites();
      setFavoriteSpots(favorites);
      
      const catches = userService.getUserCatches();
      setUserCatches(catches);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      // Utiliser les données locales comme fallback
      const localUser = userService.getCurrentUser();
      setUser(localUser);
      setUserProfile(localUser);
      message.warning('Mode démo activé : certaines fonctionnalités peuvent être limitées');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      if (!authUser) {
        // Mode démo : mettre à jour localement
        const updatedUser = userService.updateUserProfile({
          username: values.username,
          email: values.email,
          bio: values.bio,
          preferences: {
            notifications: values.notifications
          }
        });
        
        setUser(updatedUser);
        setUserProfile(updatedUser);
        setEditMode(false);
        message.success('Profil mis à jour avec succès (mode démo)');
        return;
      }
      
      // Mettre à jour le profil via AuthContext et la bio avec la nouvelle méthode
      try {
        await updateProfile(authUser.id, {
          username: values.username,
          bio: values.bio,
          notifications: values.notifications
        });
        
        // Mettre à jour la bio avec la nouvelle méthode spécifique
        await userService.updateUserBio(values.bio);
        
        // Mettre à jour également dans userService pour la compatibilité
        userService.updateUserProfile({
          username: values.username,
          email: values.email,
          bio: values.bio,
          preferences: {
            notifications: values.notifications
          }
        });
        
        // Recharger les données
        await loadUserData();
        setEditMode(false);
        message.success('Profil mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        message.error('Erreur lors de la mise à jour du profil dans Supabase. Mise à jour locale uniquement.');
        
        // Fallback : mettre à jour localement
        const updatedUser = userService.updateUserProfile({
          username: values.username,
          email: values.email,
          bio: values.bio,
          preferences: {
            notifications: values.notifications
          }
        });
        
        setUser(updatedUser);
        setUserProfile(updatedUser);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Erreur globale lors de la mise à jour du profil:', error);
      message.error('Impossible de mettre à jour le profil');
    }
  };

  const showAvatarModal = () => {
    setIsAvatarModalVisible(true);
  };

  const handleAvatarModalCancel = () => {
    setIsAvatarModalVisible(false);
  };

  const handleAvatarSelection = async (avatarUrl) => {
    try {
      setLoading(true);
      
      // Mettre à jour dans Supabase en premier
      if (authUser) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', authUser.id);

          if (error) {
            console.error('Erreur Supabase:', error);
            throw error;
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil dans Supabase:', error);
          message.error('Erreur lors de la sauvegarde de l\'avatar');
          return;
        }
      }

      // Mettre à jour l'état local
      const updatedProfile = {
        ...userProfile,
        avatar_url: avatarUrl
      };
      setUserProfile(updatedProfile);
      
      // Mettre à jour dans userService pour la persistance locale
      userService.updateUserAvatar(avatarUrl);
      
      setIsAvatarModalVisible(false);
      message.success('Avatar mis à jour avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      message.error('Erreur lors de la mise à jour de l\'avatar');
    } finally {
      setLoading(false);
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

  const handleToggleSync = (checked) => {
    try {
      storageService.setSyncEnabled(checked);
      setSyncEnabled(checked);
      message.success(`Synchronisation ${checked ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Erreur lors du changement d\'état de synchronisation:', error);
      message.error('Impossible de modifier l\'état de synchronisation');
    }
  };
  
  const handleSyncToSupabase = async () => {
    try {
      setIsSyncing(true);
      const success = await userService.syncLocalDataToSupabase();
      
      if (success) {
        message.success('Données synchronisées avec succès vers Supabase');
      } else {
        message.error('Erreur lors de la synchronisation des données');
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation vers Supabase:', error);
      message.error('Impossible de synchroniser les données');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSyncFromSupabase = async () => {
    try {
      setIsSyncing(true);
      const success = await userService.fetchDataFromSupabase();
      
      if (success) {
        message.success('Données récupérées avec succès depuis Supabase');
        // Recharger les données
        await loadUserData();
      } else {
        message.error('Erreur lors de la récupération des données');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération depuis Supabase:', error);
      message.error('Impossible de récupérer les données');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><LoadingOutlined style={{ fontSize: 24 }} spin /></div>;
  }

  // On utilise les données du profil si disponibles, sinon les données de base de l'utilisateur
  const displayName = userProfile?.username || user?.user_metadata?.username || user?.email || user?.username;
  const userEmail = user?.email;
  const userBio = userProfile?.bio || user?.bio || 'Aucune bio';
  const userAvatar = userProfile?.avatar_url || user?.avatar || null;
  const userNotifications = userProfile?.notifications || user?.preferences?.notifications || false;

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
              src={userAvatar} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <Button 
              type="primary" 
              shape="circle" 
              icon={<CameraOutlined />} 
              size="small"
              onClick={showAvatarModal}
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' 
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{displayName}</h2>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </div>
            <p style={{ color: '#666', margin: '8px 0' }}>{userEmail}</p>
            <p>{userBio}</p>
          </div>
        </div>
      </Card>

      {/* Modal de sélection d'avatar */}
      <Modal
        title="Choisissez votre avatar poisson"
        open={isAvatarModalVisible}
        onCancel={handleAvatarModalCancel}
        footer={null}
        width={800}
      >
        <p style={{ marginBottom: '20px' }}>Sélectionnez un des dessins de poissons pour votre profil :</p>
        <Row gutter={[16, 16]}>
          {FISH_AVATARS.map(avatar => (
            <Col key={avatar.id} span={8}>
              <div 
                style={{ 
                  textAlign: 'center', 
                  padding: '16px',
                  cursor: 'pointer',
                  border: userProfile?.avatar_url === avatar.url ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  backgroundColor: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => handleAvatarSelection(avatar.url)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(24,144,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  if (userProfile?.avatar_url !== avatar.url) {
                    e.currentTarget.style.borderColor = '#d9d9d9';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <img 
                  src={avatar.url} 
                  alt={avatar.name}
                  style={{ 
                    width: '96px', 
                    height: '96px',
                    objectFit: 'contain'
                  }} 
                />
                <p style={{ 
                  marginTop: '12px', 
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: userProfile?.avatar_url === avatar.url ? '500' : 'normal'
                }}>
                  {avatar.name}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Profil" key="1">
          {editMode ? (
            <Card style={{ borderRadius: '8px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleProfileUpdate}
                initialValues={{
                  username: displayName,
                  email: userEmail,
                  bio: userBio,
                  notifications: userNotifications
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
                  <Input disabled />
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
              <h3>Informations personnelles</h3>
              <p><strong>Nom d'utilisateur:</strong> {displayName}</p>
              <p><strong>Email:</strong> {userEmail}</p>
              <p><strong>Bio:</strong> {userBio}</p>
              <p><strong>Notifications:</strong> {userNotifications ? 'Activées' : 'Désactivées'}</p>
            </Card>
          )}
          
          {authUser && (
            <Card style={{ borderRadius: '8px', marginTop: '16px' }}>
              <h3>Synchronisation des données</h3>
              <p>Synchronisez vos spots, captures et favoris avec le cloud</p>
              
              <div style={{ marginBottom: '16px' }}>
                <Space>
                  <span>Synchronisation automatique:</span>
                  <Switch checked={syncEnabled} onChange={handleToggleSync} />
                </Space>
              </div>
              
              <Alert
                message="Comment fonctionne la synchronisation"
                description="Lorsque la synchronisation est activée, vos spots, captures et favoris sont automatiquement enregistrés dans votre profil Supabase. Vous pouvez à tout moment forcer une synchronisation manuelle avec les boutons ci-dessous."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <Button 
                  type="primary" 
                  onClick={handleSyncToSupabase} 
                  icon={<CloudUploadOutlined />}
                  loading={isSyncing}
                >
                  Synchroniser vers le cloud
                </Button>
                <Button 
                  onClick={handleSyncFromSupabase} 
                  icon={<CloudDownloadOutlined />}
                  loading={isSyncing}
                >
                  Récupérer depuis le cloud
                </Button>
              </div>
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