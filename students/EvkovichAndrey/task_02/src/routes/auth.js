const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authValidators } = require('../utils/validators');
const authController = require('../controllers/authController');

// Публичные маршруты
router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);

// Защищенные маршруты
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;