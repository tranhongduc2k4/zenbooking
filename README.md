# 🦷 ZenBooking - Dental Clinic Management System

ZenBooking là hệ thống quản lý và đặt lịch khám chuyên biệt dành cho các phòng khám nha khoa. Dự án cung cấp giải pháp số hóa toàn diện từ khâu đặt lịch trực tuyến của bệnh nhân, đến hệ thống quản lý bệnh án tương tác (sơ đồ răng) dành cho bác sĩ và quản trị viên.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

**Backend (RESTful API):**
- **Framework:** Java Spring Boot 3 (Java 17+)
- **ORM:** Spring Data JPA / Hibernate (tự động tạo bảng & migration)
- **Security:** Spring Security + JWT Authentication (HMAC-SHA256)
- **Database:** MySQL 8.0 (hỗ trợ Docker Compose hoặc MySQL Server cục bộ)
- **Architecture:** Package-by-Feature, 3-Tier Architecture

**Frontend (Client SPA):**
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS + Lucide Icons
- **Routing & HTTP Client:** React Router DOM v6, Axios

---

## 📂 Cấu trúc thư mục dự án

```text
ZenBooking/
├── be/                      # Mã nguồn Backend (Spring Boot, Port 8080)
│   ├── mvnw / mvnw.cmd      # Maven Wrapper (chạy không cần cài sẵn Maven)
│   ├── pom.xml
│   └── src/
├── fe/                      # Mã nguồn Frontend (React + Vite, Port 5173)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── docker-compose.yml       # Điều phối container MySQL 8.0
├── .env.example             # File mẫu các biến môi trường
└── README.md                # Tài liệu hướng dẫn
```

---

## 🛠 Hướng dẫn chi tiết cài đặt và khởi chạy dự án

### 0. Yêu cầu môi trường tối thiểu
Trước khi bắt đầu, máy tính cần cài sẵn:
1. **Git** (để clone repo)
2. **Java JDK 17** trở lên (Khuyên dùng OpenJDK 17 hoặc Oracle JDK 17)
3. **Node.js 18+** & **npm**
4. **MySQL Database**: Chọn 1 trong 2 cách:
   - *Cách 1 (Khuyên dùng):* Đã cài **Docker Desktop**
   - *Cách 2:* Đã cài **MySQL Server 8.0** cục bộ (hoặc qua XAMPP/WampServer)

---

### Bước 1: Clone mã nguồn từ GitHub
Mở Terminal / PowerShell / Git Bash và gõ lệnh:

```bash
git clone https://github.com/tranhongduc2k4/zenbooking.git
cd zenbooking
git checkout dev
```

---

### Bước 2: Chuẩn bị Cơ sở dữ liệu (MySQL)

#### 👉 Lựa chọn A: Dùng Docker (Nhanh và tiện nhất)
Nếu máy bạn đã mở Docker Desktop, tại thư mục gốc `zenbooking/`, chỉ cần chạy:
```bash
docker-compose up -d
```
Container `zenbooking-mysql` sẽ tự động khởi tạo database `zenbooking` tại cổng `3306` với user/password là `root` / `root`.

#### 👉 Lựa chọn B: Dùng MySQL Server có sẵn trên máy
Nếu bạn cài MySQL cục bộ:
1. Đảm bảo MySQL Service đang chạy ở cổng `3306`.
2. Tạo database (nếu chưa có):
   ```sql
   CREATE DATABASE IF NOT EXISTS zenbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. *(Tùy chọn)* Nếu mật khẩu MySQL trên máy bạn khác `root`, hãy copy file `.env.example` thành `.env` ở thư mục gốc hoặc thư mục `be/` và sửa lại:
   ```env
   DB_USER=root
   DB_PASS=mật_khẩu_của_bạn
   ```

---

### Bước 3: Khởi chạy Backend (Spring Boot)

Mở một cửa sổ Terminal mới tại thư mục `zenbooking`:

```bash
cd be
```

**Cách 1 - Dùng dòng lệnh (Maven Wrapper có sẵn):**
- **Trên Windows (cmd/PowerShell):**
  ```bash
  .\mvnw spring-boot:run
  ```
- **Trên macOS / Linux:**
  ```bash
  chmod +x mvnw
  ./mvnw spring-boot:run
  ```

**Cách 2 - Dùng IntelliJ IDEA:**
1. Mở thư mục `be` (hoặc cả thư mục `ZenBooking`) bằng IntelliJ IDEA.
2. Đợi IntelliJ tải xong dependencies trong `pom.xml`.
3. Tìm file: `be/src/main/java/com/tranhongduc2k4/zenbooking/ZenBookingApplication.java`
4. Bấm nút **Run** (biểu tượng tam giác xanh ▶).

> 💡 **Tự động khởi tạo dữ liệu:** Khi Backend chạy lần đầu, hệ thống sẽ:
> - Tự động tạo toàn bộ bảng trong MySQL (`ddl-auto: update`).
> - Tự động tạo 3 tài khoản mẫu (Bệnh nhân, Bác sĩ, Quản trị viên).
> - Tự động nạp sẵn 6 dịch vụ nha khoa tiêu chuẩn và danh sách lịch hẹn mẫu.
> - Backend chạy tại: `http://localhost:8080`

---

### Bước 4: Khởi chạy Frontend (React + Vite)

Mở một cửa sổ Terminal khác tại thư mục `zenbooking`:

```bash
cd fe
npm install
npm run dev
```

Mở trình duyệt và truy cập:
👉 **`http://localhost:5173`**

---

## 🔑 Tài khoản mẫu dùng thử (Pre-seeded Demo Accounts)

Hệ thống đã chuẩn bị sẵn các tài khoản với từng vai trò, **mật khẩu chung mặc định là: `123456`**

| Vai trò | Số điện thoại (Tên đăng nhập) | Email | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **Bệnh nhân (Patient)** | `0792275635` | `duc.patient@zenbooking.com` | `123456` | Đặt lịch khám trực tuyến, xem/hủy lịch hẹn cá nhân |
| **Bác sĩ (Doctor)** | `0988888888` | `tuan.doctor@zenbooking.com` | `123456` | Xem lịch khám phụ trách, quản lý hồ sơ điều trị |
| **Quản trị viên (Admin)** | `0909999999` | `admin@zenbooking.com` | `123456` | Quản trị toàn bộ lịch hẹn, duyệt ca, đổi trạng thái |

*(Ngoài ra bạn có thể bấm **"Đăng ký ngay"** trên giao diện để tạo tài khoản bệnh nhân mới).*

---

## 🧭 Các màn hình chính

- **Trang chủ giới thiệu:** `http://localhost:5173/home`
- **Đăng nhập:** `http://localhost:5173/login`
- **Đăng ký:** `http://localhost:5173/register`
- **Cổng Bệnh nhân (Tổng quan):** `http://localhost:5173/patient-home`
- **Đặt lịch khám nhanh:** `http://localhost:5173/booking`
- **Trang Quản trị & Bác sĩ:** `http://localhost:5173/admin`
