# 🦷 ZenBooking - Dental Clinic Management System

ZenBooking là hệ thống quản lý và đặt lịch khám chuyên biệt dành cho các phòng khám nha khoa. Dự án cung cấp giải pháp số hóa toàn diện từ khâu đặt lịch trực tuyến của bệnh nhân, đến hệ thống quản lý bệnh án tương tác (sơ đồ răng) dành cho bác sĩ.

## 🚀 Công nghệ sử dụng (Tech Stack)

**Workspace & DevOps:**
- **Containerization:** Docker & Docker Compose
- **Database:** MySQL 8.0

**Backend (RESTful API):**
- **Framework:** Java Spring Boot 3
- **ORM:** Spring Data JPA / Hibernate
- **Security:** Spring Security + JWT Authentication
- **Architecture:** Package-by-Feature, 3-Tier Architecture

**Frontend (Trải nghiệm người dùng):**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing & Fetching:** React Router DOM, Axios

## ✨ Tính năng nổi bật (Key Features)

### 👤 Dành cho Bệnh nhân (Patients)
- Đăng ký / Đăng nhập tài khoản bảo mật.
- Xem danh mục các dịch vụ nha khoa (Trám răng, Niềng răng, Tẩy trắng...).
- **Đặt lịch thông minh:** Chọn bác sĩ và hệ thống tự động tính toán, hiển thị các khung giờ còn trống (Available Slots).
- Xem lịch sử thăm khám cá nhân.

### 👨‍⚕️ Dành cho Bác sĩ & Quản trị viên (Doctors & Admins)
- **Quản lý bệnh án:** Lưu trữ kết quả chẩn đoán và đơn thuốc.
- **Sơ đồ răng tương tác (Tooth Chart):** Đánh dấu tình trạng trực quan trên 32 chiếc răng.
- Cập nhật trạng thái ca khám (Chờ khám, Đã hoàn thành, Hủy).

## 📂 Cấu trúc dự án (Monorepo Structure)

\`\`\`text
zenbooking-workspace/
├── docker-compose.yml       # Điều phối container MySQL
├── zenbooking-backend/      # Mã nguồn Java Spring Boot (Cổng 8080)
└── zenbooking-frontend/     # Mã nguồn React + Tailwind (Cổng 5173)
\`\`\`

## 🛠 Hướng dẫn cài đặt và chạy dự án (Getting Started)

### Yêu cầu môi trường:
- Java 17+
- Node.js 18+
- Docker & Docker Compose

### Các bước khởi chạy:

1. **Khởi chạy Database:**
   Mở terminal tại thư mục gốc và chạy lệnh:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. **Khởi chạy Backend:**
   Mở thư mục `zenbooking-backend` bằng IDE (IntelliJ IDEA), cấu hình `application.yml` kết nối tới MySQL và ấn Run `ZenBookingApplication.java`.

3. **Khởi chạy Frontend:**
   Mở terminal tại thư mục `zenbooking-frontend` và chạy:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
