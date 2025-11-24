# ⚠️ RESOLVER ERRO: 401 Unauthorized - Invalid API key

## 🔴 Erro que você está vendo:

```
POST https://rxlnvvuxmfrixajkpdci.supabase.co/rest/v1/preco_km 401 (Unauthorized)
Erro ao salvar: {message: 'Invalid API key', hint: 'Double check your Supabase `anon` or `service_role` API key.'}
```

## 🎯 CAUSAS POSSÍVEIS:

1. ❌ Chave API está errada ou incompleta
2. ❌ RLS (Row Level Security) está ativo e bloqueando
3. ❌ Tabelas não foram criadas ainda

---

## ✅ SOLUÇÃO COMPLETA - Siga na ordem:

### 1️⃣ VERIFICAR SE AS TABELAS EXISTEM

1. Acesse: https://supabase.com
2. Entre no seu projeto
3. Vá em **Table Editor** (ícone de tabela na lateral)
4. Verifique se existem essas 4 tabelas:
   - `preco_km`
   - `preco_kg`
   - `taxa_arrancada`
   - `lancamentos`

**❌ Se NÃO existirem:** Vá para o arquivo `SUPABASE_SETUP.md` e execute o **Passo 4** (criar tabelas)

**✅ Se existirem:** Continue para o passo 2

---

### 2️⃣ DESABILITAR RLS (Row Level Security)

⚠️ **IMPORTANTE**: Este é o problema mais comum!

No Supabase:

1. Vá em **SQL Editor** (ícone de banco de dados)
2. Clique em **+ New query**
3. Cole este SQL:

```sql
-- Desabilitar RLS para permitir acesso
ALTER TABLE preco_km DISABLE ROW LEVEL SECURITY;
ALTER TABLE preco_kg DISABLE ROW LEVEL SECURITY;
ALTER TABLE taxa_arrancada DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;
```

4. Clique em **RUN** (ou pressione `Ctrl+Enter`)
5. Você deve ver: "Success. No rows returned"

---

### 3️⃣ VERIFICAR A CHAVE API (Se ainda não funcionar)

1. No Supabase, vá em **Settings** (⚙️) → **API**
2. Procure a seção **Project API keys**
3. Copie a chave **anon/public** (NÃO a service_role)
4. **IMPORTANTE**: Copie a chave COMPLETA (ela é bem longa!)

A chave deve ter este formato:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M.....várias_letras_e_números
```

5. Abra o arquivo `.env` e substitua a chave:

```env
VITE_SUPABASE_URL=https://rxlnvvuxmfrixajkpdci.supabase.co
VITE_SUPABASE_ANON_KEY=cole_a_chave_completa_aqui
```

6. **REINICIE o servidor**:
   - Pare com `Ctrl+C`
   - Execute: `npm run dev`
   - Ou use: `./restart.sh`

---

### 4️⃣ TESTAR MANUALMENTE NO SUPABASE

Para garantir que as tabelas estão funcionando:

1. Vá em **Table Editor**
2. Clique na tabela `preco_km`
3. Clique em **Insert** → **Insert row**
4. Preencha:
   - `valor`: 2.50
   - `ativo`: true
5. Clique em **Save**

**✅ Se conseguir salvar:** As tabelas estão OK, o problema é RLS ou chave
**❌ Se não conseguir:** As tabelas não foram criadas corretamente

---

## 🔍 VERIFICAÇÃO RÁPIDA NO SQL EDITOR

Execute este SQL para verificar se o RLS está desabilitado:

```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('preco_km', 'preco_kg', 'taxa_arrancada', 'lancamentos');
```

**Resultado esperado:**
```
tablename          | rls_enabled
-------------------|------------
preco_km           | false
preco_kg           | false
taxa_arrancada     | false
lancamentos        | false
```

Se aparecer `true` em qualquer uma, execute o SQL do **Passo 2** novamente.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Tabelas foram criadas no Supabase
- [ ] RLS foi desabilitado em todas as tabelas
- [ ] Chave API está completa no `.env`
- [ ] URL está correta no `.env`
- [ ] Servidor foi reiniciado após editar `.env`
- [ ] Não há espaços extras no `.env`

---

## 🆘 SOLUÇÃO DEFINITIVA (Se nada funcionar)

Execute TUDO do zero no Supabase:

### SQL Completo para copiar e colar:

```sql
-- ===================================
-- DELETAR TABELAS ANTIGAS (se existirem)
-- ===================================
DROP TABLE IF EXISTS lancamentos CASCADE;
DROP TABLE IF EXISTS taxa_arrancada CASCADE;
DROP TABLE IF EXISTS preco_kg CASCADE;
DROP TABLE IF EXISTS preco_km CASCADE;

-- ===================================
-- CRIAR TABELAS
-- ===================================
CREATE TABLE preco_km (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE preco_kg (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE taxa_arrancada (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  km_inicial INTEGER NOT NULL CHECK (km_inicial >= 0),
  km_final INTEGER NOT NULL CHECK (km_final > km_inicial),
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lancamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  km_inicial DECIMAL(10,2) NOT NULL CHECK (km_inicial >= 0),
  km_final DECIMAL(10,2) NOT NULL CHECK (km_final > km_inicial),
  km_total DECIMAL(10,2) NOT NULL CHECK (km_total >= 0),
  peso DECIMAL(10,2) NOT NULL CHECK (peso >= 0),
  valor_km DECIMAL(10,2) NOT NULL CHECK (valor_km >= 0),
  valor_peso DECIMAL(10,2) NOT NULL CHECK (valor_peso >= 0),
  taxa_arrancada DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_total DECIMAL(10,2) NOT NULL CHECK (preco_total >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================
-- DESABILITAR RLS
-- ===================================
ALTER TABLE preco_km DISABLE ROW LEVEL SECURITY;
ALTER TABLE preco_kg DISABLE ROW LEVEL SECURITY;
ALTER TABLE taxa_arrancada DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;

-- ===================================
-- CRIAR ÍNDICES
-- ===================================
CREATE INDEX idx_preco_km_ativo ON preco_km(ativo, created_at DESC);
CREATE INDEX idx_preco_kg_ativo ON preco_kg(ativo, created_at DESC);
CREATE INDEX idx_taxa_arrancada_ativo ON taxa_arrancada(ativo, km_inicial, km_final);
CREATE INDEX idx_lancamentos_data ON lancamentos(data DESC);

-- ===================================
-- INSERIR DADOS DE TESTE (Opcional)
-- ===================================
INSERT INTO preco_km (valor, ativo) VALUES (2.50, true);
INSERT INTO preco_kg (valor, ativo) VALUES (0.15, true);
INSERT INTO taxa_arrancada (km_inicial, km_final, valor, ativo) VALUES
  (0, 200, 157.00, true),
  (201, 300, 236.00, true),
  (301, 400, 315.00, true),
  (401, 500, 394.00, true);
```

Cole TUDO no SQL Editor e clique em **RUN**.

---

## ✅ DEPOIS DE EXECUTAR:

1. Recarregue a página do sistema (F5)
2. Tente cadastrar um preço por KM
3. Deve funcionar!

---

**99% das vezes o problema é o RLS não estar desabilitado! Execute o passo 2! 🚀**
