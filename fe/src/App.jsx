import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import PatientPortalLayout from './layouts/PatientPortalLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/patient/LandingPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookingPage from './pages/patient/BookingPage';
import DashboardPage from './pages/admin/DashboardPage';
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
          </Route>
        </Route>

        {/* 3. Protected Routes cho Nhân viên phòng khám (ROLE_ADMIN, ROLE_DOCTOR) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Fallback điều hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
