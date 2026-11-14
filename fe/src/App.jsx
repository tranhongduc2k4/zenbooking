import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import PatientPortalLayout from './layouts/PatientPortalLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/patient/LandingPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookingPage from './pages/patient/BookingPage';
import MedicalHistoryPage from './pages/patient/MedicalHistoryPage';
import DashboardPage from './pages/admin/DashboardPage';
import ServicesManagementPage from './pages/admin/ServicesManagementPage';
import AppointmentsManagementPage from './pages/admin/AppointmentsManagementPage';
import PatientsManagementPage from './pages/admin/PatientsManagementPage';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';
import { UserCheck, DollarSign, Settings } from 'lucide-react';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Routes (Khách vãng lai chưa đăng nhập) */}
        <Route path="/" element={<PatientLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Auth Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 2. Protected Routes cho Bệnh nhân đã đăng nhập (ROLE_PATIENT) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_PATIENT', 'PATIENT']} />}>
          <Route element={<PatientPortalLayout />}>
            <Route path="/patient-home" element={<PatientDashboard />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/patient/history" element={<MedicalHistoryPage />} />
          </Route>
        </Route>

        {/* 3. Protected Routes cho Nhân viên phòng khám (ROLE_ADMIN, ROLE_DOCTOR) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsManagementPage />} />
            <Route path="patients" element={<PatientsManagementPage />} />
            <Route path="services" element={<ServicesManagementPage />} />
            <Route path="doctors" element={<AdminPlaceholderPage title="Quản lý Đội ngũ Bác sĩ" description="Quản lý danh sách bác sĩ, phân công ca trực và chuyên khoa điều trị tại phòng khám ZenBooking." icon={UserCheck} />} />
            <Route path="revenue" element={<AdminPlaceholderPage title="Doanh thu & Báo cáo Tài chính" description="Thống kê doanh thu ca khám, phân tích tỷ trọng dịch vụ nha khoa và hiệu suất kinh doanh." icon={DollarSign} />} />
            <Route path="settings" element={<AdminPlaceholderPage title="Cài đặt Hệ thống Phòng khám" description="Cấu hình thông tin cơ sở phòng khám, khung giờ làm việc và quy chuẩn bảo mật y tế." icon={Settings} />} />
          </Route>
        </Route>

        {/* Fallback điều hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
