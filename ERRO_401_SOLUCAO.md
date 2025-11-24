# ⚠️ ERRO 401 - Variáveis de Ambiente Não Configuradas

## 🔴 PROBLEMA IDENTIFICADO

O erro `401 (Unauthorized)` indica que o GitHub Pages **não tem acesso** às variáveis de ambiente do Supabase (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

---

## ✅ SOLUÇÃO - Configurar Secrets no GitHub

### Passo 1: Acessar Configurações de Secrets

1. Acesse: **https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions**

2. Você verá a página "Actions secrets and variables"

---

### Passo 2: Adicionar o Primeiro Secret

1. Clique no botão verde **"New repository secret"**

2. Preencha:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Cole a URL do seu projeto Supabase (está no arquivo `.env` local)

3. Clique em **"Add secret"**

---

### Passo 3: Adicionar o Segundo Secret

1. Clique novamente em **"New repository secret"**

2. Preencha:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Cole a chave ANON do seu Supabase (está no arquivo `.env` local)

3. Clique em **"Add secret"**

---

### Passo 4: Verificar Secrets Criados

Após adicionar, você deve ver:

```
Repository secrets
- VITE_SUPABASE_URL (Updated X minutes ago)
- VITE_SUPABASE_ANON_KEY (Updated X minutes ago)
```

---

### Passo 5: Forçar Novo Deploy

Agora que os secrets estão configurados, você precisa fazer um novo deploy:

**Opção 1 - Fazer Push (Recomendado):**
```bash
# Fazer qualquer mudança pequena
git commit --allow-empty -m "trigger deploy com secrets configurados"
git push origin main
```

**Opção 2 - Re-run Workflow:**
1. Acesse: https://github.com/andrethiagohass/JamesTransportes/actions
2. Clique no último workflow "Deploy to GitHub Pages"
3. Clique em "Re-run all jobs"

---

### Passo 6: Aguardar Deploy

1. Acesse: https://github.com/andrethiagohass/JamesTransportes/actions
2. Aguarde o workflow ficar verde ✅
3. Teste o site: https://andrethiagohass.github.io/JamesTransportes/

---

## 🎯 CHECKLIST

- [ ] Acessar Settings → Secrets → Actions
- [ ] Criar secret `VITE_SUPABASE_URL`
- [ ] Criar secret `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar que os 2 secrets aparecem na lista
- [ ] Fazer push ou re-run do workflow
- [ ] Aguardar deploy finalizar (2-3 min)
- [ ] Testar o site

---

## 📸 AJUDA VISUAL

### Como deve ficar:

```
GitHub Repository Settings
└── Secrets and variables
    └── Actions
        ├── Repository secrets
        │   ├── VITE_SUPABASE_URL ✅
        │   └── VITE_SUPABASE_ANON_KEY ✅
        └── [New repository secret] (botão)
```

---

## ⚠️ IMPORTANTE

### Os secrets SÃO OBRIGATÓRIOS porque:

1. O arquivo `.env` está apenas no seu computador local
2. O GitHub Actions não tem acesso ao seu `.env`
3. O build no GitHub precisa dessas variáveis para funcionar
4. Por segurança, nunca comitamos `.env` no Git (ele está no `.gitignore`)

### Como encontrar os valores:

**URL Supabase:**
- Abra seu arquivo `.env` local
- Copie o valor de `VITE_SUPABASE_URL`

**Chave ANON:**
- Abra seu arquivo `.env` local
- Copie o valor completo de `VITE_SUPABASE_ANON_KEY` (geralmente tem ~200 caracteres)

---

## 🔍 COMO VERIFICAR SE DEU CERTO

### No GitHub Actions:
```
Build (npm run build)
  ✅ Creating an optimized production build...
  ✅ Build completed successfully
```

### No Site:
```
✅ Login funciona
✅ Dashboard carrega
✅ Lançamentos aparecem
✅ Sem erro 401
```

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Secret name is required"
- Certifique-se de preencher o campo "Name"

### Erro: "Secret value is required"
- Certifique-se de colar a chave completa (205 caracteres)

### Deploy ainda dá erro 401
- Verifique se os nomes estão EXATAMENTE como:
  - `VITE_SUPABASE_URL` (com underline)
  - `VITE_SUPABASE_ANON_KEY` (com underline)
- Refaça o deploy após adicionar os secrets

### Site não carrega
- Aguarde 2-3 minutos após o workflow ficar verde
- Limpe cache do navegador (Ctrl+Shift+R)

---

## 🎉 DEPOIS DE CONFIGURAR

Seu site estará funcionando perfeitamente em:
**https://andrethiagohass.github.io/JamesTransportes/**

Com:
- ✅ Login funcionando
- ✅ Conexão com Supabase
- ✅ Todos os dados carregando
- ✅ Sem erros 401

---

## 📞 LINKS RÁPIDOS

| Ação | Link |
|------|------|
| **Adicionar Secrets** | https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions |
| **Ver Workflows** | https://github.com/andrethiagohass/JamesTransportes/actions |
| **Acessar Site** | https://andrethiagohass.github.io/JamesTransportes/ |

---

**Siga os passos acima e o erro 401 será resolvido! 🚀**
