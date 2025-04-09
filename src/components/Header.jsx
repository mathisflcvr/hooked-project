import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from 'antd';
import AuthButton from './AuthButton';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

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
      <div className="logo" style={{ height: '38px', margin: '16px 0', display: 'flex', alignItems: 'center' }}>
        <Link to="/map" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo height={38} />
          <span style={{ marginLeft: '10px', fontSize: '20px', fontWeight: 'bold', color: '#4285F4' }}>
            Hooked
          </span>
        </Link>
      </div>
      
      <div className="right-content">
        <AuthButton />
      </div>
    </AntHeader>
  );
};

export default Header; 