import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MapPage from './pages/MapPage';
import CatchesPage from './pages/CatchesPage';
import SpotsPage from './pages/SpotsPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { initializeApp } from './utils/initializeApp';
import { storageService } from './services/storageService';

function App() {
  const [theme, setTheme] = useState('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser l'application au démarrage
  useEffect(() => {
    console.log('App: démarrage de l\'initialisation');
    
    // Déblocage initial du localStorage (forcer la réinitialisation)
    const forceReset = true; // Forcer la réinitialisation pour résoudre le problème
    if (forceReset) {
      console.log('App: forçage de la réinitialisation du localStorage');
      storageService.resetStorage();
    }
    
    // S'assurer que le localStorage est accessible
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('App: localStorage est accessible');
      
      // Vérifier l'état du localStorage
      storageService.checkStorage();
    } catch (error) {
      console.error('App: localStorage n\'est pas accessible', error);
    }
    
    // Initialiser l'application
    const initialized = initializeApp();
    console.log(`App: initialisation ${initialized ? 'réussie' : 'non nécessaire'}`);
    
    // Vérifier le nombre de spots après initialisation
    const spots = storageService.getSpots();
    console.log(`App: ${spots.length} spots après initialisation`);
    if (spots.length > 0) {
      console.log('App: premier spot:', spots[0].name);
    } else {
      console.log('App: aucun spot trouvé après initialisation, tentative de réinitialisation forcée');
      // Forcer une réinitialisation si aucun spot n'est trouvé
      storageService.resetStorage();
      initializeApp();
      const spotsAfterRetry = storageService.getSpots();
      console.log(`App: ${spotsAfterRetry.length} spots après réinitialisation forcée`);
    }
    
    setIsInitialized(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
        components: {
          Layout: {
            colorBgHeader: theme === 'dark' ? '#141414' : '#fff',
            colorBgBody: theme === 'dark' ? '#000' : '#f0f2f5',
          },
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <MapPage />
            </Layout>
          } />
          <Route path="/spots" element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <SpotsPage />
            </Layout>
          } />
          <Route path="/catches" element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <CatchesPage />
            </Layout>
          } />
          <Route path="/community" element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <CommunityPage />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <ProfilePage />
            </Layout>
          } />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
