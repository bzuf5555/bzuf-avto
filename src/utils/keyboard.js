'use strict';

const { Markup } = require('telegraf');
const { t } = require('./i18n');

function mainKeyboard(lang = 'uz') {
  return Markup.keyboard([
    [t('btnCheck', lang)],
    [t('btnSaved', lang), t('btnHistory', lang)],
    [t('btnReminder', lang), t('btnHelp', lang)],
  ]).resize();
}

module.exports = { mainKeyboard };
