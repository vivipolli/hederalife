import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3AuthProvider, useWeb3Auth } from "@web3auth/modal-react-hooks";
import { Layout, Typography, ConfigProvider } from 'antd';
import { HealthConcernForm } from './components/HealthConcernForm';
import Header from './components/Header';
import HealthHabitsPage from './pages/HealthHabitsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';
import web3AuthContextConfig from "./config/web3auth.config";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function AppContent() {
  const { isConnected } = useWeb3Auth();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2d84eb',
          colorInfo: '#8259ef',
        },
      }}
    >
      <Router>
        <Header />
        <Content style={{ 
          background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
          padding: '32px 0',
          height: '100vh'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ 
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Health Assistant
              </Title>
              <Paragraph type="secondary">Get personalized health insights from our AI experts</Paragraph>
            </div>
            <Routes>
              <Route path="/" element={<HealthConcernForm />} />
              <Route path="/habits" element={isConnected ? <HealthHabitsPage /> : <HealthConcernForm />} />
              <Route path="/settings" element={isConnected ? <SettingsPage /> : <HealthConcernForm />} />
            </Routes>
          </div>
        </Content>
      </Router>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <AppContent />
    </Web3AuthProvider>
  );
}

export default App;
