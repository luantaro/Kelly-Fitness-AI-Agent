# Hướng dẫn sử dụng các nút hành động trong Admin Dashboard

## Tổng quan

Admin Dashboard hiện tại đã có đầy đủ logic cho tất cả các nút hành động. Dưới đây là hướng dẫn chi tiết về từng nút:

## 1. Nút "Xem chi tiết" (👁️ Eye Icon)

**Mục đích**: Hiển thị thông tin chi tiết của người dùng
**Màu sắc**: Xanh dương (blue)
**Chức năng**:

- Hiển thị thông tin cá nhân đầy đủ
- Lịch sử subscription
- Thống kê sử dụng (tin nhắn, export)
- Ngày tạo tài khoản và lần đăng nhập cuối

## 2. Nút "Quản lý Subscription" (✨ Sparkles Icon)

**Mục đích**: Thay đổi loại subscription và thời hạn
**Màu sắc**: Tím (purple)
**Chức năng**:

- Chuyển đổi giữa Trial, Free, Pro
- Thiết lập thời hạn cho tài khoản Pro (1-120 tháng)
- Preset options: 1 tháng, 3 tháng, 6 tháng, 1 năm
- Tùy chỉnh thời hạn theo ý muốn

## 3. Nút "Kích hoạt tài khoản" (✅ CheckCircle Icon)

**Mục đích**: Kích hoạt tài khoản pending_activation thành Pro
**Màu sắc**: Xanh lá (green)
**Hiển thị khi**: User có status = "pending_activation"
**Chức năng**:

- Chuyển từ trạng thái "Chờ kích hoạt" thành "Pro"
- Thiết lập thời hạn sử dụng (1-120 tháng)
- Preset options: 1 tháng, 3 tháng, 6 tháng, 1 năm
- Ghi log hoạt động của admin

## 4. Nút "Chỉnh sửa" (✏️ Pencil Icon)

**Mục đích**: Chỉnh sửa thông tin cơ bản của người dùng
**Màu sắc**: Cam (amber)
**Chức năng**:

- Thay đổi tên hiển thị (Display Name)
- Bật/tắt trạng thái hoạt động (Active/Inactive)
- Cập nhật thông tin cơ bản khác

## 5. Nút "Toggle Status" (🔄 Check/X Circle Icon)

**Mục đích**: Bật/tắt trạng thái hoạt động của tài khoản
**Màu sắc**:

- Xanh lá (green) khi user bị khóa → để kích hoạt
- Đỏ (red) khi user đang hoạt động → để khóa
  **Chức năng**:
- Khóa/mở khóa tài khoản ngay lập tức
- Không ảnh hưởng đến subscription
- User bị khóa sẽ không thể đăng nhập

## 6. Nút "Xóa" (🗑️ Trash Icon)

**Mục đích**: Xóa vĩnh viễn tài khoản người dùng
**Màu sắc**: Đỏ (red)
**Bảo mật**: Yêu cầu nhập "DELETE" để xác nhận
**Chức năng**:

- Xóa hoàn toàn tài khoản khỏi hệ thống
- Xóa tất cả dữ liệu liên quan (tin nhắn, lịch sử, etc.)
- Không thể hoàn tác sau khi xóa

## Logic hoạt động của Trial System

### Khi user mới đăng ký:

1. **Admin accounts**: Tự động được tạo với status = "active", subscription = "pro"
2. **Regular users**: Được tạo với status = "trial", có 3 ngày dùng thử

### Sau 3 ngày trial:

1. User status tự động chuyển thành "pending_activation"
2. Xuất hiện thông báo cần admin kích hoạt
3. Nút "Kích hoạt tài khoản" xuất hiện trong admin dashboard

### Khi admin kích hoạt:

1. Status chuyển từ "pending_activation" → "active"
2. Subscription chuyển thành "pro"
3. Thiết lập thời hạn theo lựa chọn của admin
4. Ghi log hoạt động kích hoạt

## API Endpoints được sử dụng:

- **GET** `/api/admin/users` - Lấy danh sách users
- **POST** `/api/admin/users/toggle-status` - Bật/tắt trạng thái
- **POST** `/api/admin/users/delete` - Xóa user
- **POST** `/api/admin/users/activate` - Kích hoạt user
- **POST** `/api/admin/users/update` - Cập nhật thông tin user
- **POST** `/api/admin/users/update-subscription` - Cập nhật subscription

## Testing các nút hành động:

1. **Login as admin**: Đăng nhập bằng tài khoản admin
2. **Navigate to admin dashboard**: Truy cập `/admin`
3. **Test từng nút một cách tuần tự**:
   - Xem chi tiết user → Check thông tin hiển thị đúng
   - Chỉnh sửa user → Thay đổi tên, status
   - Quản lý subscription → Chuyển đổi giữa các loại
   - Kích hoạt user (nếu có pending) → Test với user pending
   - Toggle status → Bật/tắt trạng thái
   - Xóa user → Test với user test (cẩn thận!)

## Lưu ý quan trọng:

- Tất cả thao tác đều yêu cầu quyền admin
- Các thay đổi được ghi log trong `admin_logs` collection
- UI sẽ refresh tự động sau mỗi thao tác thành công
- Error handling đầy đủ với thông báo lỗi rõ ràng
- Loading states để tránh double-click
