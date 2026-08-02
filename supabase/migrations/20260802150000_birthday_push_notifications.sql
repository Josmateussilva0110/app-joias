-- =============================================
-- MIGRATION: birthday_push_notifications
-- Push tokens, preferências de horário e log de envio
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_push_tokens_user_id_idx
  ON public.user_push_tokens(user_id);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id            UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  enabled            BOOLEAN NOT NULL DEFAULT FALSE,
  notify_hour        SMALLINT NOT NULL DEFAULT 9,
  notify_minute      SMALLINT NOT NULL DEFAULT 0,
  timezone           TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  notify_hour_utc    SMALLINT NOT NULL DEFAULT 12,
  notify_minute_utc  SMALLINT NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT notification_settings_hour_range
    CHECK (notify_hour >= 0 AND notify_hour <= 23),
  CONSTRAINT notification_settings_minute_range
    CHECK (notify_minute >= 0 AND notify_minute <= 59),
  CONSTRAINT notification_settings_hour_utc_range
    CHECK (notify_hour_utc >= 0 AND notify_hour_utc <= 23),
  CONSTRAINT notification_settings_minute_utc_range
    CHECK (notify_minute_utc >= 0 AND notify_minute_utc <= 59)
);

CREATE INDEX IF NOT EXISTS idx_notify_hour_utc
  ON public.notification_settings (notify_hour_utc, notify_minute_utc)
  WHERE enabled = TRUE;

CREATE TABLE IF NOT EXISTS public.birthday_notifications_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  year_sent  INT NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT birthday_notifications_log_unique_year
    UNIQUE (client_id, year_sent)
);

CREATE INDEX IF NOT EXISTS birthday_notifications_log_client_year_idx
  ON public.birthday_notifications_log (client_id, year_sent);

-- =============================================
-- TRIGGER: mantém notify_hour_utc sincronizado
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_notify_hour_utc()
RETURNS trigger AS $$
DECLARE
  local_ts timestamptz;
BEGIN
  local_ts := (
    current_date::text || ' ' ||
    lpad(new.notify_hour::text, 2, '0') || ':' ||
    lpad(new.notify_minute::text, 2, '0') || ':00'
  )::timestamp AT TIME ZONE new.timezone;

  new.notify_hour_utc := EXTRACT(HOUR FROM local_ts AT TIME ZONE 'UTC')::smallint;
  new.notify_minute_utc := EXTRACT(MINUTE FROM local_ts AT TIME ZONE 'UTC')::smallint;
  new.updated_at := NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notify_hour_utc ON public.notification_settings;
CREATE TRIGGER trg_sync_notify_hour_utc
  BEFORE INSERT OR UPDATE OF notify_hour, notify_minute, timezone, enabled
  ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.sync_notify_hour_utc();

-- =============================================
-- RPC: aniversariantes do dia por usuário
-- =============================================
CREATE OR REPLACE FUNCTION public.clients_with_birthday_today(
  p_user_id UUID,
  p_today DATE
)
RETURNS SETOF public.customers
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.customers
  WHERE created_by = p_user_id
    AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM p_today)
    AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM p_today);
$$;

GRANT EXECUTE ON FUNCTION public.clients_with_birthday_today(UUID, DATE)
  TO service_role;

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_notifications_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_push_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_settings TO authenticated;

DROP POLICY IF EXISTS "Usuário gerencia seus tokens push" ON public.user_push_tokens;
CREATE POLICY "Usuário gerencia seus tokens push"
  ON public.user_push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário vê suas configurações de notificação" ON public.notification_settings;
DROP POLICY IF EXISTS "Usuário insere suas configurações de notificação" ON public.notification_settings;
DROP POLICY IF EXISTS "Usuário atualiza suas configurações de notificação" ON public.notification_settings;

CREATE POLICY "Usuário vê suas configurações de notificação"
  ON public.notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere suas configurações de notificação"
  ON public.notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza suas configurações de notificação"
  ON public.notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Log de envio: apenas service_role (cron no backend)
REVOKE ALL ON public.birthday_notifications_log FROM authenticated;
GRANT ALL ON public.birthday_notifications_log TO service_role;
