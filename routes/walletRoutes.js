const express = require('express');
const {
  addWalletAddress,
  getAllWalletAddresses,
  getWalletAddress,
  deleteWalletAddresses,
  getLoggedInUserWalletAddresses,
  updateWalletAddress,
} = require('../controllers/walletController');

const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

router
  .route('/')
  .post(authenticateUser, addWalletAddress)
  .get(authenticateUser, getLoggedInUserWalletAddresses);

router.route('/all').get(getAllWalletAddresses);

router
  .route('/:id')
  .get(authenticateUser, getWalletAddress)
  .patch(authenticateUser, updateWalletAddress)
  .delete(authenticateUser, deleteWalletAddresses);

module.exports = router;
