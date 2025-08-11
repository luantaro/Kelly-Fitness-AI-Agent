# 🧪 Kế hoạch Test E2E - Hệ thống đồng bộ Profile 2 chiều

## 🎯 Mục tiêu Test

Test toàn bộ luồng đồng bộ hóa thông tin user profile giữa:

- User Settings Modal
- Admin Dashboard
- Sidebar Display
- API Backend
- Firestore Database

## 🚀 Chuẩn bị Test Environment

### 1. **Server Status**

- ✅ Server đang chạy: `http://localhost:3001`
- ✅ Environment: Development
- ✅ Database: Firestore (Production)

### 2. **Test Accounts**

#### User Account (để test user flow)

```
Email: freeuser1@test.com
Password: Test123456
Role: Normal User
```

#### Admin Account (để test admin flow)

```
Email: taro2255@gmail.com
Password: [Use existing password]
Role: Admin
```

## 📋 Test Scenarios E2E

### 🎭 **Scenario 1: User Profile Creation & Sync**

#### 1.1 Initial User Setup

```bash
🔗 http://localhost:3001
1. Login với freeuser1@test.com
2. Check sidebar → should show email, no profile info
3. Click Settings (⚙️) → open Settings Modal
4. Verify form is empty or has default values
```

#### 1.2 User Profile Input

```bash
Form Input:
- Tên: "Nguyễn Văn Test"
- Tuổi: 25
- Giới tính: Nam
- Chiều cao: 170 cm
- Cân nặng: 65 kg
- Hoạt động: Vừa phải (3-5 ngày/tuần)
- Mục tiêu: Tăng cơ - tăng cân

Expected Results:
✅ Form auto-saves on each input
✅ Success message appears
✅ Modal closes after 2 seconds
✅ Sidebar shows: "Nguyễn Văn Test" + "25t • 170cm • 65kg"
```

#### 1.3 Profile Persistence Test

```bash
1. Refresh page (F5)
2. Check sidebar → profile info should persist
3. Open Settings → form should show saved data
4. Close and reopen Settings → data still there
```

### 🛡️ **Scenario 2: Admin Profile Management**

#### 2.1 Admin Login & Access

```bash
1. Logout freeuser1@test.com
2. Login với taro2255@gmail.com
3. Click "🔧 Admin" in sidebar
4. Verify admin dashboard loads
5. Find freeuser1@test.com in user table
```

#### 2.2 Admin View User Profile

```bash
1. Find freeuser1@test.com row
2. Click Profile button (👤)
3. Verify UserProfileEditModal opens
4. Check form shows user's data:
   - Tên: "Nguyễn Văn Test"
   - Tuổi: 25
   - Etc.
```

#### 2.3 Admin Edit User Profile

```bash
Admin Changes:
- Tên: "Test User Updated by Admin"
- Tuổi: 26
- Cân nặng: 70 kg

Expected Results:
✅ Form updates successfully
✅ Success message appears
✅ Modal closes
✅ User table refreshes
```

### 🔄 **Scenario 3: Realtime Sync Testing**

#### 3.1 Multi-tab Sync Test

```bash
Tab 1: Admin Dashboard (logged as admin)
Tab 2: User Dashboard (logged as freeuser1)

1. In Tab 1: Edit freeuser1's profile
2. In Tab 2: Check if sidebar updates automatically
3. In Tab 2: Open Settings → verify changes appear
```

#### 3.2 Event-driven Communication

```bash
Browser DevTools Console:
1. Open Console in user tab
2. Admin makes changes in other tab
3. Check for event logs:
   - "👨‍💼 Profile updated by admin"
   - "fitchat-admin-profile-update" event
   - Sidebar re-render
```

### 📱 **Scenario 4: API & Backend Testing**

#### 4.1 API Endpoint Verification

```bash
Browser Network Tab:
1. User updates profile → Check POST /api/user/profile
2. Admin updates user → Check POST /api/admin/users/[userId]/profile
3. Profile load → Check GET /api/user/profile
4. Admin loads user → Check GET /api/admin/users/[userId]/profile

Expected:
✅ 200 responses for all requests
✅ Proper JWT tokens in headers
✅ Correct request/response payloads
```

#### 4.2 Database Verification

```bash
Firestore Console:
1. Navigate to users collection
2. Find freeuser1 document
3. Verify userProfile field contains latest data
4. Check profileUpdatedAt timestamp
5. Check profileUpdatedBy field (should be admin email)
```

### 🚨 **Scenario 5: Error Handling & Edge Cases**

#### 5.1 Network Failure Simulation

```bash
1. User opens Settings
2. Turn off internet
3. Update profile → should save locally
4. Turn on internet → should auto-sync
5. Check Firestore for final data
```

#### 5.2 Permission Testing

```bash
1. Regular user tries to access admin API directly
2. Should get 403 Forbidden
3. Admin with invalid token
4. Should get 401 Unauthorized
```

#### 5.3 Data Validation

```bash
Invalid Inputs:
- Age: -1, 200
- Height: 50, 300
- Weight: 0, 500

Expected:
✅ Form validation prevents submission
✅ Error messages appear
✅ No invalid data sent to server
```

## 🧪 Automated Test Commands

### Setup Test Environment

```bash
# Start fresh server
npm run dev

# Check server health
curl http://localhost:3001/api/health

# Clear test data (if needed)
npm run test:cleanup
```

### Manual Testing Checklist

```bash
□ User can create profile
□ User can edit profile
□ Admin can view user profiles
□ Admin can edit user profiles
□ Sidebar updates realtime
□ Data persists after refresh
□ Multi-tab sync works
□ API responses are correct
□ Database updates properly
□ Error handling works
□ Validation prevents bad data
□ Permissions are enforced
```

## 📊 Performance Testing

### Load Testing

```bash
1. Multiple users editing profiles simultaneously
2. Admin editing multiple users rapidly
3. Check for race conditions
4. Verify database consistency
```

### Caching Testing

```bash
1. Check ETag caching works
2. Verify localStorage efficiency
3. Test TTL expiration
4. Confirm smart refresh triggers
```

## 🔍 Debugging Tools

### Browser DevTools

```javascript
// Check profile sync events
window.addEventListener("fitchat-profile-updated", console.log);
window.addEventListener("fitchat-admin-profile-update", console.log);

// Check localStorage
console.log(localStorage.getItem("fitchat_user_profile"));

// Check hook state
// (Use React DevTools)
```

### Server Logs

```bash
# Watch API logs
tail -f logs/api.log

# Check Firestore operations
# (Use Firebase Console)
```

## 🎯 Success Criteria

### ✅ Must Pass

- [ ] User can create/edit profile successfully
- [ ] Admin can manage any user profile
- [ ] Changes sync realtime across all interfaces
- [ ] Data persists correctly in database
- [ ] No data loss during operations
- [ ] Security permissions work properly

### 🎖️ Nice to Have

- [ ] Optimistic UI updates feel smooth
- [ ] Error messages are user-friendly
- [ ] Performance is under 2s for all operations
- [ ] Works offline with proper sync on reconnect

## 🚀 Execution Timeline

### Phase 1: Basic Functionality (30 mins)

1. User profile creation
2. Basic CRUD operations
3. Database persistence

### Phase 2: Admin Features (30 mins)

1. Admin dashboard access
2. User profile management
3. Permission verification

### Phase 3: Realtime Sync (30 mins)

1. Event-driven updates
2. Multi-tab testing
3. Cross-user sync

### Phase 4: Edge Cases (30 mins)

1. Error handling
2. Network failures
3. Data validation

### Phase 5: Performance (30 mins)

1. Load testing
2. Caching verification
3. Database optimization

---

## 🎬 Let's Start Testing!

**Ready to begin?** Chạy từng scenario theo thứ tự để đảm bảo hệ thống hoạt động hoàn hảo!

**Current Status:** Server ready at http://localhost:3001 🚀
