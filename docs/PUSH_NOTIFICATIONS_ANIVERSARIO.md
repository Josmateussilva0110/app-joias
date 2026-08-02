# Plano de Implementação — Notificações Push de Aniversário

## Objetivo

Notificar o usuário quando um de seus clientes fizer aniversário, respeitando o **horário preferido** que o próprio usuário configura no app, com boa performance mesmo com a base crescendo.

---

## Stack envolvida

- **Frontend**: React Native (Expo)
- **Backend**: Express + TypeScript
- **Banco**: Supabase (Postgres)
- **Serviço de push**: Expo Push Notification Service (`expo-server-sdk`)

---

## Visão geral da arquitetura

```
[App RN] --token--> [Supabase: user_push_tokens]
[App RN] --preferência de horário--> [Supabase: notification_settings]

[Cron no backend, roda de hora em hora]
  -> query indexada em notification_settings (notify_hour_utc = hora atual UTC)
  -> para cada usuário que bateu o horário:
       -> RPC clients_with_birthday_today(user_id, hoje)
       -> para cada aniversariante sem envio registrado no ano:
            -> Expo Push API
            -> grava em birthday_notifications_log
```

---

## 1. Modelagem no Supabase (Postgres)

### 1.1 Tokens de push por usuário

```sql
create table user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users,
  expo_push_token text not null unique,
  created_at timestamptz default now()
);
```

### 1.2 Preferência de notificação (horário + timezone)

```sql
create table notification_settings (
  user_id uuid primary key references auth.users,
  notify_hour smallint not null default 9,       -- hora local escolhida (0-23)
  notify_minute smallint not null default 0,      -- minuto local escolhido
  timezone text not null default 'America/Sao_Paulo', -- IANA tz do dispositivo
  notify_hour_utc smallint not null,               -- pré-calculado no save
  notify_minute_utc smallint not null,
  updated_at timestamptz default now()
);

create index idx_notify_hour_utc on notification_settings (notify_hour_utc, notify_minute_utc);
```

### 1.3 Log de envio (evita duplicidade)

```sql
create table birthday_notifications_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients,
  year_sent int not null,
  sent_at timestamptz default now(),
  unique (client_id, year_sent)
);
```

### 1.4 RPC para buscar aniversariantes do dia

```sql
create or replace function clients_with_birthday_today(p_user_id uuid, p_today date)
returns setof clients as $$
  select * from clients
  where user_id = p_user_id
    and extract(month from birth_date) = extract(month from p_today)
    and extract(day from birth_date) = extract(day from p_today)
$$ language sql stable;
```

### 1.5 Trigger para manter `notify_hour_utc` sincronizado

Recalcula automaticamente sempre que `notify_hour`, `notify_minute` ou `timezone` mudam, evitando ter que fazer essa conversão manualmente no backend a cada update.

```sql
-- função em plpgsql usando timezone do Postgres para converter local -> UTC
create or replace function sync_notify_hour_utc()
returns trigger as $$
declare
  local_ts timestamptz;
begin
  local_ts := (current_date::text || ' ' || new.notify_hour || ':' || new.notify_minute)::timestamp
              at time zone new.timezone;
  new.notify_hour_utc := extract(hour from local_ts at time zone 'UTC');
  new.notify_minute_utc := extract(minute from local_ts at time zone 'UTC');
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_notify_hour_utc
before insert or update of notify_hour, notify_minute, timezone
on notification_settings
for each row execute function sync_notify_hour_utc();
```

---

## 2. Backend (Express/TS)

### 2.1 Dependências

```bash
npm install expo-server-sdk node-cron luxon
```

### 2.2 Registro de push token

`POST /notifications/register-token`
- Recebe `expo_push_token` do app autenticado.
- Faz upsert em `user_push_tokens` (evita duplicar token do mesmo dispositivo).

### 2.3 Atualização de preferência de horário

`PUT /notifications/settings`
- Recebe `notify_hour`, `notify_minute`, `timezone`.
- Faz upsert em `notification_settings` — a conversão para UTC acontece no trigger do banco, não precisa ser feita no backend.

### 2.4 Job de disparo (cron)

- Roda a cada hora cheia (`0 * * * *`) — ajustar para granularidade de minuto se necessário.
- Passos:
  1. Query indexada em `notification_settings` filtrando `notify_hour_utc = hora atual UTC`.
  2. Para cada usuário retornado, chama `clients_with_birthday_today`.
  3. Para cada aniversariante, checa `birthday_notifications_log` (unique por `client_id` + `year_sent`).
  4. Se não enviado ainda no ano, busca tokens em `user_push_tokens` e dispara via `expo-server-sdk`.
  5. Grava o log de envio.

### 2.5 Rotina de manutenção diária

- Job diário (ex: 3h da manhã UTC) que recalcula `notify_hour_utc`/`notify_minute_utc` em massa, cobrindo casos de mudança de horário de verão em usuários fora do Brasil (Brasil não usa mais DST desde 2019).

---

## 3. Frontend (React Native / Expo)

### 3.1 Permissão e captura do token

- Solicitar permissão com `expo-notifications`.
- Obter `ExpoPushToken` e enviar para `POST /notifications/register-token`.

### 3.2 Tela de configuração

- Seletor de hora (`notify_hour` / `notify_minute`).
- Timezone capturado automaticamente via `Intl.DateTimeFormat().resolvedOptions().timeZone`, sem exigir input manual do usuário.
- Ao salvar, chama `PUT /notifications/settings`.

---

## 4. Ordem sugerida de implementação

1. Criar tabelas e RPC no Supabase (seção 1).
2. Criar trigger de sincronização de `notify_hour_utc`.
3. Implementar endpoints de registro de token e de preferência (backend).
4. Implementar job de cron com a query indexada.
5. Implementar tela de configuração no app (RN).
6. Implementar captura/registro de push token no app (RN).
7. Testar fluxo completo com uma data de aniversário simulada (ex: `birth_date` = hoje) e horário próximo do atual.
8. Implementar rotina diária de manutenção de fuso horário.

---

## 5. Pontos de atenção

- **Duplicidade de envio**: garantida pelo `unique (client_id, year_sent)` em `birthday_notifications_log`.
- **Tokens inválidos**: tratar erro `DeviceNotRegistered` da resposta do Expo e remover o token de `user_push_tokens`.
- **Rate limit do Expo**: usar `expo.chunkPushNotifications()` do SDK, que já respeita os limites de lote.
- **Múltiplos dispositivos por usuário**: `user_push_tokens` permite N tokens por `user_id`; o envio deve iterar por todos.
