# 🔧 DEVELOPMENT WORKFLOW

## 🚀 **LOCALHOST DEVELOPMENT**

### **1. Start Development Server**

```bash
npm run dev
```

- ✅ Frontend: http://localhost:3002
- ✅ API calls → Firebase Functions (live backend)
- ✅ Hot reload for UI changes
- ✅ Real-time debugging

### **2. Development Features**

- 🔄 **Hot Reload**: Changes appear instantly
- 🔗 **Live Backend**: API calls to Firebase Functions
- 📊 **Real Database**: Connect to production Firestore
- 👑 **Admin Panel**: Test with real admin account

---

## 🛠️ **DEVELOPMENT TO PRODUCTION WORKFLOW**

### **Step 1: Local Development**

```bash
# Start dev server
npm run dev

# Make your changes...
# Test on localhost:3002
# Admin panel: localhost:3002/admin
```

### **Step 2: Test Build**

```bash
# Test production build locally
npm run build
npm run start
```

### **Step 3: Deploy to Production**

```bash
# Build for Firebase
npm run build

# Copy static files
Copy-Item -Path "out\*" -Destination "public\" -Recurse -Force

# Deploy to Firebase
firebase deploy
```

---

## 🔄 **AUTOMATED DEPLOYMENT SCRIPT**

Tôi sẽ tạo script tự động cho bạn:

### **deploy.ps1**

```powershell
# Build and deploy script
Write-Host "🚀 Building for production..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "📁 Copying files to Firebase public folder..." -ForegroundColor Green
    Copy-Item -Path "out\*" -Destination "public\" -Recurse -Force

    Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Green
    firebase deploy

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "🌐 Site: https://kelly-fitness-93e58.web.app" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
```

---

## 🐛 **DEBUGGING COMMON ISSUES**

### **Frontend Issues:**

```bash
# Clear Next.js cache
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall dependencies
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Start fresh
npm run dev
```

### **API Issues:**

```bash
# Check Firebase Functions logs
firebase functions:log

# Test API directly
curl https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp/api/health
```

### **Build Issues:**

```bash
# Check for TypeScript errors
npm run lint

# Build with verbose output
npm run build --verbose
```

---

## 📋 **DEVELOPMENT CHECKLIST**

### **Before Making Changes:**

- [ ] `npm run dev` running
- [ ] Can access localhost:3002
- [ ] API calls working
- [ ] Admin panel accessible

### **During Development:**

- [ ] Check browser console for errors
- [ ] Test mobile responsiveness
- [ ] Verify API endpoints
- [ ] Test authentication flows

### **Before Deployment:**

- [ ] `npm run build` successful
- [ ] Test production build locally
- [ ] Check for TypeScript errors
- [ ] Verify all features working

### **After Deployment:**

- [ ] Site loads correctly
- [ ] API endpoints responding
- [ ] Admin panel working
- [ ] Mobile view functional

---

## 🎯 **QUICK COMMANDS REFERENCE**

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Check for errors

# Firebase
firebase login                 # Login to Firebase
firebase deploy               # Deploy everything
firebase functions:log        # View function logs

# Cleanup
Remove-Item -Path ".next" -Recurse -Force    # Clear Next.js cache
```

---

_Happy coding! 🚀_
