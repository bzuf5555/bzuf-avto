#!/usr/bin/env node
'use strict';

require('dotenv').config();
const axios = require('axios');

async function setWebhook() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const NETLIFY_URL = process.env.NETLIFY_URL;

  if (!BOT_TOKEN || !NETLIFY_URL) {
    console.error('❌ BOT_TOKEN va NETLIFY_URL .env faylida bo\'lishi kerak');
    process.exit(1);
  }

  const webhookUrl = `${NETLIFY_URL}/.netlify/functions/bot`;
  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;

  console.log(`🔗 Webhook o'rnatilmoqda: ${webhookUrl}`);

  try {
    const response = await axios.post(telegramUrl, {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
    });

    if (response.data.ok) {
      console.log('✅ Webhook muvaffaqiyatli o\'rnatildi!');
      console.log(`📡 URL: ${webhookUrl}`);
    } else {
      console.error('❌ Webhook o\'rnatishda xato:', response.data.description);
    }
  } catch (error) {
    console.error('❌ Xato:', error.message);
  }
}

async function checkWebhook() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;

  try {
    const response = await axios.get(telegramUrl);
    const info = response.data.result;
    console.log('\n📊 Webhook holati:');
    console.log(`  URL: ${info.url || '(bo\'sh)'}`);
    console.log(`  Oxirgi xato: ${info.last_error_message || 'yo\'q'}`);
    console.log(`  Kutayotgan yangilanishlar: ${info.pending_update_count}`);
  } catch (error) {
    console.error('Webhook holati olishda xato:', error.message);
  }
}

const args = process.argv.slice(2);
if (args[0] === 'check') {
  checkWebhook();
} else {
  setWebhook().then(() => checkWebhook());
}
