-- =============================================
-- MIGRATION: products_customer_id_repair
-- Completa a migração se a anterior falhou no meio
-- =============================================

DELETE FROM public.products
WHERE customer_id IS NULL;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS customer_name;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'customer_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.products
      ALTER COLUMN customer_id SET NOT NULL;
  END IF;
END $$;

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
