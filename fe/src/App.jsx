import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/patient/HomePage';
import BookingPage from './pages/patient/BookingPage';
import DashboardPage from './pages/admin/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient Routes - Hiển thị HomePage & BookingPage lồng trong PatientLayout */}
        <Route path="/" element={<PatientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="booking" element={<BookingPage />} />
        </Route>

        {/* Admin Routes - Hiển thị DashboardPage lồng trong AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Fallback điều hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
