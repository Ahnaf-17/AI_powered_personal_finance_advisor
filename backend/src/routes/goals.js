const express = require('express');
const router  = express.Router();
const { getGoals, getGoal, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').get(getGoal).put(updateGoal).delete(deleteGoal);

module.exports = router;
