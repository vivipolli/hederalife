import { Layout, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartOutlined, SettingOutlined } from '@ant-design/icons';
import { useWeb3Auth } from "@web3auth/modal-react-hooks";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, connect, logout } = useWeb3Auth();

  const handleLogin = async () => {
    await connect();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AntHeader style={{ 
      background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/logo.png" 
          alt="Hedera Life Logo" 
          style={{ 
            height: '32px', 
            marginRight: '12px' 
          }} 
        />
        <span style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          Hedera Life
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isConnected && (
          <>
            {location.pathname === '/' && (
              <Button 
                type="text" 
                icon={<HeartOutlined />} 
                style={{ color: 'white' }}
                onClick={() => navigate('/habits')}
              >
                My Habits
              </Button>
            )}
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              style={{ color: 'white' }}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
          </>
        )}
        {isConnected ? (
          <Button type="primary" onClick={handleLogout}>
            Sign Out
          </Button>
        ) : (
          <Button type="primary" onClick={handleLogin}>
            Sign In
          </Button>
        )}
      </div>
    </AntHeader>
  );
};

export default Header; 