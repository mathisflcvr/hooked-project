import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Tabs, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const LoginPage = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();
  const [formReset] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Page de login montée, fonctions auth disponibles:", { signIn, signUp, resetPassword });
    
    // Vérifier si un tab est spécifié dans l'URL
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['login', 'register', 'reset'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search, signIn, signUp, resetPassword]);

  const handleLogin = async (values) => {
    console.log("Tentative de connexion avec:", {...values, password: '******'});
    try {
      setLoading(true);
      const result = await signIn(values.email, values.password);
      console.log("Résultat de connexion:", result);
      message.success('Connexion réussie !');
      navigate('/map'); // Rediriger vers la page de carte
    } catch (error) {
      console.error("Erreur complète de connexion:", error);
      message.error(`Erreur lors de la connexion : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    console.log("Connexion avec le compte de démonstration");
    try {
      setLoading(true);
      const demoEmail = 'demo@hooked.app';
      const demoPassword = 'demo123456';
      const result = await signIn(demoEmail, demoPassword);
      console.log("Résultat de connexion démo:", result);
      message.success('Connexion démo réussie !');
      navigate('/map');
    } catch (error) {
      console.error("Erreur de connexion avec le compte démo:", error);
      message.error(`Erreur lors de la connexion démo : ${error.message || 'Erreur inconnue'}`);
      
      // Si la connexion échoue, tentative d'inscription avec le compte démo
      try {
        const demoEmail = 'demo@hooked.app';
        const demoPassword = 'demo123456';
        const demoUsername = 'Démo';
        
        await signUp(demoEmail, demoPassword, demoUsername);
        message.success('Compte démo créé et connecté avec succès !');
        const loginResult = await signIn(demoEmail, demoPassword);
        console.log("Connexion après création du compte démo:", loginResult);
        navigate('/map');
      } catch (signupError) {
        console.error("Erreur de création du compte démo:", signupError);
        message.error(`Impossible de créer un compte démo : ${signupError.message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (values) => {
    console.log("Tentative d'inscription avec:", {...values, password: '******'});
    try {
      setLoading(true);
      
      if (!values.username || !values.email || !values.password || !values.confirmPassword) {
        message.error('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }
      
      if (values.password !== values.confirmPassword) {
        message.error('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
      
      if (values.password.length < 6) {
        message.error('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }
      
      const result = await signUp(values.email, values.password, values.username);
      console.log("Résultat d'inscription:", result);
      message.success('Inscription réussie ! Vérifiez votre e-mail pour confirmer votre compte.');
      setActiveTab('login');
      formRegister.resetFields();
    } catch (error) {
      console.error("Erreur complète d'inscription:", error);
      message.error(`Erreur lors de l'inscription : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    console.log("Tentative de réinitialisation avec:", values);
    try {
      setLoading(true);
      await resetPassword(values.email);
      message.success('Instructions de réinitialisation envoyées à votre e-mail.');
      setActiveTab('login');
    } catch (error) {
      console.error("Erreur complète de réinitialisation:", error);
      message.error(`Erreur lors de la réinitialisation : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: '#f0f2f5',
      position: 'relative'
    }}>
      <Link to="/map" style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <Button type="text" icon={<ArrowLeftOutlined />}>Retour à l'application</Button>
      </Link>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', margin: 0 }}>Hooked</Title>
          <Text type="secondary">Votre application de pêche intelligente</Text>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          style={{ marginBottom: '24px' }}
        >
          <TabPane tab="Connexion" key="login">
            <Form
              form={formLogin}
              layout="vertical"
              name="login_form"
              onFinish={handleLogin}
              initialValues={{ email: '', password: '' }}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Mot de passe" 
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
                  Se connecter
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => setActiveTab('reset')}
                >
                  Mot de passe oublié ?
                </Button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Button 
                  type="default"
                  onClick={handleDemoLogin}
                  loading={loading}
                  size="middle"
                >
                  Se connecter avec le compte démo
                </Button>
              </div>
            </Form>
          </TabPane>
          <TabPane tab="Inscription" key="register">
            <Form
              form={formRegister}
              layout="vertical"
              name="register_form"
              onFinish={handleSignUp}
              initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Veuillez entrer un nom d\'utilisateur' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Nom d'utilisateur" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Veuillez entrer un mot de passe' },
                  { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Mot de passe" 
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
                  S'inscrire
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Réinitialiser" key="reset">
            <Form
              form={formReset}
              layout="vertical"
              name="reset_form"
              onFinish={handleResetPassword}
              initialValues={{ email: '' }}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
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
              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => setActiveTab('login')}
                >
                  Retour à la connexion
                </Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
        
        <Divider style={{ margin: '24px 0 16px' }}>
          <Text type="secondary">ou</Text>
        </Divider>
        
        <Button 
          type="link" 
          block
          onClick={() => navigate('/map')}
        >
          Continuer en tant qu'invité
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage; 