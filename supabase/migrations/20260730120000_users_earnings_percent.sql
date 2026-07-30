ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS earnings_percent SMALLINT NOT NULL DEFAULT 100;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_earnings_percent_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_earnings_percent_check
  CHECK (earnings_percent >= 0 AND earnings_percent <= 100);
