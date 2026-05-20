'use strict';

// O'zbekiston davlat raqami formatlari:
// Yangi format: 01A123BC (2 raqam + 1-2 harf + 3 raqam + 2 harf)
// Eski format: AA12345  (2 harf + 5 raqam)
const PLATE_PATTERNS = [
  /^[0-9]{2}[A-Z]{1,2}[0-9]{3}[A-Z]{2}$/,
  /^[A-Z]{2}[0-9]{5}[A-Z]{0,2}$/,
];

function normalizePlate(input) {
  return input.toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
}

function isValidPlate(plateNumber) {
  const normalized = normalizePlate(plateNumber);
  return PLATE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function extractPlateFromText(text) {
  const cleaned = text.toUpperCase().replace(/\s+/g, '');
  for (const pattern of PLATE_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) return match[0];
  }

  const looseMatch = cleaned.match(/\d{2}[A-Z]{1,2}\d{3}[A-Z]{2}|[A-Z]{2}\d{5}/);
  return looseMatch ? looseMatch[0] : null;
}

module.exports = { isValidPlate, normalizePlate, extractPlateFromText };
