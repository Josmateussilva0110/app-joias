-- ============================================================
-- MIGRATION: product_analytics_function
-- Agrega analytics de vendas no SQL (evita full scan em Node).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_product_analytics(
  p_customer_name text DEFAULT NULL,
  p_jewelry_type text DEFAULT NULL,
  p_payment text DEFAULT 'all',
  p_month int DEFAULT NULL,
  p_year int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT
      p.value,
      p.payment_status,
      p.jewelry_type,
      p.created_at,
      COALESCE(c.name, 'Cliente') AS customer_name
    FROM public.products p
    LEFT JOIN public.customers c ON c.id = p.customer_id
    WHERE
      (p_customer_name IS NULL OR c.name ILIKE '%' || p_customer_name || '%')
      AND (p_jewelry_type IS NULL OR p.jewelry_type ILIKE '%' || p_jewelry_type || '%')
      AND (
        p_payment = 'all'
        OR (p_payment = 'paid' AND p.payment_status = true)
        OR (p_payment = 'unpaid' AND p.payment_status = false)
      )
      AND (
        (p_year IS NULL AND p_month IS NULL)
        OR (
          p_year IS NOT NULL
          AND p_month IS NOT NULL
          AND p.created_at >= make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'UTC')
          AND p.created_at < (
            CASE
              WHEN p_month = 12 THEN make_timestamptz(p_year + 1, 1, 1, 0, 0, 0, 'UTC')
              ELSE make_timestamptz(p_year, p_month + 1, 1, 0, 0, 0, 'UTC')
            END
          )
        )
        OR (
          p_year IS NOT NULL
          AND p_month IS NULL
          AND p.created_at >= make_timestamptz(p_year, 1, 1, 0, 0, 0, 'UTC')
          AND p.created_at < make_timestamptz(p_year + 1, 1, 1, 0, 0, 0, 'UTC')
        )
        OR (
          p_year IS NULL
          AND p_month IS NOT NULL
          AND EXTRACT(MONTH FROM p.created_at)::int = p_month
          AND EXTRACT(YEAR FROM p.created_at)::int >= 2026
          AND EXTRACT(YEAR FROM p.created_at)::int <= EXTRACT(YEAR FROM NOW())::int
        )
      )
  ),
  summary AS (
    SELECT
      COUNT(*)::int AS count,
      COALESCE(SUM(value), 0)::float8 AS total,
      COALESCE(SUM(value) FILTER (WHERE NOT payment_status), 0)::float8 AS unpaid_total,
      COUNT(*) FILTER (WHERE NOT payment_status)::int AS unpaid_count,
      COALESCE(SUM(value) FILTER (WHERE payment_status), 0)::float8 AS paid_total,
      COUNT(*) FILTER (WHERE payment_status)::int AS paid_count
    FROM filtered
  ),
  trend AS (
    SELECT
      m.month,
      CASE m.month
        WHEN 1 THEN 'Jan'
        WHEN 2 THEN 'Fev'
        WHEN 3 THEN 'Mar'
        WHEN 4 THEN 'Abr'
        WHEN 5 THEN 'Mai'
        WHEN 6 THEN 'Jun'
        WHEN 7 THEN 'Jul'
        WHEN 8 THEN 'Ago'
        WHEN 9 THEN 'Set'
        WHEN 10 THEN 'Out'
        WHEN 11 THEN 'Nov'
        WHEN 12 THEN 'Dez'
      END AS label,
      COALESCE(SUM(f.value), 0)::float8 AS total,
      COUNT(f.value)::int AS count
    FROM generate_series(1, 12) AS m(month)
    LEFT JOIN filtered f
      ON EXTRACT(MONTH FROM f.created_at)::int = m.month
      AND EXTRACT(YEAR FROM f.created_at)::int = COALESCE(p_year, EXTRACT(YEAR FROM NOW())::int)
    GROUP BY m.month
    ORDER BY m.month
  ),
  top_jewelry AS (
    SELECT
      jewelry_type AS name,
      SUM(value)::float8 AS total,
      COUNT(*)::int AS count
    FROM filtered
    GROUP BY jewelry_type
    ORDER BY total DESC
    LIMIT 5
  ),
  top_customers AS (
    SELECT
      customer_name AS name,
      SUM(value)::float8 AS total,
      COUNT(*)::int AS count
    FROM filtered
    GROUP BY customer_name
    ORDER BY total DESC
    LIMIT 5
  )
  SELECT jsonb_build_object(
    'summary', jsonb_build_object(
      'count', s.count,
      'total', s.total,
      'average_ticket', CASE WHEN s.count > 0 THEN s.total / s.count ELSE 0 END,
      'unpaid_total', s.unpaid_total,
      'unpaid_count', s.unpaid_count
    ),
    'monthly_trend', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'month', t.month,
            'label', t.label,
            'total', t.total,
            'count', t.count
          )
          ORDER BY t.month
        )
        FROM trend t
      ),
      '[]'::jsonb
    ),
    'payment_split', jsonb_build_object(
      'paid', jsonb_build_object('total', s.paid_total, 'count', s.paid_count),
      'unpaid', jsonb_build_object('total', s.unpaid_total, 'count', s.unpaid_count)
    ),
    'top_jewelry', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('name', j.name, 'total', j.total, 'count', j.count)
        )
        FROM top_jewelry j
      ),
      '[]'::jsonb
    ),
    'top_customers', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('name', c.name, 'total', c.total, 'count', c.count)
        )
        FROM top_customers c
      ),
      '[]'::jsonb
    )
  )
  FROM summary s;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_product_analytics(text, text, text, int, int) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_products_created_by_payment_created_at
  ON public.products (created_by, payment_status, created_at DESC);
