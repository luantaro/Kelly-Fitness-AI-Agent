# 🔄 Quick Development Reset
Write-Host "🧹 Cleaning development environment..." -ForegroundColor Cyan

# Clear Next.js cache
if (Test-Path ".next") {
    Write-Host "🗑️ Removing .next cache..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force
}

# Clear node_modules cache
if (Test-Path "node_modules/.cache") {
    Write-Host "🗑️ Removing node_modules cache..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clear build output
if (Test-Path "out") {
    Write-Host "🗑️ Removing build output..." -ForegroundColor Yellow
    Remove-Item -Path "out" -Recurse -Force
}

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host ""

# Start fresh development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev
