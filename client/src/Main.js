import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm'; 
import AccountForm from './Account/AccountForm';
import AddAccountForm from './AddAccountForm';

function Main() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/account" element={<AccountForm />} />
          <Route path="/register" element={<AddAccountForm />} />
        </Routes>
      </Router>
    </div>
  );
}

export default Main;

