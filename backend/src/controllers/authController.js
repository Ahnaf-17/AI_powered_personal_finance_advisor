const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please provide name, email and password.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: 'Please provide a valid email address.' });

  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: 'An account with that email already exists.' });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    monthlyIncome: user.monthlyIncome,
    savingsGoal: user.savingsGoal,
    currency: user.currency,
    token: generateToken(user._id),
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string')
    return res.status(400).json({ message: 'Please provide email and password.' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password.' });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    monthlyIncome: user.monthlyIncome,
    savingsGoal: user.savingsGoal,
    currency: user.currency,
    token: generateToken(user._id),
  });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
