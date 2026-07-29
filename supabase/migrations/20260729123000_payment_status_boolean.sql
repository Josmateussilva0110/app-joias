-- =============================================
-- MIGRATION: payment_status_boolean
-- Converte payment_status de enum (pago/devendo) para boolean
-- true = pago, false = devendo
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'payment_status'
      AND udt_name = 'payment_status'
  ) THEN
    ALTER TABLE public.products
      ALTER COLUMN payment_status DROP DEFAULT;

    ALTER TABLE public.products
      ALTER COLUMN payment_status TYPE BOOLEAN
      USING (payment_status::text = 'pago');

    ALTER TABLE public.products
      ALTER COLUMN payment_status SET DEFAULT false;
  END IF;
END $$;

DROP TYPE IF EXISTS public.payment_status;
