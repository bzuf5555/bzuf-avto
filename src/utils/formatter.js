'use strict';

const { t } = require('./i18n');

function formatPlate(plate) {
  return `🚗 <b>${plate}</b>`;
}

function formatFines(finesData, lang = 'uz') {
  if (!finesData || finesData.error) return t('finesError', lang);
  if (!finesData.fines || finesData.fines.length === 0) return t('finesNone', lang);

  const total = finesData.totalAmount || 0;
  let text = t('finesTitle', lang, finesData.fines.length) + '\n';
  text += `${t('finesTotal', lang)}: <b>${formatAmount(total)} ${t('currency', lang)}</b>\n\n`;

  finesData.fines.slice(0, 5).forEach((fine, i) => {
    text += `${i + 1}. ${fine.violation || 'Qoidabuzarlik'}\n`;
    text += `   📅 ${formatDate(fine.date)}\n`;
    text += `   💰 ${formatAmount(fine.amount)} ${t('currency', lang)}\n`;
    if (fine.location) text += `   📍 ${fine.location}\n`;
    text += '\n';
  });

  if (finesData.fines.length > 5) {
    text += t('finesMore', lang, finesData.fines.length - 5);
  }

  return text;
}

function formatTax(taxData, lang = 'uz') {
  if (!taxData || taxData.error) return t('taxError', lang);

  let text = t('taxTitle', lang) + '\n\n';

  if (!taxData.hasDebt) {
    text += t('taxNone', lang) + '\n';
  } else {
    text += `${t('taxDebt', lang)}: <b>${formatAmount(taxData.totalDebt)} ${t('currency', lang)}</b>\n\n`;
    if (taxData.debts && taxData.debts.length > 0) {
      taxData.debts.forEach((debt, i) => {
        text += `${i + 1}. ${debt.type || t('taxType', lang)}\n`;
        text += `   💵 ${formatAmount(debt.amount)} ${t('currency', lang)}\n`;
        if (debt.dueDate) text += `   📅 ${t('taxDue', lang)}: ${formatDate(debt.dueDate)}\n`;
        text += '\n';
      });
    }
  }

  return text;
}

function formatTechInspection(techData, lang = 'uz') {
  if (!techData || techData.error) return t('techError', lang);

  let text = t('techTitle', lang) + '\n\n';

  if (!techData.expiryDate) {
    text += `❓ ${t('noData', lang)}\n`;
    return text;
  }

  const now = new Date();
  const expiry = new Date(techData.expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  text += `${t('techExpiry', lang)}: <b>${formatDate(techData.expiryDate)}</b>\n`;

  if (daysLeft < 0) {
    text += t('techExpired', lang, Math.abs(daysLeft)) + '\n';
  } else if (daysLeft <= 30) {
    text += t('techSoon', lang, daysLeft) + '\n';
  } else {
    text += t('techValid', lang, daysLeft) + '\n';
  }

  if (techData.lastInspectionDate) {
    text += `${t('techLast', lang)}: ${formatDate(techData.lastInspectionDate)}\n`;
  }
  if (techData.nextInspectionDate) {
    text += `${t('techNext', lang)}: ${formatDate(techData.nextInspectionDate)}\n`;
  }

  return text;
}

function formatTonirovka(tonirovkaData, lang = 'uz') {
  if (!tonirovkaData || tonirovkaData.error) return t('tonirovkaError', lang);

  let text = t('tonirovkaTitle', lang) + '\n\n';

  if (!tonirovkaData.expiryDate) {
    text += `❓ ${t('noData', lang)}\n`;
    return text;
  }

  const now = new Date();
  const expiry = new Date(tonirovkaData.expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  text += `📅 ${t('tonirovkaTitle', lang).replace(/[^A-Za-z]/g, '') ? '' : ''}${t('techExpiry', lang)}: <b>${formatDate(tonirovkaData.expiryDate)}</b>\n`;

  if (daysLeft < 0) {
    text += t('tonirovkaExpired', lang, Math.abs(daysLeft)) + '\n';
  } else if (daysLeft <= 30) {
    text += t('tonirovkaSoon', lang, daysLeft) + '\n';
  } else {
    text += t('tonirovkaValid', lang, daysLeft) + '\n';
  }

  if (tonirovkaData.issueDate) {
    text += `${t('tonirovkaIssued', lang)}: ${formatDate(tonirovkaData.issueDate)}\n`;
  }
  if (tonirovkaData.lightTransmission) {
    text += `${t('tonirovkaLight', lang)}: <b>${tonirovkaData.lightTransmission}%</b>\n`;
  }
  if (tonirovkaData.issuedBy) {
    text += `${t('tonirovkaIssuedBy', lang)}: ${tonirovkaData.issuedBy}\n`;
  }
  if (tonirovkaData.certificateNumber) {
    text += `${t('tonirovkaCert', lang)}: <code>${tonirovkaData.certificateNumber}</code>\n`;
  }

  return text;
}

function formatFullReport(plateNumber, data, lang = 'uz') {
  const timestamp = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let report = `${formatPlate(plateNumber)}\n`;
  report += `🕐 ${timestamp} (${t('tashkentTime', lang)})\n`;
  report += '━━━━━━━━━━━━━━━━━━━━\n\n';

  if (data.carInfo) {
    report += `${t('carBrand', lang)}: ${data.carInfo.brand || '—'} ${data.carInfo.model || ''}\n`;
    report += `${t('carYear', lang)}: ${data.carInfo.year || '—'}\n`;
    report += `${t('carColor', lang)}: ${data.carInfo.color || '—'}\n\n`;
  }

  report += formatFines(data.fines, lang) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += formatTax(data.tax, lang) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += formatTechInspection(data.techInspection, lang) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += formatTonirovka(data.tonirovka, lang) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += `<i>${t('dataSource', lang)}</i>`;

  return report;
}

function formatAmount(amount) {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('uz-UZ');
}

function formatDate(date) {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
}

module.exports = {
  formatPlate,
  formatFines,
  formatTax,
  formatTechInspection,
  formatTonirovka,
  formatFullReport,
  formatAmount,
  formatDate,
};
