const mongoose = require('mongoose');

const WalletBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: String,
      required: [true, 'Please provide a  wallet address'],
    },
    balance: {
      type: String,
      required: [true, 'Please provide a wallet balance'],
    },
    timestamp: Date,
  },
  {
    timestamps: true,
  }
);

const walletBalance = mongoose.model('Wallet_Balance', WalletBalanceSchema);

module.exports = walletBalance;
