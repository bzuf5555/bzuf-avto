'use strict';

// TASK-008: Kunlik eslatma - har kuni soat 9:00 UTC (14:00 Toshkent vaqti)
// Netlify Scheduled Function: https://docs.netlify.com/functions/scheduled-functions/

require('dotenv').config();

const { connectDB } = require('../../src/config/database');
const User = require('../../src/models/User');
const techInspectionAgent = require('../../src/agents/techInspectionAgent');
const tonirovkaAgent = require('../../src/agents/tonirovkaAgent');
const logger = require('../../src/utils/logger');
const { Telegraf } = require('telegraf');

const WARN_DAYS = 30;

exports.handler = async (event) => {
  // Netlify scheduled functions "scheduled" sifatida keladi
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'Scheduled function' };
  }

  logger.info('Kunlik eslatma funksiyasi ishga tushdi');

  try {
    await connectDB();
    const bot = new Telegraf(process.env.BOT_TOKEN);

    // watchedPlates ro'yxati bo'lgan va eslatma yoqilgan foydalanuvchilar
    const users = await User.find({
      'watchedPlates.0': { $exists: true },
      notificationsEnabled: true,
      isBlocked: false,
    });

    logger.info(`${users.length} ta foydalanuvchi tekshirilmoqda`);

    let notifSent = 0;

    for (const user of users) {
      const warnings = [];

      for (const plate of user.watchedPlates) {
        try {
          const [tech, tonirovka] = await Promise.allSettled([
            techInspectionAgent.getTechInspection(plate),
            tonirovkaAgent.getTonirovka(plate),
          ]);

          const techData = tech.status === 'fulfilled' ? tech.value : null;
          const tonirovkaData = tonirovka.status === 'fulfilled' ? tonirovka.value : null;

          const plateWarnings = checkExpiry(plate, techData, tonirovkaData);
          if (plateWarnings.length > 0) {
            warnings.push(...plateWarnings);
          }
        } catch (err) {
          logger.error(`Plate tekshirishda xato [${plate}]:`, err.message);
        }
      }

      if (warnings.length > 0) {
        try {
          const message = buildNotificationMessage(warnings);
          await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
          notifSent++;
          await new Promise((r) => setTimeout(r, 50));
        } catch (err) {
          logger.warn(`Foydalanuvchi ${user.telegramId} ga xabar yuborilmadi: ${err.message}`);
        }
      }
    }

    logger.info(`Eslatma yuborildi: ${notifSent} ta foydalanuvchiga`);
    return { statusCode: 200, body: JSON.stringify({ sent: notifSent }) };
  } catch (error) {
    logger.error('Notifications funksiyasi xatosi:', error.message);
    return { statusCode: 500, body: error.message };
  }
};

function checkExpiry(plate, techData, tonirovkaData) {
  const warnings = [];
  const now = new Date();

  if (techData && techData.expiryDate) {
    const expiry = new Date(techData.expiryDate);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= WARN_DAYS && daysLeft >= 0) {
      warnings.push({ plate, type: 'texosmotr', daysLeft, expiryDate: techData.expiryDate });
    } else if (daysLeft < 0) {
      warnings.push({ plate, type: 'texosmotr', daysLeft, expiryDate: techData.expiryDate, expired: true });
    }
  }

  if (tonirovkaData && tonirovkaData.expiryDate) {
    const expiry = new Date(tonirovkaData.expiryDate);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= WARN_DAYS && daysLeft >= 0) {
      warnings.push({ plate, type: 'tonirovka', daysLeft, expiryDate: tonirovkaData.expiryDate });
    } else if (daysLeft < 0) {
      warnings.push({ plate, type: 'tonirovka', daysLeft, expiryDate: tonirovkaData.expiryDate, expired: true });
    }
  }

  return warnings;
}

function buildNotificationMessage(warnings) {
  let msg = `⏰ <b>Muddatlar eslatmasi</b>\n\n`;

  const byPlate = warnings.reduce((acc, w) => {
    if (!acc[w.plate]) acc[w.plate] = [];
    acc[w.plate].push(w);
    return acc;
  }, {});

  for (const [plate, items] of Object.entries(byPlate)) {
    msg += `🚗 <code>${plate}</code>\n`;
    for (const item of items) {
      const typeLabel = item.type === 'texosmotr' ? '🔧 Texosmotr' : '🪟 Tonirovka';
      const dateStr = new Date(item.expiryDate).toLocaleDateString('uz-UZ', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
      if (item.expired) {
        msg += `  ❌ ${typeLabel} muddati o'tgan (${dateStr})\n`;
      } else {
        msg += `  ⚠️ ${typeLabel}: <b>${item.daysLeft} kun</b> qoldi (${dateStr})\n`;
      }
    }
    msg += '\n';
  }

  msg += `Eslatmani o'chirish: /eslatma &lt;raqam&gt;`;
  return msg;
}
