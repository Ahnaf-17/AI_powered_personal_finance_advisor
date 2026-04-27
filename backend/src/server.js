// Disable TLS certificate verification for networks with SSL inspection (dev only)
// Must be set before any https/openai calls are made
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const goalRoutes        = require('./routes/goals');
const userRoutes        = require('./routes/users');
const aiRoutes          = require('./routes/ai');
const marketRoutes      = require('./routes/market');

const app = express();

// Connect to MongoDB — skipped in test mode (tests manage their own connection)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl/Postman) or any localhost port
    if (!origin || origin.startsWith('http://localhost:') || origin === process.env.CLIENT_URL) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals',        goalRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/market',       marketRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Only bind to a port when this file is run directly (not imported by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
