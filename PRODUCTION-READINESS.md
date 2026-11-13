# Production readiness — Novvot Market

## Ushbu paketda bajarilgan ishlar

- Loyiha metadata nomi `novvot-market` qilib yangilandi.
- README Novvot Market nomi va joriy React/Vite/Supabase arxitekturasiga moslashtirildi.
- `.env` arxivdan chiqarildi; faqat placeholder qiymatli `.env.example` qoldirildi.
- `node_modules` va build artefaktlari yakuniy ZIPga kiritilmaydi.
- ESLint'dagi takroriy `gramm` aliasi olib tashlandi.
- `useIsMobile` hook'i `useSyncExternalStore` asosida qayta yozildi.
- Admin sahifalari lazy loading'ga o'tkazildi; React, Redux, Supabase va chart dependency'lari alohida chunk'larga ajratildi.
- Birinchi admin paroli va keyingi yangi parol uchun kamida 12 belgi tekshiruvi qo'shildi.
- Supabase setup SQL'dagi buyurtma/aksiya jadvallarini o'chiradigan DROP va sozlamalarni o'chiradigan DELETE olib tashlandi. `orders`, `promotions`, sequence va private receipt bucket yaratilishi ta'minlandi.
- Boshqa biznesga tegishli Xonqa/Tandir demo mahsulotlari setup'dan chiqarildi; yangi katalog admin paneldan kiritiladi.
- Mavjud POS savdolar, mahsulotlar, buyurtmalar va sozlamalarni saqlashga yo'naltirildi.

## Deploy oldidan

1. `.env.example` dan `.env` yarating va o'zingizning Supabase URL/publishable key qiymatlaringizni kiriting.
2. Supabase production bazasini backup qiling.
3. `supabase/setup.sql` ni avval staging'da, keyin tekshiruvdan so'ng production'da bajaring.
4. `supabase functions deploy api` bilan Edge Function'ni yangilang.
5. Supabase Edge Function Secrets ichida `ADMIN_INITIAL_LOGIN` va kamida 12 belgili `ADMIN_INITIAL_PASSWORD` ni sozlang. Service role kaliti faqat server secret bo'lib qolishi kerak.
6. Hosting'da `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` ni kiriting va SPA fallback/HTTPS ni yoqing.
7. Haqiqiy production muhitida login, mahsulot CRUD, savdo, qoldiq, savdo tarixi va printer oqimini tekshiring.

## Xavfsizlik bo'yicha qolgan ishlar

- Edge Function `verify_jwt = false`; admin endpointlar maxsus sessiya tokeni bilan tekshiriladi. Public endpointlar uchun rate limiting va bot/abuse protection qo'shish kerak.
- CORS hozir `*`; production domen(lar)i bilan cheklash tavsiya etiladi.
- Admin parol hash'i legacy SHA-256 formatida. Mavjud credential'larni buzmaslik uchun bu paketda hash format migratsiyasi qilinmadi; Argon2id yoki PBKDF2 va login throttling alohida migratsiya talab qiladi.
- SQL va Edge Function o'zgarishlarini haqiqiy production ma'lumotlar bazasida tekshirish ushbu lokal paket auditi doirasiga kirmaydi.

## Tekshiruv natijalari

- ESLint: muvaffaqiyatli, 0 error va 0 warning.
- Prettier: barcha fayllar format tekshiruvidan o'tdi.
- Node testlari: 22/22 muvaffaqiyatli.
- Vite production build: muvaffaqiyatli; sahifalar va yirik vendor kutubxonalari alohida chunk'larga ajratildi.
- `npm ci` audit muhitida npm registry'ga ulanish vaqtida timeout bo'ldi. Shu sababli `npm audit` va toza install'dan keyingi `npm run check` bu muhitda tasdiqlanmadi. ZIP ichida `node_modules` yo'q; deploydan oldin internetga ulangan muhitda `npm ci` va `npm run check` bajaring.
- Haqiqiy Supabase project, hosting domeni va printer bilan end-to-end sinov bu lokal audit doirasiga kirmaydi.
