const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rate limiter for login – 10 attempts per 15 minutes per IP (TC-SEC-02)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login',    loginLimiter, login);
router.get('/me',        verifyToken, getMe);

module.exports = router;
