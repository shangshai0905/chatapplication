import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5005/auth/login', {
        user_email: email,
        user_password: password
      });
  
      // Handle the response data
      const { message, user_name, user_id } = response.data;
      console.log(message);
      console.log(user_name);
  
      if (message === 'Success') {
        console.log('Navigating to /account with loggedInUser:', user_name);
        navigate('/account', { state: { loggedInUser: user_name, loggedInUserId: user_id } }); // Update the state key to loggedInUser
      } else if (message === 'Should not be empty!') {
        alert(`Please enter your email and password!`);
      } else if (message === 'Invalid password') {
        alert(`Please enter the correct password!`);
      } else if (message === 'Invalid email') {
        alert(`Please enter the correct email!`);
      } else {
        alert(`Please enter the correct info!`);
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };
      
  return (
    <div className='App'>

      <Form className='border p-5'>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)}/>
            </Form.Group>
            </Col>
            <Col>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            </Form.Group>
          </Col>
        </Row>
          <Button onClick={handleLogin} className='mb-3'>Login</Button>
          <br/>
          <Form.Text>
            Don't have an account? <Link to="/register">Register</Link> here.
          </Form.Text>
      </Form>
    </div>

    
  );
}

export default LoginForm;
