const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  address: String,
  balance: String,
  timestamp: Date,
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
