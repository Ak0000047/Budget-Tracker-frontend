import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';

const { Title } = Typography;

function LoginPage({ onLogin }) {
  const [invalid, setInvalid] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitData = async (values) => {
    const { username, password } = values;
    setInvalid('');
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login/`, {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username);
        onLogin(username);
        navigate('/dashboard');
      }
    } catch (err) {
      setInvalid('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{ maxWidth: 400, margin: 'auto', marginTop: 120, padding: 20 }}
      bordered={false}
    >
      <Title level={2} style={{ textAlign: 'center' }}>
        Login
      </Title>

      {invalid && (
        <Alert
          type="error"
          message={invalid}
          style={{ marginBottom: 24 }}
          showIcon
          closable
          onClose={() => setInvalid('')}
        />
      )}

      <Form
        name="login-form"
        layout="vertical"
        onFinish={submitData}
        onFieldsChange={() => invalid && setInvalid('')}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter your username' }]}
        >
          <Input placeholder="Username" autoComplete="username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password placeholder="Enter Password" autoComplete="current-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default LoginPage;
