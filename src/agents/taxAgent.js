'use strict';

const axios = require('axios');
const tokenAgent = require('./tokenAgent');
const cacheAgent = require('./cacheAgent');
const logger = require('../utils/logger');

class TaxAgent {
  async getTaxDebt(plateNumber) {
    const cached = await cacheAgent.get(plateNumber, 'tax');
    if (cached) {
      logger.debug(`Soliq keshdan olindi: ${plateNumber}`);
      return { ...cached, fromCache: true };
    }

    const { token, url } = await tokenAgent.getToken('soliq');

    if (token) {
      try {
        const result = await this._fetchFromApi(plateNumber, token, url);
        await cacheAgent.set(plateNumber, 'tax', result, 'api');
        return result;
      } catch (error) {
        logger.warn(`Soliq API xatosi, mock ishlatiladi: ${error.message}`);
      }
    }

    const mockResult = this._getMockData(plateNumber);
    await cacheAgent.set(plateNumber, 'tax', mockResult, 'mock');
    return mockResult;
  }

  async _fetchFromApi(plateNumber, token, baseUrl) {
    const url = `${baseUrl || 'https://my.gov.uz/api'}/transport/tax`;
    const response = await axios.post(
      url,
      { plate_number: plateNumber },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    );

    const { data } = response;
    return {
      hasDebt: data.has_debt || false,
      totalDebt: data.total_debt || data.amount || 0,
      debts: data.debts || [],
      taxpayerInfo: data.taxpayer || null,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };
  }

  _getMockData(plateNumber) {
    const seed = plateNumber.charCodeAt(1) + plateNumber.length;
    const hasDebt = seed % 4 !== 0;

    if (!hasDebt) {
      return { hasDebt: false, totalDebt: 0, debts: [], fetchedAt: new Date().toISOString(), source: 'mock' };
    }

    const taxTypes = [
      'Transport vositasi solig\'i',
      'Yo\'l foydalanish solig\'i',
      'Ekologik to\'lov',
    ];

    const debtCount = (seed % 2) + 1;
    const debts = Array.from({ length: debtCount }, (_, i) => ({
      type: taxTypes[(seed + i) % taxTypes.length],
      amount: ((seed + i * 3) % 20 + 1) * 25000,
      period: `${2024 - i} yil`,
      dueDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const totalDebt = debts.reduce((s, d) => s + d.amount, 0);

    return { hasDebt: true, totalDebt, debts, fetchedAt: new Date().toISOString(), source: 'mock' };
  }
}

module.exports = new TaxAgent();
