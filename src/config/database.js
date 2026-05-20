require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cachedConnection = null;

const MONGODB_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
};

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI muhit o\'zgaruvchisi o\'rnatilmagan');
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, MONGODB_OPTIONS);
    logger.info('MongoDB ga muvaffaqiyatli ulandi');
    return cachedConnection;
  } catch (error) {
    logger.error('MongoDB ulanishida xato:', error.message);
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB uzildi, qayta ulanish...');
  cachedConnection = null;
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB xatosi:', err.message);
});

module.exports = { connectDB };
