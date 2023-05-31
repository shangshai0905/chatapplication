import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

function MessageHistory({ setSelectedMessage }) {
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const loggedInUser = location.state.loggedInUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5005/messages', {
          params: {
            loggedInUser: loggedInUser,
          },
        });

        // Handle the response data
        const { messages } = response.data;
        console.log(messages);
        setMessages(messages);
      } catch (error) {
        // Handle error
        console.error(error);
      }
    };

    fetchMessages();
  }, [loggedInUser]);

  useEffect(() => {
    const pollMessages = setInterval(() => {
      fetchMessages();
    }, 5000); // Poll every 5 seconds (adjust as needed)

    return () => {
      clearInterval(pollMessages);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5005/messages', {
        params: {
          loggedInUser: loggedInUser,
        },
      });

      // Handle the response data
      const { messages } = response.data;
      console.log(messages);
      setMessages(messages);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  const handleClickMessage = (message) => {
    setSelectedMessage(message.name);
    console.log(`Clicked message: ${message.name}`);
  };

  const handleSearch = () => {
    const filtered = messages.filter((message) =>
      message.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMessages(filtered);
  };
  

    const handleSearchInput = (e) => {
      setSearchQuery(e.target.value);
      const filtered = messages.filter((message) =>
        message.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredMessages(filtered);
    };
  
  return (
    <div className='box1'>
      <Form.Text className='chats'>
        <span className='chat'> Chats </span>
      </Form.Text>

      <InputGroup className='mb-3 search'>
      <Form.Control
            placeholder="Enter name"
            aria-describedby="basic-addon2"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <Button variant="outline-secondary" id="button-addon2" onClick={handleSearch}>
            <FaSearch />
          </Button>
      </InputGroup>

      <Table hover style={{ padding: '20px' }}>
        <tbody>
          {(filteredMessages.length > 0 ? filteredMessages : messages).map((message) => (
            <tr key={message.id} onClick={() => handleClickMessage(message)}>
              <td className='message-roww'>
                <div className='message-details'>
                  <div className='name'>{message.name}</div>
                  <div className='last-message'>{message.lastMessage}</div>
                  <div className='time'>
                    {new Date(message.time).toLocaleString()}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default MessageHistory;
