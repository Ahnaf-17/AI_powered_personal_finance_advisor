const express = require('express');
const router = express.Router();
const { getMarketContextForAI, getMarketPulse } = require('../controllers/marketController');

// GET /api/market/context – Returns market context string for AI enrichment
router.get('/context', async (req, res) => {
  try {
    const context = await getMarketContextForAI();
    res.json({ context: context || null });
  } catch (err) {
    console.error('market route error:', err.message);
    res.status(500).json({ message: 'Failed to fetch market context' });
  }
});

// GET /api/market/pulse – Full structured market data for frontend display
router.get('/pulse', (req, res) => {
  try {
    res.json(getMarketPulse());
  } catch (err) {
    console.error('market route error:', err.message);
    res.status(500).json({ message: 'Failed to fetch market pulse' });
  }
});

module.exports = router;
