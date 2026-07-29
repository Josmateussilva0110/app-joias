-- =============================================
-- MIGRATION: products_rls_grants
-- Garante que RLS isole registros por usuário
-- =============================================

ALTER TABLE public.products
  ALTER COLUMN created_by SET DEFAULT auth.uid();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT USAGE ON TYPE public.jewelry_type TO authenticated;

DROP POLICY IF EXISTS "Usuário atualiza seus produtos" ON public.products;

CREATE POLICY "Usuário atualiza seus produtos"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
