require('dotenv').config();
require('express-async-errors');

// express
const express = require('express');
const app = express();

const morgan = require('morgan');

// database
const connectDB = require('./db/connect');

app.use(morgan('tiny'));
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('Get Wallet Balance');
});

const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(
      PORT,
      console.log(`The server is listening on the port ${PORT}`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
