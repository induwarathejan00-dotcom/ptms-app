# PTMS Startup Script
Write-Host "Checking for existing processes on port 3000..." -ForegroundColor Cyan
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($process) {
    Write-Host "Stopping process $process..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force
}

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
