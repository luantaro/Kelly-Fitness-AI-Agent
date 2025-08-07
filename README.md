# Kelly Fitness - AI Agent | Trợ lý Sức khỏe Thông minh

Một ứng dụng web hiện đại được xây dựng với Next.js, TypeScript và Tailwind CSS, cung cấp trợ lý AI chuyên về fitness, dinh dưỡng và sức khỏe với giao diện chuyên nghiệp theo phong cách ChatGPT và Gemini.

## ✨ Tính năng chính

### 🔐 Xác thực và Bảo mật

- **Đăng nhập/Đăng ký** với Firebase Authentication
- Hỗ trợ đăng nhập bằng Google
- Bảo mật dữ liệu người dùng

### 💬 Giao diện Chat AI

- **Chat thông minh** với GPT-4o AI
- Giao diện tương tự ChatGPT với tông màu pastel tinh tế
- Tư vấn fitness và dinh dưỡng chuyên sâu
- Typing indicator và animations mượt mà
- Lưu lịch sử chat

### 🏃‍♀️ Tính năng Fitness

- **Kế hoạch tập luyện** cá nhân hóa
- Tư vấn dinh dưỡng chi tiết
- Food database cho fitness
- Theo dõi tiến độ tập luyện
- Quick actions cho các câu hỏi phổ biến

### 💳 Thanh toán và Gói dịch vụ

- **3 gói dịch vụ**: Free, Professional, Premium
- Tích hợp Stripe payment
- Giao diện thanh toán chuyên nghiệp
- Billing cycle linh hoạt (hàng tháng/năm)

### 📱 Responsive Design

- **Sidebar** có thể thu gọn
- Mobile-first design
- Smooth animations với Framer Motion
- Tối ưu cho mọi thiết bị

## 🛠 Công nghệ sử dụng

- **Framework**: Next.js 14+ với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS với custom pastel theme
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: OpenAI GPT-4o API
- **Payment**: Stripe
- **Animations**: Framer Motion
- **Icons**: Heroicons & Lucide React

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Git

### Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd deobietsaoluon
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Cấu hình Environment Variables**

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. **Chạy development server**

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📂 Cấu trúc dự án

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AuthForm.tsx       # Login/Signup form
│   ├── ChatInterface.tsx  # Main chat interface
│   ├── PaymentPage.tsx    # Payment and pricing
│   └── Sidebar.tsx        # Navigation sidebar
└── lib/                   # Utilities and configs
    ├── firebase.ts        # Firebase configuration
    └── openai.ts          # OpenAI API integration
```

## 🎨 Design System

### Màu sắc pastel

- **Lavender**: `#E8E1FF` - Primary actions
- **Sky**: `#D1F0FF` - Secondary elements
- **Mint**: `#D1FFE1` - Success states
- **Rose**: `#FFE1EB` - Accent colors
- **Cream**: `#FFF8E1` - Background variations

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 🔧 Scripts có sẵn

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra linting
npm run type-check   # Kiểm tra TypeScript
```

## 📱 Tính năng theo Mindmap

### 1. Đăng nhập/Đăng ký

- ✅ Tích hợp Firebase để lưu thông tin đăng nhập
- ✅ Form validation và error handling
- ✅ Google OAuth integration

### 2. Giao diện Chat chính

- ✅ Thanh nhập chat với quick actions
- ✅ Công cụ quick action tạo thức đơn
- ✅ Lưu lịch sử chat có thể xóa
- ✅ Trang thái khách hàng & free/paid
- ✅ Sidebar dạng xuất với lại trang đăng ký
- ✅ Dashboard popup thông tin cá nhân có thể chỉnh sửa được và lưu lại

### 3. Trang thanh toán

- ✅ Tự động cập nhật trang thái user

### 4. Backend

- ✅ AI GPT 4o - tạo thức đơn từ input của user
- ✅ Tự vận định đường - food data base các món ăn chuẩn fitness

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 🎯 Roadmap

- [ ] Tích hợp wearable devices
- [ ] Phân tích video form tập luyện
- [ ] Mobile app với React Native
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social features và community

## 📞 Liên hệ

- **Developer**: Kelly Fitness - AI Agent Team
- **Email**: support@fitchat.ai
- **Website**: [https://fitchat.ai](https://fitchat.ai)

---

Made with ❤️ by Kelly Fitness - AI Agent Team
