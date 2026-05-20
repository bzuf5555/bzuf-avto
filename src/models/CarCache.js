const mongoose = require('mongoose');

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL) || 3600;

const carCacheSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true,
    index: true,
  },
  fines: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    fetchedAt: { type: Date, default: null },
    source: { type: String, default: 'mock' },
  },
  tax: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    fetchedAt: { type: Date, default: null },
    source: { type: String, default: 'mock' },
  },
  techInspection: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    fetchedAt: { type: Date, default: null },
    source: { type: String, default: 'mock' },
  },
  carInfo: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    fetchedAt: { type: Date, default: null },
  },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + CACHE_TTL_SECONDS * 1000),
    index: { expireAfterSeconds: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

carCacheSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

carCacheSchema.methods.isFreshFor = function (dataType) {
  const data = this[dataType];
  if (!data || !data.fetchedAt) return false;
  const ageMs = Date.now() - new Date(data.fetchedAt).getTime();
  return ageMs < CACHE_TTL_SECONDS * 1000;
};

module.exports = mongoose.model('CarCache', carCacheSchema);
