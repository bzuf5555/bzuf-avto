'use strict';

const axios = require('axios');
const tokenAgent = require('./tokenAgent');
const cacheAgent = require('./cacheAgent');
const logger = require('../utils/logger');

class TechInspectionAgent {
  async getTechInspection(plateNumber) {
    const cached = await cacheAgent.get(plateNumber, 'techInspection');
    if (cached) {
      logger.debug(`Texosmotr keshdan olindi: ${plateNumber}`);
      return { ...cached, fromCache: true };
    }

    const { token, url } = await tokenAgent.getToken('texosmotr');

    if (token) {
      try {
        const result = await this._fetchFromApi(plateNumber, token, url);
        await cacheAgent.set(plateNumber, 'techInspection', result, 'api');
        return result;
      } catch (error) {
        logger.warn(`Texosmotr API xatosi, mock ishlatiladi: ${error.message}`);
      }
    }

    const mockResult = this._getMockData(plateNumber);
    await cacheAgent.set(plateNumber, 'techInspection', mockResult, 'mock');
    return mockResult;
  }

  async _fetchFromApi(plateNumber, token, baseUrl) {
    const url = `${baseUrl || 'https://yig.uz/api/v1'}/inspection`;
    const response = await axios.get(url, {
      params: { plate: plateNumber },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    const { data } = response;
    return {
      expiryDate: data.expiry_date || data.expiryDate,
      lastInspectionDate: data.last_inspection || data.lastInspectionDate,
      nextInspectionDate: data.next_inspection || data.nextInspectionDate,
      inspectionCenter: data.inspection_center || null,
      certificateNumber: data.certificate_number || null,
      isValid: data.is_valid !== undefined ? data.is_valid : null,
      fetchedAt: new Date().toISOString(),
      source: 'api',
    };
  }

  _getMockData(plateNumber) {
    const seed = plateNumber.charCodeAt(2 < plateNumber.length ? 2 : 0);

    // 6 oydan 18 oygacha tasodifiy muddat
    const monthsFromNow = (seed % 25) - 6;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsFromNow);

    const lastInspectionDate = new Date(expiryDate);
    lastInspectionDate.setFullYear(lastInspectionDate.getFullYear() - 1);

    const nextInspectionDate = new Date(expiryDate);
    nextInspectionDate.setFullYear(nextInspectionDate.getFullYear() + 1);

    const centers = [
      'Toshkent TII Markaziy texnik ko\'rik stansiyasi',
      'Chilonzor texnik ko\'rik stansiyasi',
      'Yunusobod texnik ko\'rik stansiyasi',
    ];

    return {
      expiryDate: expiryDate.toISOString(),
      lastInspectionDate: lastInspectionDate.toISOString(),
      nextInspectionDate: nextInspectionDate.toISOString(),
      inspectionCenter: centers[seed % centers.length],
      certificateNumber: `TK${new Date().getFullYear()}${plateNumber.slice(-4)}`,
      isValid: monthsFromNow > 0,
      fetchedAt: new Date().toISOString(),
      source: 'mock',
    };
  }
}

module.exports = new TechInspectionAgent();
