require('dotenv').config();
require('express-async-errors');

const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

const authRouter = require('./routes/authRoutes');
const walletRouter = require('./routes/walletRoutes');
const userRouter = require('./routes/userRoutes');

// express
const express = require('express');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// database
const connectDB = require('./db/connect');
const setupCronJob = require('./utility-scripts/balance-fetch');

app.use(morgan('tiny'));

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// routes
app.get('/', (req, res) => {
  res.send('Get Wallet Balance');
});

// mount the routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/wallets', walletRouter);
app.use('/api/v1/users', userRouter);

// error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Set up the cron job after the database connection is established
    setupCronJob();

    app.listen(
      PORT,
      console.log(`The server is listening on the port ${PORT}`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
