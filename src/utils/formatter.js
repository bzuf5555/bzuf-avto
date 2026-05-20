'use strict';

function formatPlate(plate) {
  return `🚗 <b>${plate}</b>`;
}

function formatFines(finesData) {
  if (!finesData || finesData.error) {
    return '⚠️ <i>Jarima ma\'lumotlarini olishda xato</i>';
  }
  if (!finesData.fines || finesData.fines.length === 0) {
    return '✅ Jarima topilmadi';
  }

  const total = finesData.totalAmount || 0;
  let text = `🚨 <b>Jarimalar</b> (${finesData.fines.length} ta)\n`;
  text += `💵 Jami: <b>${formatAmount(total)} so'm</b>\n\n`;

  finesData.fines.slice(0, 5).forEach((fine, i) => {
    text += `${i + 1}. ${fine.violation || 'Qoidabuzarlik'}\n`;
    text += `   📅 ${formatDate(fine.date)}\n`;
    text += `   💰 ${formatAmount(fine.amount)} so'm\n`;
    if (fine.location) text += `   📍 ${fine.location}\n`;
    text += '\n';
  });

  if (finesData.fines.length > 5) {
    text += `<i>... va yana ${finesData.fines.length - 5} ta jarima</i>`;
  }

  return text;
}

function formatTax(taxData) {
  if (!taxData || taxData.error) {
    return '⚠️ <i>Soliq ma\'lumotlarini olishda xato</i>';
  }

  let text = '💰 <b>Soliq holati</b>\n\n';

  if (!taxData.hasDebt) {
    text += '✅ Soliq qarzi yo\'q\n';
  } else {
    text += `❌ Umumiy qarz: <b>${formatAmount(taxData.totalDebt)} so'm</b>\n\n`;
    if (taxData.debts && taxData.debts.length > 0) {
      taxData.debts.forEach((debt, i) => {
        text += `${i + 1}. ${debt.type || 'Soliq turi'}\n`;
        text += `   💵 ${formatAmount(debt.amount)} so'm\n`;
        if (debt.dueDate) text += `   📅 To'lash muddati: ${formatDate(debt.dueDate)}\n`;
        text += '\n';
      });
    }
  }

  return text;
}

function formatTechInspection(techData) {
  if (!techData || techData.error) {
    return '⚠️ <i>Texosmotr ma\'lumotlarini olishda xato</i>';
  }

  let text = '🔧 <b>Texnik ko\'rik (Texosmotr)</b>\n\n';

  if (!techData.expiryDate) {
    text += '❓ Ma\'lumot topilmadi\n';
    return text;
  }

  const now = new Date();
  const expiry = new Date(techData.expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  text += `📅 Muddati: <b>${formatDate(techData.expiryDate)}</b>\n`;

  if (daysLeft < 0) {
    text += `❌ Muddati <b>${Math.abs(daysLeft)} kun</b> oldin o'tgan!\n`;
  } else if (daysLeft <= 30) {
    text += `⚠️ Muddatga <b>${daysLeft} kun</b> qoldi\n`;
  } else {
    text += `✅ Amal qilish muddati: <b>${daysLeft} kun</b>\n`;
  }

  if (techData.lastInspectionDate) {
    text += `🔍 So'nggi tekshiruv: ${formatDate(techData.lastInspectionDate)}\n`;
  }
  if (techData.nextInspectionDate) {
    text += `📆 Keyingi tekshiruv: ${formatDate(techData.nextInspectionDate)}\n`;
  }

  return text;
}

function formatFullReport(plateNumber, data) {
  const timestamp = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let report = `${formatPlate(plateNumber)}\n`;
  report += `🕐 ${timestamp} (Toshkent vaqti)\n`;
  report += '━━━━━━━━━━━━━━━━━━━━\n\n';

  if (data.carInfo) {
    report += `🚙 <b>Avtomobil</b>: ${data.carInfo.brand || '—'} ${data.carInfo.model || ''}\n`;
    report += `📋 <b>Yil</b>: ${data.carInfo.year || '—'}\n`;
    report += `🎨 <b>Rang</b>: ${data.carInfo.color || '—'}\n\n`;
  }

  report += formatFines(data.fines) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += formatTax(data.tax) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += formatTechInspection(data.techInspection) + '\n';
  report += '━━━━━━━━━━━━━━━━━━━━\n';
  report += '<i>📊 Ma\'lumotlar davlat bazalaridan olingan</i>';

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
  formatFullReport,
  formatAmount,
  formatDate,
};
