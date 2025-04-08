import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import AuthButton from './AuthButton';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("Header rendu avec état utilisateur:", user);
  }, [user]);

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div className="logo" style={{ height: '32px', margin: '16px 0' }}>
        <Link to="/map">
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
            Hooked
          </h1>
        </Link>
      </div>
      
      <div className="nav-links" style={{ flex: 1, textAlign: 'center' }}>
        <Menu mode="horizontal" selectedKeys={[window.location.pathname]} style={{ border: 'none', justifyContent: 'center' }}>
          <Menu.Item key="/map">
            <Link to="/map">Carte</Link>
          </Menu.Item>
        </Menu>
      </div>
      
      <div className="right-content">
        <AuthButton />
      </div>
    </AntHeader>
  );
};

export default Header; 