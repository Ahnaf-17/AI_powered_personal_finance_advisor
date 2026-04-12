const Goal = require('../models/Goal');

// GET /api/goals
const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  const goalsWithProgress = goals.map(g => ({
    ...g.toObject(),
    progressPercent: g.targetAmount > 0
      ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
      : 0,
  }));
  res.json(goalsWithProgress);
};

// GET /api/goals/:id
const getGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: 'Goal not found.' });
  const progressPercent = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;
  res.json({ ...goal.toObject(), progressPercent });
};

// POST /api/goals
const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  if (!name || !targetAmount)
    return res.status(400).json({ message: 'name and targetAmount are required.' });

  if (typeof name === 'string' && name.trim().length < 2)
    return res.status(400).json({ message: 'name must be at least 2 characters.' });

  const parsedTarget = Number(targetAmount);
  if (isNaN(parsedTarget) || parsedTarget <= 0)
    return res.status(400).json({ message: 'targetAmount must be a positive number.' });

  if (targetDate && new Date(targetDate) <= new Date())
    return res.status(400).json({ message: 'targetDate must be a future date.' });

  const goal = await Goal.create({
    user: req.user._id, name: name.trim(), targetAmount: parsedTarget,
    currentAmount: currentAmount || 0,
    targetDate: targetDate ? new Date(targetDate) : undefined,
  });
  res.status(201).json(goal);
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: 'Goal not found.' });

  const { name, targetAmount, currentAmount, targetDate, isCompleted } = req.body;
  if (name          !== undefined) goal.name          = name;
  if (targetAmount  !== undefined) goal.targetAmount  = targetAmount;
  if (currentAmount !== undefined) {
    goal.currentAmount = currentAmount;
    if (currentAmount >= goal.targetAmount) goal.isCompleted = true;
  }
  if (targetDate    !== undefined) goal.targetDate    = new Date(targetDate);
  if (isCompleted   !== undefined) goal.isCompleted   = isCompleted;

  await goal.save();
  res.json(goal);
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: 'Goal not found.' });
  res.json({ message: 'Goal deleted.' });
};

module.exports = { getGoals, getGoal, createGoal, updateGoal, deleteGoal };
