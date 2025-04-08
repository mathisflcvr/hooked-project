import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const MapPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ borderRadius: '12px' }}>
        <Title level={2}>Carte des spots de pêche</Title>
        <Paragraph>
          La carte des spots de pêche sera affichée ici. Cette fonctionnalité est en cours de développement.
        </Paragraph>
      </Card>
    </div>
  );
};

export default MapPage; 