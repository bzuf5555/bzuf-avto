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
  isBlocked: { type: Boolean, default: false },
  queryCount: { type: Number, default: 0 },
  lastQueryAt: { type: Date, default: null },
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

module.exports = mongoose.model('User', userSchema);
