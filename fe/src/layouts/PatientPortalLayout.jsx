import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  FileText, 
  Sparkles,
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ExternalLink,
  ChevronDown,
  PhoneCall,
  Home
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
    { name: 'Đặt lịch khám', href: '/booking', icon: CalendarPlus, badge: 'Mới', description: 'Đặt lịch nhanh' },
    { name: 'Lịch sử & Hồ sơ', href: '/patient-home#history', icon: FileText, description: 'Lịch sử khám bệnh' },
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

  // Lấy tên trang hiện tại từ navigation
  const currentPage = navigation.find(n => location.pathname === n.href) || navigation[0];

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
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <Link to="/patient-home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <span className="text-lg">🦷</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">ZenBooking</span>
              <p className="text-[10px] text-slate-400 leading-tight">Cổng Bệnh Nhân</p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
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
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Hotline */}
        <div className="px-3 pb-3">
          <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-[11px] text-blue-400 font-semibold mb-0.5">
              <PhoneCall className="w-3 h-3" />
              Hotline 24/7
            </div>
            <div className="text-sm font-bold text-white">1900 8888</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Hỗ trợ nha khoa khẩn cấp</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors mb-2"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Trang giới thiệu phòng khám</span>
          </Link>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
              {getInitials(currentUser?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.fullName || 'Bệnh nhân'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentUser?.phone || 'Thành viên'}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0"
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
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Bệnh nhân</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700">{currentPage?.name || 'Tổng quan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-56 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* Booking CTA */}
            <Link
              to="/booking"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" />
              Đặt lịch khám
            </Link>

            {/* Notifications */}
            <button 
              title="Thông báo"
              className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-700 leading-tight">
                  {currentUser?.fullName || 'Bệnh nhân'}
                </span>
                <span className="block text-[10px] text-slate-400">Bệnh nhân thân thiết</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors" />
            </div>
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

export default PatientPortalLayout;
