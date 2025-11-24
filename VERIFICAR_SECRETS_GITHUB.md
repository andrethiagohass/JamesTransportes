# 🔍 Como Verificar se os Secrets Estão Configurados

## ✅ PASSO A PASSO COMPLETO

### 1. Acesse a Página de Secrets

Clique neste link:
👉 **https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions**

### 2. Verifique se Existem 2 Secrets

Você deve ver uma lista com **exatamente 2 secrets**:

```
Repository secrets

🔒 VITE_SUPABASE_ANON_KEY     Updated X ago    [Update] [Remove]
🔒 VITE_SUPABASE_URL          Updated X ago    [Update] [Remove]
```

### 3. Se NÃO Aparecer Nada ou Aparecer Menos de 2 Secrets:

**Você precisa CRIAR os secrets!**

#### Criar Secret 1:

1. Clique no botão verde **"New repository secret"**
2. Em **Name**, digite: `VITE_SUPABASE_URL`
3. Em **Secret**, cole: (abra seu arquivo `.env` local e copie o valor de `VITE_SUPABASE_URL`)
4. Clique em **Add secret**

#### Criar Secret 2:

1. Clique novamente em **"New repository secret"**
2. Em **Name**, digite: `VITE_SUPABASE_ANON_KEY`
3. Em **Secret**, cole: (abra seu arquivo `.env` local e copie o valor completo de `VITE_SUPABASE_ANON_KEY`)
4. Clique em **Add secret**

---

### 4. Confirmar que os Secrets Foram Criados

Após criar, você deve ver:

```
✅ VITE_SUPABASE_URL          Updated now
✅ VITE_SUPABASE_ANON_KEY     Updated now
```

---

### 5. Fazer um Novo Deploy

Após adicionar os secrets, você precisa fazer um novo deploy:

```powershell
# Fazer commit vazio para triggerar deploy
git commit --allow-empty -m "trigger deploy com secrets configurados"
git push origin main
```

---

### 6. Acompanhar o Deploy

1. Acesse: https://github.com/andrethiagohass/JamesTransportes/actions
2. Clique no workflow que acabou de iniciar
3. Clique em "build"
4. Expanda "Build"
5. Você deve ver algo como:

```
✅ Creating an optimized production build...
✅ Build completed successfully
```

---

### 7. Testar o Site

Após o workflow ficar verde (✅):

1. Aguarde 1-2 minutos
2. Acesse: https://andrethiagohass.github.io/JamesTransportes/
3. Faça login
4. Verifique se o Dashboard carrega sem erro 401

---

## 🔍 COMO SABER SE OS SECRETS ESTÃO FUNCIONANDO

### No GitHub Actions:

Durante o build, você NÃO vai ver os valores dos secrets (por segurança), mas se estiverem configurados, o build vai funcionar.

### No Console do Navegador:

**ANTES (com erro):**
```
❌ GET https://...supabase.co/rest/v1/lancamentos 401 (Unauthorized)
❌ Erro: Invalid API key
```

**DEPOIS (funcionando):**
```
✅ GET https://...supabase.co/rest/v1/lancamentos 200 (OK)
✅ Dados carregados
```

---

## 📋 CHECKLIST COMPLETO

- [ ] Abrir link dos secrets
- [ ] Verificar se aparecem 2 secrets
- [ ] Se não aparecer, criar `VITE_SUPABASE_URL`
- [ ] Se não aparecer, criar `VITE_SUPABASE_ANON_KEY`
- [ ] Confirmar que os 2 secrets estão na lista
- [ ] Fazer commit vazio e push
- [ ] Ver workflow rodando em Actions
- [ ] Aguardar ficar verde
- [ ] Testar o site
- [ ] Verificar se não tem erro 401

---

## ⚠️ ATENÇÃO

### Os valores dos secrets devem ser EXATAMENTE:

**Name (campo Nome):**
- `VITE_SUPABASE_URL` ← Copie exatamente assim
- `VITE_SUPABASE_ANON_KEY` ← Copie exatamente assim

**Secret (campo Valor):**
- Cole o valor do seu arquivo `.env` local
- NÃO inclua aspas
- NÃO inclua o nome da variável (só o valor)

### Exemplo CORRETO:

```
Name: VITE_SUPABASE_URL
Secret: https://seuprojetoid.supabase.co
       ↑ só o valor, sem VITE_SUPABASE_URL=
```

### Exemplo ERRADO:

```
Name: VITE_SUPABASE_URL
Secret: VITE_SUPABASE_URL=https://seuprojetoid.supabase.co
       ↑ NÃO coloque o nome da variável no valor!
```

---

## 🎯 RESUMO RÁPIDO

1. **Vá em:** https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions
2. **Crie 2 secrets** com valores do seu `.env` local
3. **Faça push** para triggerar novo deploy
4. **Aguarde** workflow ficar verde
5. **Teste** o site

---

## 🆘 SE AINDA DER ERRO

Se depois de tudo isso ainda der erro 401:

1. Verifique se os nomes dos secrets estão EXATOS:
   - `VITE_SUPABASE_URL` (com underline `_`)
   - `VITE_SUPABASE_ANON_KEY` (com underline `_`)

2. Verifique se copiou os valores COMPLETOS do `.env`

3. Tente clicar em "Update" nos secrets e recolar os valores

4. Faça novo push para triggerar deploy novamente

---

**Acesse agora:** https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions 🔐
