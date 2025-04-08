import React from 'react';
import { Card, Button, Typography, Divider } from 'antd';
import { UserOutlined, LoginOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const WelcomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: '#f0f2f5'
    }}>
      <Card 
        style={{ 
          width: '90%', 
          maxWidth: '500px', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          textAlign: 'center'
        }}
      >
        <Title level={2} style={{ marginBottom: '12px', color: '#1890ff' }}>
          Bienvenue sur Hooked
        </Title>
        
        <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
          Votre application de pêche intelligente pour trouver les meilleurs spots et partager vos captures
        </Paragraph>
        
        <Divider style={{ marginBottom: '24px' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ height: '50px', fontSize: '16px' }}
          >
            Se connecter
          </Button>
          
          <Button 
            size="large"
            icon={<UserOutlined />}
            onClick={() => navigate('/login?tab=register')}
            style={{ height: '50px', fontSize: '16px' }}
          >
            Créer un compte
          </Button>
          
          <Divider style={{ margin: '12px 0' }}>OU</Divider>
          
          <Button 
            type="link" 
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/map')}
            style={{ fontSize: '16px' }}
          >
            Continuer en tant qu'invité
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomePage; 