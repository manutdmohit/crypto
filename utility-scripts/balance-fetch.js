const axios = require('axios');

const WalletAddress = require('../models/WalletAddress');
const WalletBalance = require('../models/WalletBalance');
const HistoricalBalance = require('../models/HistoricalData');

// Function to fetch balance from the BSCScan API
const fetchBalanceFromBSCScan = async (walletAddress) => {
  try {
    const response = await axios.get(
      `https://api.bscscan.com/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${process.env.BNC_API_KEY}`
    );
    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(`BSCScan API Error: ${response.data.message}`);
    }
  } catch (error) {
    throw error;
  }
};

// Function to periodically fetch and save wallet balances
const fetchAndSaveWalletBalances = async () => {
  console.log('Fetching and saving wallet balances...');

  try {
    // Reduce the line
    const wallets = await WalletAddress.find({})
      .select('address')
      .sort('-createdAt');

    const walletAddresses = wallets.map((wallet) => wallet.address);

    const promises = walletAddresses.map(async (address) => {
      const balance = await fetchBalanceFromBSCScan(address);

      // Archive old data to the 'historicaldata' collection
      const oldData = await WalletBalance.findOne({ address }).sort({
        timestamp: -1,
      });

      if (oldData) {
        const historicalWalletBalance = await HistoricalBalance.create({
          user: oldData.user,
          address: oldData.address,
          balance: oldData.balance,
          timestamp: oldData.timestamp,
        });

        // Update the current balance in the 'walletbalances' collection
        oldData.balance = balance;
        oldData.timestamp = Date.now();
        await oldData.save();
      }
    });

    console.log('Wallet balances fetched and saved successfully.');
  } catch (error) {
    console.error('Error fetching or saving wallet balances:', error);
  }
};

// Export the setup function
module.exports = () => {
  // Set up the periodic task using setInterval with a 5-second interval
  const intervalInMilliseconds = 300000; // 5 minutes
  setInterval(fetchAndSaveWalletBalances, intervalInMilliseconds);
};
