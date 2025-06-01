import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Layout, Button, Typography, Space } from 'antd';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Estimated from './Estimated.js';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

// Renamed to avoid conflict with Ant Design's Header
const HeaderComponent = ({ username, onLogout }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
     await axios.post(`${process.env.REACT_APP_API_URL}/logout/`, {}, {
  headers: {
    Authorization: `Token ${localStorage.getItem('token')}`,
  },
});

    } catch (error) {
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    onLogout();
    navigate('/login');
  };

  return (
    <div style={{
      background: 'white',
      padding: '12px 4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solidrgb(255, 255, 255)',
    }}>
      <Space>
        <Button icon={<HomeOutlined />} onClick={handleHomeClick}>
          Home
        </Button>
      </Space>
      <Title level={3} style={{ color: '#090ad', margin: 2 }}>
        Budget Tracker
      </Title>
      <Space>
        <Text strong>{username}</Text>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Space>
    </div>
  );
};

const AuthenticatePages = ({ element, username, onLogout }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0 }}>
        <HeaderComponent username={username} onLogout={onLogout} />
      </Header>
      <Content style={{ padding: '24px', background: '#fff' }}>
        {element}
      </Content>
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogin = (newUsername) => {
    localStorage.setItem('username', newUsername);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    setUsername('');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={<AuthenticatePages element={<Dashboard />} username={username} onLogout={handleLogout} />}
        />
        <Route
          path="/transactions"
          element={<AuthenticatePages element={<Transactions />} username={username} onLogout={handleLogout} />}
        />
        <Route
          path="/estimated"
          element={<AuthenticatePages element={<Estimated />} username={username} onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
