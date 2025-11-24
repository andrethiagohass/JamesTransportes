# ⚠️ ATENÇÃO - CREDENCIAIS EXPOSTAS

## 🔴 PROBLEMA DE SEGURANÇA

Suas credenciais do Supabase foram expostas publicamente em commits anteriores do GitHub.

---

## ✅ AÇÃO IMEDIATA NECESSÁRIA

### 1. Renovar as Credenciais do Supabase

**IMPORTANTE:** As credenciais antigas estão no histórico do Git e são públicas. Você precisa gerar novas credenciais:

1. Acesse: https://supabase.com/dashboard/project/rxlnvvuxmfrixajkpdci/settings/api

2. Na seção **Project API keys**, clique em **"Reset"** ou **"Regenerate"**:
   - Regenerar `anon/public` key
   - Isso invalida a chave antiga

3. Copie as novas credenciais

4. Atualize seu arquivo `.env` local com as novas credenciais

5. Atualize os Secrets no GitHub:
   - Acesse: https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions
   - Edite `VITE_SUPABASE_ANON_KEY` com a nova chave
   - (A URL `VITE_SUPABASE_URL` não precisa mudar)

---

## 📝 O QUE JÁ FOI FEITO

✅ Removi as credenciais dos arquivos:
- `DEPLOY_GITHUB_PAGES.md`
- `ERRO_401_SOLUCAO.md`

✅ Commits futuros não terão credenciais

---

## ⚠️ PROBLEMA REMANESCENTE

❌ O histórico do Git ainda contém as credenciais antigas nos commits:
- `FIX_401_ERROR.md` (commit antigo)
- Outros arquivos .md em commits anteriores

### Soluções:

**Opção 1 - Simples (Recomendada):**
1. Regenere as credenciais no Supabase (anula as antigas)
2. Continue usando o repositório normalmente
3. As credenciais antigas ficam inválidas

**Opção 2 - Avançada:**
1. Limpar histórico do Git (requer `git filter-branch` ou `BFG Repo-Cleaner`)
2. Force push para reescrever histórico
3. Muito complexo e pode quebrar clones existentes

---

## 🔒 CONFIGURAÇÃO DE SEGURANÇA NO SUPABASE

Após regenerar as credenciais, adicione restrições extras:

### 1. Configurar CORS
```
Dashboard → Settings → API
→ Add allowed origins:
  - https://andrethiagohass.github.io
```

### 2. Habilitar RLS (Row Level Security)
```sql
-- Se desabilitou RLS, considere criar políticas específicas
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Exemplo de política simples (todos podem ler)
CREATE POLICY "Permitir leitura pública"
ON lancamentos FOR SELECT
USING (true);
```

### 3. Limitar requisições por IP (opcional)
- Configure no Dashboard do Supabase

---

## 📋 CHECKLIST DE SEGURANÇA

- [ ] Regenerar `anon` key no Supabase
- [ ] Atualizar `.env` local com nova chave
- [ ] Atualizar Secret `VITE_SUPABASE_ANON_KEY` no GitHub
- [ ] Fazer novo deploy (push para main)
- [ ] Testar se o site funciona
- [ ] Configurar CORS no Supabase (opcional)
- [ ] Configurar RLS no Supabase (se necessário)

---

## 🎯 BOAS PRÁTICAS PARA O FUTURO

1. **Nunca commite credenciais**
   - Use sempre `.env` para credenciais
   - `.env` já está no `.gitignore`

2. **Use Secrets do GitHub**
   - Para CI/CD, sempre use Secrets
   - Nunca coloque credenciais em arquivos de documentação

3. **Documentação genérica**
   - Use placeholders: `SUA_URL_AQUI`
   - Nunca valores reais

4. **Rotação de credenciais**
   - Troque credenciais periodicamente
   - Especialmente se expostas

---

## 🆘 LINKS ÚTEIS

| Recurso | Link |
|---------|------|
| **Supabase API Settings** | https://supabase.com/dashboard/project/rxlnvvuxmfrixajkpdci/settings/api |
| **GitHub Secrets** | https://github.com/andrethiagohass/JamesTransportes/settings/secrets/actions |
| **GitHub Actions** | https://github.com/andrethiagohass/JamesTransportes/actions |

---

## ⏱️ TEMPO ESTIMADO

- Regenerar credenciais: 2 minutos
- Atualizar .env e Secrets: 3 minutos
- Novo deploy: 2-3 minutos
- **TOTAL: ~8 minutos**

---

**AÇÃO RECOMENDADA:** Regenere as credenciais do Supabase AGORA para garantir a segurança! 🔒
