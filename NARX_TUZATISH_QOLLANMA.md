# Kelishilgan sotuv narxi — tuzatish

## Xato sababi
`src/store/saleSlice.js` savatdagi narxni o‘zgartirgan, ammo Supabase `complete_pos_sale` SQL funksiyasi `v_price := (v_product->>'price')::numeric` orqali katalog narxini qayta olib, chek va savdoni eski narxda saqlagan.

## Nima o‘zgardi
- `supabase/migrations/20261113000000_use_sale_item_price.sql` — SQL funksiyasi har bir itemning `price` qiymatini oladi, tekshiradi va savdo summasini shu narxda hisoblaydi.
- `src/store/saleSlice.js` — narx kiritishni tekshirish kuchaytirildi.
- Katalogdagi asosiy narx o‘zgarmaydi. Oldingi savdolar qayta hisoblanmaydi.

## VS Code va Supabase
1. ZIPni oching, `Novvot-Market-main` papkasini VS Code’da **File > Open Folder** orqali oching.
2. Terminalda `npm install` va `npm run dev` bajaring. Node.js 22.12+ kerak.
3. Supabase Dashboard > SQL Editor > New query bo‘limida `supabase/migrations/20261113000000_use_sale_item_price.sql` faylining **butun matnini** joylashtirib **Run** bosing. Buni faqat loyihangiz ulangan to‘g‘ri Supabase bazasida bajaring. Migratsiya Supabase CLI bilan avval qo‘llangan bo‘lsa, takrorlamang.
4. Sayt hostingda ishlayotgan bo‘lsa, yangilangan frontendni ham deploy qiling. Edge Function o‘zgarmagan, qayta deploy shart emas.
5. Sinov: katalog narxi 14 000; savatda 13 000; miqdor 2. Mahsulot jami 26 000, chek jami 26 000, savdo tarixida 26 000 bo‘lishi kerak.

**Muhim:** Faqat ZIPni ochish Supabase’dagi SQL funksiyani yangilamaydi. SQL migratsiyani bajarish shart.
