# Hotfix: Chat RLS Infinite Recursion Error

## Problema
```
Error fetching own participations: "infinite recursion detected in policy for relation \"chat_participants\""
```

### Causa Raiz
A política RLS da tabela `chat_participants` continha uma referência circular:

```sql
-- ❌ PROBLEMA
CREATE POLICY "Anyone can view participants of channels they are in"
  ON chat_participants FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM chat_participants  -- ← Isso causa recursão!
      WHERE user_id = (select auth.uid())
    )
  );
```

Quando a aplicação tenta fazer SELECT em `chat_participants`, a política RLS é ativada. Mas a política contém uma subquery que também faz SELECT da mesma tabela, o que ativa a política novamente, criando um loop infinito.

## Solução

### Arquivos Alterados

1. **Migração**: [`supabase/migrations/20260213000002_fix_chat_rls_recursion.sql`](supabase/migrations/20260213000002_fix_chat_rls_recursion.sql)
   - Remove a política problemática
   - Cria funções RPC seguras com `SECURITY DEFINER`
   - Implementa nova política sem recursão

2. **Código da Aplicação**: [`apps/web/components/dashboard/medico/mensajeria/messaging-service.ts`](apps/web/components/dashboard/medico/mensajeria/messaging-service.ts)
   - Atualiza `getUserChannels()` para usar RPC
   - Atualiza `getChannelWithParticipants()` para usar RPC
   - Atualiza `getUnreadCount()` para usar RPC
   - Adiciona fallbacks para compatibilidade

## Como Aplicar a Migração

### Opção 1: Via Supabase Dashboard (Recomendado)

1. [Acesse o Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto Red Salud
3. Vá para **SQL Editor**
4. Crie uma nova query e copie todo o conteúdo de:
   ```
   supabase/migrations/20260213000002_fix_chat_rls_recursion.sql
   ```
5. Execute a query
6. Verifique se não houve erros

### Opção 2: Via Supabase CLI

```bash
cd c:\Users\Fredd\Developer\red-salud

# Instale o Supabase CLI se não estiver instalado
npm install -g supabase

# Login no seu projeto
supabase login
supabase link --project-ref your-project-ref

# Empurre as migrações
supabase db push
```

### Opção 3: Copiar Conteúdo da Migração Manualmente

Se as opções acima não funcionarem, copie e execute manualmente cada parte da migração:

1. **Remover a política antiga**:
```sql
DROP POLICY IF EXISTS "Anyone can view participants of channels they are in" ON chat_participants;
```

2. **Criar funções RPC** (execute todas as funções CREATE no arquivo da migração)

3. **Criar nova política RLS**:
```sql
CREATE POLICY "Users can view participants of channels they participate in"
  ON chat_participants FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR public.user_is_channel_member(channel_id)
  );
```

## O que Muda na Aplicação

### Antes (❌ Causa Erro)
```typescript
const { data: myParticipations, error: partError } = await supabase
  .from("chat_participants")
  .select("channel_id")
  .eq("user_id", userId)
  .eq("is_banned", false);
  // ❌ Dispara RLS recursão aqui
```

### Depois (✅ Funciona)
```typescript
const { data: channelData, error: rpcError } = await supabase.rpc(
  "get_user_channel_ids"
);
// ✅ Usa função RPC com SECURITY DEFINER - sem recursão
```

## Funções RPC Criadas

### 1. `user_is_channel_member(p_channel_id UUID) → BOOLEAN`
Verifica se o usuário atual é membro de um canal, sem ativar RLS.

### 2. `get_user_channel_ids() → TABLE(channel_id UUID)`
Retorna todos os canais do usuário, evitando recursão RLS.

### 3. `get_channel_participants(p_channel_id UUID) → TABLE(...)`
Retorna todos os participantes de um canal com informações de perfil.

### 4. `get_participant_last_read(p_channel_id UUID) → TIMESTAMP`
Retorna o timestamp do último leitura do usuário em um canal.

## Testes

Após aplicar a migração, teste:

```bash
# 1. Inicie o servidor de desenvolvimento
npm run dev

# 2. Acesse a página de mensajeria
# http://localhost:3000/dashboard/medico/mensajeria

# 3. Verifique se:
# - Os canais carregam sem erros
# - Os participantes são carregados
# - Os status de leitura funcionam
# - Não há erros no console
```

## Fallbacks

O código contém fallbacks para compatibilidade:
- Se a RPC falhar, tenta fazer query direta
- Se ambas falharem, retorna dados vazios
- Mensagens de erro descritivas no console

## Status

- [x] Migração criada
- [x] Código atualizado
- [ ] Migração aplicada ao banco de dados
- [ ] Testes em produção

## Próximas Etapas

1. Apply the migration to your Supabase project
2. Test the messaging feature thoroughly
3. Monitor console logs for any remaining issues
4. Consider auditing other RLS policies to prevent similar issues
