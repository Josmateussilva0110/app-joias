-- ============================================================
-- MIGRATION: products_list_years_function
-- Retorna anos distintos das vendas do usuário (via RLS).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_product_years()
RETURNS TABLE(year int)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS year
  FROM public.products
  WHERE EXTRACT(YEAR FROM created_at)::int >= 2026
  ORDER BY year DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_product_years() TO authenticated;
