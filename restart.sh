#!/bin/bash

# 🚀 Script para reiniciar o servidor de desenvolvimento
# James Transportes

echo "🔄 Reiniciando servidor de desenvolvimento..."
echo ""

# Matar processos Node.js rodando na porta 5173 e 5174
echo "🛑 Parando servidores na porta 5173 e 5174..."

# No Windows (Git Bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Matar processo na porta 5173
    netstat -ano | findstr :5173 | awk '{print $5}' | xargs -I {} taskkill //PID {} //F 2>/dev/null
    # Matar processo na porta 5174
    netstat -ano | findstr :5174 | awk '{print $5}' | xargs -I {} taskkill //PID {} //F 2>/dev/null
    # Matar todos os processos node
    taskkill //F //IM node.exe 2>/dev/null
# No Linux/Mac
else
    # Matar processo na porta 5173
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    # Matar processo na porta 5174
    lsof -ti:5174 | xargs kill -9 2>/dev/null
fi

echo "✅ Servidores anteriores parados"
echo ""

# Aguardar 1 segundo
sleep 1

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
echo ""
npm run dev
