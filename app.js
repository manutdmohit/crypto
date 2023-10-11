require('dotenv').config();
require('express-async-errors');

const authRouter = require('./routes/authRoutes');

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

app.use('/api/v1/auth', authRouter);

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
