# Avto Tekshiruv Bot — Loyiha Qoidalari (CLAUDE.md)

## 1. Umumiy Qoidalar

### 1.1 Barcha instrumentlar BEPUL bo'lishi SHART
- **Telegram Bot API** — bepul (Telegram tomonidan taqdim etiladi)
- **Telegraf v4** — MIT litsenziyasi, bepul
- **MongoDB Atlas Free Tier** — 512MB bepul saqlash
- **Netlify Free Tier** — 100GB/oy bepul bandwidth, 125k funksiya chaqiruvi/oy
- **Node.js** — MIT litsenziyasi, bepul
- **Mongoose, Axios, Winston** — barcha kutubxonalar MIT/bepul
- **Birorta ham pullik API, servis yoki kutubxona ishlatilmasin**

### 1.2 Token va Sir Kalitlar Xavfsizligi
- Hech qanday token, API kalit yoki parol bevosita kodga yozilmaydi
- Barcha maxfiy ma'lumotlar `.env` faylida saqlanadi
- `.env` fayli `.gitignore`ga qo'shilishi SHART
- Faqat `.env.example` fayliga oid kalitlar nomilari yoziladi (qiymatlarsiz)
- TokenAgent moduliga barcha tokenlar MongoDB'da shifrlangan holda saqlanadi

### 1.3 Arxitektura Qoidalari
- **Agent-based arxitektura**: Har bir vazifa uchun alohida agent moduli
- **Service layer**: Tashqi API chaqiruvlar faqat service modullarida
- **Model layer**: MongoDB sxemalar faqat models/ papkasida
- **Handler layer**: Bot logikasi faqat handlers/ papkasida
- **Middleware**: Kross-cutting concerns (rate limiting, logging) middleware'da

### 1.4 Kod Sifati
- Har bir funksiya bitta vazifani bajaradi (Single Responsibility)
- Error handling barcha async funksiyalarda bo'lishi shart
- MongoDB connection pooling ishlatiladi (serverless uchun optimallashtirilgan)
- Har bir tashqi API chaqiruvi cache'lanadi (MongoDB yoki in-memory)

## 2. Texnologiya Stack

| Komponent | Texnologiya | Narx |
|-----------|-------------|------|
| Bot Framework | Telegraf v4 | BEPUL |
| Runtime | Node.js 18+ | BEPUL |
| Database | MongoDB Atlas (M0 Free) | BEPUL |
| Hosting | Netlify Functions | BEPUL |
| HTTP Client | Axios | BEPUL |
| Logging | Winston | BEPUL |
| ORM | Mongoose | BEPUL |
| Cache | node-cache + MongoDB | BEPUL |

## 3. Loyiha Tuzilmasi

```
bzuf-avto/
├── netlify/
│   └── functions/
│       └── bot.js              # Webhook endpoint (Netlify Function)
├── src/
│   ├── agents/
│   │   ├── tokenAgent.js       # API tokenlarini boshqarish
│   │   ├── fineAgent.js        # Jarima ma'lumotlari agenti
│   │   ├── taxAgent.js         # Soliq qarzi agenti
│   │   ├── techInspectionAgent.js  # Texosmotr agenti
│   │   └── cacheAgent.js       # Kesh boshqaruv agenti
│   ├── services/
│   │   ├── carService.js       # Asosiy avtomobil ma'lumotlari
│   │   ├── fineService.js      # Jarima tekshiruv servisi
│   │   ├── taxService.js       # Soliq tekshiruv servisi
│   │   └── techService.js      # Texosmotr tekshiruv servisi
│   ├── models/
│   │   ├── User.js             # Foydalanuvchi modeli
│   │   ├── Query.js            # So'rov tarixi modeli
│   │   ├── ApiToken.js         # API tokenlar modeli
│   │   └── CarCache.js         # Avto ma'lumotlar keshi
│   ├── handlers/
│   │   ├── commandHandler.js   # Bot buyruqlari
│   │   ├── messageHandler.js   # Xabar ishlovchisi
│   │   └── callbackHandler.js  # Inline keyboard callback
│   ├── middleware/
│   │   ├── rateLimiter.js      # So'rovlar chastotasini cheklash
│   │   └── userMiddleware.js   # Foydalanuvchi kuzatuvi
│   ├── utils/
│   │   ├── formatter.js        # Javob formatlash
│   │   ├── validator.js        # Davlat raqami tekshiruvi
│   │   └── logger.js           # Logging utility
│   └── config/
│       ├── database.js         # MongoDB ulanishi
│       └── bot.js              # Bot konfiguratsiyasi
├── scripts/
│   └── setup.js                # Boshlang'ich sozlash
├── CLAUDE.md                   # Bu fayl — loyiha qoidalari
├── task.md                     # Joriy vazifalar
├── done.md                     # Bajarilgan vazifalar
├── package.json
├── netlify.toml
├── .env.example
└── .gitignore
```

## 4. Git Workflow

- Asosiy branch: `main`
- Remote: `https://github.com/bzuf5555/bzuf-avto.git`
- Har bir deploy Netlify orqali avtomatik amalga oshiriladi (`main` branchga push qilinganda)
- `.env` fayli hech qachon commit qilinmaydi

## 5. Muhit O'zgaruvchilari (Environment Variables)

Barcha muhit o'zgaruvchilari `.env` faylida va Netlify dashboard'da o'rnatiladi:

- `BOT_TOKEN` — Telegram bot tokeni
- `MONGODB_URI` — MongoDB Atlas ulanish manzili
- `NODE_ENV` — `development` yoki `production`
- `CACHE_TTL` — Kesh muddati (soniyalarda, standart: 3600)
- `RATE_LIMIT_MAX` — Foydalanuvchi uchun maksimal so'rovlar (standart: 10)
- `RATE_LIMIT_WINDOW` — So'rovlar oynasi (millisekundlarda)

## 6. Xato Boshqaruvi

- Barcha tashqi API chaqiruvlar try/catch ichida bo'lishi shart
- Xato bo'lsa foydalanuvchiga tushunarli o'zbek tilida xabar beriladi
- Kritik xatolar Winston orqali loglanadi
- Tashqi API ishlamasa, kesh ma'lumotlari ishlatiladi

## 7. Ma'lumotlar Manbalari

### Joriy Integrasiyalar:
- Uzbekistan davlat xizmatlari API (my.gov.uz)
- e.jarima.uz — Jarima tekshiruvi
- soliq.uz — Soliq qarzi tekshiruvi
- yig.uz — Texosmotr ma'lumotlari

### Muhim:
- Barcha tashqi API chaqiruvlar abstract interface orqali amalga oshiriladi
- Real API kalitlari TokenAgent tomonidan boshqariladi
- Mock ma'lumotlar development muhitida ishlatiladi
