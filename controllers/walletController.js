const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const WalletAddress = require('../models/WalletAddress');
const WalletBalance = require('../models/WalletBalance');

const CustomError = require('../errors');

// @desc Add Wallet Address
// @route POST /api/v1/wallets
// @access Private
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

// @desc Get Logged in User Wallet Addresses
// @route GET /api/v1/wallets
// @access Private
exports.getLoggedInUserWalletAddresses = async (req, res) => {
  const user = req.user.userId;

  const wallets = await WalletAddress.find({ user })
    .select(['-createdAt', '-updatedAt', '-__v'])
    .sort('-createdAt');

  const count = wallets.length;

  res.status(StatusCodes.OK).json({ count, wallets });
};

// @desc Get All Wallet Addresses
// @route GET /api/v1/wallets/all
// @access Private
exports.getAllWalletAddresses = async (req, res) => {
  const wallets = await WalletAddress.find({})
    .select('address')
    .sort('-createdAt -updatedAt -__v');

  res.status(StatusCodes.OK).json({ wallets });
};

// @desc Get Single Wallet Address
// @route GET /api/v1/wallets/:id
// @access Private
exports.getWalletAddress = async (req, res) => {
  const { id: walletId } = req.params;

  const wallet = await WalletAddress.findById(walletId).select(
    '-createdAt -updatedAt -__v'
  );

  if (!wallet) {
    throw new CustomError.NotFoundError(`No wallet found with ID: ${walletId}`);
  }

  if (req.user.userId !== wallet.user.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to access this wallet address'
    );
  }

  res.status(StatusCodes.OK).json({ wallet });
};

// @desc Update Wallet Address
// @route PATCH /api/v1/wallets/:id
// @access Private
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

// @desc Delete Wallet Address
// @route DELETE /api/v1/wallets/:id
// @access Private
exports.deleteWalletAddresses = async (req, res) => {
  const { id: walletId } = req.params;

  const walletAddress = await WalletAddress.findOne({ _id: walletId });

  if (!walletAddress) {
    throw new CustomError.NotFoundError(`No wallet found with ID: ${walletId}`);
  }

  if (req.user.userId !== walletAddress.user.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to delete this wallet address'
    );
  }

  await walletAddress.remove();

  res.status(StatusCodes.OK).json({ msg: 'Wallet Deleted Successfully' });
};
