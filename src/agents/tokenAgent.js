'use strict';

const CryptoJS = require('crypto-js');
const NodeCache = require('node-cache');
const ApiToken = require('../models/ApiToken');
const logger = require('../utils/logger');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production!!';

// In-memory kesh — har bir serverless invokatsiya uchun tezkor kirish
const tokenCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class TokenAgent {
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getToken(service) {
    const cached = tokenCache.get(service);
    if (cached) return cached;

    try {
      const record = await ApiToken.findOne({ service, isActive: true });
      if (!record || record.isExpired()) {
        logger.warn(`${service} uchun faol token topilmadi`);
        return this._getEnvToken(service);
      }

      const token = this.decrypt(record.encryptedToken);
      const url = record.encryptedUrl ? this.decrypt(record.encryptedUrl) : null;

      await record.markUsed();
      const result = { token, url };
      tokenCache.set(service, result);
      return result;
    } catch (error) {
      logger.error(`TokenAgent.getToken xatosi [${service}]:`, error.message);
      return this._getEnvToken(service);
    }
  }

  async saveToken(service, token, url = null, expiresAt = null) {
    try {
      const encryptedToken = this.encrypt(token);
      const encryptedUrl = url ? this.encrypt(url) : null;

      await ApiToken.findOneAndUpdate(
        { service },
        {
          encryptedToken,
          encryptedUrl,
          isActive: true,
          expiresAt,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      tokenCache.del(service);
      logger.info(`${service} tokeni muvaffaqiyatli saqlandi`);
      return true;
    } catch (error) {
      logger.error(`TokenAgent.saveToken xatosi [${service}]:`, error.message);
      return false;
    }
  }

  async deactivateToken(service) {
    try {
      await ApiToken.updateOne({ service }, { isActive: false });
      tokenCache.del(service);
      logger.info(`${service} tokeni o'chirildi`);
    } catch (error) {
      logger.error(`TokenAgent.deactivateToken xatosi:`, error.message);
    }
  }

  async listTokens() {
    try {
      return await ApiToken.find({}, { encryptedToken: 0, encryptedUrl: 0 });
    } catch (error) {
      logger.error('TokenAgent.listTokens xatosi:', error.message);
      return [];
    }
  }

  // Muhit o'zgaruvchilaridan token olish (fallback)
  _getEnvToken(service) {
    const envMap = {
      jarima: { token: process.env.JARIMA_API_KEY, url: process.env.JARIMA_API_URL },
      soliq: { token: process.env.SOLIQ_API_KEY, url: process.env.SOLIQ_API_URL },
      texosmotr: { token: process.env.TEXOSMOTR_API_KEY, url: process.env.TEXOSMOTR_API_URL },
      mygov: { token: process.env.MYGOV_API_KEY, url: process.env.MYGOV_API_URL },
    };
    return envMap[service] || { token: null, url: null };
  }
}

module.exports = new TokenAgent();
