'use strict';

const NodeCache = require('node-cache');
const logger = require('../utils/logger');

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX) || 20;
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000; // 1 soat

const requestCounts = new NodeCache({ stdTTL: Math.ceil(WINDOW_MS / 1000), checkperiod: 60 });

async function rateLimiter(ctx, next) {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  const key = `rl:${userId}`;

  const count = requestCounts.get(key) || 0;

  if (count >= MAX_REQUESTS) {
    const ttl = requestCounts.getTtl(key);
    const minutesLeft = ttl ? Math.ceil((ttl - Date.now()) / 60000) : 60;

    logger.warn(`Rate limit: foydalanuvchi ${userId} cheklandi`);
    return ctx.reply(
      `⛔ Siz soatiga ${MAX_REQUESTS} ta so'rovdan oshib ketdingiz.\n` +
        `⏳ ${minutesLeft} daqiqadan so'ng qayta urinib ko'ring.`
    ).catch(() => {});
  }

  requestCounts.set(key, count + 1);
  return next();
}

module.exports = rateLimiter;
