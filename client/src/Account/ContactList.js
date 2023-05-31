import React, { useEffect, useState } from 'react';
import '../App.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { FaMailBulk, FaTrash, FaSearch } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function ContactList({ setSelectedUser, userLoggedInId }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userLoggedIn, setUserLoggedIn] = useState(userLoggedInId);

  useEffect(() => {
    console.log("useEffect triggered");
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      const response = await axios.get('http://localhost:5005/auth/users', {
        headers: {
          user_id: userLoggedInId
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userName) => {
    setSelectedUser(userName);
  };

  const handleDeleteUser = async (userId, userName) => {
    console.log(userId);
    console.log(userLoggedIn);
    const confirmed = window.confirm(`Are you sure you want to delete ${userName} from your contact list?`);
  
    if (confirmed) {
      try {
        if (userId === userLoggedIn) {
          console.log('Cannot delete the currently logged-in user.');
          alert('You are not allowed to delete yourself.');
          return;
        }
  
        await axios.delete(`http://localhost:5005/auth/deleteUser/${userId}`, {
          headers: {
            user_id: userLoggedIn
          }
        });
        fetchUserList();
      } catch (error) {
        console.log(error);
      }
    }
  };
  
  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className='box'>
      <Form.Text className='title'>Contact List</Form.Text>
      <Form.Group className='search1 mb-3 mt-4'>
        <InputGroup>
          <Form.Control
            placeholder='Enter name'
            aria-describedby='basic-addon2'
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <Button variant='outline-secondary' id='button-addon2' onClick={handleSearch}>
            <FaSearch />
          </Button>
        </InputGroup>
      </Form.Group>
      <Table hover style={{ padding: '20px' }}>
        <tbody>
          {(searchQuery.length > 0 ? filteredUsers : users).map((user) => (
            <tr key={user.user_id}>
              <td>{user.name}</td>
              <td>
                <FaMailBulk onClick={() => handleUserClick(user.name)} />
              </td>
              <td>
                <FaTrash onClick={() => handleDeleteUser(user.user_id, user.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button className='logout' onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default ContactList;