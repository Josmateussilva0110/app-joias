# Plano de Implementação — Fluxo de Senha

Cobre dois cenários distintos:

1. **Trocar senha** — usuário já autenticado no app.
2. **Esqueci minha senha** — usuário deslogado, sem acesso à conta, resolvido via suporte manual (sem envio de e-mail).

---

## 1. Trocar senha (usuário logado)

Usa o Supabase Auth nativamente, sem infraestrutura extra.

### Fluxo

1. Usuário informa **senha atual** + **nova senha** na tela do app.
2. App reautentica com a senha atual, pra confirmar que é o dono da conta:

```ts
const { error: reauthError } = await supabase.auth.signInWithPassword({
  email: user.email,
  password: senhaAtual,
});
```

3. Se a reautenticação for bem-sucedida, atualiza a senha:

```ts
const { error } = await supabase.auth.updateUser({ password: novaSenha });
```

4. Se `reauthError` existir, exibir mensagem de "senha atual incorreta".

### Por que reautenticar antes de trocar
Evita que alguém com a sessão aberta (ex: celular destravado) troque a senha sem confirmar identidade.

---

## 2. Esqueci minha senha (usuário deslogado, via suporte manual)

Sem envio de e-mail ou SMS — a identidade é confirmada por um humano do suporte.

### 2.1 App (React Native)

**Tela "Esqueci minha senha"**
- Formulário pedindo o identificador de login (e-mail ou telefone, o que já for usado).
- Ao enviar, cria uma **solicitação** no backend — não dispara nada automático.
- Mensagem de retorno: *"Solicitação enviada. Nossa equipe vai entrar em contato para confirmar sua identidade e liberar o acesso."*

### 2.2 Backend / Supabase

**Tabela de solicitações**

```sql
create table password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  identifier text not null,                -- email ou telefone informado
  status text not null default 'pending',  -- pending | contacted | resolved | rejected
  requested_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by text                          -- quem no suporte tratou
);
```

**Endpoint**

`POST /auth/password-reset-request`
- Recebe o identificador.
- Localiza o `user_id` correspondente.
- Insere linha em `password_reset_requests` com status `pending`.
- Retorna sempre uma resposta genérica de sucesso, independente de o identificador existir ou não (evita vazar quais contas existem).

### 2.3 Fluxo de atendimento (suporte)

1. Suporte identifica solicitações `pending` (consulta manual na tabela, ou webhook/alerta automático quando uma linha nova é inserida).
2. Entra em contato com o usuário pelo canal já usado (WhatsApp, telefone) e **confirma identidade** (dados que só o dono da conta saberia).
3. Confirmada a identidade, reseta a senha via **Admin API do Supabase**, usando a `service_role key` (nunca exposta no app, só em ambiente seguro/script interno):

```ts
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: novaSenhaTemporaria,
});
```

4. Suporte passa a senha temporária pro usuário, pelo mesmo canal de confirmação de identidade.
5. Atualiza o status da solicitação para `resolved`.

### 2.4 Forçar troca de senha no primeiro login

Pra senha temporária não ficar valendo indefinidamente:

```sql
alter table user_profiles add column must_change_password boolean default false;
```

- Ao resetar via admin, seta `must_change_password = true`.
- No app, após login, checa a flag — se `true`, bloqueia navegação e força a tela de troca de senha (reaproveitando o fluxo da seção 1, sem exigir "senha atual" nesse caso específico, já que é senha temporária).
- Ao trocar com sucesso, seta `must_change_password = false`.

### 2.5 Painel de administração (opcional)

- No início, dá pra acompanhar solicitações direto pelo Supabase Studio.
- Se o volume crescer, evoluir para uma tela interna simples listando solicitações `pending`, com ação de marcar como `resolved`.

---

## Ordem sugerida de implementação

1. **Trocar senha logado**
   - Tela de troca de senha no app.
   - Lógica de reautenticação + `updateUser`.

2. **Esqueci minha senha**
   - Criar tabela `password_reset_requests`.
   - Criar coluna `must_change_password` em `user_profiles`.
   - Endpoint `POST /auth/password-reset-request`.
   - Tela "Esqueci minha senha" no app.
   - Script/rotina admin de reset (com `service_role key`).
   - Lógica de bloqueio + tela de troca obrigatória quando `must_change_password = true`.
   - (Opcional) Alerta automático quando nova solicitação entra.

---

## Pontos de atenção

- **`service_role key`** nunca deve ser exposta no app — só usada em ambiente de backend/admin seguro.
- **Resposta genérica** no endpoint de solicitação evita enumeração de contas existentes.
- **Senha temporária** deve ser de uso único, sempre acompanhada da flag `must_change_password`.
- **Confirmação de identidade manual** é o ponto mais frágil do fluxo — documentar claramente pro suporte quais dados exigir antes de liberar o reset.
