# 🚀 Scripts de Reinicialização - James Transportes

Criei 3 scripts para facilitar o restart do servidor de desenvolvimento!

## 📝 Scripts Disponíveis

### 1️⃣ **restart.bat** (Windows - Mais Simples)
Para usar no **Prompt de Comando** ou **Terminal do Windows**

### 2️⃣ **restart.ps1** (PowerShell - Mais Poderoso)
Para usar no **PowerShell**

### 3️⃣ **restart.sh** (Bash - Git Bash/Linux/Mac)
Para usar no **Git Bash**, **WSL**, **Linux** ou **Mac**

---

## 🎯 Como Usar

### No Git Bash (RECOMENDADO)

```bash
./restart.sh
```

ou

```bash
bash restart.sh
```

### No PowerShell

```powershell
.\restart.ps1
```

### No CMD (Prompt de Comando)

```cmd
restart.bat
```

ou simplesmente:

```cmd
restart
```

---

## ✨ O que os scripts fazem:

1. 🛑 **Param todos os servidores** rodando nas portas 5173 e 5174
2. 🧹 **Matam processos Node.js** antigos
3. ⏳ **Aguardam 1 segundo** para garantir que tudo parou
4. 🚀 **Iniciam o servidor** novamente com `npm run dev`

---

## 🔧 Atalhos Úteis

### Criar um alias no Git Bash

Adicione no arquivo `~/.bashrc`:

```bash
alias restart='cd /c/Develop/JamesTransportes && ./restart.sh'
```

Depois, de qualquer pasta, basta digitar:
```bash
restart
```

### Criar um alias no PowerShell

Adicione no perfil do PowerShell (`$PROFILE`):

```powershell
function Restart-JamesTransportes {
    Set-Location C:\Develop\JamesTransportes
    .\restart.ps1
}
Set-Alias restart Restart-JamesTransportes
```

Depois, de qualquer pasta, basta digitar:
```powershell
restart
```

---

## ⚠️ Problemas Comuns

### PowerShell: "execução de scripts está desabilitada"

Execute este comando **uma vez** (como Administrador):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Confirme com `S` (Sim).

### Git Bash: "Permission denied"

Dê permissão de execução:

```bash
chmod +x restart.sh
```

---

## 📖 Exemplo de Uso

```bash
# No Git Bash
$ cd /c/Develop/JamesTransportes
$ ./restart.sh

🔄 Reiniciando servidor de desenvolvimento...

🛑 Parando servidores nas portas 5173 e 5174...
✅ Servidores anteriores parados

🚀 Iniciando servidor...

  VITE v5.4.21  ready in 1323 ms

  ➜  Local:   http://localhost:5173/
```

---

## 💡 Dica Extra

Se você usa **VS Code**, pode adicionar um **task** para rodar com atalho:

Crie `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Restart Server",
      "type": "shell",
      "command": "./restart.sh",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Depois: `Ctrl+Shift+P` → `Tasks: Run Task` → `Restart Server`

---

## 🎉 Pronto!

Agora você tem um comando rápido para reiniciar o servidor sempre que precisar!

**Recomendação**: Use `./restart.sh` no Git Bash para melhor compatibilidade.
