import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useState } from 'react';
import Layout from './components/Layout';
import MapPage from './pages/MapPage';
import CatchesPage from './pages/CatchesPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [theme, setTheme] = useState('light');

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
        <Layout theme={theme} toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/catches" element={<CatchesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
