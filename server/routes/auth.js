const express = require('express');
const router = express.Router();
const register_controller = require('../controllers/auth_account');

// Register route
router.post('/register', register_controller.addAccount);

// Login route
router.post('/login', register_controller.loginAccount);

// Logout route
router.post('/logout', register_controller.logoutAccount);

// User listing route
router.get('/users', register_controller.showUsers);

// Delete user route
router.delete('/deleteUser/:user_id', register_controller.deleteUser);

module.exports = router;
