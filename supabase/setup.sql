-- Novvot Market: Supabase > SQL Editor ga to'liq nusxalab Run bosing.
-- Script qayta bajarishga mos: mavjud mahsulotlar, buyurtmalar, sozlamalar va POS savdolarini o'chirmaydi.
CREATE TABLE IF NOT EXISTS public.categories (id text PRIMARY KEY, data jsonb NOT NULL, sort int NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS public.products (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.promotions (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1001;
CREATE TABLE IF NOT EXISTS public.orders (id text PRIMARY KEY DEFAULT nextval('public.order_number_seq')::text, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.app_settings (key text PRIMARY KEY, value jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS public.admin_sessions (token text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.categories, public.products, public.promotions, public.orders, public.app_settings, public.admin_sessions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Buyurtma to'lov cheklari uchun yopiq Storage bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('order-receipts', 'order-receipts', false, 9437184, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 9437184,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','application/pdf'];

-- Mahsulot va kategoriya seed ma'lumotlari ataylab kiritilmaydi:
-- Novvot Market katalogini admin panel orqali o'zingiz kiriting.

-- Mijoz profillari va savat (har bir foydalanuvchi uchun alohida). Qayta ishga tushirish xavfsiz.
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text CHECK (char_length(full_name) <= 100),
  phone text CHECK (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  birthday date CHECK (birthday > '1900-01-01' AND birthday <= current_date),
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  font_size text NOT NULL DEFAULT 'normal' CHECK (font_size IN ('small','normal','large')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.cart_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  qty int NOT NULL CHECK (qty > 0 AND qty <= 10000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.cart_items TO authenticated;
GRANT ALL ON public.profiles, public.cart_items TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "own cart" ON public.cart_items;
CREATE POLICY "own cart" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POS: avvalgi savdolar o'chirilmaydi. Yangi ustunlar qayta ishga tushirishga mos.
CREATE TABLE IF NOT EXISTS public.pos_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total numeric(14,2) NOT NULL CHECK (total >= 0),
  name text CHECK (char_length(name) <= 100),
  started_at timestamptz,
  duration_seconds integer CHECK (duration_seconds >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pos_sales TO service_role;
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS name text CHECK (char_length(name) <= 100);
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS duration_seconds integer CHECK (duration_seconds >= 0);
CREATE TABLE IF NOT EXISTS public.pos_sale_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sale_id uuid NOT NULL REFERENCES public.pos_sales(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  name text NOT NULL,
  qty numeric(14,3) NOT NULL CHECK (qty > 0),
  unit text NOT NULL CHECK (unit IN ('piece','kg','g','l','m','pack')),
  price numeric(14,2) NOT NULL CHECK (price >= 0)
);
GRANT ALL ON public.pos_sale_items TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.pos_sale_items_id_seq TO service_role;
REVOKE ALL ON public.pos_sales, public.pos_sale_items FROM anon, authenticated;
ALTER TABLE public.pos_sale_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pos_sale_items_sale_idx ON public.pos_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS pos_sales_created_idx ON public.pos_sales(created_at DESC);
DROP FUNCTION IF EXISTS public.complete_pos_sale(jsonb);
DROP FUNCTION IF EXISTS public.complete_pos_sale(jsonb, text, timestamptz);
CREATE FUNCTION public.complete_pos_sale(p_items jsonb, p_name text DEFAULT NULL, p_started_at timestamptz DEFAULT NULL)
RETURNS SETOF public.pos_sales
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_sale public.pos_sales; v_total numeric := 0; v jsonb; v_product jsonb; v_price numeric; v_qty numeric;
  v_end timestamptz := clock_timestamp(); v_start timestamptz := COALESCE(p_started_at, v_end);
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'Savdo mahsulotlari noto‘g‘ri'; END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Savdo mahsulotlari bo‘sh yoki juda ko‘p'; END IF;
  IF char_length(p_name) > 100 OR v_start > v_end THEN RAISE EXCEPTION 'Nom yoki boshlanish vaqti noto‘g‘ri'; END IF;
  INSERT INTO public.pos_sales(total,name,started_at,duration_seconds,created_at)
    VALUES(0,NULLIF(btrim(p_name),''),v_start,floor(extract(epoch FROM v_end-v_start))::integer,v_end) RETURNING * INTO v_sale;
  FOR v IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'product_id' LOOP
    SELECT data INTO v_product FROM public.products WHERE id=v->>'product_id' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Mahsulot topilmadi'; END IF;
    v_qty := (v->>'qty')::numeric; v_price := (v_product->>'price')::numeric;
    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 10000 OR v_price IS NULL OR v_price < 0 OR (v_product->>'available') = 'false' THEN RAISE EXCEPTION 'Mahsulot narxi yoki miqdori noto‘g‘ri'; END IF;
    IF COALESCE(v_product->>'unit','piece') NOT IN ('piece','kg','g','l','m','pack') THEN RAISE EXCEPTION 'Mahsulot birligi noto‘g‘ri'; END IF;
    IF COALESCE(v_product->>'unit','piece') IN ('piece','g','pack') AND v_qty<>trunc(v_qty) THEN RAISE EXCEPTION 'Dona miqdori butun son bo‘lsin'; END IF;
    INSERT INTO public.pos_sale_items(sale_id,product_id,name,qty,unit,price)
      VALUES(v_sale.id,v->>'product_id',COALESCE(v_product->'name'->>'uz',v_product->>'name',v->>'product_id'),v_qty,COALESCE(v_product->>'unit','piece'),v_price);
    v_total := v_total + v_qty*v_price;
    UPDATE public.products SET data=jsonb_set(data,'{stock}',to_jsonb(greatest(0,COALESCE((data->>'stock')::numeric,0)-v_qty))) WHERE id=v->>'product_id';
  END LOOP;
  UPDATE public.pos_sales SET total=v_total WHERE id=v_sale.id RETURNING * INTO v_sale;
  RETURN NEXT v_sale;
END; $$;
REVOKE ALL ON FUNCTION public.complete_pos_sale(jsonb,text,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_pos_sale(jsonb,text,timestamptz) TO service_role;
NOTIFY pgrst, 'reload schema';

-- Savdo holati: printed (chop etilgan), saved (saqlangan), cancelled (bekor qilingan)
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'printed';
DO $$ BEGIN
  ALTER TABLE public.pos_sales ADD CONSTRAINT pos_sales_status_check CHECK (status IN ('printed','saved','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE OR REPLACE FUNCTION public.complete_pos_sale(p_items jsonb, p_name text, p_started_at timestamptz, p_status text)
RETURNS SETOF public.pos_sales
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_sale public.pos_sales; v_status text := COALESCE(p_status,'printed');
BEGIN
  IF v_status NOT IN ('printed','saved','cancelled') THEN RAISE EXCEPTION 'Savdo holati noto‘g‘ri'; END IF;
  SELECT * INTO v_sale FROM public.complete_pos_sale(p_items,p_name,p_started_at);
  IF v_status = 'cancelled' THEN
    -- Bekor qilingan savdo omborni kamaytirmaydi
    UPDATE public.products pr SET data=jsonb_set(pr.data,'{stock}',to_jsonb(COALESCE((pr.data->>'stock')::numeric,0)+i.qty))
      FROM public.pos_sale_items i WHERE i.sale_id=v_sale.id AND pr.id=i.product_id;
  END IF;
  UPDATE public.pos_sales SET status=v_status WHERE id=v_sale.id RETURNING * INTO v_sale;
  RETURN NEXT v_sale;
END; $$;
REVOKE ALL ON FUNCTION public.complete_pos_sale(jsonb,text,timestamptz,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_pos_sale(jsonb,text,timestamptz,text) TO service_role;
NOTIFY pgrst, 'reload schema';
