const express = require('express');
const {
  addWalletAddress,
  getAllWalletAddresses,
  getWalletAddress,
  deleteWalletAddresses,
  getLoggedInUserWalletAddresses,
  updateWalletAddress,
} = require('../controllers/walletController');

const router = express.Router();

router.route('/').post(addWalletAddress).get(getLoggedInUserWalletAddresses);

router.route('/all').get(getAllWalletAddresses);

router
  .route('/:id')
  .get(getWalletAddress)
  .patch(updateWalletAddress)
  .delete(deleteWalletAddresses);

module.exports = router;
