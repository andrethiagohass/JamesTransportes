# 📋 Configuração do Supabase - James Transportes

Este documento contém todas as instruções para configurar o banco de dados no Supabase.

## 🔐 Passo 1: Criar um Projeto no Supabase

1. Acesse https://supabase.com
2. Faça login com sua conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: James Transportes
   - **Database Password**: Crie uma senha forte (salve em local seguro!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde a criação do projeto (pode levar 1-2 minutos)

## 🔑 Passo 2: Obter as Credenciais

1. Na tela do seu projeto, vá em **Settings** (ícone de engrenagem) → **API**
2. Você verá:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Uma chave longa começando com `eyJ...`
3. Copie esses valores

## 📝 Passo 3: Configurar Variáveis de Ambiente

1. No seu projeto, crie um arquivo `.env` na raiz (c:\Develop\JamesTransportes\.env)
2. Adicione:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

⚠️ **IMPORTANTE**: Substitua pelos valores copiados no Passo 2!

## 🗄️ Passo 4: Criar as Tabelas

1. No Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em "+ New query"
3. Cole o seguinte SQL:

```sql
-- ============================================
-- TABELA: preco_km
-- Armazena os preços por quilômetro
-- ============================================
CREATE TABLE preco_km (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA: preco_kg
-- Armazena os preços por quilograma
-- ============================================
CREATE TABLE preco_kg (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABELA: taxa_arrancada
-- Armazena as taxas de arrancada por faixa de KM
-- ============================================
CREATE TABLE taxa_arrancada (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  km_inicial INTEGER NOT NULL CHECK (km_inicial >= 0),
  km_final INTEGER NOT NULL CHECK (km_final > km_inicial),
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT faixa_km_valida CHECK (km_final > km_inicial)
);

-- ============================================
-- TABELA: lancamentos
-- Armazena os lançamentos de viagens
-- ============================================
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

-- ============================================
-- ÍNDICES para melhorar performance
-- ============================================
CREATE INDEX idx_preco_km_ativo ON preco_km(ativo, created_at DESC);
CREATE INDEX idx_preco_kg_ativo ON preco_kg(ativo, created_at DESC);
CREATE INDEX idx_taxa_arrancada_ativo ON taxa_arrancada(ativo, km_inicial, km_final);
CREATE INDEX idx_lancamentos_data ON lancamentos(data DESC);

-- ============================================
-- TRIGGERS para atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_preco_km_updated_at BEFORE UPDATE ON preco_km
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preco_kg_updated_at BEFORE UPDATE ON preco_kg
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taxa_arrancada_updated_at BEFORE UPDATE ON taxa_arrancada
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON lancamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **RUN** (botão no canto inferior direito)
5. Você verá "Success. No rows returned" - isso está correto!

## 🔓 Passo 5: Configurar as Políticas de Acesso (RLS)

Por padrão, o Supabase ativa Row Level Security (RLS). Para este sistema simples, vamos desabilitar:

1. No SQL Editor, crie uma nova query
2. Cole o seguinte SQL:

```sql
-- Desabilitar RLS para permitir acesso público
-- (Para produção, você deve configurar autenticação)
ALTER TABLE preco_km DISABLE ROW LEVEL SECURITY;
ALTER TABLE preco_kg DISABLE ROW LEVEL SECURITY;
ALTER TABLE taxa_arrancada DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;
```

3. Clique em **RUN**

⚠️ **NOTA DE SEGURANÇA**: Esta configuração é para desenvolvimento. Em produção, você deve implementar autenticação e políticas de RLS adequadas!

## 📊 Passo 6: Inserir Dados Iniciais (Opcional)

Para testar o sistema, você pode inserir alguns dados de exemplo:

```sql
-- Inserir preço por KM inicial
INSERT INTO preco_km (valor, ativo) VALUES (2.50, true);

-- Inserir preço por KG inicial
INSERT INTO preco_kg (valor, ativo) VALUES (0.15, true);

-- Inserir taxas de arrancada
INSERT INTO taxa_arrancada (km_inicial, km_final, valor, ativo) VALUES
  (0, 200, 157.00, true),
  (201, 300, 236.00, true),
  (301, 400, 315.00, true),
  (401, 500, 394.00, true);
```

## ✅ Passo 7: Verificar as Tabelas

1. Vá em **Table Editor** (ícone de tabela)
2. Você deve ver 4 tabelas:
   - `preco_km`
   - `preco_kg`
   - `taxa_arrancada`
   - `lancamentos`
3. Clique em cada uma para verificar se foram criadas corretamente

## 🚀 Passo 8: Testar a Conexão

1. Certifique-se de que o arquivo `.env` está configurado corretamente
2. No terminal, execute:

```bash
npm install
npm run dev
```

3. O sistema deve abrir em `http://localhost:5173`
4. Tente cadastrar um preço por KM
5. Se funcionar, sua configuração está correta! 🎉

## 📱 Estrutura das Tabelas

### `preco_km`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| valor | DECIMAL | Valor por quilômetro (R$) |
| ativo | BOOLEAN | Se está ativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### `preco_kg`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| valor | DECIMAL | Valor por quilograma (R$) |
| ativo | BOOLEAN | Se está ativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### `taxa_arrancada`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| km_inicial | INTEGER | KM inicial da faixa |
| km_final | INTEGER | KM final da faixa |
| valor | DECIMAL | Valor da taxa (R$) |
| ativo | BOOLEAN | Se está ativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### `lancamentos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| data | DATE | Data da viagem |
| km_inicial | DECIMAL | Quilometragem inicial |
| km_final | DECIMAL | Quilometragem final |
| km_total | DECIMAL | Total de KM (calculado) |
| peso | DECIMAL | Peso transportado (kg) |
| valor_km | DECIMAL | Valor/km usado no cálculo |
| valor_peso | DECIMAL | Valor/kg usado no cálculo |
| taxa_arrancada | DECIMAL | Taxa de arrancada aplicada |
| preco_total | DECIMAL | Valor total da viagem |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme se as variáveis estão corretas (sem espaços extras)

### Erro ao conectar
- Verifique se a URL e a chave estão corretas
- Confirme se o projeto no Supabase está ativo
- Tente recriar as credenciais no Supabase

### Tabelas não aparecem
- Execute novamente o SQL de criação das tabelas
- Verifique se há erros no SQL Editor
- Confirme se está no projeto correto

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase (Settings → Logs)
3. Revise cada passo desta documentação

---

**🎉 Pronto! Seu banco de dados está configurado e pronto para uso!**
