import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ContactList from './ContactList';
import MessageHistory from './MessageHistory';
import ChatRoom from './ChatRoom';
import '../App.css';

function AccountForm() {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMessageName, setSelectedMessage] = useState('');
  const location = useLocation();

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedMessage('');
  };

  const handleSelectMessage = (message) => {
    setSelectedUser('');
    setSelectedMessage(message);
  };

  return (
    <div className="mainbox">    
      <div className="contactlist-panel">
      <ContactList setSelectedUser={handleSelectUser} userLoggedInId={location.state?.loggedInUser?.user_id} />
      </div>
      <div className="messhistory-panel">
        <MessageHistory setSelectedMessage={handleSelectMessage} />
      </div>
      <div className="chatroom-panel">
        {selectedUser && <ChatRoom selectedUser={selectedUser} />}
        {selectedMessageName && <ChatRoom selectedMessage={selectedMessageName} />}
      </div>
    </div>
  );
}

export default AccountForm;
