import { Layout, Typography, ConfigProvider } from 'antd';
import { HealthConcernForm } from './components/HealthConcernForm';
import { Header } from './components/Header';
import './App.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2d84eb',
          colorInfo: '#8259ef',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ 
          background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
          padding: '32px 0' 
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
              <Paragraph type="secondary">Get personalized habits suggestions from our AI experts</Paragraph>
            </div>
            <HealthConcernForm />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
