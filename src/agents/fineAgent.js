'use strict';

const axios = require('axios');
const tokenAgent = require('./tokenAgent');
const cacheAgent = require('./cacheAgent');
const logger = require('../utils/logger');

class FineAgent {
  async getFines(plateNumber) {
    const cached = await cacheAgent.get(plateNumber, 'fines');
    if (cached) {
      logger.debug(`Jarima keshdan olindi: ${plateNumber}`);
      return { ...cached, fromCache: true };
    }

    const { token, url } = await tokenAgent.getToken('jarima');

    if (token) {
      try {
        const result = await this._fetchFromApi(plateNumber, token, url);
        await cacheAgent.set(plateNumber, 'fines', result, 'api');
        return result;
      } catch (error) {
        logger.warn(`Jarima API xatosi, mock ishlatiladi: ${error.message}`);
      }
    }

    // Real API kalit bo'lmasa yoki xato bo'lsa — mock ma'lumot
    const mockResult = this._getMockData(plateNumber);
    await cacheAgent.set(plateNumber, 'fines', mockResult, 'mock');
    return mockResult;
  }

  async _fetchFromApi(plateNumber, token, baseUrl) {
    const url = `${baseUrl || 'https://e.jarima.uz/api/v1'}/violations`;
    const response = await axios.get(url, {
      params: { plate: plateNumber },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BzufAvtoBot/1.0',
      },
      timeout: 8000,
    });

    const { data } = response;
    return {
      fines: data.violations || data.fines || [],
      totalAmount: data.totalAmount || data.total_amount || 0,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };
  }

  // Development va demo uchun mock ma'lumotlar
  _getMockData(plateNumber) {
    const seed = plateNumber.charCodeAt(0) + plateNumber.charCodeAt(plateNumber.length - 1);
    const hasFines = seed % 3 !== 0;

    if (!hasFines) {
      return { fines: [], totalAmount: 0, fetchedAt: new Date().toISOString(), source: 'mock' };
    }

    const count = (seed % 3) + 1;
    const violations = [
      'Tezlik chegarasini oshirish (40-59 km/h)',
      'Qizil svetofor orqali o\'tish',
      'Noto\'g\'ri yo\'l belgilari bo\'yicha harakatlanish',
      'Xavfsizlik kamarini takmagan holda haydash',
      'Mobil telefondan foydalanish',
    ];

    const fines = Array.from({ length: count }, (_, i) => ({
      id: `MOCK-${plateNumber}-${i}`,
      violation: violations[(seed + i) % violations.length],
      amount: ((seed + i * 7) % 10 + 1) * 50000,
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Toshkent sh., ${['Chilonzor', 'Yunusobod', 'Mirzo Ulugbek', 'Olmazor'][(seed + i) % 4]} tumani`,
      status: i === 0 ? 'unpaid' : 'paid',
    }));

    const totalAmount = fines.filter((f) => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);

    return { fines, totalAmount, fetchedAt: new Date().toISOString(), source: 'mock' };
  }
}

module.exports = new FineAgent();
