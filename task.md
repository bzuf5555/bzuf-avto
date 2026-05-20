# Vazifalar (Tasks)

## 🔴 Yuqori Prioritet

- [ ] **TASK-001**: MongoDB Atlas bepul klaster yaratish va `MONGODB_URI` olish
  - Atlas.mongodb.com saytiga kiring
  - M0 Free klaster yarating
  - Connection string oling va `.env` fayliga qo'ying

- [ ] **TASK-002**: Netlify saytini bog'lash
  - netlify.com'da yangi sayt yarating
  - GitHub repo bilan bog'lang (`https://github.com/bzuf5555/bzuf-avto.git`)
  - Environment variables (`BOT_TOKEN`, `MONGODB_URI`) Netlify dashboard'da o'rnating

- [ ] **TASK-003**: Telegram Webhook o'rnatish
  - Deploy bo'lgandan keyin quyidagi URL'ga so'rov yuboring:
  ```
  https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<NETLIFY_URL>/.netlify/functions/bot
  ```

- [ ] **TASK-004**: Real API integratsiya
  - e.jarima.uz API kaliti olish
  - soliq.uz API kaliti olish
  - my.gov.uz developer portaliga ro'yxatdan o'tish

## 🟡 O'rta Prioritet

- [ ] **TASK-005**: Rate limiting sozlash
  - Foydalanuvchi boshiga soatiga 20 so'rov chegarasi
  - Spamdan himoya qilish

- [ ] **TASK-006**: Admin panel buyruqlari
  - `/stats` — bot statistikasi
  - `/broadcast` — barcha foydalanuvchilarga xabar yuborish
  - `/users` — foydalanuvchilar ro'yxati

- [ ] **TASK-007**: So'rov tarixi funksionalligi
  - Foydalanuvchi o'z so'rovlar tarixini ko'rishi
  - `/history` buyrug'i

- [ ] **TASK-008**: Notifikatsiyalar
  - Texosmotr muddati yaqinlashganda eslatma
  - Yangi jarima qo'shilganda xabar

## 🟢 Past Prioritet

- [ ] **TASK-009**: Ko'p til qo'llab-quvvatlash
  - O'zbek (asosiy)
  - Rus tili

- [ ] **TASK-010**: To'lov integratsiyasi (kelajak uchun)
  - Premium rejim uchun Click yoki Payme

- [ ] **TASK-011**: Avtomobil solishtirish funksiyasi
  - Bir nechta davlat raqamini bir vaqtda tekshirish

## 📋 Texnik Qarzdorliklar

- [ ] **TECH-001**: API response keshini optimallashtrish
- [ ] **TECH-002**: Serverless cold start vaqtini kamaytirish
- [ ] **TECH-003**: MongoDB indexlar optimallashtirish
- [ ] **TECH-004**: Error monitoring (Sentry yoki o'xshash bepul servis)

---
*Fayl yangilangan: 2026-05-20*
