# Vazifalar (Tasks)

## 🔴 Yuqori Prioritet — Siz bajarishingiz kerak

- [ ] **TASK-001**: MongoDB Atlas bepul klaster yaratish va `MONGODB_URI` olish
  1. https://atlas.mongodb.com saytiga boring
  2. "Build a Database" → **M0 Free** tanlang
  3. Region: **AWS / Frankfurt** (yaqin server)
  4. "Connect" → "Connect your application" → connection string oling
  5. `.env` faylida `MONGODB_URI=` ni yangilang
  6. Netlify dashboard'da ham `MONGODB_URI` env var o'rnating

- [ ] **TASK-002**: Netlify saytini bog'lash
  1. https://netlify.com → "Add new site" → "Import an existing project"
  2. GitHub → `bzuf5555/bzuf-avto` repo tanlang
  3. Build command: `npm install` | Publish dir: `public`
  4. Environment Variables qo'shing:
     - `BOT_TOKEN` = `8943535032:AAHIyPXvmNUUFlB391k61DGQOHuDjpXMnNI`
     - `MONGODB_URI` = (TASK-001 dan olingan)
     - `NODE_ENV` = `production`
     - `ENCRYPTION_KEY` = (32 belgili ixtiyoriy kalit)
  5. Deploy tugmasini bosing

- [ ] **TASK-003**: Telegram Webhook o'rnatish
  - TASK-001 va TASK-002 tayyor bo'lgandan keyin terminalda:
  ```
  node scripts/setup.js
  ```
  - Yoki terminal ichida: `! node scripts/setup.js`

- [ ] **TASK-004**: Real API integratsiya (ixtiyoriy — hozir mock ishlaydi)
  - e.jarima.uz → API kaliti olish
  - `.env` da `JARIMA_API_KEY` ga yozing
  - Netlify dashboard'da ham yangilang

## 🟡 O'rta Prioritet

- [ ] **TASK-009**: Ko'p til qo'llab-quvvatlash (Rus tili)
- [ ] **TASK-010**: To'lov integratsiyasi (Click/Payme)
- [ ] **TASK-011**: Bir nechta raqamni bir vaqtda tekshirish

## 📋 Qolgan Texnik Vazifalar

- [ ] **TECH-002**: Cold start optimallashtirish (qisman bajarildi)

---
*Fayl yangilangan: 2026-05-20*
