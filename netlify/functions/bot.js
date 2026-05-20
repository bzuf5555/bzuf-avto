'use strict';

require('dotenv').config();

const { connectDB } = require('../../src/config/database');
const logger = require('../../src/utils/logger');

// Bot singleton — Netlify serverless container qayta ishlatilganda qayta yaratilmaydi
let botInstance = null;

async function getBot() {
  if (botInstance) return botInstance;
  await connectDB();
  botInstance = require('../../src/config/bot');
  return botInstance;
}

exports.handler = async (event, context) => {
  // Netlify connection reuse uchun
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
    await bot.handleUpdate(update);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    logger.error('Webhook handler xatosi:', error.message);
    // Telegram'ga har doim 200 qaytariladi — xato bo'lsa ham bot loop bo'lmaydi
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: error.message }) };
  }
};
