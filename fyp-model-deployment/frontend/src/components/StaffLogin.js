import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import './StaffLogin.css';
import { useAuth } from '../context/AuthContext'; // Import the context

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context

  const handleLogin = (e) => {
    e.preventDefault();

    // Basic username and password check
    if (username === 'nurse' && password === 'nurse') {
      // Use context to set authentication state and user role
      login('nurse');

      // Navigate to the appropriate page
      navigate('/admission form'); 
    } else if (username === 'admin' && password === 'admin') {
      // Use context to set authentication state and user role
      login('admin');

      // Navigate to the appropriate page
      navigate('/admin dashboard'); 
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Container className="login-container">
      <Form onSubmit={handleLogin} className="login-form">
        <h2 className="text-center mt-0">Staff Login</h2>
        <Form.Group controlId="formUsername" className="custom-form-group">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="custom-form-group">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="primary" type="submit" className="mt-3">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default StaffLogin;
