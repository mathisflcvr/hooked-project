import { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Input, Space, Typography, Tabs, Empty } from 'antd';
import { LikeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { createInteraction } from '../models/dataModels';
import { FISH_TYPES } from '../models/dataModels';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Traduction des types de poissons
const FISH_TYPES_FR = {
  [FISH_TYPES.PIKE]: 'Brochet',
  [FISH_TYPES.ZANDER]: 'Sandre',
  [FISH_TYPES.TROUT]: 'Truite',
  [FISH_TYPES.BASS]: 'Bar',
  [FISH_TYPES.CARP]: 'Carpe',
  [FISH_TYPES.CATFISH]: 'Silure'
};

const CommunityPage = () => {
  const [catches, setCatches] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const loadedCatches = storageService.getCatches();
    const loadedInteractions = storageService.getInteractions();
    setCatches(loadedCatches);
    setInteractions(loadedInteractions);
  }, []);

  const getSpotName = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.name : 'Spot inconnu';
  };

  const handleLike = (catchId) => {
    // Vérifier si l'utilisateur a déjà liké
    const alreadyLiked = interactions.some(
      interaction => interaction.catchId === catchId && 
                     interaction.userId === 'currentUser' && 
                     interaction.type === 'like'
    );

    if (alreadyLiked) {
      return;
    }

    const newInteraction = createInteraction({
      type: 'like',
      catchId,
      userId: 'currentUser', // À remplacer par l'ID de l'utilisateur connecté
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });

    storageService.addInteraction(newInteraction);
    setInteractions([...interactions, newInteraction]);
  };

  const handleComment = (catchId) => {
    const commentInput = commentInputs[catchId];
    if (!commentInput || !commentInput.trim()) return;

    const newInteraction = createInteraction({
      type: 'comment',
      catchId,
      userId: 'currentUser', // À remplacer par l'ID de l'utilisateur connecté
      content: commentInput,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });

    storageService.addInteraction(newInteraction);
    setInteractions([...interactions, newInteraction]);
    
    // Réinitialiser le champ de commentaire pour ce catch
    setCommentInputs({
      ...commentInputs,
      [catchId]: ''
    });
  };

  const updateCommentInput = (catchId, value) => {
    setCommentInputs({
      ...commentInputs,
      [catchId]: value
    });
  };

  const getLikesCount = (catchId) => {
    return interactions.filter(
      (interaction) => interaction.catchId === catchId && interaction.type === 'like'
    ).length;
  };

  const getComments = (catchId) => {
    return interactions.filter(
      (interaction) => interaction.catchId === catchId && interaction.type === 'comment'
    );
  };

  const getTopSpots = () => {
    const spotStats = catches.reduce((acc, catchItem) => {
      acc[catchItem.spotId] = (acc[catchItem.spotId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(spotStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([spotId]) => {
        const spot = storageService.getSpots().find((s) => s.id === spotId);
        return spot;
      })
      .filter(Boolean); // Filtrer les spots non trouvés (null/undefined)
  };

  const items = [
    {
      key: '1',
      label: 'Fil d\'actualité',
      children: (
        catches.length === 0 ? (
          <Empty
            description="Aucune capture n'a été partagée pour le moment"
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
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={`${FISH_TYPES_FR[item.fishType] || item.fishType} - ${new Date(item.createdAt).toLocaleDateString()}`}
                  description={
                    <>
                      <p><strong>Spot:</strong> {getSpotName(item.spotId)}</p>
                      <p><strong>Appât:</strong> {item.bait}</p>
                      <p><strong>Technique:</strong> {item.technique}</p>
                      {item.weight && <p><strong>Poids:</strong> {item.weight} kg</p>}
                      {item.length && <p><strong>Taille:</strong> {item.length} cm</p>}
                    </>
                  }
                />
                <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                  <Space>
                    <Button
                      type="text"
                      icon={<LikeOutlined />}
                      onClick={() => handleLike(item.id)}
                    >
                      {getLikesCount(item.id)} J'aime
                    </Button>
                    <Button type="text" icon={<MessageOutlined />}>
                      {getComments(item.id).length} Commentaires
                    </Button>
                  </Space>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      value={commentInputs[item.id] || ''}
                      onChange={(e) => updateCommentInput(item.id, e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={2}
                    />
                    <Button type="primary" onClick={() => handleComment(item.id)}>
                      Envoyer
                    </Button>
                  </Space.Compact>
                  {getComments(item.id).length > 0 && (
                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Commentaires</Title>
                  )}
                  {getComments(item.id).map((comment) => (
                    <Card key={comment.id} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                        <Text strong>Utilisateur</Text>
                      </div>
                      <Text>{comment.content}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </Space>
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
            }}
          />
        )
      ),
    },
    {
      key: '2',
      label: 'Top Spots',
      children: (
        getTopSpots().length === 0 ? (
          <Empty
            description="Aucun spot populaire pour le moment"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={getTopSpots()}
            renderItem={(spot) => (
              <List.Item
                style={{ 
                  background: '#f9f9f9', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px' 
                }}
              >
                <List.Item.Meta
                  title={spot.name}
                  description={
                    <>
                      <p>{spot.description}</p>
                      <p><strong>Type de pêche:</strong> {spot.fishingType}</p>
                      <p><strong>Poissons:</strong> {
                        Array.isArray(spot.fishTypes) 
                          ? spot.fishTypes.map(type => FISH_TYPES_FR[type] || type).join(', ')
                          : ''
                      }</p>
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
        )
      ),
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: '8px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
        />
      </Card>
    </div>
  );
};

export default CommunityPage; 