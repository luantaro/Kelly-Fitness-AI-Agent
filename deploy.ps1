# 🚀 Build and Deploy to Firebase
Write-Host "Starting build and deploy process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the application
Write-Host "📦 Building Next.js application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Copy files to Firebase public directory
Write-Host "📁 Copying build files to Firebase public directory..." -ForegroundColor Green
if (Test-Path "out") {
    Remove-Item -Path "public\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "out\*" -Destination "public\" -Recurse -Force
    Write-Host "✅ Files copied successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build output directory 'out' not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Deploy to Firebase
Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Green
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your site is live at: https://kelly-fitness-93e58.web.app" -ForegroundColor Cyan
    Write-Host "👑 Admin panel: https://kelly-fitness-93e58.web.app/admin" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed! Please check Firebase CLI setup." -ForegroundColor Red
    Write-Host "💡 Try: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✨ All done! Happy coding! ✨" -ForegroundColor Magenta
