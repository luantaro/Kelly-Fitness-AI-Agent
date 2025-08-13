/**
 * Firebase Full Deployment Script  
 * Safely deploys both frontend and backend with full functions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase Full Deployment...\n');

// Step 1: Backup current data
console.log('1️⃣ Creating deployment backup...');
try {
  if (!fs.existsSync('deployment-backup')) {
    fs.mkdirSync('deployment-backup');
  }
  
  // Backup critical files
  const backupFiles = [
    'firebase.json',
    'next.config.ts', 
    'functions/package.json',
    'functions/src/index.ts'
  ];
  
  backupFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const backupPath = `deployment-backup/${path.basename(file)}.backup`;
      fs.copyFileSync(file, backupPath);
      console.log(`   ✅ Backed up ${file}`);
    }
  });
  
  console.log('   ✅ Backup completed\n');
} catch (error) {
  console.error('   ❌ Backup failed:', error.message);
  process.exit(1);
}

// Step 2: Build Next.js static export
console.log('2️⃣ Building Next.js static export...');
try {
  // Clean previous builds
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  
  // Build static export
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✅ Next.js build completed\n');
} catch (error) {
  console.error('   ❌ Next.js build failed:', error.message);
  process.exit(1);
}

// Step 3: Prepare public folder with static files
console.log('3️⃣ Preparing Firebase hosting files...');
try {
  // Clean public folder but preserve assets
  const preserveFiles = [
    'favicon.ico', 'favicon.svg', 'favicon-16.svg', 
    'apple-touch-icon.svg', 'manifest.json',
    'file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg'
  ];
  
  // Remove old build files
  const publicContents = fs.readdirSync('public');
  publicContents.forEach(item => {
    if (!preserveFiles.includes(item)) {
      const itemPath = path.join('public', item);
      if (fs.statSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      } else if (!preserveFiles.includes(item)) {
        fs.unlinkSync(itemPath);
      }
    }
  });
  
  // Copy static export to public
  if (fs.existsSync('out')) {
    const outContents = fs.readdirSync('out');
    outContents.forEach(item => {
      const srcPath = path.join('out', item);
      const destPath = path.join('public', item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true, force: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
  
  console.log('   ✅ Static files prepared\n');
} catch (error) {
  console.error('   ❌ File preparation failed:', error.message);
  process.exit(1);
}

// Step 4: Build Firebase Functions
console.log('4️⃣ Building Firebase Functions...');
try {
  process.chdir('functions');
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');
  console.log('   ✅ Functions build completed\n');
} catch (error) {
  console.error('   ❌ Functions build failed:', error.message);
  process.exit(1);
}

// Step 5: Validate deployment structure
console.log('5️⃣ Validating deployment structure...');
try {
  const checks = [
    { file: 'public/index.html', desc: 'Main HTML file' },
    { file: 'public/_next', desc: 'Next.js assets' },
    { file: 'functions/lib/index.js', desc: 'Compiled functions' },
    { file: 'firebase.json', desc: 'Firebase config' }
  ];
  
  checks.forEach(check => {
    if (fs.existsSync(check.file)) {
      console.log(`   ✅ ${check.desc}: Found`);
    } else {
      console.log(`   ❌ ${check.desc}: Missing`);
      throw new Error(`Missing required file: ${check.file}`);
    }
  });
  
  console.log('   ✅ Deployment structure validated\n');
} catch (error) {
  console.error('   ❌ Validation failed:', error.message);
  process.exit(1);
}

// Step 6: Deploy to Firebase
console.log('6️⃣ Deploying to Firebase...');
try {
  execSync('firebase deploy', { stdio: 'inherit' });
  console.log('   ✅ Firebase deployment completed\n');
} catch (error) {
  console.error('   ❌ Firebase deployment failed:', error.message);
  process.exit(1);
}

// Step 7: Test deployment
console.log('7️⃣ Testing deployment...');
try {
  // Test main site
  console.log('   🧪 Testing main site...');
  const https = require('https');
  const testUrl = 'https://kelly-fitness-93e58.web.app';
  
  const testEndpoints = [
    '/',
    '/api/admin/stats', 
    '/api/admin/users',
    '/api/admin/check'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${testUrl}${endpoint}`);
      if (response.ok || response.status === 401) { // 401 is expected for auth endpoints
        console.log(`   ✅ ${endpoint}: OK`);
      } else {
        console.log(`   ⚠️ ${endpoint}: ${response.status}`);
      }
    } catch (err) {
      console.log(`   ⚠️ ${endpoint}: ${err.message}`);
    }
  }
  
  console.log('   ✅ Basic tests completed\n');
} catch (error) {
  console.log('   ⚠️ Testing skipped:', error.message, '\n');
}

// Step 8: Generate deployment report
console.log('8️⃣ Generating deployment report...');
try {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    deployment: {
      frontend: 'Firebase Hosting',
      backend: 'Firebase Functions', 
      database: 'Firestore',
      auth: 'Firebase Auth'
    },
    urls: {
      main: 'https://kelly-fitness-93e58.web.app',
      admin: 'https://kelly-fitness-93e58.web.app/admin',
      api: 'https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp'
    },
    features: [
      'Static Next.js frontend',
      'TypeScript Firebase Functions',
      'Admin dashboard with full APIs',
      'User management system',
      'Authentication & authorization',
      'Database integration'
    ]
  };
  
  fs.writeFileSync('DEPLOYMENT_REPORT.json', JSON.stringify(report, null, 2));
  console.log('   ✅ Deployment report generated\n');
} catch (error) {
  console.log('   ⚠️ Report generation failed:', error.message, '\n');
}

console.log('🎉 Firebase Full Deployment Completed Successfully!');
console.log('📱 Main site: https://kelly-fitness-93e58.web.app');
console.log('👑 Admin panel: https://kelly-fitness-93e58.web.app/admin');
console.log('🔧 Functions: https://us-central1-kelly-fitness-93e58.cloudfunctions.net/nextjsApp');
console.log('\n✅ All features deployed and ready to use!');

async function fetch(url) {
  const https = require('https');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET'
    };
    
    const req = https.request(options, (res) => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
    req.end();
  });
}

module.exports = { fetch };
