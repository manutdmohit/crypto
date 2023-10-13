const HistoricalBalance = require('../models/HistoricalData');
const {
  format,
  startOfDay,
  endOfDay,
  differenceInMonths,
  subMonths,
  isBefore,
  parseISO,
} = require('date-fns');

// Function to calculate the balance change and percentage change
const calculateBalanceChanges = (data, interval = 'day') => {
  const changes = [];
  let currentBalance = null;

  for (const entry of data) {
    const nextBalance = parseFloat(entry.balance);

    if (currentBalance !== null) {
      const amountChange = nextBalance - currentBalance;
      const percentageChange =
        currentBalance !== 0
          ? ((nextBalance - currentBalance) / currentBalance) * 100
          : 0;

      // Format the percentageChange to display 2 decimal places
      const formattedPercentageChange = percentageChange.toFixed(2);

      changes.push({
        date: entry.timestamp,
        balance: entry.balance,
        amountChange,
        percentageChange: formattedPercentageChange,
      });
    }

    currentBalance = nextBalance;
  }

  if (interval === 'day') {
    // Group changes by day
    const dailyChanges = groupChangesByDay(changes);
    return dailyChanges;
  } else {
    return changes;
  }
};

// Function to group changes by day
const groupChangesByDay = (changes) => {
  const dailyChanges = new Map();
  for (const change of changes) {
    const date = change.date.toISOString().split('T')[0]; // Extract date in "YYYY-MM-DD" format
    if (!dailyChanges.has(date)) {
      dailyChanges.set(date, []);
    }
    dailyChanges.get(date).push(change);
  }
  return Array.from(dailyChanges.values());
};

// Function to calculate balance changes for a specific wallet address
const fetchBalanceChangesForAddress = async (
  userId,
  walletAddress,
  dateRange
) => {
  try {
    let startDate, endDate;

    if (dateRange) {
      startDate = parseISO(dateRange[0]);
      endDate = parseISO(dateRange[1]);
      const monthsBetween = differenceInMonths(endDate, startDate);

      if (monthsBetween < 3) {
        throw new Error(
          'Invalid date range. It must be at least three months.'
        );
      }
    } else {
      startDate = subMonths(new Date(), 3);
      endDate = new Date();
    }

    // Format the start date to the beginning of the day
    const formattedStartDate = format(
      startOfDay(startDate),
      "yyyy-MM-dd'T00:00:00.000'XXX"
    );

    // Format the end date to the end of the day
    const formattedEndDate = format(
      endOfDay(endDate),
      "yyyy-MM-dd'T23:59:59.999'XXX"
    );

    const data = await HistoricalBalance.find({
      user: userId,
      address: walletAddress,
      timestamp: { $gte: formattedStartDate, $lte: formattedEndDate },
    }).sort({ timestamp: 1 });

    if (data.length < 3) {
      throw new Error('Insufficient data to calculate changes.');
    }

    return {
      dailyChanges: calculateBalanceChanges(data, 'day'),
      weeklyChanges: calculateBalanceChanges(data, 'other'),
      monthlyChanges: calculateBalanceChanges(data, 'other'),
    };
  } catch (error) {
    throw error;
  }
};

exports.getwalletBalanceForLoggedinUser = async (
  userId,
  walletAddresses,
  dateRange
) => {
  try {
    if (dateRange) {
      dateRange = JSON.parse(dateRange);
    }

    const results = { results: {} };

    for (const address of walletAddresses) {
      const balanceChanges = await fetchBalanceChangesForAddress(
        userId,
        address,
        dateRange
      );
      results.results[address] = balanceChanges;
    }

    return results;
  } catch (error) {
    console.error('Error fetching or calculating balance changes:', error);
    throw error;
  }
};
