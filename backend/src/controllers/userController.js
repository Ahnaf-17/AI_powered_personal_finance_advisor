const User = require('../models/User');

// GET /api/users/profile
const getProfile = async (req, res) => {
  res.json(req.user);
};

// PATCH /api/users/profile
const updateProfile = async (req, res) => {
  const { name, monthlyIncome, savingsGoal, currency } = req.body;
  const user = await User.findById(req.user._id);

  if (name          !== undefined) user.name          = name;
  if (monthlyIncome !== undefined) user.monthlyIncome  = monthlyIncome;
  if (savingsGoal   !== undefined) user.savingsGoal    = savingsGoal;
  if (currency      !== undefined) user.currency       = currency;

  await user.save();
  res.json({
    _id: user._id, name: user.name, email: user.email,
    monthlyIncome: user.monthlyIncome, savingsGoal: user.savingsGoal, currency: user.currency,
  });
};

// PATCH /api/users/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'currentPassword and newPassword are required.' });

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword)))
    return res.status(401).json({ message: 'Current password is incorrect.' });

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully.' });
};

module.exports = { getProfile, updateProfile, changePassword };
