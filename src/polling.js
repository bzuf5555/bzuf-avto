'use strict';

require('dotenv').config();

const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

async function startPolling() {
  logger.info('MongoDB ga ulanilmoqda...');
  await connectDB();

  // bot.js ni bu yerda import qilamiz — ulanish tayyor bo'lgandan keyin
  const bot = require('./config/bot');

  logger.info('Bot polling rejimida ishga tushmoqda...');
  await bot.launch();
  logger.info('✅ Bot ishga tushdi! @BotFather da berilgan username orqali sinab ko\'ring.');

  process.once('SIGINT', () => {
    logger.info('Bot to\'xtatilmoqda (SIGINT)...');
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    logger.info('Bot to\'xtatilmoqda (SIGTERM)...');
    bot.stop('SIGTERM');
  });
}

startPolling().catch((err) => {
  console.error('Bot ishga tushmadi:', err.message);
  process.exit(1);
});
