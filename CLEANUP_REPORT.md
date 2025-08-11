# CLEANUP REPORT - Kelly Fitness AI

## 🗑️ Files to DELETE (Safe to remove)

### 1. Empty/Corrupted Files
- `src/app/api/admin/users/subscription-history/route.ts` - File trống
- `src/components/DebugStatusCheck2.tsx` - File debug trùng lặp

### 2. Unused Admin Dashboard Files (Replaced by RefactoredUserManagement)
- `src/components/admin/AdminDashboard.tsx` - Cũ, không dùng
- `src/components/admin/NewSimpleAdminDashboard.tsx` - Cũ, không dùng  
- `src/components/admin/SecureAdminDashboard.tsx` - Cũ, không dùng
- `src/components/admin/SimpleAdminDashboard.tsx` - Cũ, không dùng
- `src/components/admin/UserManagement.tsx` - Cũ, không dùng
- `src/components/admin/UserManagement-fixed.tsx` - Cũ, không dùng
- `src/components/admin/UserManagementWrapper.tsx` - Cũ, không dùng
- `src/components/admin/SimpleUserManagement.tsx` - Cũ, không dùng

### 3. Unused API Routes
- `src/app/api/admin/users/toggle-status/` - Cũ, thay bằng toggle-status-secure
- `src/app/api/admin/users/toggle-status-new/` - Test version, không dùng
- `src/app/api/admin/users/update-subscription-secure/` - Trùng với update-subscription

### 4. Root Test Files (Move to scripts/)
- `check-pending-users.js` - Di chuyển vào scripts/
- `create-test-auth-users.js` - Di chuyển vào scripts/
- `list-free-users.js` - Di chuyển vào scripts/
- `test-api-direct.js` - Di chuyển vào scripts/
- `test-api-http.js` - Di chuyển vào scripts/
- `test-chat-logic.js` - Di chuyển vào scripts/
- `test-delete-api.js` - Di chuyển vào scripts/
- `test-menu-logic.js` - Di chuyển vào scripts/
- `test-updated-logic.js` - Di chuyển vào scripts/
- `view-user-usage.js` - Di chuyển vào scripts/

## ✅ Files to KEEP (Currently used)

### Active Admin Components
- `RefactoredUserManagement.tsx` - ✅ Main admin dashboard
- `UserDetailModal.tsx` - ✅ User detail view
- `UserEditModal.tsx` - ✅ Edit user modal
- `DeleteConfirmModal.tsx` - ✅ Delete confirmation
- `ActivateUserModal.tsx` - ✅ User activation
- `SubscriptionManagerModal.tsx` - ✅ Subscription management
- `UserTable.tsx` - ✅ User list table
- `UserRow.tsx` - ✅ Table row component

### Active API Routes
- `/api/admin/users/route.ts` - ✅ Main users API
- `/api/admin/users/activate/` - ✅ User activation
- `/api/admin/users/delete/` - ✅ User deletion
- `/api/admin/users/update/` - ✅ User updates
- `/api/admin/users/update-subscription/` - ✅ Subscription updates

## 📊 Storage Savings: ~50-70 files removed
