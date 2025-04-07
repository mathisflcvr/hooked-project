import { useState, useEffect } from 'react';
import { Card, List, Statistic, Row, Col, Typography, Avatar, Empty } from 'antd';
import { UserOutlined, TrophyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { storageService } from '../services/storageService';
import { FISH_TYPES } from '../models/dataModels';

const { Title, Text } = Typography;

// Traduction des types de poissons
const FISH_TYPES_FR = {
  [FISH_TYPES.PIKE]: 'Brochet',
  [FISH_TYPES.ZANDER]: 'Sandre',
  [FISH_TYPES.TROUT]: 'Truite',
  [FISH_TYPES.BASS]: 'Bar',
  [FISH_TYPES.CARP]: 'Carpe',
  [FISH_TYPES.CATFISH]: 'Silure'
};

const ProfilePage = () => {
  const [userCatches, setUserCatches] = useState([]);
  const [stats, setStats] = useState({
    totalCatches: 0,
    uniqueSpecies: 0,
    topSpots: [],
  });

  useEffect(() => {
    const catches = storageService.getCatches();
    const userCatches = catches.filter(catchItem => catchItem.createdBy === 'currentUser');
    setUserCatches(userCatches);

    // Calcul des statistiques
    const uniqueSpecies = new Set(userCatches.map(catchItem => catchItem.fishType)).size;
    
    const spotStats = userCatches.reduce((acc, catchItem) => {
      acc[catchItem.spotId] = (acc[catchItem.spotId] || 0) + 1;
      return acc;
    }, {});

    const topSpots = Object.entries(spotStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([spotId]) => {
        const spot = storageService.getSpots().find(s => s.id === spotId);
        return spot;
      })
      .filter(Boolean); // Filtrer les spots non trouvés (null/undefined)

    setStats({
      totalCatches: userCatches.length,
      uniqueSpecies,
      topSpots,
    });
  }, []);

  const getSpotName = (spotId) => {
    const spot = storageService.getSpots().find(s => s.id === spotId);
    return spot ? spot.name : 'Spot inconnu';
  };

  return (
    <div>
      <Card style={{ borderRadius: '8px', marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar size={64} icon={<UserOutlined />} />
          </Col>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Mon Profil</Title>
            <Text type="secondary">Pêcheur passionné</Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '8px', height: '100%' }}>
            <Statistic
              title="Total des captures"
              value={stats.totalCatches}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '8px', height: '100%' }}>
            <Statistic
              title="Espèces différentes"
              value={stats.uniqueSpecies}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '8px', height: '100%' }}>
            <Statistic
              title="Spots favoris"
              value={stats.topSpots.length}
              valueStyle={{ color: '#faad14' }}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
            <span>Mes Spots Favoris</span>
          </div>
        } 
        style={{ borderRadius: '8px', marginBottom: 16 }}
      >
        {stats.topSpots.length === 0 ? (
          <Empty
            description="Vous n'avez pas encore de spots favoris"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={stats.topSpots}
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
                  avatar={<Avatar icon={<EnvironmentOutlined />} style={{ backgroundColor: '#1890ff' }} />}
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
          />
        )}
      </Card>

      <Card 
        title="Mes Dernières Captures" 
        style={{ borderRadius: '8px' }}
      >
        {userCatches.length === 0 ? (
          <Empty
            description="Vous n'avez pas encore enregistré de captures"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={userCatches.slice(0, 5)}
            renderItem={(item) => (
              <List.Item
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
                  title={`${FISH_TYPES_FR[item.fishType] || item.fishType} - ${new Date(item.createdAt).toLocaleDateString()}`}
                  description={
                    <>
                      <p><strong>Spot:</strong> {getSpotName(item.spotId)}</p>
                      <p><strong>Appât:</strong> {item.bait}</p>
                      <p><strong>Technique:</strong> {item.technique}</p>
                      <p><strong>Météo:</strong> {item.weather}</p>
                      {item.weight && <p><strong>Poids:</strong> {item.weight} kg</p>}
                      {item.length && <p><strong>Taille:</strong> {item.length} cm</p>}
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
    </div>
  );
};

export default ProfilePage; 