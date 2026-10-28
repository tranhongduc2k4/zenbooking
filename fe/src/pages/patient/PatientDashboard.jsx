import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  PlusCircle, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Activity,
  Smile,
  ShieldCheck
} from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Không thể đọc thông tin user từ localStorage', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner chào mừng */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Cổng thông tin Bệnh nhân ZenBooking
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Chào mừng {currentUser?.fullName ? currentUser.fullName : 'bệnh nhân'} trở lại!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Đây là bảng điều khiển của bạn. Theo dõi lịch hẹn khám nha khoa, lộ trình điều trị và kiểm tra sức khỏe răng miệng dễ dàng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Đặt lịch khám mới
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Thẻ trạng thái & Nhắc nhở nha khoa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Lịch khám sắp tới
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Chưa có lịch hẹn</h3>
            <p className="text-xs text-slate-500 mt-0.5">Đặt lịch định kỳ 6 tháng/lần để bảo vệ răng</p>
            <Link to="/booking" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
              Đặt hẹn ngay →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Hồ sơ y bạ điện tử
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Đã kích hoạt</h3>
            <p className="text-xs text-slate-500 mt-0.5">SĐT liên kết: <span className="font-medium text-slate-700">{currentUser?.phone || '0987...'}</span></p>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-600">
              Bảo mật y tế chuẩn ISO
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Điểm thành viên ZenZen
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">100 Điểm thưởng</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ưu đãi giảm 10% cho lần cạo vôi tiếp theo</p>
            <span className="inline-block mt-3 text-xs font-semibold text-amber-600">
              Hạng: Bệnh nhân Thân Thiết
            </span>
          </div>
        </div>
      </div>

      {/* Thông tin hỗ trợ và lời khuyên */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-base">
            💡
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Lời khuyên chăm sóc răng từ Bác sĩ ZenBooking</h4>
            <p className="text-xs text-slate-500 mt-0.5">Đánh răng ít nhất 2 lần/ngày với bàn chải lông mềm và sử dụng chỉ nha khoa sau mỗi bữa ăn.</p>
          </div>
        </div>
        <Link
          to="/booking"
          className="shrink-0 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
        >
          Tư vấn trực tuyến
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
