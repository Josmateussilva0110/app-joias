-- =============================================
-- MIGRATION: customers_phone_format
-- Telefone com 10 ou 11 dígitos numéricos
-- =============================================

ALTER TABLE public.customers
  DROP CONSTRAINT IF EXISTS customers_phone_format_check;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_phone_format_check
  CHECK (
    phone ~ '^\d{10}$'
    OR (
      phone ~ '^\d{11}$'
      AND substring(phone, 3, 1) = '9'
    )
  );
