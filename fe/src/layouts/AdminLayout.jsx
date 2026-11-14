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
} from 'lucide-react';
import UserAccountDropdown from '../components/UserAccountDropdown';

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

  const allNavigation = [
    { 
      name: isDoctor ? 'Lịch khám của tôi' : 'Tổng quan', 
      href: '/admin', 
      icon: LayoutDashboard,
      description: isDoctor ? 'Dashboard bác sĩ' : 'Tổng quan phòng khám',
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: isDoctor ? 'Ca khám sắp tới' : 'Quản lý lịch hẹn', 
      href: '/admin/appointments', 
      icon: Calendar,
      description: isDoctor ? 'Lịch trực của bác sĩ' : 'Toàn bộ lịch hẹn',
      badge: isDoctor ? '3' : '8',
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Hồ sơ bệnh nhân', 
      href: '/admin/patients', 
      icon: Users,
      description: 'Danh sách bệnh nhân',
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Dịch vụ & Bảng giá', 
      href: '/admin/services', 
      icon: Stethoscope,
      description: 'Quản lý dịch vụ',
      roles: ['ROLE_ADMIN', 'ADMIN', 'ROLE_DOCTOR', 'DOCTOR']
    },
    { 
      name: 'Đội ngũ bác sĩ', 
      href: '/admin/doctors', 
      icon: UserCheck,
      description: 'Nhân sự phòng khám',
      roles: ['ROLE_ADMIN', 'ADMIN']
    },
    { 
      name: 'Doanh thu & Báo cáo', 
      href: '/admin/revenue', 
      icon: DollarSign,
      description: 'Thống kê tài chính',
      roles: ['ROLE_ADMIN', 'ADMIN']
    },
    { 
      name: 'Cài đặt hệ thống', 
      href: '/admin/settings', 
      icon: Settings,
      description: 'Cấu hình phòng khám',
      roles: ['ROLE_ADMIN', 'ADMIN']
    },
  ];

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

  const currentPage = visibleNavigation.find(n => location.pathname === n.href);
  const accentColor = isDoctor ? 'from-teal-500 to-cyan-400' : 'from-blue-500 to-cyan-400';
  const badgeColor = isDoctor ? 'bg-teal-500/15 text-teal-400' : 'bg-blue-500/15 text-blue-400';
  const activeBg = isDoctor ? 'bg-teal-600 shadow-teal-600/25' : 'bg-blue-600 shadow-blue-600/25';

  return (
    <div className="min-h-screen bg-gray-50 flex antialiased text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <span className="text-sm font-bold text-white">{isDoctor ? '🩺' : 'ZB'}</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">ZenBooking</span>
              <p className="text-[11px] text-slate-300 leading-tight">
                {isDoctor ? 'Cổng Bác Sĩ' : 'Quản Trị Viên'}
              </p>
            </div>
          </Link>
          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
            {isDoctor ? 'Chuyên môn nha khoa' : 'Quản trị phòng khám'}
          </p>
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? `${activeBg} text-white shadow-lg`
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-300 group-hover:bg-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-300 group-hover:text-slate-100'}`}>
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Trang đặt lịch bệnh nhân</span>
          </Link>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${accentColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow`}>
              {getInitials(currentUser?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.fullName || (isDoctor ? 'BS. Chuyên Khoa' : 'Admin Phòng Khám')}
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {isDoctor ? 'Bác sĩ điều trị' : 'Quản lý trưởng'}
              </div>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-300 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">{isDoctor ? 'Bác sĩ' : 'Admin'}</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700">{currentPage?.name || 'Tổng quan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={isDoctor ? "Tìm bệnh nhân..." : "Tìm bệnh nhân, mã hẹn..."}
                className="w-56 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* New Appointment CTA */}
            <Link
              to="/admin/appointments"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo lịch hẹn
            </Link>

            {/* Notifications */}
            <button 
              type="button"
              title="Thông báo"
              className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile Avatar Pill with Switch Account Dropdown */}
            <UserAccountDropdown currentUser={currentUser} onLogout={handleLogout} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
