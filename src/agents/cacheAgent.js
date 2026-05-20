'use strict';

const NodeCache = require('node-cache');
const CarCache = require('../models/CarCache');
const logger = require('../utils/logger');

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600;

// In-memory kesh serverless cold-start'lardan keyin ham ishlaydi
const memCache = new NodeCache({ stdTTL: Math.min(CACHE_TTL, 300), checkperiod: 60 });

class CacheAgent {
  _memKey(plate, type) {
    return `${plate}:${type}`;
  }

  async get(plateNumber, dataType) {
    const memKey = this._memKey(plateNumber, dataType);
    const memHit = memCache.get(memKey);
    if (memHit) return memHit;

    try {
      const record = await CarCache.findOne({ plateNumber });
      if (!record) return null;

      const data = record[dataType];
      if (!data || !record.isFreshFor(dataType)) return null;

      memCache.set(memKey, data.data);
      return data.data;
    } catch (error) {
      logger.error(`CacheAgent.get xatosi [${plateNumber}:${dataType}]:`, error.message);
      return null;
    }
  }

  async set(plateNumber, dataType, data, source = 'api') {
    const memKey = this._memKey(plateNumber, dataType);
    memCache.set(memKey, data);

    try {
      const update = {
        [`${dataType}.data`]: data,
        [`${dataType}.fetchedAt`]: new Date(),
        [`${dataType}.source`]: source,
        expireAt: new Date(Date.now() + CACHE_TTL * 1000),
        updatedAt: new Date(),
      };

      await CarCache.findOneAndUpdate(
        { plateNumber },
        { $set: update },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`CacheAgent.set xatosi [${plateNumber}:${dataType}]:`, error.message);
    }
  }

  async invalidate(plateNumber) {
    ['fines', 'tax', 'techInspection', 'carInfo'].forEach((type) => {
      memCache.del(this._memKey(plateNumber, type));
    });

    try {
      await CarCache.deleteOne({ plateNumber });
      logger.info(`Kesh tozalandi: ${plateNumber}`);
    } catch (error) {
      logger.error(`CacheAgent.invalidate xatosi:`, error.message);
    }
  }

  async getStats() {
    try {
      const count = await CarCache.countDocuments();
      return { cachedPlates: count, memCacheKeys: memCache.keys().length };
    } catch {
      return { cachedPlates: 0, memCacheKeys: 0 };
    }
  }
}

module.exports = new CacheAgent();
