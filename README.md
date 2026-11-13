# Novvot Market — Kassa va boshqaruv tizimi

Novvot Market — React 19, Vite 7 va Supabase asosida ishlaydigan savdo/POS boshqaruv ilovasi. Frontend `src/` ichida JSX, backend amallari esa Supabase Edge Function orqali bajariladi.

## Texnologiyalar

- React 19 + Vite 7
- React Router 7 va Redux Toolkit
- Tailwind CSS 4
- Supabase PostgreSQL, Storage va Edge Functions
- ESLint, Prettier va Node.js test runner

## Talablar

- Node.js `22.12.0` yoki yangiroq
- npm (Node.js bilan birga keladi)
- Supabase loyihasi
- Supabase CLI (Edge Function deploy qilish uchun)

## Lokal ishga tushirish

1. ZIP arxivni oching va loyiha papkasiga kiring.
2. `.env.example` nusxasidan `.env` yarating.
3. `.env` ichiga Supabase project URL va publishable key qiymatlarini kiriting:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
   VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
   ```

4. Dependency'larni lockfile bo'yicha o'rnating:

   ```bash
   npm ci
   ```

5. Development server:

   ```bash
   npm run dev
   ```

6. Production build:

   ```bash
   npm run build
   npm run preview
   ```

## Sahifalar

- `/` — boshqaruv paneli
- `/pos` — yangi savdo / kassa
- `/categories` — kategoriyalar
- `/products` — mahsulotlar va qoldiq
- `/sales` — saqlangan savdolar
- `/stats` — statistika
- `/settings` — sozlamalar
- `/login` — administrator kirishi

## Supabase sozlash

> Production bazada SQL bajarishdan oldin backup oling. `supabase/setup.sql` qayta bajarishga moslab yozilgan va mavjud POS savdolar, mahsulotlar, buyurtmalar hamda sozlamalarni o'chirmaydi. Shunga qaramay, avval staging loyihada tekshirish tavsiya etiladi.

1. Supabase SQL Editor'da `supabase/setup.sql` faylini to'liq bajaring.
2. Yangi baza bo'lsa, katalog bo'sh bo'ladi: admin paneldan Novvot Market kategoriyalari va mahsulotlarini kiriting. Setup skript boshqa biznesga tegishli demo mahsulotlarni avtomatik qo'shmaydi.
3. Supabase CLI orqali project'ni ulang va Edge Function'ni deploy qiling:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_ID
   supabase functions deploy api
   ```

4. Supabase Dashboard → Edge Functions → Secrets ichida quyidagilarni sozlang:

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_INITIAL_LOGIN`
   - `ADMIN_INITIAL_PASSWORD` — kamida 12 belgi

   `SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` odatda Supabase muhitida mavjud bo'ladi; mavjudligini tekshiring. Birinchi admin loginidan keyin admin paneldan login/parolni yangilang.

5. Frontend hosting sozlamalarida `.env` dagi uchta `VITE_` o'zgaruvchini kiriting.
6. Hosting'da HTTPS yoqing va SPA fallback/rewrite'ni `index.html` ga yo'naltiring. Aks holda `/pos`, `/products` kabi ichki URL'larni sahifani yangilaganda hosting 404 qaytarishi mumkin.
7. Deploydan keyin `/login` orqali kirib, mahsulot qo'shish, savdo saqlash, qoldiq kamayishi, savdo tarixi va chek chop etishni real muhitda tekshiring.

### Muhim xavfsizlik qoidalari

- `VITE_` bilan boshlangan qiymatlar brauzerga yuboriladi. U yerga faqat Supabase URL va publishable key qo'ying.
- `SUPABASE_SERVICE_ROLE_KEY` va `ADMIN_INITIAL_PASSWORD` ni hech qachon `.env`, Git yoki frontend kodiga joylamang. Faqat Supabase Edge Function Secrets'da saqlang.
- `.env` Git'ga qo'shilmasligi kerak. `.env.example` faqat placeholder qiymatlarni saqlaydi.
- Storage'dagi `order-receipts` bucket private; chek fayllari Edge Function orqali yuklanadi va vaqtinchalik signed URL bilan ko'rsatiladi.
- `supabase/functions/api` hozir `verify_jwt = false` bilan ishlaydi: administrator amallari Edge Function ichidagi admin sessiya tekshiruvi bilan himoyalangan. Public endpointlar uchun production trafikda rate limiting/abuse protection qo'shish va CORS originlarini hosting domeniga cheklash tavsiya etiladi.
- Admin parolining joriy hash mexanizmi legacy SHA-256 formatida. Ishlayotgan admin credential'larini buzmaslik uchun avtomatik o'zgartirilmadi; kuchli password policy, rate limiting va Argon2id/PBKDF2 migratsiyasi alohida xavfsizlik ishi sifatida bajarilishi kerak.

## Tekshiruv buyruqlari

```bash
npm run lint
npm run format:check
npm test
npm run build
npm run check
```

`npm run check` yuqoridagi lint, format, test va production build bosqichlarini ketma-ket bajaradi.

## Chek chop etish

POS chek chop etish oynasi hozir 80 mm termal qog'ozga mo'ljallangan. Printer drayverida 80 mm roll/qog'oz o'lchamini tanlang. 58 mm yoki 50 mm printerda chop etishdan oldin `src/admin/lib/print-receipt.js` dagi sahifa kengligi va chek layoutini moslashtirish kerak.

## Papkalar

```text
src/
  admin/                 Admin sahifalari, komponentlari va POS logikasi
  components/ui/         UI komponentlari
  hooks/                 React hook'lar
  integrations/supabase/ Supabase client
  store/                 Redux store va slice'lar
  test/                  Node.js testlari
supabase/
  functions/api/         Edge Function API
  migrations/            SQL migratsiyalar
  setup.sql              To'liq idempotent schema setup
```
