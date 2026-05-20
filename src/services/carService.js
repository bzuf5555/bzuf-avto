'use strict';

const fineAgent = require('../agents/fineAgent');
const taxAgent = require('../agents/taxAgent');
const techInspectionAgent = require('../agents/techInspectionAgent');
const cacheAgent = require('../agents/cacheAgent');
const Query = require('../models/Query');
const logger = require('../utils/logger');

class CarService {
  async getFullReport(plateNumber, userId, telegramId) {
    const startTime = Date.now();
    const queryRecord = await Query.create({
      userId,
      telegramId,
      plateNumber,
      queryType: 'full',
      status: 'pending',
    });

    try {
      // Barcha agentlarni parallel ishga tushirish — tezlikni oshiradi
      const [fines, tax, techInspection] = await Promise.allSettled([
        fineAgent.getFines(plateNumber),
        taxAgent.getTaxDebt(plateNumber),
        techInspectionAgent.getTechInspection(plateNumber),
      ]);

      const result = {
        plateNumber,
        fines: fines.status === 'fulfilled' ? fines.value : { error: true },
        tax: tax.status === 'fulfilled' ? tax.value : { error: true },
        techInspection: techInspection.status === 'fulfilled' ? techInspection.value : { error: true },
      };

      const responseTimeMs = Date.now() - startTime;
      await Query.findByIdAndUpdate(queryRecord._id, {
        status: 'success',
        result,
        responseTimeMs,
      });

      return result;
    } catch (error) {
      logger.error(`CarService.getFullReport xatosi [${plateNumber}]:`, error.message);
      await Query.findByIdAndUpdate(queryRecord._id, {
        status: 'error',
        errorMessage: error.message,
        responseTimeMs: Date.now() - startTime,
      });
      throw error;
    }
  }

  async getFines(plateNumber) {
    return fineAgent.getFines(plateNumber);
  }

  async getTaxDebt(plateNumber) {
    return taxAgent.getTaxDebt(plateNumber);
  }

  async getTechInspection(plateNumber) {
    return techInspectionAgent.getTechInspection(plateNumber);
  }

  async refreshCache(plateNumber) {
    await cacheAgent.invalidate(plateNumber);
  }

  async getUserHistory(telegramId, limit = 10) {
    return Query.find({ telegramId, status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('plateNumber queryType createdAt responseTimeMs');
  }
}

module.exports = new CarService();
