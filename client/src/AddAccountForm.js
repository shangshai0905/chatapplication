import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';

function AddAccountForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAddAccount = async () => {
    try {
      const response = await axios.post('http://localhost:5005/auth/register', {
        user_name: name,
        user_email: email,
        user_password: password
      });
  
      // Handle the response data
      const { message } = response.data;
      console.log(message);
  
      if (message === 'User has been added successfully.') {
        console.log('Account added successfully');
        navigate('/');
      } else if (message === 'Email already exists! Please use another email.') {
        alert(`Email ${email} already exists! Please use another email.`);
      } else {
        alert('An error occurred while adding the account. Please try again.');
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };
      
  return (
    <div className='App'>
      <Form>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
          </Col>
        </Row>
        <Button onClick={handleAddAccount}>Add Account</Button>
      </Form>
    </div>
  );
}

export default AddAccountForm;
