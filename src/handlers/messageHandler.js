'use strict';

const { Markup } = require('telegraf');
const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const { isValidPlate, extractPlateFromText, normalizePlate, extractMultiplePlates } = require('../utils/validator');
const { t, getLang } = require('../utils/i18n');
const logger = require('../utils/logger');

async function handleText(ctx) {
  const text = ctx.message.text;
  if (!text || text.startsWith('/')) return;

  const lang = getLang(ctx.dbUser);

  // TASK-011: Bir nechta raqam tekshirish
  const plates = extractMultiplePlates(text);
  if (plates.length > 1) {
    return handleMultiplePlates(ctx, plates, lang);
  }

  // Yagona raqam
  const plate = extractPlateFromText(text);
  if (!plate || !isValidPlate(plate)) {
    return ctx.replyWithHTML(t('invalidPlate', lang));
  }

  const normalizedPlate = normalizePlate(plate);
  const loadingMsg = await ctx.replyWithHTML(t('checking', lang, normalizedPlate));

  try {
    const userId = ctx.dbUser ? ctx.dbUser._id : null;
    const telegramId = ctx.from.id;

    if (ctx.dbUser) await ctx.dbUser.incrementQuery();

    const data = await carService.getFullReport(normalizedPlate, userId, telegramId);
    const report = formatter.formatFullReport(normalizedPlate, data, lang);
    const keyboard = buildKeyboard(normalizedPlate, data, lang);

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.replyWithHTML(report, { reply_markup: keyboard.reply_markup });
  } catch (error) {
    logger.error(`messageHandler xatosi [${normalizedPlate}]:`, error.message);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.replyWithHTML(t('error', lang));
  }
}

async function handleMultiplePlates(ctx, plates, lang) {
  const loadingMsg = await ctx.replyWithHTML(t('checkingMultiple', lang, plates.length));

  try {
    if (ctx.dbUser) await ctx.dbUser.incrementQuery();

    const userId = ctx.dbUser ? ctx.dbUser._id : null;
    const telegramId = ctx.from.id;

    // Parallel tekshirish
    const results = await Promise.allSettled(
      plates.map((plate) => carService.getFullReport(plate, userId, telegramId))
    );

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});

    for (let i = 0; i < plates.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        const report = formatter.formatFullReport(plates[i], result.value, lang);
        const keyboard = buildKeyboard(plates[i], result.value, lang);
        await ctx.replyWithHTML(report, { reply_markup: keyboard.reply_markup });
      } else {
        await ctx.replyWithHTML(`🚗 <b>${plates[i]}</b>\n${t('error', lang)}`);
      }
    }
  } catch (error) {
    logger.error('handleMultiplePlates xatosi:', error.message);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    await ctx.replyWithHTML(t('error', lang));
  }
}

function buildKeyboard(plateNumber, data, lang = 'uz') {
  const fineCount = data.fines?.fines?.length || 0;
  const taxDebt = data.tax?.totalDebt || 0;
  const techValid = data.techInspection?.isValid;
  const tonirovkaValid = data.tonirovka?.isValid;

  return Markup.inlineKeyboard([
    [Markup.button.callback(t('keyboardFines', lang, fineCount), `fines:${plateNumber}`)],
    [Markup.button.callback(t('keyboardTax', lang, taxDebt, formatter.formatAmount(taxDebt)), `tax:${plateNumber}`)],
    [
      Markup.button.callback(t('keyboardTech', lang, techValid), `tech:${plateNumber}`),
      Markup.button.callback(t('keyboardTonirovka', lang, tonirovkaValid), `tonirovka:${plateNumber}`),
    ],
    [Markup.button.callback(t('keyboardRefresh', lang), `refresh:${plateNumber}`)],
  ]);
}

module.exports = { handleText, buildKeyboard };
