const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: { type: String, default: null },
  firstName: { type: String, required: true },
  lastName: { type: String, default: null },
  languageCode: { type: String, default: 'uz' },
  phoneNumber: { type: String, default: null },
  phoneSharedAt: { type: Date, default: null },
  isBlocked: { type: Boolean, default: false },
  queryCount: { type: Number, default: 0 },
  lastQueryAt: { type: Date, default: null },
  // TASK-008: eslatma obunasi uchun
  watchedPlates: { type: [String], default: [] },
  notificationsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

userSchema.methods.incrementQuery = async function () {
  this.queryCount += 1;
  this.lastQueryAt = new Date();
  await this.save();
};

userSchema.methods.watchPlate = async function (plate) {
  const normalized = plate.toUpperCase().trim();
  if (!this.watchedPlates.includes(normalized)) {
    this.watchedPlates.push(normalized);
    await this.save();
    return true;
  }
  return false;
};

userSchema.methods.unwatchPlate = async function (plate) {
  const normalized = plate.toUpperCase().trim();
  const before = this.watchedPlates.length;
  this.watchedPlates = this.watchedPlates.filter((p) => p !== normalized);
  if (this.watchedPlates.length < before) {
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
