-- Chek raqami (1, 2, 3, ...) va oluvchi ma'lumotlari savdo bilan birga saqlanadi.
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS customer text CHECK (char_length(customer) <= 100);
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS phone text CHECK (char_length(phone) <= 30);
ALTER TABLE public.pos_sales ADD COLUMN IF NOT EXISTS check_no bigint;

CREATE SEQUENCE IF NOT EXISTS public.pos_sale_check_no_seq START 1;
GRANT USAGE, SELECT ON SEQUENCE public.pos_sale_check_no_seq TO service_role;

-- Eski savdolarga vaqt tartibida 1 dan raqam beriladi.
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS n
  FROM public.pos_sales WHERE check_no IS NULL
)
UPDATE public.pos_sales p
SET check_no = numbered.n + COALESCE((SELECT max(check_no) FROM public.pos_sales), 0)
FROM numbered WHERE p.id = numbered.id;

SELECT setval('public.pos_sale_check_no_seq',
  GREATEST(COALESCE((SELECT max(check_no) FROM public.pos_sales), 0), 1),
  (SELECT max(check_no) FROM public.pos_sales) IS NOT NULL);

ALTER TABLE public.pos_sales ALTER COLUMN check_no SET DEFAULT nextval('public.pos_sale_check_no_seq');
ALTER TABLE public.pos_sales ALTER COLUMN check_no SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pos_sales_check_no_idx ON public.pos_sales(check_no);

NOTIFY pgrst, 'reload schema';
