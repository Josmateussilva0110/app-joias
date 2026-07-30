-- =============================================
-- MIGRATION: products_jewelry_type_text
-- Troca enum jewelry_type por texto livre
-- =============================================

ALTER TABLE public.products
  ALTER COLUMN jewelry_type TYPE TEXT
  USING (
    CASE jewelry_type::text
      WHEN 'colar' THEN 'Colar'
      WHEN 'brinco' THEN 'Brinco'
      WHEN 'pulseira' THEN 'Pulseira'
      WHEN 'anel' THEN 'Anel'
      WHEN 'tornozeleira' THEN 'Tornozeleira'
      WHEN 'broche' THEN 'Broche'
      WHEN 'relogio' THEN 'Relógio'
      WHEN 'conjunto' THEN 'Conjunto'
      WHEN 'bracelete' THEN 'Bracelete'
      WHEN 'outro' THEN 'Outro'
      ELSE jewelry_type::text
    END
  );

ALTER TABLE public.products
  ADD CONSTRAINT products_jewelry_type_not_empty
    CHECK (char_length(trim(jewelry_type)) > 0),
  ADD CONSTRAINT products_jewelry_type_max_length
    CHECK (char_length(jewelry_type) <= 120);

DROP TYPE IF EXISTS public.jewelry_type;
