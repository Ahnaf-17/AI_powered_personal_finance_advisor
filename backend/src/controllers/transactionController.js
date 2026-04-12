const Transaction = require('../models/Transaction');

// GET /api/transactions
const getTransactions = async (req, res) => {
  const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
  const filter = { user: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// GET /api/transactions/:id
const getTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
  res.json(tx);
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || !amount || !category)
    return res.status(400).json({ message: 'type, amount and category are required.' });

  const validTypes = ['income', 'expense'];
  if (!validTypes.includes(type))
    return res.status(400).json({ message: `type must be one of: ${validTypes.join(', ')}.` });

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0)
    return res.status(400).json({ message: 'amount must be a positive number.' });

  const tx = await Transaction.create({
    user: req.user._id, type, amount: parsedAmount, category,
    description: description || '',
    date: date ? new Date(date) : new Date(),
  });
  res.status(201).json(tx);
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!tx) return res.status(404).json({ message: 'Transaction not found.' });

  const { type, amount, category, description, date } = req.body;
  const validTypes = ['income', 'expense'];
  if (type !== undefined && !validTypes.includes(type))
    return res.status(400).json({ message: `type must be one of: ${validTypes.join(', ')}.` });

  if (amount !== undefined) {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ message: 'amount must be a positive number.' });
    tx.amount = parsedAmount;
  }
  if (type)        tx.type        = type;
  if (category)    tx.category    = category;
  if (description !== undefined) tx.description = description;
  if (date)        tx.date        = new Date(date);

  await tx.save();
  res.json(tx);
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
  res.json({ message: 'Transaction deleted.' });
};

// GET /api/transactions/summary  — totals by category
const getSummary = async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const summary = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: since } } },
    { $group: {
      _id: { type: '$type', category: '$category' },
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
    { $sort: { total: -1 } },
  ]);

  const income  = summary.filter(s => s._id.type === 'income').reduce((a, c) => a + c.total, 0);
  const expense = summary.filter(s => s._id.type === 'expense').reduce((a, c) => a + c.total, 0);

  res.json({ income, expense, net: income - expense, breakdown: summary });
};

// GET /api/transactions/daily?days=7  — daily expense totals for bar chart
const getDaily = async (req, res) => {
  const { days = 7 } = req.query;
  const n = Math.min(Number(days), 90);
  const since = new Date();
  since.setDate(since.getDate() - (n - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await Transaction.aggregate([
    { $match: { user: req.user._id, type: 'expense', date: { $gte: since } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      total: { $sum: '$amount' },
    }},
  ]);

  // Build a full array with 0-filled gaps
  const map = Object.fromEntries(rows.map(r => [r._id, r.total]));
  const result = Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-AU', { weekday: 'short' });
    return { date: key, label, total: map[key] || 0 };
  });

  res.json(result);
};

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getSummary, getDaily };
