const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const WalletAddress = require('../models/WalletAddress');
const WalletBalance = require('../models/WalletBalance');

const CustomError = require('../errors');

exports.addWalletAddress = async (req, res) => {
  const userId = req.user.userId;

  const { address } = req.body;

  const isAddressAlreadyAdded = await WalletAddress.findOne({
    address: address,
  });

  if (isAddressAlreadyAdded) {
    throw new CustomError.BadRequestError(
      'The Wallet address you have provided is already added'
    );
  }

  if (!address.startsWith('0x') || address.length !== 42) {
    throw new CustomError.BadRequestError(
      'Please provide a valid wallet address'
    );
  }

  const { data } = await axios.get(
    `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${process.env.BSCSCAN_API_KEY}`
  );

  if (data.status !== '1') {
    throw new CustomError.BadRequestError(`${data.result}`);
  }

  const wallet = await WalletAddress.create({
    user: userId,
    address,
  });

  if (wallet) {
    await WalletBalance.create({
      user: userId,
      address,
      balance: data.result,
      timestamp: Date.now(),
    });
  }

  res.status(StatusCodes.CREATED).json({ wallet });
};

exports.getLoggedInUserWalletAddresses = async (req, res) => {
  const user = req.user.userId;

  const wallets = await WalletAddress.find({ user })
    .select(['-createdAt', '-updatedAt', '-__v'])
    .sort('-createdAt');

  const count = wallets.length;

  res.status(StatusCodes.OK).json({ count, wallets });
};

exports.getAllWalletAddresses = async (req, res) => {
  // Reduce the line
  const wallets = await WalletAddress.find({})
    .select('address')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ wallets });
};

exports.getWalletAddress = async (req, res) => {
  const { id: walletId } = req.params;

  const wallet = await WalletAddress.findById(walletId).select(
    '-createdAt -updatedAt -__v'
  );

  if (!wallet) {
    throw new CustomError.NotFoundError(`No wallet found with ID: ${walletId}`);
  }

  res.status(StatusCodes.OK).json({ wallet });
};
exports.updateWalletAddress = async (req, res) => {
  const { id: walletId } = req.params;

  const { address } = req.body;

  if (!address.startsWith('0x') || address.length !== 42) {
    throw new CustomError.BadRequestError(
      'Please provide a valid wallet address'
    );
  }

  const { data } = await axios.get(
    `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${process.env.BSCSCAN_API_KEY}`
  );

  if (data.status !== '1') {
    throw new CustomError.BadRequestError(`${data.result}`);
  }

  const wallet = await WalletAddress.findOneAndUpdate(
    { _id: walletId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!wallet) {
    throw new CustomError.NotFoundError(`No wallet found with ID: ${walletId}`);
  }

  // Create New Wallet Balance With the Updated Address
  if (wallet) {
    await WalletBalance.create({
      user: userId,
      address,
      balance: data.result,
      timestamp: Date.now(),
    });
  }

  res.status(StatusCodes.OK).json({ wallet });
};

exports.deleteWalletAddresses = async (req, res) => {
  const { id: walletId } = req.params;

  const walletAddress = await WalletAddress.findOneAndDelete({ _id: walletId });

  if (!walletAddress) {
    throw new CustomError.NotFoundError(`No wallet found with ID: ${walletId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Wallet Deleted Successfully' });
};
