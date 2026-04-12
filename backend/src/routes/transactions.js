const express = require('express');
const router  = express.Router();
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getSummary } = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/summary', getSummary);
router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').get(getTransaction).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
