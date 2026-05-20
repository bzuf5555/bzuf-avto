'use strict';

require('dotenv').config();

const { connectDB } = require('../../src/config/database');
const logger = require('../../src/utils/logger');

const HANDLER_TIMEOUT_MS = 9000;

// Bot singleton — Netlify serverless container qayta ishlatilganda qayta yaratilmaydi
let botInstance = null;
let dbConnecting = null;

async function getBot() {
  if (botInstance) return botInstance;

  // DB ulanish bir marta boshlanadi (parallel chaqiruvlarda ikkilanmaydi)
  if (!dbConnecting) {
    dbConnecting = connectDB().catch((err) => {
      dbConnecting = null;
      throw err;
    });
  }
  await dbConnecting;

  if (!botInstance) {
    botInstance = require('../../src/config/bot');
  }
  return botInstance;
}

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Handler ${ms}ms dan oshdi`)), ms)
  );
  return Promise.race([promise, timeout]);
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'Avto Tekshiruv Bot ishlamoqda ✅' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request: bo\'sh body' };
  }

  let update;
  try {
    update = JSON.parse(event.body);
  } catch {
    logger.error('Webhook JSON parse xatosi');
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    const bot = await getBot();
    await withTimeout(bot.handleUpdate(update), HANDLER_TIMEOUT_MS);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    logger.error('Webhook handler xatosi:', error.message);
    // Telegram'ga har doim 200 qaytariladi — xato bo'lsa ham bot loop bo'lmaydi
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: error.message }) };
  }
};
