-- ============================================================
-- MIGRATION: products_filter_months_function
-- Meses distintos com vendas do usuário (via RLS).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_product_months(filter_year int DEFAULT NULL)
RETURNS TABLE(month int)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT EXTRACT(MONTH FROM created_at)::int AS month
  FROM public.products
  WHERE filter_year IS NULL
     OR EXTRACT(YEAR FROM created_at)::int = filter_year
  ORDER BY month;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_product_months(int) TO authenticated;
