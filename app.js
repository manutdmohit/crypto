require('dotenv').config();
require('express-async-errors');

const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

const authRouter = require('./routes/authRoutes');
const walletRouter = require('./routes/walletRoutes');

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

// mount the routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/wallets', walletRouter);

// error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
