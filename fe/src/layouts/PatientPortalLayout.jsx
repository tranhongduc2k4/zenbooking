import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  FileText, 
  Sparkles,
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ExternalLink,
  ChevronDown,
  PhoneCall
} from 'lucide-react';

const PatientPortalLayout = () => {
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const navigation = [
    { name: 'Tổng quan', href: '/patient-home', icon: LayoutDashboard, description: 'Bảng điều khiển cá nhân' },
    { name: 'Đặt lịch khám', href: '/booking', icon: CalendarPlus, badge: 'Mới', description: 'Đặt lịch nhanh trực tuyến' },
    { name: 'Lịch sử & Hồ sơ', href: '/patient-home#history', icon: FileText, description: 'Lịch sử khám & y bạ' },
    { name: 'Điểm thưởng', href: '/patient-home#rewards', icon: Sparkles, badge: '100đ', description: 'ZenZen Rewards' },
  ];

  const getInitials = (name) => {
    if (!name) return 'BN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const currentPage = navigation.find(n => location.pathname === n.href) || navigation[0];

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased text-slate-800">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar 256px cố định */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link to="/patient-home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-150">
              <span className="text-lg">🦷</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight block">ZenBooking</span>
              <p className="text-[11px] text-slate-300 font-medium leading-none mt-0.5">Cổng Bệnh Nhân</p>
            </div>
          </Link>
          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
            className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Dịch vụ cá nhân
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/patient-home' && location.pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                        isActive 
                          ? 'bg-white/25 text-white' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-blue-100 opacity-90' : 'text-slate-300 opacity-80 group-hover:text-slate-200'}`}>
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Khối Hotline & Footer cố định */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
          {/* Hotline box */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold mb-0.5">
              <PhoneCall className="w-3.5 h-3.5" />
              Hotline Cấp cứu 24/7
            </div>
            <div className="text-sm font-bold text-white tracking-wide">1900 8888</div>
            <p className="text-[11px] text-slate-300 mt-0.5 opacity-85">Hỗ trợ sự cố răng miệng khẩn cấp</p>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-1.5 text-[12px] text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              Trang phòng khám
            </span>
            <span className="text-[10px] text-slate-400">/home</span>
          </Link>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/90 border border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              {getInitials(currentUser?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.fullName || 'Bệnh nhân'}
              </div>
              <div className="text-[11px] text-slate-300 truncate opacity-85">
                {currentUser?.phone || 'Thành viên ZenBooking'}
              </div>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/60 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header - Tinh gọn, loại bỏ ô tìm kiếm không cần thiết */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-slate-600 truncate">
              <span className="text-slate-500">Cổng Bệnh Nhân</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900 truncate">{currentPage?.name || 'Tổng quan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Booking Button */}
            <Link
              to="/booking"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Đặt lịch khám</span>
            </Link>

            {/* Notifications */}
            <button 
              type="button"
              title="Thông báo lịch hẹn"
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 cursor-pointer group py-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-50">
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="hidden xl:block text-left">
                <span className="block text-[13px] font-semibold text-slate-800 leading-tight">
                  {currentUser?.fullName || 'Bệnh nhân'}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">Bệnh nhân thân thiết</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientPortalLayout;
