# Fluxo de notificações

Documentação completa do sistema de **lembretes de aniversário de clientes** no app **loja-joias**. As notificações são enviadas pelo **servidor** via **Expo Push API** — o app não agenda notificações localmente.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo 1 — Ativar lembretes no perfil](#fluxo-1--ativar-lembretes-no-perfil)
4. [Fluxo 2 — Envio automático (cron)](#fluxo-2--envio-automático-cron)
5. [Fluxo 3 — Recebimento no dispositivo](#fluxo-3--recebimento-no-dispositivo)
6. [Fluxo 4 — Caixa de notificações recentes](#fluxo-4--caixa-de-notificações-recentes)
7. [Fluxo 5 — Logout e desativação](#fluxo-5--logout-e-desativação)
8. [Fuso horário e UTC](#fuso-horário-e-utc)
9. [Banco de dados](#banco-de-dados)
10. [Endpoints da API](#endpoints-da-api)
11. [Configuração Firebase / Expo (Android)](#configuração-firebase--expo-android)
12. [Segurança e performance](#segurança-e-performance)
13. [Referência de arquivos](#referência-de-arquivos)

---

## Visão geral

O sistema avisa o lojista quando um **cliente faz aniversário no dia**, no horário configurado no perfil.

| Camada | Responsabilidade |
|--------|------------------|
| **App** | Permissão push, registro de token, preferências (ligar/desligar + horário) |
| **Backend** | Cron minuto a minuto, busca aniversariantes, envia push via Expo |
| **Supabase** | Tokens, configurações, log anti-duplicata |
| **Expo + FCM/APNs** | Entrega da notificação no dispositivo |

### Dois subsistemas no app

```mermaid
flowchart LR
    subgraph Server["Servidor (push)"]
        A[Cron backend] --> B[Expo Push API]
        B --> C[Dispositivo]
    end

    subgraph Local["App (caixa local)"]
        C --> D[NotificationInboxListener]
        D --> E[AsyncStorage]
        E --> F[Tela Notificações]
    end
```

| Subsistema | Onde vive | Função |
|------------|-----------|--------|
| **Push de aniversário** | Backend + Expo | Enviar lembrete no horário configurado |
| **Inbox recente** | Só no celular | Listar notificações recebidas (até 50), abrir cliente |

> A lista de notificações recentes **não vem do servidor** — é armazenada localmente no dispositivo.

### Mapa geral

```mermaid
flowchart TB
    subgraph Setup["Configuração inicial"]
        S1[Usuário ativa no Perfil] --> S2[Permissão + token Expo]
        S2 --> S3[Salva settings no Supabase]
    end

    subgraph Daily["Todo dia (automático)"]
        D1[Cron: hora UTC bate?] --> D2[Aniversariantes do dia]
        D2 --> D3{Já enviou este ano?}
        D3 -->|Não| D4[Push via Expo]
        D3 -->|Sim| D5[Pula cliente]
        D4 --> D6[Registra no log]
    end

    subgraph Device["No celular"]
        D4 --> R1[Notificação na bandeja]
        R1 --> R2[Inbox local + badge no header]
    end

    S3 --> D1
```

---

## Arquitetura

```mermaid
flowchart TB
    subgraph App["App (React Native / Expo)"]
        Profile["ProfileBirthdayNotificationsCard"]
        PushReg["PushTokenRegistration"]
        Inbox["NotificationInboxListener"]
        Screen["/notifications"]
        PushSvc["push-notifications.service.ts"]
    end

    subgraph API["Backend (Express)"]
        Routes["notificationRoutes"]
        NS["NotificationService"]
        Cron["birthdayNotificationCron"]
    end

    subgraph Supabase["Supabase"]
        Tokens["user_push_tokens"]
        Settings["notification_settings"]
        Log["birthday_notifications_log"]
        Customers["customers"]
        RPC["clients_with_birthday_today()"]
    end

    subgraph External["Externo"]
        Expo["Expo Push API"]
        FCM["FCM / APNs"]
    end

    Profile --> PushSvc
    PushReg --> PushSvc
    PushSvc --> Routes
    Routes --> NS
    NS --> Tokens
    NS --> Settings
    Cron --> NS
    NS --> RPC
    RPC --> Customers
    NS --> Log
    NS --> Expo
    Expo --> FCM
    FCM --> Inbox
    Inbox --> Screen
```

---

## Fluxo 1 — Ativar lembretes no perfil

### Jornada no app

```mermaid
flowchart TD
    Start([Perfil → Lembretes de aniversário]) --> Toggle{Usuário liga toggle?}

    Toggle -->|Desligar| Disable[PUT settings enabled=false]
    Disable --> OkOff([Lembretes desativados])

    Toggle -->|Ligar| Perm[Solicita permissão POST_NOTIFICATIONS]
    Perm --> PermOk{Permissão concedida?}
    PermOk -->|Não, bloqueada| Settings[Alert → Abrir configurações]
    PermOk -->|Não| ToastErr[Toast de erro]
    PermOk -->|Sim| Token[Obtém Expo Push Token]
    Token --> TokenOk{Token OK?}
    TokenOk -->|Não| FirebaseErr[Erro Firebase/FCM ou emulador]
    TokenOk -->|Sim| Reg[POST /notifications/register-token]
    Reg --> Save[PUT settings enabled=true + horário + timezone]
    Save --> OkOn([Lembretes ativados])

    subgraph Horario["Alterar horário (toggle ligado)"]
        H1[DateTimePicker] --> H2[PUT settings com novo horário]
        H2 --> H3[Trigger DB recalcula notify_hour_utc]
    end
```

### Sequência técnica (ativar)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant App as App
    participant Expo as Expo Notifications
    participant API as Backend
    participant DB as Supabase

    U->>App: Liga toggle no perfil
    App->>Expo: requestPermissionsAsync()
    Expo-->>App: granted
    App->>Expo: getExpoPushTokenAsync(projectId)
    Expo-->>App: ExponentPushToken[...]
    App->>API: POST /notifications/register-token
    API->>DB: UPSERT user_push_tokens
    App->>API: PUT /notifications/settings { enabled: true, ... }
    API->>DB: UPSERT notification_settings
    Note over DB: Trigger sync_notify_hour_utc
    API-->>App: 200 OK
    App-->>U: Toast — Lembretes ativados
```

### Valores padrão

| Campo | Padrão |
|-------|--------|
| Horário | 09:00 |
| Timezone | Fuso do dispositivo (`Intl`) ou `America/Sao_Paulo` |
| `enabled` | `false` até o usuário ativar |

### Requisitos do dispositivo

| Condição | Resultado |
|----------|-----------|
| Celular físico | Obrigatório — emulador não obtém token push |
| Android | `google-services.json` + FCM V1 no Expo |
| Permissão negada | Toggle não ativa; opção de abrir configurações do SO |

---

## Fluxo 2 — Envio automático (cron)

O backend roda um **cron a cada minuto** e processa usuários cujo horário UTC coincide com o instante atual.

### Cron jobs

```mermaid
flowchart LR
    subgraph EveryMinute["* * * * * (a cada minuto)"]
        J1[runBirthdayNotificationJob]
    end

    subgraph Daily3AM["0 3 * * * (03:00 UTC)"]
        J2[recalculateUtcOffsets]
    end

    J1 --> Users[Usuários com enabled=true<br/>e hora UTC atual]
    J2 --> Trigger[Re-dispara trigger de timezone<br/>para todos os settings]
```

### Lógica de envio por usuário

```mermaid
flowchart TD
    Start([Cron dispara]) --> Query[SELECT notification_settings<br/>WHERE enabled AND notify_hour_utc = now<br/>AND notify_minute_utc = now]
    Query --> Loop{Para cada usuário}

    Loop --> RPC[RPC clients_with_birthday_today]
    RPC --> Any{Aniversariantes?}
    Any -->|Não| Loop
    Any -->|Sim| CustLoop{Para cada cliente}

    CustLoop --> LogCheck{birthday_notifications_log<br/>cliente + ano?}
    LogCheck -->|Já enviou| CustLoop
    LogCheck -->|Não enviou| Tokens[Busca tokens push do usuário]
    Tokens --> HasToken{Tokens existem?}
    HasToken -->|Não| CustLoop
    HasToken -->|Sim| Push[Expo Push API]
    Push --> Delivered{Ticket OK?}
    Delivered -->|Sim| InsertLog[INSERT log ano atual]
    Delivered -->|Não| Cleanup[Remove tokens DeviceNotRegistered]
    InsertLog --> CustLoop
    Cleanup --> CustLoop
```

### Sequência técnica (envio)

```mermaid
sequenceDiagram
    participant Cron as birthdayNotificationCron
    participant NS as NotificationService
    participant DB as Supabase (admin)
    participant RPC as clients_with_birthday_today
    participant Expo as Expo Push API
    participant Device as Celular

    Cron->>NS: runBirthdayNotificationJob(now UTC)
    NS->>DB: settings WHERE enabled + hora UTC
    loop Por usuário elegível
        NS->>RPC: p_user_id, p_today
        RPC-->>NS: lista de customers
        loop Por aniversariante
            NS->>DB: log já existe? (client_id + year)
            alt Não enviado este ano
                NS->>DB: SELECT expo_push_token
                NS->>Expo: sendPushNotificationsAsync
                Expo->>Device: FCM/APNs → notificação
                Expo-->>NS: tickets
                NS->>DB: INSERT birthday_notifications_log
            end
        end
    end
```

### Conteúdo da notificação push

| Campo | Valor |
|-------|-------|
| **title** | `Aniversário hoje` |
| **body** | `{nome do cliente} faz aniversário hoje. Aproveite para parabenizar!` |
| **data.type** | `customer-birthday` |
| **data.customerId** | UUID do cliente |
| **sound** | `default` |

### Anti-duplicata

Cada par `(client_id, year_sent)` é único na tabela `birthday_notifications_log`. Um cliente recebe **no máximo 1 push por ano**, mesmo que o cron rode várias vezes no mesmo minuto.

---

## Fluxo 3 — Recebimento no dispositivo

```mermaid
sequenceDiagram
    participant Expo as Expo Push / FCM
    participant OS as Sistema operacional
    participant App as App (foreground/background/fechado)
    participant Listener as NotificationInboxListener

    Expo->>OS: Entrega push
    OS->>App: Exibe banner / bandeja

    alt App em foreground
        App->>Listener: addNotificationReceivedListener
    else Usuário toca na notificação
        App->>Listener: addNotificationResponseReceivedListener
    else App volta ao foreground
        App->>Listener: syncRecentNotificationsFromTray
    end

    Listener->>Listener: captureRecentNotification → AsyncStorage
```

### Comportamento por estado do app

| Estado do app | O que acontece |
|---------------|----------------|
| **Fechado** | SO exibe notificação; ao abrir, sincroniza bandeja |
| **Background** | Banner + entrada na inbox ao voltar |
| **Foreground** | Listener captura e atualiza lista imediatamente |

---

## Fluxo 4 — Caixa de notificações recentes

Tela acessível pelo ícone de sino no header. Dados **locais** (AsyncStorage, máx. 50 itens).

### Jornada

```mermaid
flowchart TD
    Start([Ícone sino no header]) --> Screen[Tela /notifications]
    Screen --> List[Lista de recentes]
    List --> Tap{Toca item?}
    Tap -->|Sim, tem customerId| Customer[Abre /customers/id]
    Tap -->|Não| Stay[Fica na lista]
    List --> Dismiss[Toca X → remove item]
    List --> Clear[Limpar tudo → esvazia AsyncStorage + bandeja SO]
```

### Armazenamento local

```mermaid
flowchart LR
    Push[Push recebido] --> Map[mapExpoNotification]
    Map --> Store["@app:recent_notifications"]
    Store --> Query[useRecentNotifications]
    Query --> UI[Tela + badge no header]
```

| Campo local | Origem |
|-------------|--------|
| `id` | identifier da notificação Expo |
| `title`, `body` | conteúdo do push |
| `receivedAt` | timestamp de recebimento |
| `customerId` | `data.customerId` do push |
| `type` | `data.type` (`customer-birthday`) |

---

## Fluxo 5 — Logout e desativação

```mermaid
flowchart TD
    subgraph Desativar["Toggle desligado no perfil"]
        A1[PUT settings enabled=false] --> A2[Backend para de incluir usuário no cron]
    end

    subgraph Logout["Logout"]
        L1[clearBirthdayNotificationsOnLogout] --> L2[DELETE token no backend]
        L2 --> L3[Remove token do AsyncStorage]
        L3 --> L4[clearRecentNotificationsOnLogout]
    end
```

> Desativar o toggle **não** remove o token push do banco — apenas impede o envio. No logout, o token é removido do backend.

---

## Fuso horário e UTC

O usuário configura horário **local** (`notify_hour`, `notify_minute`, `timezone`). O cron compara em **UTC**.

```mermaid
flowchart LR
    User["Usuário: 09:00<br/>America/Sao_Paulo"] --> Trigger["Trigger sync_notify_hour_utc"]
    Trigger --> UTC["notify_hour_utc = 12<br/>notify_minute_utc = 0"]
    UTC --> Cron["Cron compara com now UTC"]
```

| Evento | Quando |
|--------|--------|
| INSERT/UPDATE em `notification_settings` | Trigger recalcula `notify_hour_utc` / `notify_minute_utc` |
| Cron de manutenção (03:00 UTC) | Re-processa todos os settings (útil após mudança de horário de verão) |

---

## Banco de dados

Migration: `supabase/migrations/20260802150000_birthday_push_notifications.sql`

### Modelo de dados

```mermaid
erDiagram
    users ||--o{ user_push_tokens : "user_id"
    users ||--o| notification_settings : "user_id"
    customers ||--o{ birthday_notifications_log : "client_id"
    users ||--o{ customers : "created_by"

    users {
        uuid id PK
    }
    user_push_tokens {
        uuid id PK
        uuid user_id FK
        text expo_push_token UK
        timestamptz created_at
    }
    notification_settings {
        uuid user_id PK_FK
        boolean enabled
        smallint notify_hour
        smallint notify_minute
        text timezone
        smallint notify_hour_utc
        smallint notify_minute_utc
        timestamptz updated_at
    }
    birthday_notifications_log {
        uuid id PK
        uuid client_id FK
        int year_sent
        timestamptz sent_at
    }
    customers {
        uuid id PK
        uuid created_by FK
        date birth_date
        text name
    }
```

### Tabelas

| Tabela | Acesso | Função |
|--------|--------|--------|
| `user_push_tokens` | Usuário (RLS) + service_role | Tokens Expo por dispositivo |
| `notification_settings` | Usuário (RLS) + service_role | Preferências de horário |
| `birthday_notifications_log` | **Só service_role** | Evita reenvio no mesmo ano |

### RPC

```sql
clients_with_birthday_today(p_user_id UUID, p_today DATE)
```

Retorna clientes do usuário cujo `birth_date` coincide em **mês e dia** com `p_today`.

---

## Endpoints da API

```mermaid
flowchart LR
    subgraph Auth["Rotas autenticadas"]
        E1["POST /notifications/register-token"]
        E2["DELETE /notifications/register-token"]
        E3["GET /notifications/settings"]
        E4["PUT /notifications/settings"]
    end

    App[App] --> Auth
    Auth --> Supabase[(Supabase)]
```

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/notifications/register-token` | Registra/atualiza token Expo |
| `DELETE` | `/api/notifications/register-token` | Remove token (logout) |
| `GET` | `/api/notifications/settings` | Lê preferências |
| `PUT` | `/api/notifications/settings` | Salva preferências |

### Exemplos

**Registrar token:**
```http
POST /api/notifications/register-token
Authorization: Bearer <token>

{ "expo_push_token": "ExponentPushToken[xxxx]" }
```

**Salvar configurações:**
```http
PUT /api/notifications/settings
Authorization: Bearer <token>

{
  "enabled": true,
  "notify_hour": 9,
  "notify_minute": 0,
  "timezone": "America/Sao_Paulo"
}
```

---

## Configuração Firebase / Expo (Android)

Push no Android exige Firebase + credenciais no Expo.

```mermaid
flowchart TD
    A[Firebase Console] --> B[Criar projeto Android]
    B --> C[Baixar google-services.json]
    C --> D[Salvar em app/google-services.json]
    D --> E[Expo Dashboard → Credentials → FCM V1]
    E --> F[Upload service account JSON]
    F --> G[Gerar APK: ./build-apk.sh --clean-prebuild]
    G --> H[Push funciona com app fechado]
```

| Passo | Detalhe |
|-------|---------|
| Package Android | `com.mateus0110.lojajoias` |
| Expo Project ID | `bf241346-b604-4df1-972f-8c8fae3c9628` |
| Permissão Android | `POST_NOTIFICATIONS` em `app.json` |
| Canal Android | `customer-birthdays` — "Aniversários de clientes" |
| Service account JSON | **Não commitar** — ignorado pelo `.gitignore` |
| `google-services.json` | Pode ir pro Git (IDs públicos do app) |

Referência: `app/env-exemple` e `app/google-services.json.example`

---

## Segurança e performance

```mermaid
mindmap
  root((Notificações))
    Segurança
      RLS nos tokens e settings
      Log só service_role
      Tokens invalidados automaticamente
    Performance
      Cron O usuários elegíveis por minuto
      Índice em notify_hour_utc
      Sem re-sync ao salvar cliente
    Confiabilidade
      Log anti-duplicata por ano
      Lock isBirthdayJobRunning
      Manutenção UTC diária
```

### Por que server-side push?

| Antes (local) | Agora (servidor) |
|---------------|------------------|
| App buscava todos os clientes | Backend consulta só aniversariantes do dia |
| Re-agendava N notificações a cada sync | Cron leve por minuto |
| Lento com muitos clientes | Escala no backend |

### Limpeza de tokens inválidos

Se o Expo retorna `DeviceNotRegistered`, o backend remove o token de `user_push_tokens` automaticamente.

---

## Referência de arquivos

| Área | Arquivo | Função |
|------|---------|--------|
| **Backend** | `backend/src/services/NotificationService.ts` | Tokens, settings, envio push, cron logic |
| **Backend** | `backend/src/jobs/birthdayNotificationCron.ts` | Cron minuto + manutenção UTC |
| **Backend** | `backend/src/routes/notificationRoutes.ts` | Rotas da API |
| **Backend** | `backend/src/bootstrap.ts` | Inicia cron na subida do servidor |
| **App** | `app/src/services/push-notifications.service.ts` | Permissões, token, enable/disable |
| **App** | `app/src/services/notification.service.ts` | Chamadas HTTP à API |
| **App** | `app/src/features/profile/components/profile-birthday-notifications-card.tsx` | UI no perfil |
| **App** | `app/src/features/notifications/components/push-token-registration.tsx` | Sync token ao logar |
| **App** | `app/src/features/notifications/components/notification-inbox-listener.tsx` | Captura push → inbox local |
| **App** | `app/src/app/(protected)/notifications.tsx` | Tela de recentes |
| **App** | `app/src/storage/recent-notifications.storage.ts` | Persistência local |
| **Shared** | `packages/shared/src/schemas/notification.schema.ts` | DTOs compartilhados |
| **DB** | `supabase/migrations/20260802150000_birthday_push_notifications.sql` | Migration |

---

## Ciclo de vida completo

```mermaid
flowchart TB
    subgraph Config["1. Configuração"]
        C1[Ativa no perfil] --> C2[Token + settings no DB]
    end

    subgraph Run["2. Operação diária"]
        R1[Cron no horário UTC] --> R2[Aniversariantes]
        R2 --> R3[Push Expo]
        R3 --> R4[Log anti-duplicata]
    end

    subgraph UX["3. Experiência no app"]
        U1[Notificação na bandeja] --> U2[Inbox local]
        U2 --> U3[Toque → ficha do cliente]
    end

    C2 --> R1
    R3 --> U1
```

---

## Documentação relacionada

- [Fluxo de troca de senha](./README.md)
- [Backend — API Express](./BACKEND.md)
- [App — Expo / React Native](./APP.md)
