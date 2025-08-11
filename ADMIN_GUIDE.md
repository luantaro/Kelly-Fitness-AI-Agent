# 🎯 Hệ thống Admin & Quản lý Free User - Kelly Fitness AI

## 📋 Tổng quan

Hệ thống admin được thiết kế để:

1. **Theo dõi thống kê tổng quát** của ứng dụng
2. **Quản lý người dùng** và subscription
3. **Kích hoạt/vô hiệu hóa** tài khoản
4. **Nâng cấp/hạ cấp** gói subscription

## 🚀 Truy cập Admin Dashboard

### URL: `/admin`

- Chỉ admin được phép truy cập
- Cần cập nhật email admin trong `src/app/admin/page.tsx` (dòng 31-34):

```typescript
const ADMIN_EMAILS = [
  "admin@kelly-fitness.com",
  "your-email@gmail.com", // ← Thay thế bằng email của bạn
];
```

## 📊 Tính năng Admin Dashboard

### 1. **Tab Tổng quan**

- 👥 Tổng số người dùng
- ✅ Người dùng hoạt động
- 💬 Tổng cuộc trò chuyện
- 💰 Doanh thu (ước tính)

### 2. **Tab Người dùng**

- 📋 Danh sách tất cả người dùng
- 👀 Xem chi tiết từng user
- 🔄 Nâng cấp/hạ cấp subscription
- ⚡ Kích hoạt/vô hiệu hóa tài khoản

### 3. **Thao tác quản lý**

- **Nâng cấp Pro**: Người dùng có unlimited access
- **Hạ cấp Free**: Áp dụng giới hạn 5 messages/ngày
- **Kích hoạt**: User có thể sử dụng app
- **Vô hiệu hóa**: Block user khỏi app
- **⭐ Subscription Manager**: Quản lý thời gian sử dụng Pro

### 4. **🎯 Subscription Duration Manager**

#### Tính năng mới: Chọn thời gian sử dụng Pro

- **Button "Subscription"** trên mỗi dòng user
- **Modal quản lý subscription** với các tùy chọn:
  - 📱 **Free**: 5 messages/ngày
  - ⭐ **Pro**: Unlimited với thời gian tùy chọn
- **Thời gian sử dụng Pro**:
  - 1 tháng
  - 3 tháng
  - 6 tháng
  - 1 năm
  - 2 năm
  - 3 năm
- **Tự động gia hạn**: Option cho renewal
- **Theo dõi hạn sử dụng**:
  - Ngày bắt đầu
  - Ngày kết thúc
  - Tự động hạ cấp khi hết hạn

## 🔒 Logic Free User Limitations

### 1. **Message Limits**

```typescript
Free User: 5 messages/ngày
Pro User: Unlimited
```

### 2. **Export PDF Limits**

```typescript
Free User: 1 export/ngày
Pro User: Unlimited
```

### 3. **AI Personalities**

```typescript
Free User: 2 personalities (friendly, professional)
Pro User: Tất cả 6 personalities
```

### 4. **Weekly Menu**

```typescript
Free User: 1 thực đơn/tuần
Pro User: Unlimited
```

## 🛠️ API Endpoints được tạo

### Admin APIs:

- `GET /api/admin/stats` - Thống kê tổng quát
- `GET /api/admin/users` - Danh sách người dùng
- `POST /api/admin/users/update-subscription` - Cập nhật subscription
- `POST /api/admin/users/update-subscription-duration` - **NEW**: Cập nhật subscription với thời gian
- `GET /api/admin/users/subscription-status` - **NEW**: Kiểm tra trạng thái subscription
- `POST /api/admin/users/toggle-status` - Kích hoạt/vô hiệu hóa

### User APIs:

- `GET /api/user/quota` - Lấy thông tin quota user hiện tại

### Chat API Updates:

- Kiểm tra limits trước khi xử lý message
- Kiểm tra subscription expiry tự động
- Trả về error nếu vượt giới hạn
- Tự động increment message count

## 📁 Files được tạo/cập nhật

### Admin Components:

- `src/app/admin/page.tsx` - Admin dashboard chính
- `src/components/UserQuota.tsx` - Component hiển thị quota
- `src/components/SubscriptionModal.tsx` - **NEW**: Modal quản lý subscription duration

### APIs:

- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/update-subscription/route.ts`
- `src/app/api/admin/users/update-subscription-duration/route.ts` - **NEW**
- `src/app/api/admin/users/subscription-status/route.ts` - **NEW**
- `src/app/api/admin/users/toggle-status/route.ts`
- `src/app/api/user/quota/route.ts`

### Libraries:

- `src/lib/userSubscription.ts` - Logic quản lý subscription (updated with duration features)

### Updated Files:

- `src/app/api/chat/route.ts` - Thêm subscription expiry checking
- `src/components/ChatInterface.tsx` - Gửi userId và handle limits

## 🔧 Cách sử dụng

### 1. **Setup Admin**

```bash
# Tạo admin đầu tiên
node scripts/setup-admin.js --email admin@example.com --role SUPER_ADMIN
```

### 2. **Tạo Test Users**

```bash
# Tạo 2 test users với gói Pro 1 tháng
node scripts/create-test-users.js
```

**Test Users Credentials:**

- 📧 `testuser1@kelly-fitness.com` / 🔑 `TestPassword123!`
- 📧 `testuser2@kelly-fitness.com` / 🔑 `TestPassword123!`
- ⭐ **Subscription**: Pro (1 tháng, hết hạn 8/9/2025)

### 3. **Monitor Users qua Firebase Console**

```bash
# 1. Firebase Console → Authentication → Users
# 2. Firebase Console → Firestore → Collections → users
# 3. Xem/edit user data trực tiếp
# 4. Quản lý subscription thông qua Firestore
```

### 3. **Database Structure**

```typescript
// Collection: users
{
  uid: string,
  email: string,
  subscription: "free" | "pro",
  isActive: boolean,
  dailyMessageCount: number,
  lastResetDate: string,
  dailyExportCount: number,
  allowedPersonalities: string[],
  createdAt: string,
  updatedAt: string,
  // NEW Duration Fields
  subscriptionStartDate: string | null,
  subscriptionEndDate: string | null,
  subscriptionDurationMonths: number,
  autoRenew: boolean,
}

// Collection: adminLogs
{
  action: string,
  targetUserId: string,
  timestamp: string,
  adminUser: string
}

// Collection: subscriptionLogs (NEW)
{
  userId: string,
  action: "upgraded" | "downgraded" | "auto_downgraded",
  subscriptionType: "free" | "pro",
  durationMonths: number,
  startDate: string | null,
  endDate: string | null,
  reason?: string,
  timestamp: string,
}
```

## 🎨 UI/UX Features

### 1. **User Experience**

- Real-time quota display
- Warning khi gần đạt giới hạn
- Friendly error messages
- Upgrade prompts

### 2. **Admin Experience**

- Clean dashboard interface
- Quick actions
- Search/filter capabilities
- Real-time statistics

## 🚀 Next Steps

### Có thể mở rộng thêm:

1. **Payment Integration** - Stripe/PayPal
2. **Email Notifications** - Warning emails
3. **Analytics Dashboard** - Advanced metrics
4. **Bulk Operations** - Mass user management
5. **Report Generation** - Export data

## 📞 Support & Debugging

### 🔧 **Authentication Issues**

Nếu có vấn đề với Google Auth (không chuyển trang sau login):

1. **Check Firebase Console OAuth Configuration:**

   ```
   Firebase Console → Authentication → Sign-in method → Google
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: được tự động config bởi Firebase
   ```

2. **Test Firebase Configuration:**

   ```bash
   node scripts/test-firebase-config.js
   ```

3. **Debug Authentication Flow:**

   - Mở http://localhost:3000
   - Kiểm tra AuthDebug component (góc trên-phải)
   - Xem browser console để check errors
   - Kiểm tra Network tab trong DevTools

4. **Test với Email/Password:**
   ```
   📧 testuser1@kelly-fitness.com
   🔑 TestPassword123!
   ```

### ⚠️ **Common Issues:**

- **Popup bị block:** Check browser popup blocker
- **Network errors:** Kiểm tra internet connection
- **OAuth errors:** Verify Firebase Console → Authentication settings
- **CORS errors:** Ensure localhost:3000 trong authorized origins

Nếu có vấn đề với admin system:

1. Check console logs
2. Verify Firebase permissions
3. Ensure admin emails are correct
4. Check API responses trong Network tab

---

**🎉 Admin system đã sẵn sàng sử dụng!** Truy cập `/admin` để bắt đầu quản lý hệ thống.
