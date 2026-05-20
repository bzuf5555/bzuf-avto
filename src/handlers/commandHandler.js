'use strict';

const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const User = require('../models/User');
const Query = require('../models/Query');
const logger = require('../utils/logger');

const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean);

async function start(ctx) {
  const name = ctx.from.first_name || 'Do\'stim';
  const message =
    `👋 Salom, <b>${name}</b>!\n\n` +
    `🚗 <b>Avto Tekshiruv Botiga</b> xush kelibsiz!\n\n` +
    `Bu bot orqali O'zbekiston avtomobillari haqida quyidagi ma'lumotlarni bilib olishingiz mumkin:\n\n` +
    `🚨 <b>Jarimalar</b> — to'lanmagan va to'langan jarimalar\n` +
    `💰 <b>Soliq qarzlari</b> — transport solig'i holati\n` +
    `🔧 <b>Texosmotr</b> — texnik ko'rik muddati\n\n` +
    `📝 <b>Ishlatish:</b>\n` +
    `Davlat raqamini yuboring, masalan:\n` +
    `<code>01A123BC</code> yoki <code>AA12345</code>\n\n` +
    `🔹 /help — yordam\n` +
    `🔹 /history — so'rovlar tarixi`;

  await ctx.replyWithHTML(message);
}

async function help(ctx) {
  const message =
    `ℹ️ <b>Yordam</b>\n\n` +
    `<b>Davlat raqami formatlari:</b>\n` +
    `• <code>01A123BC</code> — yangi format\n` +
    `• <code>AA12345</code> — eski format\n\n` +
    `<b>Buyruqlar:</b>\n` +
    `🔹 /start — boshlanish\n` +
    `🔹 /help — bu yordam\n` +
    `🔹 /history — oxirgi 10 ta so'rovingiz\n\n` +
    `<b>Eslatma:</b> Ma'lumotlar davlat bazalaridan olinadi va keshlanadi. ` +
    `Yangi ma'lumot olish uchun <i>"🔄 Yangilash"</i> tugmasini bosing.`;

  await ctx.replyWithHTML(message);
}

async function history(ctx) {
  if (!ctx.from) return;

  try {
    const queries = await carService.getUserHistory(ctx.from.id, 10);

    if (queries.length === 0) {
      return ctx.reply('📭 Hali hech qanday so\'rov yo\'q.\n\nDavlat raqamini yuboring.');
    }

    let text = '📋 <b>So\'rovlar tarixi (oxirgi 10 ta):</b>\n\n';
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
    await ctx.reply('Tarix olishda xato yuz berdi.');
  }
}

async function stats(ctx) {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.reply('⛔ Bu buyruq faqat adminlar uchun.');
  }

  try {
    const [userCount, queryCount, todayCount] = await Promise.all([
      User.countDocuments(),
      Query.countDocuments({ status: 'success' }),
      Query.countDocuments({
        status: 'success',
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const text =
      `📊 <b>Bot Statistikasi</b>\n\n` +
      `👥 Jami foydalanuvchilar: <b>${userCount}</b>\n` +
      `🔍 Jami so'rovlar: <b>${queryCount}</b>\n` +
      `📅 Bugungi so'rovlar: <b>${todayCount}</b>`;

    await ctx.replyWithHTML(text);
  } catch (error) {
    logger.error('stats xatosi:', error.message);
    await ctx.reply('Statistika olishda xato.');
  }
}

module.exports = { start, help, history, stats };
