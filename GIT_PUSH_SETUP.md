# 🔐 Configurar Git para Push - James Transportes

## ✅ GIT JÁ CONFIGURADO

Seu Git já está configurado com:
- **Nome**: andrethiagohass
- **Email**: andrethiagohass@users.noreply.github.com
- **Repositório**: https://github.com/andrethiagohass/JamesTransportes.git

---

## ⚠️ PROBLEMA DE AUTENTICAÇÃO

Você está autenticado com outro usuário (fefelinacatsitter) e precisa trocar para andrethiagohass.

---

## 🔧 SOLUÇÕES:

### **Opção 1: Usar GitHub CLI (RECOMENDADO)**

1. Instale o GitHub CLI: https://cli.github.com/
2. Execute:
   ```bash
   gh auth login
   ```
3. Siga as instruções e autentique com andrethiagohass
4. Depois faça o push:
   ```bash
   git push -u origin main
   ```

---

### **Opção 2: Usar Personal Access Token**

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Configure:
   - **Note**: JamesTransportes
   - **Expiration**: 90 days (ou o que preferir)
   - **Scopes**: Marque `repo` (todos os sub-itens)
4. Clique em **Generate token**
5. **COPIE O TOKEN** (você só verá uma vez!)
6. No terminal, execute:
   ```bash
   git remote set-url origin https://SEU_TOKEN_AQUI@github.com/andrethiagohass/JamesTransportes.git
   git push -u origin main
   ```

**Exemplo:**
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/andrethiagohass/JamesTransportes.git
```

---

### **Opção 3: Usar Credential Manager (Windows)**

1. Abra o **Gerenciador de Credenciais** do Windows
   - Pressione `Windows + R`
   - Digite: `control /name Microsoft.CredentialManager`
   - Enter
2. Vá em **Credenciais do Windows**
3. Procure por credenciais do GitHub e **remova todas**
4. Feche e tente fazer push novamente:
   ```bash
   git push -u origin main
   ```
5. Uma janela pedirá para autenticar - entre com andrethiagohass

---

### **Opção 4: Usar SSH (Mais Seguro)**

1. Gere uma chave SSH (se não tiver):
   ```bash
   ssh-keygen -t ed25519 -C "andrethiagohass@users.noreply.github.com"
   ```
   - Pressione Enter 3 vezes (padrão)

2. Copie a chave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. Adicione no GitHub:
   - Acesse: https://github.com/settings/ssh/new
   - Cole a chave
   - Clique em **Add SSH key**

4. Mude o remote para SSH:
   ```bash
   git remote set-url origin git@github.com:andrethiagohass/JamesTransportes.git
   ```

5. Faça o push:
   ```bash
   git push -u origin main
   ```

---

## 🚀 COMANDOS ÚTEIS

### Ver configuração atual:
```bash
git config --list | grep user
git remote -v
```

### Ver status:
```bash
git status
```

### Ver histórico de commits:
```bash
git log --oneline
```

### Forçar push (CUIDADO!):
```bash
git push -u origin main --force
```

---

## 📝 COMANDOS COMPLETOS PARA PUSH

Depois de resolver a autenticação:

```bash
# 1. Verificar mudanças
git status

# 2. Adicionar todos os arquivos (se houver mudanças)
git add .

# 3. Fazer commit
git commit -m "feat: sistema completo de gestão de transportes"

# 4. Fazer push
git push -u origin main
```

---

## ⚠️ RESOLUÇÃO RÁPIDA

**Método mais rápido (Personal Access Token):**

1. Crie token: https://github.com/settings/tokens/new
   - Marque: `repo`
   - Generate token
   - **COPIE O TOKEN**

2. Execute (substitua TOKEN_AQUI):
   ```bash
   git remote set-url origin https://TOKEN_AQUI@github.com/andrethiagohass/JamesTransportes.git
   git push -u origin main
   ```

**Pronto! 🎉**

---

## 📚 MAIS INFORMAÇÕES

- GitHub Docs - Personal Access Tokens: https://docs.github.com/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- GitHub CLI: https://cli.github.com/
- SSH Keys: https://docs.github.com/authentication/connecting-to-github-with-ssh

---

**Escolha uma das opções acima e seu push vai funcionar! 🚀**
