const express = require('express');
const {
  addWalletAddress,
  getAllWalletAddresses,
  getWalletAddress,
  deleteWalletAddresses,
  getLoggedInUserWalletAddresses,
  updateWalletAddress,
  getWalletCurrentBalanceForLoggedinUser,
} = require('../controllers/walletController');

const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

router
  .route('/')
  .post(authenticateUser, addWalletAddress)
  .get(authenticateUser, getLoggedInUserWalletAddresses);

router.get(/current/, authenticateUser, getWalletCurrentBalanceForLoggedinUser);

router.route('/all').get(getAllWalletAddresses);

router
  .route('/:id')
  .get(authenticateUser, getWalletAddress)
  .patch(authenticateUser, updateWalletAddress)
  .delete(authenticateUser, deleteWalletAddresses);

module.exports = router;
