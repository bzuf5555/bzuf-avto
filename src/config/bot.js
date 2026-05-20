require('dotenv').config();
const { Telegraf } = require('telegraf');
const logger = require('../utils/logger');

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN muhit o\'zgaruvchisi o\'rnatilmagan');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const commandHandler = require('../handlers/commandHandler');
const messageHandler = require('../handlers/messageHandler');
const callbackHandler = require('../handlers/callbackHandler');
const userMiddleware = require('../middleware/userMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

bot.use(userMiddleware);
bot.use(rateLimiter);

bot.start(commandHandler.start);
bot.help(commandHandler.help);
bot.command('history', commandHandler.history);
bot.command('stats', commandHandler.stats);

bot.on('text', messageHandler.handleText);
bot.on('callback_query', callbackHandler.handleCallback);

bot.catch((err, ctx) => {
  logger.error(`Bot xatosi [${ctx.updateType}]:`, err.message);
  ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.').catch(() => {});
});

module.exports = bot;
