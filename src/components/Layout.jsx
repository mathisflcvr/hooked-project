import { Layout as AntLayout, Menu, Button, theme, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import {
  HomeOutlined,
  CameraOutlined,
  TeamOutlined,
  UserOutlined,
  BulbOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import Logo from './Logo';

const { Content, Sider } = AntLayout;
const { Title } = Typography;

const Layout = ({ children, theme: currentTheme, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, colorBgLayout },
  } = theme.useToken();

  useEffect(() => {
    // Appliquer la classe dark au body quand le thème est sombre
    if (currentTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [currentTheme]);

  const menuItems = [
    {
      key: '/map',
      icon: <HomeOutlined />,
      label: <Link to="/map">Carte</Link>,
    },
    {
      key: '/spots',
      icon: <EnvironmentOutlined />,
      label: <Link to="/spots">Spots</Link>,
    },
    {
      key: '/catches',
      icon: <CameraOutlined />,
      label: <Link to="/catches">Captures</Link>,
    },
    {
      key: '/community',
      icon: <TeamOutlined />,
      label: <Link to="/community">Communauté</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profil</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme={currentTheme === 'dark' ? 'dark' : 'light'}
        width={220}
        style={{ 
          overflow: 'auto', 
          height: '100vh', 
          position: 'fixed', 
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        <div className="logo" style={{ 
          height: 64, 
          margin: '16px auto', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s'
        }}>
          {collapsed ? (
            <img 
              src="/images/hook-mini.svg" 
              alt="Hooked Mini Logo" 
              height="36"
              style={{ 
                display: 'inline-block',
                marginTop: '6px',
                marginLeft: '2px',
                transition: 'all 0.3s',
                filter: currentTheme === 'dark' ? 'brightness(1.5)' : 'none'
              }}
            />
          ) : (
            <div style={{ transition: 'all 0.3s', padding: '0 10px' }}>
              <Logo 
                height="40" 
                width="auto" 
                style={{
                  filter: currentTheme === 'dark' ? 'brightness(1.2)' : 'none'
                }}
              />
            </div>
          )}
        </div>
        <Menu
          theme={currentTheme === 'dark' ? 'dark' : 'light'}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header />
        <div style={{ 
          padding: '15px 24px', 
          background: colorBgContainer,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {location.pathname === '/map' && 'Carte des Spots'}
              {location.pathname === '/spots' && 'Mes Spots'}
              {location.pathname === '/catches' && 'Mes Captures'}
              {location.pathname === '/community' && 'Communauté'}
              {location.pathname === '/profile' && 'Profil'}
            </Title>
          </div>
          <Button
            type="text"
            icon={<BulbOutlined />}
            onClick={toggleTheme}
            style={{ fontSize: '16px' }}
          />
        </div>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: colorBgContainer,
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 