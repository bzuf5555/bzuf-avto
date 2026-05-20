'use strict';

const User = require('../models/User');
const logger = require('../utils/logger');

async function userMiddleware(ctx, next) {
  if (!ctx.from) return next();

  try {
    const { id, username, first_name, last_name, language_code } = ctx.from;

    let user = await User.findOne({ telegramId: id });
    if (!user) {
      user = await User.create({
        telegramId: id,
        username: username || null,
        firstName: first_name || 'Foydalanuvchi',
        lastName: last_name || null,
        languageCode: language_code || 'uz',
      });
      logger.info(`Yangi foydalanuvchi: ${id} (@${username || 'no_username'})`);
    } else {
      // Profil ma'lumotlari o'zgargan bo'lsa yangilash
      const needsUpdate =
        user.username !== username ||
        user.firstName !== first_name ||
        user.lastName !== last_name;

      if (needsUpdate) {
        await User.updateOne(
          { telegramId: id },
          { username, firstName: first_name, lastName: last_name }
        );
      }
    }

    if (user.isBlocked) {
      return ctx.reply('Siz botdan foydalanishdan mahrum etilgansiz.').catch(() => {});
    }

    ctx.dbUser = user;
  } catch (error) {
    logger.error('userMiddleware xatosi:', error.message);
  }

  return next();
}

module.exports = userMiddleware;
