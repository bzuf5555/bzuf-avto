'use strict';

const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const { isValidPlate, normalizePlate } = require('../utils/validator');
const { t, getLang } = require('../utils/i18n');
const User = require('../models/User');
const Query = require('../models/Query');
const logger = require('../utils/logger');

const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean);

async function start(ctx) {
  const lang = getLang(ctx.dbUser);
  const name = ctx.from.first_name || (lang === 'ru' ? 'Друг' : 'Do\'stim');
  await ctx.replyWithHTML(t('welcome', lang, name));
}

async function help(ctx) {
  const lang = getLang(ctx.dbUser);
  await ctx.replyWithHTML(t('help', lang));
}

async function history(ctx) {
  if (!ctx.from) return;
  const lang = getLang(ctx.dbUser);

  try {
    const queries = await carService.getUserHistory(ctx.from.id, 10);

    if (queries.length === 0) {
      return ctx.replyWithHTML(t('historyEmpty', lang));
    }

    let text = t('historyTitle', lang);
    queries.forEach((q, i) => {
      const date = formatter.formatDate(q.createdAt);
      const time = new Date(q.createdAt).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
      text += `${i + 1}. <code>${q.plateNumber}</code> — ${date} ${time}\n`;
    });

    await ctx.replyWithHTML(text);
  } catch (error) {
    logger.error('history xatosi:', error.message);
    await ctx.replyWithHTML(t('error', lang));
  }
}

async function eslatma(ctx) {
  if (!ctx.from) return;
  const lang = getLang(ctx.dbUser);
  const args = ctx.message.text.split(' ').slice(1);
  const user = ctx.dbUser;

  if (!user) return ctx.replyWithHTML(t('userNotFound', lang));

  if (args.length === 0) {
    if (!user.watchedPlates || user.watchedPlates.length === 0) {
      return ctx.replyWithHTML(t('watchListEmpty', lang));
    }
    let text = t('watchListTitle', lang);
    user.watchedPlates.forEach((p, i) => { text += `${i + 1}. <code>${p}</code>\n`; });
    text += t('watchListRemoveHint', lang);
    return ctx.replyWithHTML(text);
  }

  const plate = normalizePlate(args[0]);
  if (!isValidPlate(plate)) {
    return ctx.replyWithHTML(t('watchInvalidPlate', lang));
  }

  if (user.watchedPlates && user.watchedPlates.includes(plate)) {
    await user.unwatchPlate(plate);
    return ctx.replyWithHTML(t('watchRemoved', lang, plate));
  } else {
    if (user.watchedPlates && user.watchedPlates.length >= 5) {
      return ctx.replyWithHTML(t('watchLimit', lang));
    }
    await user.watchPlate(plate);
    return ctx.replyWithHTML(t('watchAdded', lang, plate));
  }
}

async function til(ctx) {
  if (!ctx.from) return;
  const lang = getLang(ctx.dbUser);
  await ctx.replyWithHTML(t('langSelect', lang));
}

async function tilUz(ctx) {
  if (!ctx.from || !ctx.dbUser) return;
  await User.updateOne({ telegramId: ctx.from.id }, { languageCode: 'uz' });
  ctx.dbUser.languageCode = 'uz';
  await ctx.replyWithHTML(t('langChanged', 'uz'));
}

async function tilRu(ctx) {
  if (!ctx.from || !ctx.dbUser) return;
  await User.updateOne({ telegramId: ctx.from.id }, { languageCode: 'ru' });
  ctx.dbUser.languageCode = 'ru';
  await ctx.replyWithHTML(t('langChanged', 'ru'));
}

async function stats(ctx) {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('⛔ Bu buyruq faqat adminlar uchun.');
  }

  try {
    const [userCount, activeUsers, queryCount, todayCount, watchedCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastQueryAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Query.countDocuments({ status: 'success' }),
      Query.countDocuments({
        status: 'success',
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      User.countDocuments({ 'watchedPlates.0': { $exists: true } }),
    ]);

    await ctx.replyWithHTML(
      `📊 <b>Bot Statistikasi</b>\n\n` +
      `👥 Jami foydalanuvchilar: <b>${userCount}</b>\n` +
      `🟢 Faol (7 kun): <b>${activeUsers}</b>\n` +
      `🔔 Eslatma obunachilari: <b>${watchedCount}</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `🔍 Jami so'rovlar: <b>${queryCount}</b>\n` +
      `📅 Bugungi so'rovlar: <b>${todayCount}</b>`
    );
  } catch (error) {
    logger.error('stats xatosi:', error.message);
    await ctx.reply('Statistika olishda xato.');
  }
}

async function users(ctx) {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('⛔ Bu buyruq faqat adminlar uchun.');
  }

  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('telegramId username firstName queryCount createdAt');

    if (recentUsers.length === 0) return ctx.reply('Foydalanuvchilar yo\'q.');

    let text = `👥 <b>Oxirgi 20 ta foydalanuvchi:</b>\n\n`;
    recentUsers.forEach((u, i) => {
      const name = u.username ? `@${u.username}` : u.firstName;
      const date = formatter.formatDate(u.createdAt);
      text += `${i + 1}. ${name} — ${u.queryCount} so'rov (${date})\n`;
    });

    await ctx.replyWithHTML(text);
  } catch (error) {
    logger.error('users xatosi:', error.message);
    await ctx.reply('Foydalanuvchilar ro\'yxatini olishda xato.');
  }
}

async function broadcast(ctx) {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('⛔ Bu buyruq faqat adminlar uchun.');
  }

  const text = ctx.message.text.replace('/broadcast', '').trim();
  if (!text) return ctx.reply('Ishlatish: /broadcast <xabar matni>');

  try {
    const allUsers = await User.find({ isBlocked: false }).select('telegramId');
    let sent = 0;
    let failed = 0;

    for (const user of allUsers) {
      try {
        await ctx.telegram.sendMessage(user.telegramId, `📢 ${text}`, { parse_mode: 'HTML' });
        sent++;
        await new Promise((r) => setTimeout(r, 35));
      } catch {
        failed++;
      }
    }

    await ctx.replyWithHTML(
      `✅ <b>Xabar yuborildi</b>\n\n` +
      `📤 Muvaffaqiyatli: <b>${sent}</b>\n` +
      `❌ Xato: <b>${failed}</b>`
    );
  } catch (error) {
    logger.error('broadcast xatosi:', error.message);
    await ctx.reply('Xabar yuborishda xato.');
  }
}

module.exports = { start, help, history, eslatma, til, tilUz, tilRu, stats, users, broadcast };
