const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { getBudgetAdvice, getSavingsSuggestions, chatWithAdvisor } = require('../controllers/aiController');

const router = express.Router();

// Rate limiter for AI endpoints – 10 requests per hour per user
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many AI requests. Please try again in an hour.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// Chatbot rate limiter – 30 messages per hour
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Too many chat messages. Please try again in an hour.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// All AI routes require authentication
router.use(verifyToken);

// POST /api/ai/budget-advice
router.post('/budget-advice', aiLimiter, getBudgetAdvice);

// POST /api/ai/savings-suggestions
router.post('/savings-suggestions', aiLimiter, getSavingsSuggestions);

// POST /api/ai/chat
router.post(
  '/chat',
  chatLimiter,
  [
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  ],
  chatWithAdvisor
);

module.exports = router;
