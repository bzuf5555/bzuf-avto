'use strict';

const User = require('../models/User');
const logger = require('../utils/logger');

async function userMiddleware(ctx, next) {
  if (!ctx.from) return next();

  try {
    const { id, username, first_name, last_name, language_code } = ctx.from;

    // Telegram language_code: 'ru' bo'lsa rus tili, aks holda o'zbek
    const detectedLang = language_code && language_code.startsWith('ru') ? 'ru' : 'uz';

    let user = await User.findOne({ telegramId: id });
    if (!user) {
      user = await User.create({
        telegramId: id,
        username: username || null,
        firstName: first_name || 'Foydalanuvchi',
        lastName: last_name || null,
        languageCode: detectedLang,
      });
      logger.info(`Yangi foydalanuvchi: ${id} (@${username || 'no_username'}) lang=${detectedLang}`);
    } else {
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

    const { t } = require('../utils/i18n');
    if (user.isBlocked) {
      return ctx.reply(t('blocked', user.languageCode || 'uz')).catch(() => {});
    }

    ctx.dbUser = user;
  } catch (error) {
    logger.error('userMiddleware xatosi:', error.message);
  }

  return next();
}

module.exports = userMiddleware;
