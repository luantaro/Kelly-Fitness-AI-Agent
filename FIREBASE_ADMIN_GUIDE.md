# 🔥 Firebase Admin Management - Kelly Fitness AI

## 📋 Tổng quan

Hệ thống quản lý admin trên Firebase cho phép:

1. **🎯 Role-based Access Control (RBAC)**
2. **🔐 Custom Firebase Claims**
3. **📊 Firestore-based Admin Profiles**
4. **📝 Audit Logging**
5. **🛡️ Fine-grained Permissions**

## 🚀 Setup Admin đầu tiên

### 1. **CLI Setup (Recommended)**

```bash
# Install dependencies đầu tiên
npm install

# Setup Super Admin đầu tiên
node scripts/setup-admin.js --email taro2255@gmail.com --role SUPER_ADMIN --name "Admin"

# Hoặc setup Admin thông thường
node scripts/setup-admin.js --email admin@kelly-fitness.com --role ADMIN
```

### 2. **Manual Setup qua API**

```typescript
// POST /api/admin/manage
{
  "uid": "firebase_user_uid",
  "email": "admin@example.com",
  "role": "SUPER_ADMIN",
  "displayName": "Main Admin"
}
```

## 🎭 Admin Roles & Permissions

### **SUPER_ADMIN** 🔴

- ✅ **Full system access**
- ✅ Manage other admins
- ✅ Database access
- ✅ System settings
- ✅ Payment management

### **ADMIN** 🔵

- ✅ User management
- ✅ Subscription management
- ✅ Analytics & reports
- ✅ Content management
- ❌ Cannot manage other admins
- ❌ No system settings access

### **MODERATOR** 🟢

- ✅ View users
- ✅ Content moderation
- ✅ Basic analytics
- ❌ Cannot edit users
- ❌ No subscription management

### **SUPPORT** 🟡

- ✅ View users
- ✅ Subscription support
- ❌ No content management
- ❌ No analytics access

## 🛠️ Technical Implementation

### **1. Firebase Custom Claims**

```typescript
// Set custom claims
await adminAuth.setCustomUserClaims(uid, {
  admin: true,
  role: "SUPER_ADMIN",
  features: {
    canViewUsers: true,
    canEditUsers: true,
    canManageAdmins: true,
    // ... other permissions
  },
});
```

### **2. Firestore Admin Profiles**

```typescript
// Collection: adminProfiles
{
  uid: string,
  email: string,
  displayName?: string,
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT",
  features: AdminFeatures,
  isActive: boolean,
  createdAt: string,
  updatedAt: string,
  createdBy: string,
  lastLogin?: string
}
```

### **3. Permission Checking**

```typescript
// Client-side hook
const { hasPermission } = useAdminFeatures();

if (hasPermission("canManageUsers")) {
  // Show user management UI
}

// API-side verification
const canEdit = await hasAdminPermission(uid, "canEditUsers");
if (!canEdit) {
  return NextResponse.json(
    { error: "Insufficient permissions" },
    { status: 403 }
  );
}
```

## 🎨 UI Components

### **1. Admin Dashboard** `/admin`

- Legacy admin system (email-based)
- User management
- Subscription management
- Basic stats

### **2. Admin Features** `/admin/features`

- New Firebase-based system
- Role management
- Permission viewing
- Admin profile management

### **3. Protected Components**

```tsx
import { ProtectedAdminComponent } from "@/hooks/useAdminFeatures";

<ProtectedAdminComponent requiredPermission="canManageUsers">
  <UserManagement />
</ProtectedAdminComponent>;
```

## 🔄 Migration Strategy

### **Hiện tại: Dual System**

1. **Legacy System** (taro2255@gmail.com)

   - Email-based whitelist
   - Full access compatibility
   - Backward compatibility

2. **New System** (Firebase-based)
   - Role-based permissions
   - Granular control
   - Audit logging

### **Migration Path:**

```bash
# 1. Setup SUPER_ADMIN đầu tiên
node scripts/setup-admin.js --email taro2255@gmail.com --role SUPER_ADMIN

# 2. Tạo các admin khác qua UI
# Visit /admin/features → Add Admin

# 3. Eventually deprecate legacy system
```

## 📡 API Endpoints

### **Admin Management**

- `GET /api/admin/manage` - List all admins
- `POST /api/admin/manage` - Create admin
- `PUT /api/admin/manage` - Update admin
- `DELETE /api/admin/manage` - Deactivate admin

### **Permissions**

- `GET /api/admin/permissions` - Check admin status
- `POST /api/admin/permissions` - Check multiple permissions

### **Legacy Compatibility**

- `POST /api/admin/permissions` - Grant/revoke admin (legacy)

## 🔍 Monitoring & Logs

### **1. Admin Logs Collection**

```typescript
// Collection: adminLogs
{
  action: "admin_created" | "admin_updated" | "admin_deactivated",
  targetUserId: string,
  targetEmail: string,
  role?: string,
  features?: AdminFeatures,
  performedBy: string,
  timestamp: string
}
```

### **2. Subscription Logs**

```typescript
// Collection: subscriptionLogs
{
  userId: string,
  action: "upgraded" | "downgraded" | "auto_downgraded",
  subscriptionType: "free" | "pro",
  durationMonths: number,
  performedBy?: string,
  timestamp: string
}
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **"Admin not found"**

   - Ensure user logged in at least once
   - Check Firebase Auth console
   - Verify email spelling

2. **"Insufficient permissions"**

   - Check admin role and features
   - Verify custom claims set
   - Try refreshing user token

3. **"Legacy vs New system conflicts"**
   - Legacy admins have full access
   - New system respects granular permissions
   - Use migration CLI to upgrade

### **Debug Commands:**

```bash
# Check admin status
node scripts/setup-admin.js --email admin@example.com --help

# View logs in Firebase Console
# Go to Firestore → adminLogs collection

# Check custom claims
# Go to Firebase Auth → Users → Select user → Custom claims
```

## 🚀 Production Checklist

### **Security:**

- ✅ Custom claims properly set
- ✅ API endpoints protected
- ✅ Admin emails verified
- ✅ Firestore security rules updated
- ✅ Audit logging enabled

### **Monitoring:**

- ✅ Admin actions logged
- ✅ Permission changes tracked
- ✅ Failed auth attempts monitored
- ✅ Database access audited

### **Backup:**

- ✅ Admin profiles backed up
- ✅ Permission configs documented
- ✅ Recovery procedures established

## 📞 Support

### **For Issues:**

1. Check Firebase Console logs
2. Verify admin setup with CLI
3. Review API responses in Network tab
4. Check custom claims in Firebase Auth

### **Emergency Access:**

- Legacy admin system still active
- taro2255@gmail.com has full access
- CLI can create emergency SUPER_ADMIN

---

**🎉 Firebase Admin Management system đã sẵn sàng sử dụng!**

_Hệ thống cung cấp quản lý admin chuyên nghiệp với security tối ưu và scalability cao._
