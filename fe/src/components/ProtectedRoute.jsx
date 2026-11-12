import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Component Route Bảo Vệ (Protected Route)
 * @param {Array} allowedRoles Danh sách các role được phép truy cập (vd: ['ROLE_ADMIN', 'ROLE_PATIENT'])
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  // Lấy role từ user object hoặc user_role trong localStorage
  let userRole = localStorage.getItem('user_role');
  if (!userRole) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userRole = userObj?.role;
      }
    } catch (e) {
      console.error('Không thể parse thông tin user từ localStorage:', e);
      userRole = null;
    }
  }

  // 1. Chưa đăng nhập (không có token) -> Chuyển hướng về trang đăng nhập
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng kiểm tra phân quyền (allowedRoles)
  if (allowedRoles.length > 0) {
    // Chuẩn hóa role (hỗ trợ cả trường hợp có hoặc không có tiền tố ROLE_)
    const normalizedUserRole = userRole
      ? userRole.startsWith('ROLE_')
        ? userRole
        : `ROLE_${userRole}`
      : '';

    const hasPermission = allowedRoles.some((role) => {
      const normalizedAllowed = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      return normalizedAllowed === normalizedUserRole || role === userRole;
    });

    // Không đủ quyền -> Chuyển hướng sang trang Không có quyền truy cập (/unauthorized)
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Token hợp lệ và đủ quyền -> Render nội dung bên trong
  return <Outlet />;
};

export default ProtectedRoute;
