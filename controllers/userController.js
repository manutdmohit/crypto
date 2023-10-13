const User = require('../models/User');
const WalletAddress = require('../models/WalletAddress');

const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const { createTokenUser } = require('../utils');
const {
  getwalletBalanceForLoggedinUser,
} = require('../utility-scripts/loggedinUserFetchBalance');

exports.showCurrentLoggedInUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// @desc Get Single User
// @route /api/v1/users/:id
// @access Private
exports.getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findOne({ _id: userId }).select(
    '-password -createdAt -updatedAt -__v'
  );

  if (!user) {
    throw new CustomError.NotFoundError(`No user found with id : ${userId}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

// @desc Update User
// @route /api/v1/users/:id
// @access Private
exports.updateUser = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new CustomError.NotFoundError(`No user found with id : ${userId}`);
  }

  const tokenUser = createTokenUser(user);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// @desc Get Wallet Balance for Logged in User
// @route /api/v1/users/balance
// @access Private
exports.getWalletBalanceForLoggedinUser = async (req, res) => {
  const userId = req.user.userId;

  const { dateRange } = req.query;

  const walletAddresses = await WalletAddress.find({ user: userId }).select(
    'address'
  );

  const addressessArray = walletAddresses.map((wallet) => wallet.address);

  const results = await getwalletBalanceForLoggedinUser(
    userId,
    addressessArray,
    dateRange
  );

  res.status(StatusCodes.OK).json(results);
};
