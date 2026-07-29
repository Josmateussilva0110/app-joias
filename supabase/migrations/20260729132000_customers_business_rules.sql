-- =============================================
-- MIGRATION: customers_business_rules
-- Telefone único por usuário
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS customers_created_by_phone_unique_idx
  ON public.customers (created_by, phone);
