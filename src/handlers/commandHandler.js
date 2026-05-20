'use strict';

const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const { isValidPlate, normalizePlate } = require('../utils/validator');
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
    `🔧 <b>Texosmotr</b> — texnik ko'rik muddati\n` +
    `🪟 <b>Tonirovka</b> — ruxsatnoma muddati\n\n` +
    `📝 <b>Ishlatish:</b>\n` +
    `Davlat raqamini yuboring, masalan:\n` +
    `<code>01A123BC</code> yoki <code>AA12345</code>\n\n` +
    `🔹 /help — yordam\n` +
    `🔹 /history — so'rovlar tarixi\n` +
    `🔹 /eslatma — muddatlar eslatmasi`;

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
    `🔹 /history — oxirgi 10 ta so'rovingiz\n` +
    `🔹 /eslatma <code>01A123BC</code> — eslatmaga qo'shish/o'chirish\n\n` +
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

async function eslatma(ctx) {
  if (!ctx.from) return;

  const args = ctx.message.text.split(' ').slice(1);
  const user = ctx.dbUser;

  if (!user) return ctx.reply('Foydalanuvchi topilmadi.');

  // /eslatma — hozirgi kuzatilayotgan raqamlar ro'yxati
  if (args.length === 0) {
    if (!user.watchedPlates || user.watchedPlates.length === 0) {
      return ctx.replyWithHTML(
        '🔔 <b>Eslatma ro\'yxati bo\'sh</b>\n\n' +
        'Eslatma qo\'shish uchun:\n' +
        '<code>/eslatma 01A123BC</code>'
      );
    }
    let text = '🔔 <b>Kuzatilayotgan raqamlar:</b>\n\n';
    user.watchedPlates.forEach((p, i) => { text += `${i + 1}. <code>${p}</code>\n`; });
    text += '\nO\'chirish: <code>/eslatma 01A123BC</code>';
    return ctx.replyWithHTML(text);
  }

  const plate = normalizePlate(args[0]);
  if (!isValidPlate(plate)) {
    return ctx.reply('❌ Noto\'g\'ri davlat raqami formati.');
  }

  // Ro'yxatda bo'lsa — o'chirish, bo'lmasa — qo'shish
  if (user.watchedPlates && user.watchedPlates.includes(plate)) {
    await user.unwatchPlate(plate);
    return ctx.replyWithHTML(
      `🔕 <code>${plate}</code> eslatma ro'yxatidan o'chirildi.`
    );
  } else {
    if (user.watchedPlates && user.watchedPlates.length >= 5) {
      return ctx.reply('⚠️ Maksimal 5 ta raqam kuzatish mumkin.');
    }
    await user.watchPlate(plate);
    return ctx.replyWithHTML(
      `🔔 <code>${plate}</code> eslatma ro'yxatiga qo'shildi.\n\n` +
      `Har kuni muddatlar yaqinlashsa xabar beraman.`
    );
  }
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

    const text =
      `📊 <b>Bot Statistikasi</b>\n\n` +
      `👥 Jami foydalanuvchilar: <b>${userCount}</b>\n` +
      `🟢 Faol (7 kun): <b>${activeUsers}</b>\n` +
      `🔔 Eslatma obunachilari: <b>${watchedCount}</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `🔍 Jami so'rovlar: <b>${queryCount}</b>\n` +
      `📅 Bugungi so'rovlar: <b>${todayCount}</b>`;

    await ctx.replyWithHTML(text);
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

    if (recentUsers.length === 0) {
      return ctx.reply('Foydalanuvchilar yo\'q.');
    }

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
  if (!text) {
    return ctx.reply('Ishlatish: /broadcast <xabar matni>');
  }

  try {
    const allUsers = await User.find({ isBlocked: false }).select('telegramId');
    let sent = 0;
    let failed = 0;

    for (const user of allUsers) {
      try {
        await ctx.telegram.sendMessage(user.telegramId, `📢 ${text}`, { parse_mode: 'HTML' });
        sent++;
        // Telegram flood limitidan himoya uchun kichik pauza
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

module.exports = { start, help, history, eslatma, stats, users, broadcast };
