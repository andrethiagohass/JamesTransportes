# 🚀 Script PowerShell para reiniciar o servidor de desenvolvimento
# James Transportes

Write-Host "🔄 Reiniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host ""

# Função para matar processos nas portas 5173 e 5174
function Stop-ServerPorts {
    Write-Host "🛑 Parando servidores nas portas 5173 e 5174..." -ForegroundColor Yellow
    
    # Porta 5173
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($port5173) {
        $process5173 = Get-Process -Id $port5173.OwningProcess -ErrorAction SilentlyContinue
        if ($process5173) {
            Stop-Process -Id $process5173.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Processo na porta 5173 parado" -ForegroundColor Green
        }
    }
    
    # Porta 5174
    $port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue
    if ($port5174) {
        $process5174 = Get-Process -Id $port5174.OwningProcess -ErrorAction SilentlyContinue
        if ($process5174) {
            Stop-Process -Id $process5174.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Processo na porta 5174 parado" -ForegroundColor Green
        }
    }
    
    # Matar todos os processos node.exe (mais garantido)
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Servidores anteriores parados" -ForegroundColor Green
    Write-Host ""
}

# Parar servidores
Stop-ServerPorts

# Aguardar 1 segundo
Start-Sleep -Seconds 1

# Iniciar o servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Cyan
Write-Host ""
npm run dev
