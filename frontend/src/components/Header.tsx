import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Header: AntHeader } = Layout;

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const profileMenu = (
        <Menu>
            {!isLoggedIn ? (
                <Menu.Item key="signin" icon={<UserOutlined />}>
                    Sign In
                </Menu.Item>
            ) : (
                <>
                    <Menu.Item key="settings" icon={<SettingOutlined />}>
                        Settings
                    </Menu.Item>
                    <Menu.Item key="logout" icon={<LogoutOutlined />}>
                        Logout
                    </Menu.Item>
                </>
            )}
        </Menu>
    );

    return (
        <AntHeader style={{ 
            background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src="/logo.png" 
                        alt="Hedera Life Logo" 
                        style={{ 
                            height: '32px', 
                            marginRight: '12px' 
                        }} 
                    />
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>Hedera Life</span>
                </div>
                <Dropdown overlay={profileMenu} placement="bottomRight">
                    <Avatar 
                        icon={<UserOutlined />} 
                        style={{ 
                            cursor: 'pointer',
                            background: '#fff',
                            color: '#2d84eb'
                        }}
                    />
                </Dropdown>
            </div>
        </AntHeader>
    );
}; 