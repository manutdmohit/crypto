const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email address',
      },
    },
    contact: {
      type: String,
      required: [true, 'Please provide your contact number'],
    },
    age: {
      type: Number,
      required: [true, 'Please provide your age'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: `{VALUE} is not supported. male, female, other are supported.`,
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
