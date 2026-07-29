-- =============================================
-- MIGRATION: jewelry_type_new_values
-- Adiciona relogio, conjunto e bracelete
-- =============================================

ALTER TYPE public.jewelry_type ADD VALUE IF NOT EXISTS 'relogio';
ALTER TYPE public.jewelry_type ADD VALUE IF NOT EXISTS 'conjunto';
ALTER TYPE public.jewelry_type ADD VALUE IF NOT EXISTS 'bracelete';
