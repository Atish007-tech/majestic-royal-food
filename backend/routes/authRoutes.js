const express = require('express');
const router = express.Router();
const { registerResult, loginResult } = require('../controllers/authController');

router.post('/register', registerResult);
router.post('/login', loginResult);

module.exports = router;
