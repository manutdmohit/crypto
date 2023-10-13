const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

exports.registerUser = async (req, res) => {
  const { email } = req.body;

  const isUserAlreadyRegistered = await User.findOne({
    email,
  });

  if (isUserAlreadyRegistered) {
    throw new CustomError.BadRequestError('User already registered');
  }

  const user = await User.create(req.body);

  res.status(StatusCodes.CREATED).json({ user });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email }).select([
    '-createdAt',
    '-updatedAt',
  ]);

  if (!user) {
    throw new CustomError.NotFoundError('No user found');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

exports.logoutUser = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
