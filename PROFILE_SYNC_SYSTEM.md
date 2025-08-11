# 🔄 Hệ thống đồng bộ hóa Profile 2 chiều

## 📋 Tổng quan

Đã tạo thành công hệ thống đồng bộ hóa thông tin user profile 2 chiều giữa:

- **User Settings Modal** (người dùng nhập thông tin)
- **Admin Dashboard** (admin quản lý thông tin user)
- **Sidebar** (hiển thị thông tin realtime)

## 🏗️ Kiến trúc hệ thống

### 1. **React Hooks**

#### `useUserProfileSync.ts`

```typescript
// Hook cho user quản lý profile của chính mình
const {
  profile, // UserProfile object
  isLoading, // Loading state
  error, // Error message
  updateProfile, // (updates) => Promise<boolean>
  refreshProfile, // () => Promise<void>
  lastSyncTime, // Date | null
} = useUserProfileSync();
```

#### `useAdminProfileSync.ts`

```typescript
// Hook cho admin quản lý profile của users
const {
  updateUserProfile, // (userId, profile) => Promise<boolean>
  getUserProfile, // (userId) => Promise<profile>
  isLoading,
  error,
} = useAdminProfileSync();
```

### 2. **API Endpoints**

#### User Profile API

- **GET** `/api/user/profile` - Lấy profile của user hiện tại
- **POST** `/api/user/profile` - Cập nhật profile của user hiện tại

#### Admin Profile API

- **GET** `/api/admin/users/[userId]/profile` - Admin lấy profile của user
- **POST** `/api/admin/users/[userId]/profile` - Admin cập nhật profile của user

### 3. **Components**

#### `SettingsModal.tsx`

- ✅ Sử dụng `useUserProfileSync`
- ✅ Realtime updates khi nhập liệu
- ✅ Auto-sync với server
- ✅ Event-driven notifications

#### `UserProfileEditModal.tsx`

- ✅ Component mới cho admin chỉnh sửa profile user
- ✅ Sử dụng `useAdminProfileSync`
- ✅ Form validation
- ✅ Success/error handling

#### `Sidebar.tsx`

- ✅ Hiển thị thông tin profile realtime
- ✅ Tự động cập nhật khi có thay đổi
- ✅ Hiển thị: Tên, tuổi, chiều cao, cân nặng

#### `RefactoredUserManagement.tsx`

- ✅ Tích hợp `UserProfileEditModal`
- ✅ Nút "Profile" trong user table
- ✅ Auto-refresh sau khi cập nhật

## 🔄 Luồng đồng bộ hóa

### 1. **User tự cập nhật profile**

```
User Input → useUserProfileSync → API → Firestore → Event → Sidebar Update
           ↘                                       ↗
            localStorage (immediate UX)            ↗
                                          Admin Dashboard
```

### 2. **Admin cập nhật profile user**

```
Admin Edit → useAdminProfileSync → API → Firestore → Event → User Notification
                                                    ↘
                                                     Sidebar Update
```

### 3. **Event-driven Communication**

```javascript
// Events được dispatch tự động:
"fitchat-profile-updated"; // User cập nhật profile
"fitchat-admin-profile-update"; // Admin cập nhật profile user
"fitchat-profile-synced"; // Sync thành công từ server
```

## 📊 Interface Definition

```typescript
interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
}
```

## 🎯 Tính năng chính

### ✅ Realtime Sync

- Thay đổi ngay lập tức trên UI
- Background sync với server
- Automatic conflict resolution

### ✅ Caching thông minh

- localStorage cho immediate updates
- Server-side ETag caching
- TTL-based refresh

### ✅ Error Handling

- Graceful degradation
- Offline-first approach
- User-friendly error messages

### ✅ Admin Controls

- View/edit any user profile
- Audit trail (updatedBy, timestamp)
- Bulk operations support

### ✅ Security

- JWT token authentication
- Admin permission checks
- Input validation & sanitization

## 🚀 Cách sử dụng

### 1. **User Experience**

1. User login → tự động load profile từ server
2. Mở Settings Modal → chỉnh sửa thông tin
3. Mỗi thay đổi → tự động sync
4. Sidebar → hiển thị thông tin realtime

### 2. **Admin Experience**

1. Vào Admin Dashboard
2. Click nút "Profile" (👤) trên user row
3. Chỉnh sửa thông tin user
4. Save → user nhận notification và cập nhật realtime

### 3. **Developer Experience**

```typescript
// Trong component bất kỳ
const { profile, updateProfile } = useUserProfileSync();

// Update profile
await updateProfile({ name: "Tên mới", age: 25 });

// Listen for admin updates
useEffect(() => {
  const handleAdminUpdate = (event) => {
    console.log("Admin updated profile:", event.detail);
  };

  window.addEventListener("fitchat-admin-profile-update", handleAdminUpdate);
  return () =>
    window.removeEventListener(
      "fitchat-admin-profile-update",
      handleAdminUpdate
    );
}, []);
```

## 🎉 Kết quả

- ✅ **Đồng bộ hóa 2 chiều** hoàn chỉnh
- ✅ **Realtime updates** cho tất cả components
- ✅ **Admin dashboard** với full control
- ✅ **User experience** mượt mà
- ✅ **Performance optimized** với caching
- ✅ **Security** được đảm bảo

## 🔍 Testing

Server đang chạy tại: **http://localhost:3001**

Test scenarios:

1. User login → Settings → chỉnh sửa profile → check sidebar
2. Admin login → Admin Dashboard → edit user profile → check user notification
3. Multiple tabs → cập nhật ở tab này → check tab kia
4. Network disconnect → offline updates → reconnect → auto sync

---

**🎯 Mission Accomplished!** Hệ thống đồng bộ hóa 2 chiều đã hoạt động đầy đủ! 🚀
