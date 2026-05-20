'use strict';

const axios = require('axios');
const tokenAgent = require('./tokenAgent');
const cacheAgent = require('./cacheAgent');
const logger = require('../utils/logger');

class TonirovkaAgent {
  async getTonirovka(plateNumber) {
    const cached = await cacheAgent.get(plateNumber, 'tonirovka');
    if (cached) {
      logger.debug(`Tonirovka keshdan olindi: ${plateNumber}`);
      return { ...cached, fromCache: true };
    }

    const { token, url } = await tokenAgent.getToken('texosmotr');

    if (token) {
      try {
        const result = await this._fetchFromApi(plateNumber, token, url);
        await cacheAgent.set(plateNumber, 'tonirovka', result, 'api');
        return result;
      } catch (error) {
        logger.warn(`Tonirovka API xatosi, mock ishlatiladi: ${error.message}`);
      }
    }

    const mockResult = this._getMockData(plateNumber);
    await cacheAgent.set(plateNumber, 'tonirovka', mockResult, 'mock');
    return mockResult;
  }

  async _fetchFromApi(plateNumber, token, baseUrl) {
    const url = `${baseUrl || 'https://yig.uz/api/v1'}/tinting`;
    const response = await axios.get(url, {
      params: { plate: plateNumber },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 8000,
    });

    const { data } = response;
    return {
      expiryDate: data.expiry_date || data.expiryDate,
      issueDate: data.issue_date || data.issueDate,
      certificateNumber: data.certificate_number || null,
      issuedBy: data.issued_by || null,
      lightTransmission: data.light_transmission || null,
      isValid: data.is_valid !== undefined ? data.is_valid : null,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };
  }

  _getMockData(plateNumber) {
    const seed = plateNumber.charCodeAt(plateNumber.length - 1) + plateNumber.length * 3;

    const monthsFromNow = (seed % 20) - 4;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsFromNow);

    const issueDate = new Date(expiryDate);
    issueDate.setFullYear(issueDate.getFullYear() - 1);

    const stations = [
      'Toshkent STSI №1 tonirovka nazorat punkti',
      'Chilonzor tuman STSI',
      'Yunusobod tuman STSI',
      'Mirzo Ulugbek tuman STSI',
    ];

    // O'zbekiston qonuni bo'yicha old shisha ≥75%, yon shishalar ≥70%
    const transmissionValues = [70, 72, 75, 78, 80];
    const lightTransmission = transmissionValues[seed % transmissionValues.length];

    return {
      expiryDate: expiryDate.toISOString(),
      issueDate: issueDate.toISOString(),
      certificateNumber: `TN${new Date().getFullYear()}${plateNumber.slice(-4)}`,
      issuedBy: stations[seed % stations.length],
      lightTransmission,
      isValid: monthsFromNow > 0,
      fetchedAt: new Date().toISOString(),
      source: 'mock',
    };
  }
}

module.exports = new TonirovkaAgent();
