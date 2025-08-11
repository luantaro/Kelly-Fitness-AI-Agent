# 🎯 Hướng dẫn sử dụng Subscription Duration Manager

## 📋 Tổng quan tính năng mới

Kelly Fitness AI Admin hiện đã có tính năng **Subscription Duration Manager** - cho phép admin quản lý thời gian sử dụng Pro của user một cách chi tiết và linh hoạt.

## 🚀 Cách sử dụng

### 1. **Truy cập Admin Dashboard**

```
URL: http://localhost:3002/admin
```

### 2. **Quản lý Subscription Duration**

#### **A. Trong danh sách Users:**

- Tìm user cần cập nhật subscription
- Click button **🗓️ Subscription** (màu xanh lá)
- Modal "Cập nhật Subscription" sẽ hiện ra

#### **B. Trong Subscription Modal:**

**🔸 Chọn loại gói:**

- **📱 Free**: 5 messages/ngày (miễn phí)
- **⭐ Pro**: Unlimited (có phí)

**🔸 Chọn thời gian sử dụng (chỉ cho Pro):**

- 1 tháng
- 3 tháng
- 6 tháng
- 1 năm
- 2 năm
- 3 năm

**🔸 Tùy chọn bổ sung:**

- ☑️ **Tự động gia hạn**: Tự động renew khi hết hạn
- 📅 **Preview ngày hết hạn**: Hiển thị ngày bắt đầu và kết thúc

### 3. **Theo dõi Subscription Status**

#### **A. Thông tin hiển thị:**

- **Ngày bắt đầu**: Khi nào user được nâng cấp Pro
- **Ngày kết thúc**: Khi nào subscription hết hạn
- **Thời gian còn lại**: Số ngày remaining
- **Trạng thái**: Active/Expired

#### **B. Auto-processing:**

- Hệ thống tự động kiểm tra expiry mỗi khi user gửi message
- Tự động downgrade về Free khi hết hạn
- Ghi log vào `subscriptionLogs` collection

## 🎨 UI/UX Features

### **Subscription Modal Components:**

1. **📊 User Info Panel**

   - Hiển thị thông tin user hiện tại
   - Subscription type hiện tại
   - Ngày hết hạn (nếu có)

2. **🎛️ Subscription Type Selector**

   - Button toggle Free/Pro
   - Description về benefits

3. **⏰ Duration Picker**

   - Dropdown chọn thời gian
   - Preview ngày bắt đầu/kết thúc
   - Chỉ hiện khi chọn Pro

4. **🔄 Auto-Renew Option**
   - Checkbox cho automatic renewal
   - Giúp admin setup recurring subscription

## 📡 API Endpoints mới

### **1. Update Subscription with Duration**

```typescript
POST /api/admin/users/update-subscription-duration

Body: {
  userId: string,
  subscription: "free" | "pro",
  durationMonths: number,
  autoRenew: boolean
}
```

### **2. Check Subscription Status**

```typescript
GET /api/admin/users/subscription-status?userId={id}

Response: {
  isValid: boolean,
  isExpired: boolean,
  daysRemaining: number,
  endDate: string | null
}
```

## 🗄️ Database Schema Updates

### **Users Collection - New Fields:**

```typescript
{
  // Existing fields...
  subscriptionStartDate: string | null,
  subscriptionEndDate: string | null,
  subscriptionDurationMonths: number,
  autoRenew: boolean,
}
```

### **New Collection: subscriptionLogs**

```typescript
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

## 🛡️ Business Logic

### **1. Expiry Checking Process:**

```
1. User gửi message
2. API kiểm tra subscription expiry
3. Nếu expired → Auto downgrade về Free
4. Ghi log action vào subscriptionLogs
5. Thông báo user về expiry
```

### **2. Duration Calculation:**

```typescript
// Ví dụ: User upgrade Pro 3 tháng vào 8/8/2025
startDate = "2025-08-08T00:00:00Z";
endDate = "2025-11-08T00:00:00Z"; // +3 months
durationMonths = 3;
```

### **3. Auto-Renewal (Future):**

- Sẵn sàng cho payment integration
- Flag `autoRenew` đã được setup
- Có thể integrate với Stripe/PayPal sau

## 🎯 Use Cases

### **Scenario 1: Nâng cấp user lên Pro 6 tháng**

```
1. Admin click "Subscription" button
2. Chọn "Pro" + "6 tháng"
3. System tự tính: 8/8/2025 → 8/2/2026
4. User có unlimited access đến 8/2/2026
5. Sau 8/2/2026 tự động về Free
```

### **Scenario 2: Gia hạn subscription**

```
1. User hiện tại: Pro đến 15/9/2025
2. Admin gia hạn thêm 3 tháng
3. System update: endDate = 15/12/2025
4. Không mất thời gian đã có
```

### **Scenario 3: Downgrade sớm**

```
1. User hiện tại: Pro đến 15/12/2025
2. Admin downgrade về Free
3. System reset: startDate/endDate = null
4. User ngay lập tức bị limit 5 messages/day
```

## 🚀 Benefits

### **Cho Admin:**

- ✅ Quản lý subscription linh hoạt
- ✅ Theo dõi chính xác thời gian hết hạn
- ✅ Audit trail đầy đủ
- ✅ Setup sẵn cho payment integration

### **Cho User:**

- ✅ Thời gian sử dụng Pro rõ ràng
- ✅ Warning trước khi hết hạn
- ✅ Không bị cut off đột ngột
- ✅ Option auto-renewal

### **Cho Business:**

- ✅ Flexible pricing plans
- ✅ Better customer retention
- ✅ Clear revenue tracking
- ✅ Scalable subscription model

## 🔧 Troubleshooting

### **Lỗi thường gặp:**

1. **"User not found"**

   - Đảm bảo user đã login ít nhất 1 lần
   - Check Firebase Authentication

2. **"Subscription modal không mở"**

   - Refresh browser
   - Check console logs

3. **"Duration không được save"**
   - Verify admin permissions
   - Check API responses trong Network tab

---

**🎉 Tính năng Subscription Duration Manager đã sẵn sàng sử dụng!**

_Admin có thể bắt đầu quản lý thời gian subscription của users một cách chuyên nghiệp và linh hoạt._
