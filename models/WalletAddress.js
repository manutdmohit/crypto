const mongoose = require('mongoose');

const WalletAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: String,
      required: [true, 'Please provide a  wallet address'],
    },
  },
  {
    timestamps: true,
  }
);

const walletAddress = mongoose.model('Wallet_Address', WalletAddressSchema);

module.exports = walletAddress;
