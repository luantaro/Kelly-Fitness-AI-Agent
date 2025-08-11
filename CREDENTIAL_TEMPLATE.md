# 🔑 CREDENTIAL TEMPLATE FOR .env.local

# Copy and replace values below in your .env.local file

# ==========================================

# 1. OPENAI API KEY (from https://platform.openai.com/api-keys)

# ==========================================

OPENAI_API_KEY=sk-proj-PASTE_YOUR_OPENAI_KEY_HERE

# ==========================================

# 2. FIREBASE PRIVATE KEY (from Firebase Console)

# ==========================================

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_YOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ==========================================

# EXAMPLE FORMAT:

# ==========================================

# OPENAI_API_KEY=sk-proj-abc123xyz789...

# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# ==========================================

# VERIFICATION COMMANDS:

# ==========================================

# node scripts/validate-credentials.js

# node scripts/final-security-check.js
