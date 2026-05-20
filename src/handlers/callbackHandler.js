'use strict';

const carService = require('../services/carService');
const formatter = require('../utils/formatter');
const logger = require('../utils/logger');

async function handleCallback(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data) return ctx.answerCbQuery();

  const [action, plateNumber] = data.split(':');

  if (!plateNumber) return ctx.answerCbQuery('Xato: raqam topilmadi');

  try {
    switch (action) {
      case 'fines':
        await handleFinesDetail(ctx, plateNumber);
        break;
      case 'tax':
        await handleTaxDetail(ctx, plateNumber);
        break;
      case 'tech':
        await handleTechDetail(ctx, plateNumber);
        break;
      case 'refresh':
        await handleRefresh(ctx, plateNumber);
        break;
      default:
        await ctx.answerCbQuery('Noma\'lum amal');
    }
  } catch (error) {
    logger.error(`callbackHandler xatosi [${action}:${plateNumber}]:`, error.message);
    await ctx.answerCbQuery('Xato yuz berdi').catch(() => {});
  }
}

async function handleFinesDetail(ctx, plateNumber) {
  await ctx.answerCbQuery('Jarimalar yuklanmoqda...');
  const fines = await carService.getFines(plateNumber);
  const text = `${formatter.formatPlate(plateNumber)}\n\n${formatter.formatFines(fines)}`;
  await ctx.replyWithHTML(text);
}

async function handleTaxDetail(ctx, plateNumber) {
  await ctx.answerCbQuery('Soliq ma\'lumotlari yuklanmoqda...');
  const tax = await carService.getTaxDebt(plateNumber);
  const text = `${formatter.formatPlate(plateNumber)}\n\n${formatter.formatTax(tax)}`;
  await ctx.replyWithHTML(text);
}

async function handleTechDetail(ctx, plateNumber) {
  await ctx.answerCbQuery('Texosmotr ma\'lumotlari yuklanmoqda...');
  const tech = await carService.getTechInspection(plateNumber);
  const text = `${formatter.formatPlate(plateNumber)}\n\n${formatter.formatTechInspection(tech)}`;
  await ctx.replyWithHTML(text);
}

async function handleRefresh(ctx, plateNumber) {
  await ctx.answerCbQuery('🔄 Kesh tozalanmoqda...');
  await carService.refreshCache(plateNumber);

  const userId = ctx.dbUser?._id || null;
  const telegramId = ctx.from?.id;

  const data = await carService.getFullReport(plateNumber, userId, telegramId);
  const report = formatter.formatFullReport(plateNumber, data);

  await ctx.replyWithHTML(
    `🔄 <b>Yangilangan ma'lumotlar:</b>\n\n${report}`
  );
}

module.exports = { handleCallback };
