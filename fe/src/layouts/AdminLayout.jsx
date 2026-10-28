import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  Stethoscope, 
  DollarSign, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  PlusCircle, 
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Stethoscope as DoctorIcon
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Không thể đọc thông tin user:', e);
    }
  }, []);

  const userRole = localStorage.getItem('user_role') || currentUser?.role;
  const isDoctor = userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR';
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  // Danh mục menu với phân quyền chi tiết cho Admin và Bác sĩ
  const allNavigation = [
    { 
      name: isDoctor ? 'Lịch khám của tôi' : 'Tổng quan phòng khám', 
      href: '/admin', 
      icon: LayoutDashboard,
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: isDoctor ? 'Ca khám sắp tới' : 'Quản lý lịch hẹn', 
      href: '/admin/appointments', 
      icon: Calendar, 
      badge: isDoctor ? '3 chờ' : '8 mới',
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Hồ sơ bệnh nhân', 
      href: '/admin/patients', 
      icon: Users,
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Bảng giá & Dịch vụ', 
      href: '/admin/services', 
      icon: Stethoscope,
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Đội ngũ bác sĩ', 
      href: '/admin/doctors', 
      icon: UserCheck, 
      roles: ['ROLE_ADMIN', 'ADMIN'] // Chỉ Admin được xem quản lý nhân sự
    },
    { 
      name: 'Doanh thu & Báo cáo', 
      href: '/admin/revenue', 
      icon: DollarSign, 
      roles: ['ROLE_ADMIN', 'ADMIN'] // Chỉ Admin được xem tài chính doanh thu
    },
    { 
      name: 'Cài đặt hệ thống', 
      href: '/admin/settings', 
      icon: Settings, 
      roles: ['ROLE_ADMIN', 'ADMIN'] // Chỉ Admin được cấu hình hệ thống
    },
  ];

  // Lọc menu hiển thị dựa trên role hiện tại
  const visibleNavigation = allNavigation.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((r) => r === userRole || (userRole && userRole.includes(r)));
  });

  const getInitials = (name) => {
    if (!name) return isDoctor ? 'BS' : 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white font-bold text-xl shadow-lg ${
              isDoctor ? 'from-cyan-600 to-teal-500 shadow-teal-500/20' : 'from-blue-600 to-cyan-500 shadow-blue-500/20'
            }`}>
              {isDoctor ? '🩺' : 'ZB'}
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                ZenBooking
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                  isDoctor ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isDoctor ? 'Bác Sĩ' : 'Admin'}
                </span>
              </span>
              <p className="text-xs text-slate-400">
                {isDoctor ? 'Cổng Lâm Sàng Y Tế' : 'Nha Khoa Quốc Tế'}
              </p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isDoctor ? 'Chuyên môn nha khoa' : 'Quản trị phòng khám'}
          </div>
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors mb-3"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Xem trang bệnh nhân
            </span>
            <span className="text-[10px] text-slate-400">/booking</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow shrink-0 ${
                isDoctor 
                  ? 'bg-gradient-to-tr from-cyan-600 to-teal-500' 
                  : 'bg-gradient-to-tr from-blue-500 to-indigo-600'
              }`}>
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-semibold text-white leading-tight truncate">
                  {currentUser?.fullName || (isDoctor ? 'BS. Chuyên Khoa' : 'Admin Phòng Khám')}
                </div>
                <div className="text-[11px] text-blue-400 truncate">
                  {isDoctor ? 'Bác sĩ điều trị' : 'Quản lý trưởng'}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/60 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Global Quick Search */}
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isDoctor ? "Tìm bệnh nhân của tôi, ca khám..." : "Tìm bệnh nhân, mã hẹn, SĐT..."}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/booking"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo lịch hẹn mới
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button 
                title="Thông báo hệ thống"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile pill */}
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                isDoctor ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-700">
                  {currentUser?.fullName || (isDoctor ? 'Bác sĩ điều trị' : 'Admin Quản Trị')}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {isDoctor ? 'Khoa Răng Hàm Mặt' : 'zenbooking.vn'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
