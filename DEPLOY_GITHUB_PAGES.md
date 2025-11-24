# 🚀 Deploy no GitHub Pages - James Transportes

## ✅ TUDO CONFIGURADO!

Já configurei tudo automaticamente para você! O deploy vai acontecer automaticamente sempre que você fizer push.

---

## 📋 PASSOS PARA PUBLICAR

### 1️⃣ Configurar Secrets no GitHub

Você precisa adicionar as variáveis de ambiente como **Secrets** no GitHub:

1. Acesse: https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions

2. Clique em **New repository secret**

3. Adicione 2 secrets:

   **Secret 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://rxlnvvuxmfrixajkpdci.supabase.co`
   - Clique em **Add secret**

   **Secret 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bG52dnV4bWZyaXhhamtwZGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTg5MzcsImV4cCI6MjA3OTUzNDkzN30.TeRVzRDVCIhEgjwbPfzoyEAAIG_mFE80BvjA3jIg`
   - Clique em **Add secret**

---

### 2️⃣ Ativar GitHub Pages

1. Acesse: https://github.com/andrethiagohass/JamesTransportes/settings/pages

2. Em **Source**, selecione:
   - **Source**: GitHub Actions ✅

3. Clique em **Save**

---

### 3️⃣ Fazer Push e Deploy

Agora vamos fazer commit das mudanças e fazer push:

```bash
git add .
git commit -m "feat: configurar deploy para GitHub Pages"
git push origin main
```

---

### 4️⃣ Aguardar o Deploy

1. Após o push, acesse: https://github.com/andrethiagohass/JamesTransportes/actions

2. Você verá o workflow "Deploy to GitHub Pages" rodando

3. Aguarde 2-3 minutos até ficar verde ✅

4. Seu site estará disponível em:
   **https://andrethiagohass.github.io/JamesTransportes/**

---

## 🎯 RESUMO RÁPIDO

| Passo | O que fazer | Link |
|-------|-------------|------|
| 1 | Adicionar Secrets | https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions |
| 2 | Ativar GitHub Pages | https://github.com/andrethiagohass/JamesTransportes/settings/pages |
| 3 | Fazer push | `git push origin main` |
| 4 | Ver deploy rodando | https://github.com/andrethiagohass/JamesTransportes/actions |
| 5 | Acessar site | https://andrethiagohass.github.io/JamesTransportes/ |

---

## 📝 O QUE FOI CONFIGURADO

✅ Arquivo `.github/workflows/deploy.yml` criado
✅ Vite configurado com `base: '/JamesTransportes/'`
✅ Build automático quando fizer push na branch main
✅ Deploy automático para GitHub Pages

---

## 🔄 COMO FUNCIONA

Toda vez que você fizer push para a branch `main`:

1. GitHub Actions vai executar
2. Instalar dependências (`npm ci`)
3. Fazer build (`npm run build`)
4. Publicar na GitHub Pages
5. Site fica disponível em 2-3 minutos

---

## 🎁 EXTRAS

### Ver logs do deploy:
https://github.com/andrethiagohass/JamesTransportes/actions

### Forçar novo deploy (se necessário):
1. Vá em Actions
2. Clique em "Deploy to GitHub Pages"
3. Clique em "Run workflow"

### Domínio customizado (opcional):
Se quiser usar um domínio próprio (ex: transportes.com.br):
1. Compre um domínio
2. Configure DNS CNAME para `andrethiagohass.github.io`
3. Adicione o domínio em Settings → Pages

---

## ⚠️ IMPORTANTE

- **Secrets são obrigatórios**: O build não vai funcionar sem eles
- **Aguarde 2-3 minutos**: O deploy não é instantâneo
- **Primeira vez pode demorar mais**: GitHub está configurando tudo

---

## 🆘 PROBLEMAS COMUNS

### Deploy falhou?
1. Verifique se adicionou os 2 secrets corretamente
2. Veja os logs em Actions
3. Certifique-se que selecionou "GitHub Actions" em Pages

### Site não carrega?
1. Aguarde mais alguns minutos
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Verifique se GitHub Pages está ativo

### Erros de build?
1. Veja os logs em Actions
2. Verifique se os secrets estão corretos
3. Tente fazer build local: `npm run build`

---

## 🎉 PRONTO!

Depois de configurar os secrets e fazer push, seu site estará no ar em:

**🌐 https://andrethiagohass.github.io/JamesTransportes/**

Compartilhe esse link com a pessoa que vai usar! 🚀

---

## 📞 PRÓXIMOS PASSOS

1. [ ] Adicionar secrets no GitHub
2. [ ] Ativar GitHub Pages
3. [ ] Fazer commit e push
4. [ ] Aguardar deploy
5. [ ] Acessar o site
6. [ ] Compartilhar o link!

---

**Qualquer dúvida, consulte os logs em Actions! 💪**
