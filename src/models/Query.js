const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  telegramId: { type: Number, required: true, index: true },
  plateNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  queryType: {
    type: String,
    enum: ['full', 'fine', 'tax', 'tech'],
    default: 'full',
  },
  status: {
    type: String,
    enum: ['success', 'error', 'pending'],
    default: 'pending',
  },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  errorMessage: { type: String, default: null },
  responseTimeMs: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

querySchema.index({ telegramId: 1, createdAt: -1 });
querySchema.index({ plateNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Query', querySchema);
