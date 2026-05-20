const mongoose = require('mongoose');

// TokenAgent tomonidan boshqariladi — tashqi API tokenlarini shifrlangan holda saqlaydi
const apiTokenSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    unique: true,
    enum: ['jarima', 'soliq', 'texosmotr', 'mygov'],
    index: true,
  },
  encryptedToken: { type: String, required: true },
  encryptedUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  lastUsedAt: { type: Date, default: null },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

apiTokenSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

apiTokenSchema.methods.markUsed = async function () {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  await this.save();
};

apiTokenSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('ApiToken', apiTokenSchema);
