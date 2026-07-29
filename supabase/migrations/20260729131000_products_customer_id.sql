-- =============================================
-- MIGRATION: products_customer_id
-- Substitui customer_name por FK customer_id
-- =============================================

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_customer_name_not_empty;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT;

DO $$
DECLARE
  product_row RECORD;
  matched_customer_id UUID;
  has_customer_name BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'customer_name'
  ) INTO has_customer_name;

  IF NOT has_customer_name THEN
    RETURN;
  END IF;

  FOR product_row IN
    SELECT id, created_by, trim(customer_name) AS customer_name
    FROM public.products
    WHERE customer_id IS NULL
      AND customer_name IS NOT NULL
      AND char_length(trim(customer_name)) > 0
  LOOP
    SELECT c.id
    INTO matched_customer_id
    FROM public.customers c
    WHERE c.created_by = product_row.created_by
      AND lower(trim(c.name)) = lower(product_row.customer_name)
    ORDER BY c.created_at ASC
    LIMIT 1;

    IF matched_customer_id IS NULL THEN
      INSERT INTO public.customers (created_by, name, phone, birth_date)
      VALUES (
        product_row.created_by,
        product_row.customer_name,
        '0000000000',
        '1990-01-01'
      )
      RETURNING id INTO matched_customer_id;
    END IF;

    UPDATE public.products
    SET customer_id = matched_customer_id
    WHERE id = product_row.id;
  END LOOP;
END $$;

DELETE FROM public.products
WHERE customer_id IS NULL;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS customer_name;

ALTER TABLE public.products
  ALTER COLUMN customer_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS products_customer_id_idx ON public.products(customer_id);

DROP POLICY IF EXISTS "Usuário insere seus produtos" ON public.products;
DROP POLICY IF EXISTS "Usuário atualiza seus produtos" ON public.products;

CREATE POLICY "Usuário insere seus produtos"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Usuário atualiza seus produtos"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id AND c.created_by = auth.uid()
    )
  );
