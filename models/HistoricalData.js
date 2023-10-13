const mongoose = require('mongoose');

const HistoricalBalanceSchema = new mongoose.Schema(
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

const historicalBalance = mongoose.model(
  'Historical_Balance',
  HistoricalBalanceSchema
);

module.exports = historicalBalance;
