# Firebase Full Deployment
# Safely deploys both frontend and backend with full functions

Write-Host "🚀 Starting Firebase Full Deployment..." -ForegroundColor Green

# Step 1: Build Next.js static export
Write-Host "`n1️⃣ Building Next.js static export..." -ForegroundColor Yellow
try {
    if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
    if (Test-Path "out") { Remove-Item "out" -Recurse -Force }
    
    npm run build
    Write-Host "   ✅ Next.js build completed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Next.js build failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Prepare public folder
Write-Host "`n2️⃣ Preparing Firebase hosting files..." -ForegroundColor Yellow
try {
    # Clean public folder but preserve assets
    $preserveFiles = @(
        'favicon.ico', 'favicon.svg', 'favicon-16.svg', 
        'apple-touch-icon.svg', 'manifest.json',
        'file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg'
    )
    
    Get-ChildItem "public" | Where-Object { $_.Name -notin $preserveFiles } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    
    # Copy static export to public
    if (Test-Path "out") {
        Copy-Item "out\*" "public\" -Recurse -Force
    }
    
    Write-Host "   ✅ Static files prepared" -ForegroundColor Green
} catch {
    Write-Host "   ❌ File preparation failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Build Firebase Functions
Write-Host "`n3️⃣ Building Firebase Functions..." -ForegroundColor Yellow
try {
    Set-Location "functions"
    npm run build
    Set-Location ".."
    Write-Host "   ✅ Functions build completed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Functions build failed: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Step 4: Validate deployment structure
Write-Host "`n4️⃣ Validating deployment structure..." -ForegroundColor Yellow
$missingFiles = @()
if (!(Test-Path "public\index.html")) { $missingFiles += "public\index.html" }
if (!(Test-Path "public\_next")) { $missingFiles += "public\_next" }
if (!(Test-Path "functions\lib\index.js")) { $missingFiles += "functions\lib\index.js" }
if (!(Test-Path "firebase.json")) { $missingFiles += "firebase.json" }

if ($missingFiles.Count -gt 0) {
    Write-Host "   ❌ Missing required files: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   ✅ Deployment structure validated" -ForegroundColor Green
}

# Step 5: Deploy to Firebase
Write-Host "`n5️⃣ Deploying to Firebase..." -ForegroundColor Yellow
try {
    firebase deploy
    Write-Host "   ✅ Firebase deployment completed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Firebase deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Generate deployment report
Write-Host "`n6️⃣ Generating deployment report..." -ForegroundColor Yellow
$report = @{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    status = "SUCCESS"
    deployment = @{
        frontend = "Firebase Hosting"
        backend = "Firebase Functions"
        database = "Firestore"
        auth = "Firebase Auth"
    }
    urls = @{
        main = "https://kelly-fitness-93e58.web.app"
        admin = "https://kelly-fitness-93e58.web.app/admin"
        api = "https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp"
    }
    features = @(
        "Static Next.js frontend",
        "TypeScript Firebase Functions",
        "Admin dashboard with full APIs",
        "User management system", 
        "Authentication & authorization",
        "Database integration"
    )
}

$report | ConvertTo-Json -Depth 3 | Out-File "DEPLOYMENT_REPORT.json" -Encoding UTF8
Write-Host "   ✅ Deployment report generated" -ForegroundColor Green

Write-Host "`n🎉 Firebase Full Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "📱 Main site: https://kelly-fitness-93e58.web.app" -ForegroundColor Cyan
Write-Host "👑 Admin panel: https://kelly-fitness-93e58.web.app/admin" -ForegroundColor Cyan  
Write-Host "🔧 Functions: https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp" -ForegroundColor Cyan
Write-Host "`n✅ All features deployed and ready to use!" -ForegroundColor Green
