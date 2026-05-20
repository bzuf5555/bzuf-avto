'use strict';

const messages = {
  uz: {
    welcome: (name) =>
      `👋 Salom, <b>${name}</b>!\n\n` +
      `🚗 <b>Avto Tekshiruv Botiga</b> xush kelibsiz!\n\n` +
      `Bu bot orqali O'zbekiston avtomobillari haqida:\n\n` +
      `🚨 <b>Jarimalar</b> — to'lanmagan va to'langan jarimalar\n` +
      `💰 <b>Soliq qarzlari</b> — transport solig'i holati\n` +
      `🔧 <b>Texosmotr</b> — texnik ko'rik muddati\n` +
      `🪟 <b>Tonirovka</b> — ruxsatnoma muddati\n\n` +
      `📝 Davlat raqamini yuboring:\n` +
      `<code>01A123BC</code> yoki <code>01456AAA</code>\n\n` +
      `🔹 /help — yordam\n` +
      `🔹 /history — so'rovlar tarixi\n` +
      `🔹 /eslatma — muddatlar eslatmasi\n` +
      `🔹 /til — tilni o'zgartirish`,

    help:
      `ℹ️ <b>Yordam</b>\n\n` +
      `<b>Davlat raqami formatlari:</b>\n` +
      `• <code>01A123BC</code> — format 1\n` +
      `• <code>01456AAA</code> — format 2\n\n` +
      `<b>Bir nechta raqam:</b>\n` +
      `• <code>01A123BC, 01456AAA</code> — vergul bilan ajrating\n\n` +
      `<b>Buyruqlar:</b>\n` +
      `🔹 /start — boshlanish\n` +
      `🔹 /help — bu yordam\n` +
      `🔹 /history — oxirgi 10 ta so'rovingiz\n` +
      `🔹 /eslatma <code>01A123BC</code> — eslatmaga qo'shish/o'chirish\n` +
      `🔹 /til — tilni o'zgartirish (uz/ru)\n\n` +
      `Ma'lumotlar keshlanadi. Yangilash uchun 🔄 tugmasini bosing.`,

    invalidPlate:
      `❌ <b>Noto'g'ri davlat raqami</b>\n\n` +
      `To'g'ri formatlar:\n` +
      `• <code>01A123BC</code> — format 1\n` +
      `• <code>01456AAA</code> — format 2\n` +
      `• <code>01A123BC, 01456AAA</code> — bir nechta raqam\n\n` +
      `Iltimos, qaytadan kiriting.`,

    checking: (plate) => `🔍 <code>${plate}</code> tekshirilmoqda...\n⏳ Iltimos kuting...`,
    checkingMultiple: (count) => `🔍 <b>${count} ta</b> raqam tekshirilmoqda...\n⏳ Iltimos kuting...`,

    error: `⚠️ Ma'lumotlarni olishda xato yuz berdi.\nIltimos, bir ozdan so'ng qayta urinib ko'ring.`,

    historyEmpty: `📭 Hali hech qanday so'rov yo'q.\n\nDavlat raqamini yuboring.`,
    historyTitle: `📋 <b>So'rovlar tarixi (oxirgi 10 ta):</b>\n\n`,

    watchListEmpty:
      `🔔 <b>Eslatma ro'yxati bo'sh</b>\n\n` +
      `Eslatma qo'shish uchun:\n<code>/eslatma 01A123BC</code>`,
    watchListTitle: `🔔 <b>Kuzatilayotgan raqamlar:</b>\n\n`,
    watchListRemoveHint: `\nO'chirish: <code>/eslatma 01A123BC</code>`,
    watchAdded: (plate) => `🔔 <code>${plate}</code> eslatma ro'yxatiga qo'shildi.\n\nHar kuni muddatlar yaqinlashsa xabar beraman.`,
    watchRemoved: (plate) => `🔕 <code>${plate}</code> eslatma ro'yxatidan o'chirildi.`,
    watchLimit: `⚠️ Maksimal 5 ta raqam kuzatish mumkin.`,
    watchInvalidPlate: `❌ Noto'g'ri davlat raqami formati.`,

    phoneRequest:
      `📱 <b>Telefon raqamingizni ulashing</b>\n\n` +
      `Botdan foydalanish uchun telefon raqamingizni bir marta ulashish kerak.\n` +
      `Quyidagi tugmani bosing:`,
    phoneButton: `📱 Raqamni ulashish`,
    phoneReceived: (name) =>
      `✅ Rahmat, <b>${name}</b>! Raqamingiz saqlandi.\n\n` +
      `Endi botdan to'liq foydalanishingiz mumkin 🚗`,
    langChanged: `✅ Til o'zgartirildi: <b>O'zbek tili</b> 🇺🇿`,
    langSelect:
      `🌐 <b>Tilni tanlang / Выберите язык</b>\n\n` +
      `🇺🇿 /til_uz — O'zbek tili\n` +
      `🇷🇺 /til_ru — Русский язык`,

    blocked: `Siz botdan foydalanishdan mahrum etilgansiz.`,
    userNotFound: `Foydalanuvchi topilmadi.`,
    adminOnly: `⛔ Bu buyruq faqat adminlar uchun.`,

    // Formatter strings
    dataSource: `📊 Ma'lumotlar davlat bazalaridan olingan`,
    tashkentTime: `Toshkent vaqti`,
    currency: `so'm`,
    noData: `Ma'lumot topilmadi`,
    finesNone: `✅ Jarima topilmadi`,
    finesTitle: (count) => `🚨 <b>Jarimalar</b> (${count} ta)`,
    finesTotal: `💵 Jami`,
    finesMore: (n) => `<i>... va yana ${n} ta jarima</i>`,
    finesError: `⚠️ <i>Jarima ma'lumotlarini olishda xato</i>`,
    taxTitle: `💰 <b>Soliq holati</b>`,
    taxNone: `✅ Soliq qarzi yo'q`,
    taxDebt: `❌ Umumiy qarz`,
    taxType: `Soliq turi`,
    taxDue: `To'lash muddati`,
    taxError: `⚠️ <i>Soliq ma'lumotlarini olishda xato</i>`,
    techTitle: `🔧 <b>Texnik ko'rik (Texosmotr)</b>`,
    techExpiry: `📅 Muddati`,
    techExpired: (days) => `❌ Muddati <b>${days} kun</b> oldin o'tgan!`,
    techSoon: (days) => `⚠️ Muddatga <b>${days} kun</b> qoldi`,
    techValid: (days) => `✅ Amal qilish muddati: <b>${days} kun</b>`,
    techLast: `🔍 So'nggi tekshiruv`,
    techNext: `📆 Keyingi tekshiruv`,
    techError: `⚠️ <i>Texosmotr ma'lumotlarini olishda xato</i>`,
    tonirovkaTitle: `🪟 <b>Tonirovka ruxsatnomasi</b>`,
    tonirovkaExpired: (days) => `❌ Muddati <b>${days} kun</b> oldin o'tgan!`,
    tonirovkaSoon: (days) => `⚠️ Muddatga <b>${days} kun</b> qoldi`,
    tonirovkaValid: (days) => `✅ Amal qilish muddati: <b>${days} kun</b>`,
    tonirovkaIssued: `📋 Berilgan sana`,
    tonirovkaLight: `💡 Yorug'lik o'tkazuvchanligi`,
    tonirovkaIssuedBy: `🏢 Berilgan joy`,
    tonirovkaCert: `🔢 Raqam`,
    tonirovkaError: `⚠️ <i>Tonirovka ma'lumotlarini olishda xato</i>`,
    carBrand: `🚙 <b>Avtomobil</b>`,
    carYear: `📋 <b>Yil</b>`,
    carColor: `🎨 <b>Rang</b>`,

    keyboardFines: (n) => n > 0 ? `🚨 Jarimalar (${n})` : `✅ Jarima yo'q`,
    keyboardTax: (debt, amt) => debt > 0 ? `❌ Qarz: ${amt} so'm` : `✅ Soliq to'liq`,
    keyboardTech: (valid) => valid === false ? `❌ Texosmotr o'tgan` : `✅ Texosmotr amal qiladi`,
    keyboardTonirovka: (valid) => valid === false ? `❌ Tonirovka o'tgan` : `🪟 Tonirovka amal qiladi`,
    keyboardRefresh: `🔄 Yangilash`,
  },

  ru: {
    welcome: (name) =>
      `👋 Привет, <b>${name}</b>!\n\n` +
      `🚗 Добро пожаловать в <b>Avto Tekshiruv Bot</b>!\n\n` +
      `Через этот бот вы можете узнать:\n\n` +
      `🚨 <b>Штрафы</b> — неоплаченные и оплаченные\n` +
      `💰 <b>Налоговые долги</b> — статус транспортного налога\n` +
      `🔧 <b>Техосмотр</b> — срок технического осмотра\n` +
      `🪟 <b>Тонировка</b> — срок действия разрешения\n\n` +
      `📝 Отправьте номер автомобиля:\n` +
      `<code>01A123BC</code> или <code>01456AAA</code>\n\n` +
      `🔹 /help — помощь\n` +
      `🔹 /history — история запросов\n` +
      `🔹 /eslatma — напоминания о сроках\n` +
      `🔹 /til — изменить язык`,

    help:
      `ℹ️ <b>Помощь</b>\n\n` +
      `<b>Форматы номеров:</b>\n` +
      `• <code>01A123BC</code> — формат 1\n` +
      `• <code>01456AAA</code> — формат 2\n\n` +
      `<b>Несколько номеров:</b>\n` +
      `• <code>01A123BC, 01456AAA</code> — разделите запятой\n\n` +
      `<b>Команды:</b>\n` +
      `🔹 /start — начало\n` +
      `🔹 /help — эта помощь\n` +
      `🔹 /history — последние 10 запросов\n` +
      `🔹 /eslatma <code>01A123BC</code> — добавить/убрать напоминание\n` +
      `🔹 /til — изменить язык (uz/ru)\n\n` +
      `Данные кешируются. Нажмите 🔄 для обновления.`,

    invalidPlate:
      `❌ <b>Неверный номер автомобиля</b>\n\n` +
      `Правильные форматы:\n` +
      `• <code>01A123BC</code> — формат 1\n` +
      `• <code>01456AAA</code> — формат 2\n` +
      `• <code>01A123BC, 01456AAA</code> — несколько номеров\n\n` +
      `Пожалуйста, попробуйте снова.`,

    checking: (plate) => `🔍 Проверяем <code>${plate}</code>...\n⏳ Пожалуйста, подождите...`,
    checkingMultiple: (count) => `🔍 Проверяем <b>${count}</b> номера...\n⏳ Пожалуйста, подождите...`,

    error: `⚠️ Ошибка при получении данных.\nПожалуйста, попробуйте позже.`,

    historyEmpty: `📭 Запросов пока нет.\n\nОтправьте номер автомобиля.`,
    historyTitle: `📋 <b>История запросов (последние 10):</b>\n\n`,

    watchListEmpty:
      `🔔 <b>Список напоминаний пуст</b>\n\n` +
      `Чтобы добавить напоминание:\n<code>/eslatma 01A123BC</code>`,
    watchListTitle: `🔔 <b>Отслеживаемые номера:</b>\n\n`,
    watchListRemoveHint: `\nУдалить: <code>/eslatma 01A123BC</code>`,
    watchAdded: (plate) => `🔔 <code>${plate}</code> добавлен в список напоминаний.\n\nБуду напоминать при приближении сроков.`,
    watchRemoved: (plate) => `🔕 <code>${plate}</code> удалён из списка напоминаний.`,
    watchLimit: `⚠️ Можно отслеживать максимум 5 номеров.`,
    watchInvalidPlate: `❌ Неверный формат номера автомобиля.`,

    phoneRequest:
      `📱 <b>Поделитесь номером телефона</b>\n\n` +
      `Для использования бота нужно один раз поделиться номером телефона.\n` +
      `Нажмите кнопку ниже:`,
    phoneButton: `📱 Поделиться номером`,
    phoneReceived: (name) =>
      `✅ Спасибо, <b>${name}</b>! Ваш номер сохранён.\n\n` +
      `Теперь вы можете пользоваться ботом 🚗`,
    langChanged: `✅ Язык изменён: <b>Русский язык</b> 🇷🇺`,
    langSelect:
      `🌐 <b>Tilni tanlang / Выберите язык</b>\n\n` +
      `🇺🇿 /til_uz — O'zbek tili\n` +
      `🇷🇺 /til_ru — Русский язык`,

    blocked: `Вы заблокированы и не можете использовать бота.`,
    userNotFound: `Пользователь не найден.`,
    adminOnly: `⛔ Эта команда только для администраторов.`,

    dataSource: `📊 Данные получены из государственных баз`,
    tashkentTime: `Ташкент`,
    currency: `сум`,
    noData: `Данные не найдены`,
    finesNone: `✅ Штрафов нет`,
    finesTitle: (count) => `🚨 <b>Штрафы</b> (${count} шт.)`,
    finesTotal: `💵 Итого`,
    finesMore: (n) => `<i>... и ещё ${n} штрафа(ов)</i>`,
    finesError: `⚠️ <i>Ошибка при получении данных о штрафах</i>`,
    taxTitle: `💰 <b>Налоговый статус</b>`,
    taxNone: `✅ Налоговых долгов нет`,
    taxDebt: `❌ Общий долг`,
    taxType: `Вид налога`,
    taxDue: `Срок оплаты`,
    taxError: `⚠️ <i>Ошибка при получении данных о налогах</i>`,
    techTitle: `🔧 <b>Технический осмотр</b>`,
    techExpiry: `📅 Срок действия`,
    techExpired: (days) => `❌ Срок истёк <b>${days} дней</b> назад!`,
    techSoon: (days) => `⚠️ До окончания срока <b>${days} дней</b>`,
    techValid: (days) => `✅ Действителен ещё <b>${days} дней</b>`,
    techLast: `🔍 Последний осмотр`,
    techNext: `📆 Следующий осмотр`,
    techError: `⚠️ <i>Ошибка при получении данных о техосмотре</i>`,
    tonirovkaTitle: `🪟 <b>Разрешение на тонировку</b>`,
    tonirovkaExpired: (days) => `❌ Срок истёк <b>${days} дней</b> назад!`,
    tonirovkaSoon: (days) => `⚠️ До окончания срока <b>${days} дней</b>`,
    tonirovkaValid: (days) => `✅ Действительна ещё <b>${days} дней</b>`,
    tonirovkaIssued: `📋 Дата выдачи`,
    tonirovkaLight: `💡 Светопропускаемость`,
    tonirovkaIssuedBy: `🏢 Место выдачи`,
    tonirovkaCert: `🔢 Номер`,
    tonirovkaError: `⚠️ <i>Ошибка при получении данных о тонировке</i>`,
    carBrand: `🚙 <b>Автомобиль</b>`,
    carYear: `📋 <b>Год</b>`,
    carColor: `🎨 <b>Цвет</b>`,

    keyboardFines: (n) => n > 0 ? `🚨 Штрафы (${n})` : `✅ Штрафов нет`,
    keyboardTax: (debt, amt) => debt > 0 ? `❌ Долг: ${amt} сум` : `✅ Налог оплачен`,
    keyboardTech: (valid) => valid === false ? `❌ Техосмотр истёк` : `✅ Техосмотр действителен`,
    keyboardTonirovka: (valid) => valid === false ? `❌ Тонировка истекла` : `🪟 Тонировка действительна`,
    keyboardRefresh: `🔄 Обновить`,
  },
};

function getLang(user) {
  if (!user) return 'uz';
  const code = user.languageCode || 'uz';
  return code.startsWith('ru') ? 'ru' : 'uz';
}

function t(key, lang = 'uz', ...args) {
  const m = messages[lang] || messages.uz;
  const value = m[key];
  if (typeof value === 'function') return value(...args);
  return value || messages.uz[key] || key;
}

module.exports = { t, getLang, messages };
