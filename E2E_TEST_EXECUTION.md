# 🎬 E2E Test Execution Guide

## 🚀 BƯỚC 1: Khởi động Test Environment

### Start Server

```bash
# Server đã chạy tại http://localhost:3001
# Nếu chưa chạy:
npm run dev
```

### Load Test Helpers

```javascript
// Copy và paste vào browser console:
// Nội dung từ file e2e-test-helpers.js
// Hoặc load trực tiếp:
const script = document.createElement("script");
script.src = "/e2e-test-helpers.js";
document.head.appendChild(script);
```

## 🎯 BƯỚC 2: Test User Profile Flow

### 2.1 Chuẩn bị User Account

```bash
URL: http://localhost:3001
1. Login với: freeuser1@test.com / Test123456
2. Hoặc tạo account mới nếu cần
```

### 2.2 Test User Profile Creation

```javascript
// Trong browser console:
E2ETestHelpers.setupProfileSyncListeners();

// Check initial state
E2ETestHelpers.checkLocalStorageProfile();

// Simulate profile update
E2ETestHelpers.simulateProfileUpdate({
  name: "Nguyễn Văn Test E2E",
  age: 28,
  gender: "male",
  height: 175,
  weight: 70,
  activityLevel: "moderate",
  goal: "gain_muscle",
});
```

### 2.3 Manual UI Testing

```bash
1. Click Settings (⚙️) button
2. Fill form:
   - Tên: "Test User Manual"
   - Tuổi: 25
   - Giới tính: Nam
   - Chiều cao: 170
   - Cân nặng: 65
   - Hoạt động: Vừa phải
   - Mục tiêu: Tăng cơ

3. Verify:
   ✅ Form saves automatically
   ✅ Success message appears
   ✅ Sidebar updates with new info
   ✅ Console shows events
```

## 🛡️ BƯỚC 3: Test Admin Profile Management

### 3.1 Switch to Admin Account

```bash
1. Logout current user
2. Login với: taro2255@gmail.com / [existing password]
3. Verify "🔧 Admin" appears in sidebar
4. Click Admin → Admin Dashboard loads
```

### 3.2 Test Admin Functions

```bash
1. Find freeuser1@test.com in user table
2. Click Profile button (👤)
3. Verify UserProfileEditModal opens
4. Check data shows user's info
5. Make changes:
   - Tên: "Updated by Admin E2E"
   - Tuổi: 30
   - Cân nặng: 72

6. Save changes
7. Verify success message
8. Check user table refreshes
```

### 3.3 Admin Console Testing

```javascript
// In admin browser console:
E2ETestHelpers.testAPIEndpoints();

// Test admin update simulation:
E2ETestHelpers.simulateAdminUpdate("freeuser1-uid", {
  name: "Admin Console Test",
  age: 32,
});
```

## 🔄 BƯỚC 4: Test Realtime Sync

### 4.1 Multi-Tab Testing

```bash
Tab 1: Admin Dashboard (admin logged in)
Tab 2: User Dashboard (freeuser1 logged in)

Sequence:
1. Tab 2: Open console, run E2ETestHelpers.setupProfileSyncListeners()
2. Tab 1: Edit freeuser1's profile via admin UI
3. Tab 2: Watch console for events
4. Tab 2: Check sidebar updates automatically
5. Tab 2: Open Settings → verify changes appear
```

### 4.2 Event Testing

```javascript
// Tab 2 (User) console:
window.addEventListener("fitchat-admin-profile-update", (event) => {
  console.log("🎯 Received admin update:", event.detail);
  console.log("👤 Updated by:", event.detail.updatedBy);
  console.log("⏰ Timestamp:", event.detail.timestamp);
});

// Tab 1 (Admin): Make changes, watch Tab 2 console
```

## 📡 BƯỚC 5: API & Database Testing

### 5.1 API Endpoint Verification

```javascript
// Test full API flow:
E2ETestHelpers.testAPIEndpoints();

// Manual API testing:
fetch("/api/user/profile", {
  headers: {
    Authorization: "Bearer " + (await firebase.auth().currentUser.getIdToken()),
    "Cache-Control": "no-cache",
  },
})
  .then((r) => r.json())
  .then(console.log);
```

### 5.2 Database Verification

```bash
1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to 'users' collection
4. Find freeuser1 document
5. Check 'userProfile' field
6. Verify 'profileUpdatedAt' timestamp
7. Check 'profileUpdatedBy' field
```

### 5.3 Network Tab Monitoring

```bash
Browser DevTools → Network Tab:
1. Clear network log
2. Update profile via UI
3. Check for API calls:
   ✅ POST /api/user/profile (200)
   ✅ GET /api/user/profile (200)
   ✅ Proper request payloads
   ✅ JWT tokens in headers
```

## 🚨 BƯỚC 6: Error Testing

### 6.1 Permission Testing

```javascript
// Try admin API with regular user token:
fetch("/api/admin/users/test-user/profile", {
  headers: {
    Authorization: "Bearer " + (await firebase.auth().currentUser.getIdToken()),
  },
}).then((r) => console.log("Should be 403:", r.status));
```

### 6.2 Network Failure Simulation

```bash
1. Open Settings Modal
2. DevTools → Network Tab → Set to "Offline"
3. Update profile → should save locally
4. Set back to "Online"
5. Check auto-sync happens
6. Verify final data in Firestore
```

### 6.3 Data Validation Testing

```bash
Try invalid inputs:
- Age: -5, 200
- Height: 30, 400
- Weight: -10, 1000

Expected:
✅ Form validation blocks submission
✅ Error messages appear
✅ No invalid data sent to API
```

## ⚡ BƯỚC 7: Performance Testing

### 7.1 Load Testing

```javascript
// Performance test suite:
E2ETestHelpers.performanceTest();

// Full sync flow test:
E2ETestHelpers.testFullSyncFlow();

// Stress test:
for (let i = 0; i < 50; i++) {
  E2ETestHelpers.simulateProfileUpdate({
    name: `Stress Test ${i}`,
    age: 20 + i,
  });
}
```

### 7.2 Memory Usage Monitoring

```bash
DevTools → Performance Tab:
1. Start recording
2. Run performance tests
3. Stop recording
4. Check for memory leaks
5. Verify efficient re-renders
```

## 🎯 BƯỚC 8: Comprehensive Test Suite

### 8.1 Quick Test Suite

```javascript
// Run all tests in sequence:
E2ETestHelpers.runQuickTestSuite();

// Individual tests:
E2ETestHelpers.checkLocalStorageProfile();
E2ETestHelpers.testAPIEndpoints();
E2ETestHelpers.performanceTest();
```

### 8.2 Manual Verification Checklist

```bash
□ User can create profile via Settings
□ User can edit existing profile
□ Changes appear in sidebar immediately
□ Changes persist after page refresh
□ Admin can access admin dashboard
□ Admin can view user profiles
□ Admin can edit user profiles
□ Admin changes trigger user notifications
□ Multi-tab sync works correctly
□ API endpoints return correct responses
□ Database updates properly
□ Error handling works for invalid data
□ Permission checks prevent unauthorized access
□ Network failures don't lose data
□ Performance is acceptable under load
```

## 📊 Success Criteria

### ✅ Must Pass All

- User profile CRUD operations work
- Admin profile management functions
- Realtime sync across all interfaces
- Data persistence in Firestore
- Security permissions enforced
- Error handling graceful

### 🎖️ Performance Targets

- Profile updates < 2 seconds
- UI updates < 500ms
- API responses < 1 second
- No memory leaks during extended use

## 🎉 Test Completion Report

```bash
Date: [Today]
Server: http://localhost:3001
Environment: Development
Database: Firestore Production

Test Results:
□ User Profile Flow: PASS/FAIL
□ Admin Management: PASS/FAIL
□ Realtime Sync: PASS/FAIL
□ API Endpoints: PASS/FAIL
□ Database Operations: PASS/FAIL
□ Error Handling: PASS/FAIL
□ Performance: PASS/FAIL

Overall Status: READY FOR PRODUCTION / NEEDS FIXES
```

---

## 🚀 Start Testing Now!

**Ready?** Open http://localhost:3001 và bắt đầu từ Bước 1!

**Pro Tip:** Mở DevTools Console để chạy test helpers và monitor events realtime! 🎯
