-- =============================================
-- MIGRATION: create_customers
-- Clientes cadastrados por usuário
-- =============================================

CREATE TABLE IF NOT EXISTS public.customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   UUID NOT NULL DEFAULT auth.uid() REFERENCES public.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  birth_date   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT customers_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT customers_phone_not_empty CHECK (char_length(trim(phone)) > 0)
);

CREATE INDEX IF NOT EXISTS customers_created_by_idx ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS customers_created_by_created_at_idx ON public.customers(created_by, created_at DESC);

DROP TRIGGER IF EXISTS customers_set_updated_at ON public.customers;
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

DROP POLICY IF EXISTS "Usuário vê seus clientes" ON public.customers;
DROP POLICY IF EXISTS "Usuário insere seus clientes" ON public.customers;
DROP POLICY IF EXISTS "Usuário atualiza seus clientes" ON public.customers;
DROP POLICY IF EXISTS "Usuário deleta seus clientes" ON public.customers;

CREATE POLICY "Usuário vê seus clientes"
  ON public.customers FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Usuário insere seus clientes"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuário atualiza seus clientes"
  ON public.customers FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuário deleta seus clientes"
  ON public.customers FOR DELETE
  USING (auth.uid() = created_by);
