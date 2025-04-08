import React from 'react';
import { Button, Dropdown, Space, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Menu déroulant pour les utilisateurs connectés
  const items = [
    {
      key: 'profile',
      label: 'Profil',
      icon: <UserOutlined />,
      onClick: handleProfileClick,
    },
    {
      key: 'logout',
      label: 'Déconnexion',
      icon: <LogoutOutlined />,
      onClick: handleLogoutClick,
    },
  ];

  // Si l'utilisateur est connecté, afficher un menu déroulant
  if (user) {
    console.log("Utilisateur connecté:", user);
    const displayName = user.user_metadata?.username || 'Utilisateur';
    const photoURL = user.user_metadata?.avatar_url;

    return (
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space className="auth-button-container" style={{ cursor: 'pointer', padding: '4px 8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
          <span className="user-name" style={{ marginRight: '8px' }}>{displayName}</span>
          {photoURL ? (
            <Avatar src={photoURL} size="small" />
          ) : (
            <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
          )}
        </Space>
      </Dropdown>
    );
  }

  console.log("Aucun utilisateur connecté");
  // Si l'utilisateur n'est pas connecté, afficher un bouton de connexion
  return (
    <Button 
      type="primary" 
      icon={<LoginOutlined />} 
      onClick={handleLoginClick}
      loading={loading}
    >
      Connexion
    </Button>
  );
};

export default AuthButton; 