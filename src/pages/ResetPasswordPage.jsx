import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le hash de l'URL
    const hashParam = window.location.hash.substring(1);
    if (hashParam) {
      try {
        const params = new URLSearchParams(hashParam);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        
        if (accessToken) {
          setHash(hashParam);
          
          // Définir la session
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(expiresIn)
          });
        }
      } catch (error) {
        console.error('Erreur lors du traitement du hash:', error);
      }
    }
  }, []);

  const handleResetPassword = async (values) => {
    try {
      setLoading(true);

      if (values.password !== values.confirmPassword) {
        message.error('Les mots de passe ne correspondent pas');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) throw error;

      message.success('Mot de passe mis à jour avec succès !');
      
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      message.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!hash) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 150px)',
        padding: '20px' 
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: '450px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Alert
            message="Lien invalide"
            description="Le lien de réinitialisation du mot de passe est invalide ou a expiré. Veuillez faire une nouvelle demande de réinitialisation."
            type="error"
            showIcon
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button type="primary" onClick={() => navigate('/login')}>
              Retour à la connexion
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 150px)',
      padding: '20px' 
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Réinitialiser votre mot de passe
        </Title>
        
        <Text style={{ display: 'block', marginBottom: '24px' }}>
          Veuillez entrer votre nouveau mot de passe ci-dessous.
        </Text>
        
        <Form
          form={form}
          layout="vertical"
          name="reset_password_form"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Veuillez entrer un nouveau mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nouveau mot de passe" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer votre mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirmer le mot de passe" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={loading}
            >
              Réinitialiser le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage; 