# ⚡ GUIA RÁPIDO - 5 MINUTOS

## 🚀 Como Começar AGORA

### Passo 1: Configurar Supabase (5 min)

1. Acesse: https://supabase.com
2. Login → New Project
3. Copie a **URL** e a **anon key** em Settings → API

### Passo 2: Criar `.env`

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=cole_sua_url_aqui
VITE_SUPABASE_ANON_KEY=cole_sua_chave_aqui
```

### Passo 3: Criar Tabelas

No Supabase:
1. SQL Editor → New query
2. Cole o SQL do arquivo `SUPABASE_SETUP.md` (seção "Passo 4")
3. RUN

### Passo 4: Rodar o Sistema

```bash
npm run dev
```

Abra: http://localhost:5173

### Passo 5: Usar

1. Cadastre preço/km
2. Cadastre preço/kg
3. Cadastre taxas de arrancada
4. Faça lançamentos!

---

## 📖 Documentação Completa

- **INICIO_AQUI.md** - Resumo completo do sistema
- **SUPABASE_SETUP.md** - Guia detalhado do banco
- **README.md** - Documentação técnica

---

## 🆘 Problemas?

1. Arquivo `.env` existe na raiz?
2. URL e chave estão corretas?
3. Tabelas foram criadas?
4. `npm install` foi executado?

---

**Bom trabalho! 🚚**
