const express = require('express');
const router  = express.Router();
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getSummary, getDaily, getMonthlyTrend } = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/summary', getSummary);
router.get('/daily',   getDaily);
router.get('/monthly', getMonthlyTrend);
router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').get(getTransaction).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
