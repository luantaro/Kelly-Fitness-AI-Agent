# 🚨 SECURITY FIX PLAN - KHẮC PHỤC BẢO MẬT

## ⚠️ CRITICAL ISSUES FOUND

### 1. **FIREBASE PRIVATE KEY HARDCODED** (CRITICAL)

- **File**: `src/lib/firebase-admin.ts`
- **Risk**: Full Firebase access if code is exposed
- **Action**: IMMEDIATE REMOVAL + KEY ROTATION

### 2. **API KEYS IN .env.local** (HIGH)

- **Files**: `.env.local`
- **Risk**: API access if file is compromised
- **Action**: Move to secure environment variables

### 3. **ADMIN EMAILS HARDCODED** (MEDIUM)

- **File**: `src/lib/admin-client.ts`
- **Risk**: Admin account exposure
- **Action**: Move to database/environment

### 4. **SERVICE ACCOUNT EMAIL EXPOSED** (LOW)

- **Multiple files**: Scripts folder
- **Risk**: Information disclosure
- **Action**: Use environment variables

## 🛠️ IMMEDIATE ACTIONS REQUIRED

### Step 1: Remove Hardcoded Private Key

```typescript
// BEFORE (DANGEROUS):
privateKey: "-----BEGIN PRIVATE KEY-----\n...";

// AFTER (SECURE):
privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
```

### Step 2: Rotate Firebase Private Key

1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Generate new private key
4. Update environment variables
5. Delete old key

### Step 3: Environment Variable Setup

```bash
# Production Environment Variables
FIREBASE_PROJECT_ID=kelly-fitness-93e58
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
OPENAI_API_KEY=sk-proj-...
```

### Step 4: Update Code Security

- Remove all hardcoded credentials
- Use environment variables only
- Add .env\* to .gitignore
- Implement proper secret management

### Step 5: Git History Cleanup

```bash
# Remove sensitive data from git history
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env.local' \
--prune-empty --tag-name-filter cat -- --all
```

## 🔒 BEST PRACTICES TO IMPLEMENT

1. **Never commit .env files**
2. **Use secret management services** (AWS Secrets Manager, HashiCorp Vault)
3. **Rotate keys regularly**
4. **Implement least privilege access**
5. **Use environment-specific configurations**
6. **Add security headers** (already implemented in next.config.ts)
7. **Implement proper authentication/authorization**

## ✅ VERIFICATION CHECKLIST

- [ ] Remove hardcoded private key
- [ ] Rotate Firebase credentials
- [ ] Update .gitignore
- [ ] Clean git history
- [ ] Test with environment variables
- [ ] Deploy with secure environment setup
- [ ] Monitor for any exposed credentials
- [ ] Implement secret scanning in CI/CD

## 🚨 IMMEDIATE TODO

1. **STOP ALL DEPLOYMENTS** until credentials are secured
2. **Rotate ALL exposed keys/credentials**
3. **Fix hardcoded values**
4. **Update deployment pipeline**
5. **Security audit of entire codebase**
