import { Layout as AntLayout, Menu, Button, theme, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CameraOutlined,
  TeamOutlined,
  UserOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;
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
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Carte des Spots</Link>,
    },
    {
      key: '/catches',
      icon: <CameraOutlined />,
      label: <Link to="/catches">Mes Captures</Link>,
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
          justifyContent: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: currentTheme === 'dark' ? 'white' : 'inherit' }}>
            {!collapsed && 'Hooked'}
          </Title>
        </div>
        <Menu
          theme={currentTheme === 'dark' ? 'dark' : 'light'}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {location.pathname === '/' && 'Carte des Spots'}
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
        </Header>
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