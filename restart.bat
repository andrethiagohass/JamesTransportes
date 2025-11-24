@echo off
REM 🚀 Script BAT para reiniciar o servidor de desenvolvimento
REM James Transportes

echo.
echo 🔄 Reiniciando servidor de desenvolvimento...
echo.

REM Matar processos Node.js
echo 🛑 Parando servidores...
taskkill /F /IM node.exe 2>nul
echo ✅ Servidores anteriores parados
echo.

REM Aguardar 1 segundo
timeout /t 1 /nobreak >nul

REM Iniciar o servidor
echo 🚀 Iniciando servidor...
echo.
npm run dev
