-- =============================================
-- MIGRATION: products_created_by_payment_status
-- Para quem já aplicou a versão anterior com user_id
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN user_id TO created_by;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pago', 'devendo');
  END IF;
END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'devendo';

DROP INDEX IF EXISTS public.products_user_id_idx;
DROP INDEX IF EXISTS public.products_user_created_at_idx;

CREATE INDEX IF NOT EXISTS products_created_by_idx ON public.products(created_by);
CREATE INDEX IF NOT EXISTS products_created_by_created_at_idx ON public.products(created_by, created_at DESC);

DROP POLICY IF EXISTS "Usuário vê seus produtos" ON public.products;
DROP POLICY IF EXISTS "Usuário insere seus produtos" ON public.products;
DROP POLICY IF EXISTS "Usuário atualiza seus produtos" ON public.products;
DROP POLICY IF EXISTS "Usuário deleta seus produtos" ON public.products;

CREATE POLICY "Usuário vê seus produtos"
  ON public.products FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Usuário insere seus produtos"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuário atualiza seus produtos"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Usuário deleta seus produtos"
  ON public.products FOR DELETE
  USING (auth.uid() = created_by);
