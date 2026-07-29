-- =============================================
-- MIGRATION: create_products
-- Vendas/registros de joias por usuário
-- =============================================

CREATE TYPE public.jewelry_type AS ENUM (
  'colar',
  'brinco',
  'pulseira',
  'anel',
  'tornozeleira',
  'broche',
  'relogio',
  'conjunto',
  'bracelete',
  'outro'
);

CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID NOT NULL DEFAULT auth.uid() REFERENCES public.users(id) ON DELETE CASCADE,
  jewelry_type    public.jewelry_type NOT NULL,
  customer_name   TEXT NOT NULL,
  value           NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  payment_status  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT products_customer_name_not_empty CHECK (char_length(trim(customer_name)) > 0)
);

CREATE INDEX IF NOT EXISTS products_created_by_idx ON public.products(created_by);
CREATE INDEX IF NOT EXISTS products_created_by_created_at_idx ON public.products(created_by, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT USAGE ON TYPE public.jewelry_type TO authenticated;

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
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuário deleta seus produtos"
  ON public.products FOR DELETE
  USING (auth.uid() = created_by);
