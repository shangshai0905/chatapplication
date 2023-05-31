import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { AiOutlineSend } from 'react-icons/ai';
import axios from 'axios';

function ChatRoom({ selectedUser, selectedMessage }) {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState('');
  const contentRef = useRef(null);
  const [selectedMessageName, setSelectedMessageName] = useState('');
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setSelectedMessageName(selectedMessage);
  }, [selectedMessage]);

  useEffect(() => {
    if (location.state && location.state.loggedInUser) {
      console.log('Location state:', location.state);
      const user = location.state.loggedInUser;
      setLoggedInUser(user);
      console.log('Logged in user:', user);
    }
  }, [location.state]);

  useEffect(() => {
    const contentElement = contentRef.current;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = contentElement;
      setShowNotification(scrollTop > 0);

      const isScrolledToBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) < 1;

      if (isScrolledToBottom) {
        setScrollToBottom(true);
      }
    };

    contentElement.addEventListener('scroll', handleScroll);

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
    };
  }, [contentRef]);

  const handleNotificationClick = () => {
    const contentElement = contentRef.current;
    contentElement.scrollTop = contentElement.scrollHeight;
    setShowNotification(false);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let url = 'http://localhost:5005/messages';
        if (selectedUser) {
          url += `?sender=${loggedInUser}&recipient=${selectedUser}`;
        } else if (selectedMessageName) {
          url += `?sender=${loggedInUser}&recipient=${selectedMessageName}`;
        }

        const response = await axios.get(url);
        console.log('Response:', response.data); // Add this line

        // Check if the user has scrolled to the bottom before updating messages
        const contentElement = contentRef.current;
        const { scrollTop, clientHeight, scrollHeight } = contentElement;
        const isScrolledToBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) < 1;

        setMessages(response.data.messages);

        if (isScrolledToBottom) {
          contentElement.scrollTop = contentElement.scrollHeight;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (loggedInUser && (selectedUser || selectedMessageName)) {
      fetchMessages();

      // Fetch messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [loggedInUser, selectedUser, selectedMessageName]);

  const getTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);

    if (now.getDate() === messageTime.getDate()) {
      // Same day, display only the time
      const hours = messageTime.getHours();
      const minutes = messageTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } else {
      // Different day, display full timestamp
      const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
      return messageTime.toLocaleString('en-US', options);
    }
  };

  const handleMessageSend = async () => {
    if (message.trim() !== '') {
      try {
        const newMessage = {
          sender: loggedInUser || 'Unknown User',
          recipient: selectedUser || selectedMessageName,
          content: message,
        };

        console.log(newMessage);

        // Send the new message to the server
        const response = await axios.post('http://localhost:5005/messages', newMessage);

        if (response.status === 200) {
          console.log(response.data); // Log the response from the server

          setMessage('');
        } else {
          // An error occurred while storing the message
          console.error('Error:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (messageId) {
      setDeleteMessageId(messageId); // Set the message ID to delete in state
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5005/messages/${deleteMessageId}`);
      if (response.status === 200) {
        console.log('Message deleted');
        setDeleteMessageId(null); // Reset deleteMessageId after successful deletion
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteMessageId(null); // Reset deleteMessageId if deletion is cancelled
  };

  const handleDeleteButtonClick = (messageId) => {
    handleDeleteMessage(messageId);
  };

  return (
    <div className="box2">
      <Card>
        <Card.Body>{selectedMessage || selectedUser}</Card.Body>
      </Card>

      <div className="content" ref={contentRef} style={{ maxHeight: '850px', overflowY: 'auto' }}>
        {messages && Array.isArray(messages) ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === loggedInUser ? 'right' : 'left'}`}
              style={{ justifyContent: msg.sender === loggedInUser ? 'flex-end' : 'flex-start' }}
            >
              <span className="message-time">{getTime(msg.time)}</span>

              {msg.sender === loggedInUser ? (
                <OverlayTrigger
                  trigger="click"
                  placement="top"
                  overlay={
                    <Popover id={`popover-${msg.id}`}>
                      <Popover.Body>
                        <Button variant="secondary" onClick={() => handleDeleteButtonClick(msg.id)}>
                          Delete
                        </Button>
                      </Popover.Body>
                    </Popover>
                  }
                  rootClose
                >
                  <span
                    className="message-content"
                    style={{
                      backgroundColor: msg.sender === loggedInUser ? 'blue' : 'pink',
                      color: msg.sender === loggedInUser ? 'white' : 'black',
                    }}
                  >
                    {msg.text}
                  </span>
                </OverlayTrigger>
              ) : (
                <span
                  className="message-content"
                  style={{
                    backgroundColor: msg.sender === loggedInUser ? 'blue' : 'pink',
                    color: msg.sender === loggedInUser ? 'white' : 'black',
                  }}
                >
                  {msg.text}
                </span>
              )}
            </div>
          ))
        ) : (
          <div>Loading....</div>
        )}
      </div>
      {showNotification && (
        <div className="notification">
          <Button variant="primary" onClick={handleNotificationClick}>
            New Message
          </Button>
        </div>
      )}
      <div className="typemess">
        <Form.Group as={Row} controlId="formPlaintextEmail">
          <Col sm="10" className="input-col">
            <Form.Control
              type="text"
              placeholder="Type a message..."
              size="lg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleMessageSend();
                }
              }}
            />
          </Col>
          <Form.Label column className="send" onClick={handleMessageSend}>
            <AiOutlineSend />
          </Form.Label>
        </Form.Group>
      </div>

      {deleteMessageId && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this message?</p>
            <div className="delete-modal-buttons">
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
