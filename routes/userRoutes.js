const express = require('express');
const {
  getSingleUser,
  showCurrentLoggedInUser,
  updateUser,
  getWalletBalanceForLoggedinUser,
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

router.patch('/', authenticateUser, updateUser);

router.get('/balance', authenticateUser, getWalletBalanceForLoggedinUser);

router.route('/showme').get(authenticateUser, showCurrentLoggedInUser);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;
