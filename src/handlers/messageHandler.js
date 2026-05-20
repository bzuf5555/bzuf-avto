'use strict';

const { Markup } = require('telegraf');
const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const { isValidPlate, extractPlateFromText, normalizePlate } = require('../utils/validator');
const logger = require('../utils/logger');

async function handleText(ctx) {
  const text = ctx.message.text;
  if (!text || text.startsWith('/')) return;

  const plate = extractPlateFromText(text);

  if (!plate || !isValidPlate(plate)) {
    return ctx.replyWithHTML(
      '❌ <b>Noto\'g\'ri davlat raqami</b>\n\n' +
        'To\'g\'ri formatlar:\n' +
        '• <code>01A123BC</code> — yangi format\n' +
        '• <code>AA12345</code> — eski format\n\n' +
        'Iltimos, qaytadan kiriting.'
    );
  }

  const normalizedPlate = normalizePlate(plate);
  const loadingMsg = await ctx.replyWithHTML(
    `🔍 <code>${normalizedPlate}</code> tekshirilmoqda...\n⏳ Iltimos kuting...`
  );

  try {
    const userId = ctx.dbUser ? ctx.dbUser._id : null;
    const telegramId = ctx.from.id;

    if (ctx.dbUser) {
      await ctx.dbUser.incrementQuery();
    }

    const data = await carService.getFullReport(normalizedPlate, userId, telegramId);

    const report = formatter.formatFullReport(normalizedPlate, data);
    const keyboard = buildKeyboard(normalizedPlate, data);

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.replyWithHTML(report, { reply_markup: keyboard.reply_markup });
  } catch (error) {
    logger.error(`messageHandler xatosi [${normalizedPlate}]:`, error.message);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.reply(
      '⚠️ Ma\'lumotlarni olishda xato yuz berdi.\nIltimos, bir ozdan so\'ng qayta urinib ko\'ring.'
    );
  }
}

function buildKeyboard(plateNumber, data) {
  const fineCount = data.fines?.fines?.length || 0;
  const taxDebt = data.tax?.totalDebt || 0;
  const techValid = data.techInspection?.isValid;

  const fineLabel = fineCount > 0 ? `🚨 Jarimalar (${fineCount})` : '✅ Jarima yo\'q';
  const taxLabel = taxDebt > 0 ? `❌ Qarz: ${formatter.formatAmount(taxDebt)} so'm` : '✅ Soliq to\'liq';
  const techLabel = techValid === false ? '❌ Texosmotr o\'tgan' : '✅ Texosmotr amal qiladi';

  return Markup.inlineKeyboard([
    [Markup.button.callback(fineLabel, `fines:${plateNumber}`)],
    [Markup.button.callback(taxLabel, `tax:${plateNumber}`)],
    [Markup.button.callback(techLabel, `tech:${plateNumber}`)],
    [Markup.button.callback('🔄 Yangilash', `refresh:${plateNumber}`)],
  ]);
}

module.exports = { handleText };
