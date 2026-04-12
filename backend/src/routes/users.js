const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/profile').get(getProfile).patch(updateProfile);
router.patch('/password', changePassword);

module.exports = router;
