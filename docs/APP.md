# App — loja-joias (Expo / React Native)

Documentação completa do aplicativo mobile **Sintonia**: arquitetura, navegação, autenticação, camada de dados, features e build.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Providers e bootstrap](#providers-e-bootstrap)
4. [Navegação](#navegação)
5. [Autenticação e sessão](#autenticação-e-sessão)
6. [HTTP e refresh de token](#http-e-refresh-de-token)
7. [Camada de dados](#camada-de-dados)
8. [Features](#features)
9. [Armazenamento local](#armazenamento-local)
10. [Tema e UI](#tema-e-ui)
11. [Configuração e build](#configuração-e-build)
12. [Estrutura de pastas](#estrutura-de-pastas)
13. [Documentação relacionada](#documentação-relacionada)

---

## Visão geral

| Item | Detalhe |
|------|---------|
| **Nome** | Sintonia |
| **Framework** | Expo SDK 54 + React Native 0.81 |
| **Roteamento** | Expo Router (file-based) |
| **Estado servidor** | TanStack React Query v5 |
| **Formulários** | React Hook Form + Zod |
| **HTTP** | Axios |
| **Pacote compartilhado** | `@app/shared` (schemas com o backend) |
| **Plataformas** | Android, iOS (web parcial) |

O app é o cliente da API documentada em [BACKEND.md](./BACKEND.md). Toda persistência de negócio fica no servidor; o celular guarda sessão, preferências de UI e inbox local de notificações.

```mermaid
flowchart LR
    User[Usuário] --> App[App Expo]
    App --> API[Backend /api]
    App --> SecureStore[SecureStore — sessão]
    App --> AsyncStorage[AsyncStorage — tema, inbox]
    App --> ExpoPush[Expo Notifications]
    ExpoPush --> FCM[FCM / APNs]
```

---

## Arquitetura

```mermaid
flowchart TB
    subgraph Screens["Telas app/src/app/"]
        Public[login · register · forgot-password · welcome]
        Protected[home · customers · products · analytics · profile · notifications]
    end

    subgraph Features["features/"]
        AuthF[auth]
        ProdF[products]
        CustF[customers]
        AnalF[analytics]
        ProfF[profile]
        NotifF[notifications]
    end

    subgraph Core["Núcleo"]
        Hooks[hooks]
        Services[services]
        Context[context]
        Storage[storage]
    end

    subgraph External["Externo"]
        API[Axios → Backend]
        Shared["@app/shared"]
        RQ[React Query]
    end

    Screens --> Features
    Features --> Hooks
    Hooks --> Services
    Services --> API
    Services --> Shared
    Hooks --> RQ
    Context --> Storage
```

### Padrão por feature

```mermaid
flowchart LR
    Screen[Tela app/] --> Component[features/.../components]
    Component --> Hook[hooks/use-*]
    Hook --> Service[services/*.service.ts]
    Service --> Request[request.ts + api.ts]
    Request --> Backend[Backend API]
    Hook --> RQ[React Query cache]
```

---

## Providers e bootstrap

```mermaid
flowchart TD
    Root["_layout.tsx"] --> Fonts[Plus Jakarta Sans]
    Fonts --> PersistQuery[PersistQueryClientProvider]
    PersistQuery --> AuthP[AuthProvider]
    AuthP --> ThemeP[ThemeProvider]
    ThemeP --> ToastP[ToastProvider]
    ToastP --> Stack[Stack Expo Router]

    subgraph Boot["Na abertura"]
        B1[SplashScreen]
        B2[loadUser — SecureStore]
        B3[Token refresh se expirado]
        B4[index → home ou welcome]
    end

    AuthP --> Boot
```

| Provider | Arquivo | Função |
|----------|---------|--------|
| `PersistQueryClientProvider` | `_layout.tsx` | Cache React Query em AsyncStorage (24h) |
| `AuthProvider` | `auth.context.tsx` | Sessão, login, logout, biometria |
| `ThemeProvider` | `theme.context.tsx` | Tema claro/escuro |
| `ToastProvider` | `toast.context.tsx` | Feedback visual |

**Queries não persistidas:** `products`, `customers`, `profile` — sempre rebuscam ao abrir.

---

## Navegação

Roteamento **file-based** em `app/src/app/`.

### Mapa de rotas

```mermaid
flowchart TD
    Index["/ index"] --> Signed{signed?}
    Signed -->|Sim| Home["/(protected)/home"]
    Signed -->|Não| Welcome["/welcomePage"]

    Welcome --> Login["/login"]
    Welcome --> Register["/register"]
    Login --> Forgot["/forgot-password"]

    subgraph Protected["/(protected)/ — auth required"]
        H[home — vendas]
        C[customers/* — clientes]
        P[products/* — vendas CRUD]
        A[analytics]
        N[notifications]
        PR[profile]
        CP[change-password-required]
    end

    Home --> H
    H --> C & P & A & N & PR
```

### Guards

```mermaid
flowchart TD
    Enter["Entra em /(protected)"] --> AuthG{signed?}
    AuthG -->|Não| LoginRedirect["Redirect → /login"]
    AuthG -->|Sim| ProfileLoad[Carrega profile]
    ProfileLoad --> PassG{must_change_password?}
    PassG -->|Sim| CP["Redirect → change-password-required"]
    PassG -->|Não| Stack[Stack normal + PushTokenRegistration]
```

| Layout | Arquivo | Responsabilidade |
|--------|---------|------------------|
| Root | `_layout.tsx` | Providers globais |
| Protected | `(protected)/_layout.tsx` | Auth guard, senha obrigatória, push/inbox listeners |

### Transições

Definidas em `constants/navigation-transitions.ts`:

| Tipo | Uso |
|------|-----|
| `pushTransition` | Telas padrão |
| `modalTransition` | new/edit (clientes, produtos) |
| `fadeTransition` | analytics, notifications |

---

## Autenticação e sessão

### Fluxos de login

```mermaid
flowchart TD
    subgraph Email["E-mail + senha"]
        E1[login.tsx] --> E2[loginUser API]
        E2 --> E3[establishSession]
    end

    subgraph Bio["Biometria"]
        B1[BiometricLoginButton] --> B2[refreshToken do SecureStore]
        B2 --> B3[refreshService.refresh]
        B3 --> E3
    end

    subgraph Register["Cadastro"]
        R1[register.tsx] --> R2[registerUser + login automático]
        R2 --> E3
    end

    E3 --> Save[SecureStore + tokenManager]
    Save --> Home["/(protected)/home"]
```

### Ciclo de vida da sessão

```mermaid
sequenceDiagram
    participant App as App boot
    participant SS as SecureStore
    participant TM as tokenManager
    participant RS as refreshService
    participant API as Backend

    App->>SS: getAuth()
    alt Token válido
        SS-->>App: AuthData
        App->>TM: setTokens
    else Token expirado
        App->>RS: refresh(refreshToken)
        RS->>API: POST /auth/refresh
        API-->>RS: novos tokens
        RS->>SS: saveAuth
        RS->>TM: setTokens + notifyRefreshed
    else Refresh falhou
        App->>App: clearLocalSession → welcome/login
    end
```

### Logout

```mermaid
flowchart LR
    Logout[logout] --> API[POST /logout]
    Logout --> Clear1[tokenManager.clear]
    Logout --> Clear2[SecureStore remove]
    Logout --> Clear3[Query cache clear]
    Logout --> Clear4[Push token remove]
    Logout --> Clear5[Recent notifications clear]
```

### Biometria

| Ação | Onde | O que guarda |
|------|------|--------------|
| Ativar | Perfil → card biométrico | `email` + `refreshToken` no SecureStore |
| Login | Botão na tela de login | Refresh via token biométrico |
| Desativar | Perfil | Remove credenciais biométricas |

Detalhes de senha: [Fluxo de troca de senha](./README.md)

---

## HTTP e refresh de token

```mermaid
sequenceDiagram
    participant Comp as Componente/Hook
    participant Axios as api (axios)
    participant TM as tokenManager
    participant RS as refreshService
    participant BE as Backend

    Comp->>Axios: request autenticado
    Axios->>TM: waitRefresh()
    Axios->>BE: Bearer accessToken

    alt 401 + token expirado
        Axios->>RS: refresh(refreshToken)
        RS->>BE: POST /auth/refresh
        BE-->>RS: novos tokens
        RS->>TM: setTokens
        Axios->>BE: retry request original
    else 401 irrecuperável
        RS->>App: logout + redirect login
    end
```

| Arquivo | Função |
|---------|--------|
| `services/api.ts` | Instância Axios + interceptors |
| `services/request.ts` | Wrapper `requestData` tipado |
| `services/token.manager.ts` | Tokens em memória + lock de refresh |
| `services/refresh.service.ts` | Refresh único (deduplicado) |

**Regra crítica:** requests aguardam `tokenManager.waitRefresh()` para não usar access token expirado durante o boot.

---

## Camada de dados

### React Query

```mermaid
flowchart LR
    Hook[useProducts · useCustomers · useProfile] --> Query[useQuery / useInfiniteQuery / useMutation]
    Query --> Service[*.service.ts]
    Service --> API[Backend]
    Query --> Cache[QueryClient]
    Cache --> Persist[AsyncStorage persister]
```

| Hook | Query key | Tipo |
|------|-----------|------|
| `useProducts` | `["products", filters]` | Infinite query (paginação) |
| `useCustomers` | `["customers", ...]` | Infinite query |
| `useProfile` | `["profile"]` | Query simples |
| `useProductAnalytics` | analytics key | Query |
| `useRecentNotifications` | `recent-notifications` | Query local |

### Serviços HTTP

| Serviço | Domínio |
|---------|---------|
| `auth.service.ts` | login, register, refresh, password reset |
| `profile.service.ts` | perfil, senha |
| `product.service.ts` | CRUD vendas, analytics |
| `customer.service.ts` | CRUD clientes |
| `notification.service.ts` | settings + push token API |
| `push-notifications.service.ts` | permissões, Expo token, enable/disable |
| `recent-notifications.service.ts` | inbox local |

Rotas centralizadas em `config/api-routes.ts`. URL base em `config/env.ts` ← `api-url.generated.ts`.

### Schemas compartilhados

Validação Zod alinhada ao backend via `@app/shared`:

- Produtos, clientes, notificações → shared
- Auth (login, register, senha) → `schemas/auth.schema.ts` local

---

## Features

### Mapa funcional

```mermaid
mindmap
  root((App Sintonia))
    Vendas
      Home lista paginada
      Filtros mês/ano/pagamento
      Nova venda modal
      Detalhe e edição
    Clientes
      Lista com busca
      Cadastro com birth_date
      Detalhe e edição
    Analytics
      KPIs
      Gráficos ranked/donut
      Percentual ganho
    Perfil
      Nome usuário
      Tema claro/escuro
      Biometria
      Lembretes aniversário
      Alterar senha
      Logout
    Notificações
      Push aniversário
      Inbox recentes local
    Auth
      Welcome
      Login biometria
      Register
      Esqueci senha
      Troca senha obrigatória
```

### Home (vendas)

```mermaid
flowchart TD
    Home[home.tsx] --> Filters[ProductsFilters]
    Home --> List[SectionList por status pagamento]
    Home --> FAB[Nova venda → products/new]
    Filters --> useProducts[useProducts infinite query]
    List --> Detail[products/id]
```

### Clientes

| Tela | Rota | Ação |
|------|------|------|
| Lista | `customers/index` | Busca, resumo, FAB novo |
| Novo | `customers/new` | Modal — `CustomerForm` |
| Detalhe | `customers/[id]` | Ver + ações |
| Editar | `customers/[id]/edit` | Modal — inclui `birth_date` |

`birth_date` alimenta o cron de aniversário no backend.

### Analytics

| Tela | Rota | Dados |
|------|------|-------|
| Dashboard | `analytics` | `GET /products/analytics` |
| % ganho | card no dashboard | `PATCH /profile/earnings-percent` + storage local |

### Perfil

| Card | Função |
|------|--------|
| `ProfileUserCard` | Nome de exibição |
| `ProfileThemeCard` | Tema claro/escuro |
| `ProfileBiometricCard` | Login biométrico |
| `ProfileBirthdayNotificationsCard` | Push aniversários |
| `ProfileChangePasswordCard` | Troca de senha |
| `ProfileLogoutButton` | Sair |

### Notificações

Dois subsistemas — detalhes em [FLUXO_NOTIFICACOES.md](./FLUXO_NOTIFICACOES.md):

```mermaid
flowchart LR
    subgraph Push["Push server-side"]
        PTR[PushTokenRegistration] --> Sync[syncPushTokenWithBackend]
        PBC[ProfileBirthdayNotificationsCard] --> Settings[API settings]
    end

    subgraph Inbox["Inbox local"]
        NIL[NotificationInboxListener] --> Store[AsyncStorage]
        Store --> Screen[notifications.tsx]
        NHB[notifications-header-button] --> Screen
    end
```

---

## Armazenamento local

```mermaid
flowchart TB
    subgraph SecureStore["SecureStore (criptografado)"]
        S1[app_auth — tokens + user]
        S2[biometric credentials]
    end

    subgraph AsyncStorage["AsyncStorage"]
        A1["@app:theme"]
        A2["@app:recent_notifications"]
        A3["@app:expo_push_token"]
        A4["@app:analytics_earnings"]
        A5[React Query persist cache]
    end
```

| Chave | Conteúdo | Quando limpa |
|-------|----------|--------------|
| `app_auth` | Sessão completa | Logout |
| Biometric | email + refreshToken | Desativar biometria / falha |
| `@app:recent_notifications` | Até 50 notificações | Logout / limpar manual |
| `@app:expo_push_token` | Token Expo local | Logout |

---

## Tema e UI

```mermaid
flowchart LR
    ThemeProvider --> Colors["constants/theme.ts"]
    Colors --> Components[AppShell · FormField · cards]
    ThemeProvider --> AsyncStorage["@app:theme"]
```

| Peça | Descrição |
|------|-----------|
| **AppShell** | Layout padrão — header gradiente, back, settings |
| **FormField** | Input com ícone, erro, toggle senha |
| **Motion** | Animações Reanimated (`components/ui/motion.ts`) |
| **Fonte** | Plus Jakarta Sans (400–800) |
| **Ícones** | Lucide React Native |
| **Gráficos** | react-native-gifted-charts (analytics) |

Tema padrão: **dark**. Usuário alterna no perfil.

---

## Configuração e build

### URL da API

```mermaid
flowchart LR
    Env["app/.env<br/>EXPO_PUBLIC_API_URL"] --> Write["scripts/write-api-url.js"]
    Write --> Gen["api-url.generated.ts"]
    Gen --> Config["app.config.js extra.apiUrl"]
    Config --> Runtime["config/env.ts → API_URL"]
```

| Valor `EXPO_PUBLIC_API_URL` | Comportamento |
|-----------------------------|---------------|
| `auto` | IP da máquina na rede local |
| `emulator` | `10.0.2.2` (Android emulator) |
| URL fixa | ex. `http://192.168.x.x:3001/api` |

Template: `app/env-exemple`. Em produção exige **HTTPS**.

### Comandos

```bash
# Desenvolvimento
cd app
cp env-exemple .env    # ajuste EXPO_PUBLIC_API_URL
npm start              # gera api-url + expo start

# Android nativo
npm run android

# APK release (monorepo)
./build-apk.sh --clean-prebuild
```

### Config nativa relevante

| Arquivo | Função |
|---------|--------|
| `app.json` | Expo config, permissões, plugins |
| `app.config.js` | API URL, google-services, cleartext dev |
| `google-services.json` | Firebase Android (push) |
| `eas.json` | Perfis EAS Build |
| `version.build.json` | `versionCode` Android |

Expo Project ID: `bf241346-b604-4df1-972f-8c8fae3c9628`

---

## Estrutura de pastas

```
app/
├── src/
│   ├── app/                        # Rotas Expo Router
│   │   ├── _layout.tsx             # Providers globais
│   │   ├── index.tsx               # Redirect inicial
│   │   ├── welcomePage.tsx
│   │   ├── login.tsx · register.tsx · forgot-password.tsx
│   │   └── (protected)/
│   │       ├── _layout.tsx         # Auth guard + push listeners
│   │       ├── home.tsx
│   │       ├── customers/ · products/
│   │       ├── analytics.tsx · profile.tsx · notifications.tsx
│   │       └── change-password-required.tsx
│   ├── features/                   # UI por domínio
│   │   ├── auth/ · products/ · customers/
│   │   ├── analytics/ · profile/ · notifications/ · welcome/
│   ├── components/                 # UI compartilhada
│   │   ├── appShell.tsx · layout/ · ui/
│   ├── context/                    # Auth, Theme, Toast
│   ├── hooks/                      # React Query wrappers
│   ├── services/                   # HTTP + push + request
│   ├── storage/                    # SecureStore + AsyncStorage
│   ├── schemas/                    # Zod local (auth)
│   ├── config/                     # api-routes, env
│   ├── constants/                  # theme, motion, transitions
│   └── lib/                        # query-client, persister
├── scripts/                        # write-api-url, load-app-env, bump version
├── app.json · app.config.js
├── env-exemple
└── package.json
```

---

## Ciclo de vida — resumo

```mermaid
flowchart TB
    subgraph Open["Abrir app"]
        O1[Splash + fonts] --> O2[Sessão SecureStore]
        O2 --> O3{Autenticado?}
        O3 -->|Sim| O4[Home]
        O3 -->|Não| O5[Welcome → Login]
    end

    subgraph Use["Uso"]
        U1[React Query → API] --> U2[Vendas · Clientes · Analytics]
        U2 --> U3[Perfil · Notificações push]
    end

    subgraph Close["Sair"]
        C1[Logout] --> C2[Limpa sessão + cache + push]
        C2 --> O5
    end

    O4 --> Use
```

---

## Documentação relacionada

- [Backend — API Express](./BACKEND.md)
- [Fluxo de troca de senha](./README.md)
- [Fluxo de notificações](./FLUXO_NOTIFICACOES.md)
- Template env: `app/env-exemple`
- Build APK: `./build-apk.sh` na raiz do monorepo
