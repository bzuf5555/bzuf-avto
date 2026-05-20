'use strict';

const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const { getLang } = require('../utils/i18n');
const { buildKeyboard } = require('./messageHandler');
const logger = require('../utils/logger');

async function handleCallback(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data) return ctx.answerCbQuery();

  const [action, plateNumber] = data.split(':');
  const lang = getLang(ctx.dbUser);

  if (!plateNumber) return ctx.answerCbQuery('Xato: raqam topilmadi');

  try {
    switch (action) {
      case 'fines':
        await handleFinesDetail(ctx, plateNumber, lang);
        break;
      case 'tax':
        await handleTaxDetail(ctx, plateNumber, lang);
        break;
      case 'tech':
        await handleTechDetail(ctx, plateNumber, lang);
        break;
      case 'tonirovka':
        await handleTonirovkaDetail(ctx, plateNumber, lang);
        break;
      case 'refresh':
        await handleRefresh(ctx, plateNumber, lang);
        break;
      default:
        await ctx.answerCbQuery('Noma\'lum amal');
    }
  } catch (error) {
    logger.error(`callbackHandler xatosi [${action}:${plateNumber}]:`, error.message);
    await ctx.answerCbQuery('Xato yuz berdi').catch(() => {});
  }
}

async function handleFinesDetail(ctx, plateNumber, lang) {
  await ctx.answerCbQuery(lang === 'ru' ? 'Загрузка штрафов...' : 'Jarimalar yuklanmoqda...');
  const fines = await carService.getFines(plateNumber);
  await ctx.replyWithHTML(`${formatter.formatPlate(plateNumber)}\n\n${formatter.formatFines(fines, lang)}`);
}

async function handleTaxDetail(ctx, plateNumber, lang) {
  await ctx.answerCbQuery(lang === 'ru' ? 'Загрузка данных о налогах...' : 'Soliq ma\'lumotlari yuklanmoqda...');
  const tax = await carService.getTaxDebt(plateNumber);
  await ctx.replyWithHTML(`${formatter.formatPlate(plateNumber)}\n\n${formatter.formatTax(tax, lang)}`);
}

async function handleTechDetail(ctx, plateNumber, lang) {
  await ctx.answerCbQuery(lang === 'ru' ? 'Загрузка техосмотра...' : 'Texosmotr ma\'lumotlari yuklanmoqda...');
  const tech = await carService.getTechInspection(plateNumber);
  await ctx.replyWithHTML(`${formatter.formatPlate(plateNumber)}\n\n${formatter.formatTechInspection(tech, lang)}`);
}

async function handleTonirovkaDetail(ctx, plateNumber, lang) {
  await ctx.answerCbQuery(lang === 'ru' ? 'Загрузка тонировки...' : 'Tonirovka ma\'lumotlari yuklanmoqda...');
  const tonirovka = await carService.getTonirovka(plateNumber);
  await ctx.replyWithHTML(`${formatter.formatPlate(plateNumber)}\n\n${formatter.formatTonirovka(tonirovka, lang)}`);
}

async function handleRefresh(ctx, plateNumber, lang) {
  await ctx.answerCbQuery(lang === 'ru' ? '🔄 Очищаем кеш...' : '🔄 Kesh tozalanmoqda...');
  await carService.refreshCache(plateNumber);

  const userId = ctx.dbUser?._id || null;
  const telegramId = ctx.from?.id;

  const data = await carService.getFullReport(plateNumber, userId, telegramId);
  const report = formatter.formatFullReport(plateNumber, data, lang);
  const keyboard = buildKeyboard(plateNumber, data, lang);
  const prefix = lang === 'ru' ? '🔄 <b>Обновлённые данные:</b>\n\n' : '🔄 <b>Yangilangan ma\'lumotlar:</b>\n\n';

  await ctx.replyWithHTML(prefix + report, { reply_markup: keyboard.reply_markup });
}

module.exports = { handleCallback };
