import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  ChevronRight, 
  UserCheck, 
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  Sparkles,
  CalendarPlus,
  FileText,
  Pill,
  Award,
  Stethoscope,
  MapPin,
  Smile
} from 'lucide-react';

const PatientDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Danh sách lịch hẹn cá nhân của bệnh nhân (Mock data đồng bộ)
  const [myAppointments, setMyAppointments] = useState([
    {
      id: 'ZB-AP-8801',
      service: 'Khám tổng quát & Chụp X-quang răng',
      doctor: 'BS. CKI Trần Minh Tuấn',
      specialty: 'Chuyên gia Chỉnh nha & Răng khôn',
      date: 'Thứ Sáu, 30/10/2026',
      time: '09:00',
      room: 'Phòng khám 1 (Lầu 1)',
      status: 'CONFIRMED', // Đã xác nhận
      cost: 'Miễn phí',
    },
    {
      id: 'ZB-AP-8802',
      service: 'Cạo vôi răng & Đánh bóng siêu âm',
      doctor: 'ThS. BS Lê Hoàng Yến',
      specialty: 'Chuyên gia Nha khoa Thẩm mỹ',
      date: 'Thứ Ba, 10/11/2026',
      time: '14:30',
      room: 'Ghế nha số 3',
      status: 'PENDING', // Chờ xác nhận
      cost: '200.000đ',
    },
    {
      id: 'ZB-AP-8750',
      service: 'Trám răng thẩm mỹ Composite',
      doctor: 'BS. CKI Trần Minh Tuấn',
      specialty: 'Chỉnh nha & Răng khôn',
      date: '15/09/2026',
      time: '10:00',
      room: 'Phòng khám 2',
      status: 'COMPLETED', // Đã khám xong
      cost: '350.000đ',
    },
    {
      id: 'ZB-AP-8610',
      service: 'Tẩy trắng răng Laser Whitening',
      doctor: 'ThS. BS Lê Hoàng Yến',
      specialty: 'Nha khoa Thẩm mỹ',
      date: '20/06/2026',
      time: '15:00',
      room: 'Ghế nha thẩm mỹ',
      status: 'COMPLETED', // Đã khám xong
      cost: '1.500.000đ',
    },
  ]);

  const filteredAppointments = myAppointments.filter((apt) => {
    const matchSearch =
      apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ phòng khám xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Lịch hẹn đã xác nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Đã hoàn thành ca khám
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Welcome Bar (Đồng bộ phong cách trang Admin) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Cổng Thông Tin Bệnh Nhân • ZenBooking Dental
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chào mừng {currentUser?.fullName || 'Bệnh nhân'} trở lại!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bảng điều khiển theo dõi lịch hẹn nha khoa, hồ sơ khám và tình trạng răng miệng cá nhân.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMyAppointments([...myAppointments])}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <CalendarPlus className="w-4 h-4" />
            Đặt lịch khám mới
          </Link>
        </div>
      </div>

      {/* 4 Thống kê cá nhân (Overview Cards) - Chuẩn bố cục Grid Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Lịch khám kế tiếp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Lịch khám kế tiếp
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-extrabold text-blue-600 tracking-tight">
              09:00 - T6, 30/10
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              BS. CKI Trần Minh Tuấn
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đã xác nhận ca khám</span>
          </div>
        </div>

        {/* Card 2: Tổng số lần khám */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số lần khám
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">3</span>
            <span className="text-xs text-slate-500">lần khám nha</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Gần nhất: 15/09/2026</span>
          </div>
        </div>

        {/* Card 3: Hồ sơ & Đơn thuốc */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Đơn thuốc & Lời dặn
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1</span>
            <span className="text-xs text-slate-500">đơn thuốc lưu</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Răng miệng phục hồi tốt</span>
          </div>
        </div>

        {/* Card 4: Điểm thưởng ZenZen */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Điểm thưởng ZenZen
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">100</span>
            <span className="text-xs font-semibold text-slate-600">Điểm</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Hạng: Bệnh nhân Thân Thiết</span>
          </div>
        </div>
      </div>

      {/* Main Content: Bảng lịch hẹn cá nhân & Cột thông tin hỗ trợ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Bảng lịch hẹn của tôi (Chiếm 3 cột trên màn hình lớn) */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          {/* Table Header with Search & Filter */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lịch hẹn khám của tôi (My Appointments)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách các ca khám nha khoa bạn đã đăng ký tại hệ thống
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm dịch vụ, bác sĩ, mã lịch..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({myAppointments.length})
                </button>
                <button
                  onClick={() => setStatusFilter('CONFIRMED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'CONFIRMED' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã duyệt
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chờ duyệt
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'COMPLETED' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã khám
                </button>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Mã hẹn & Dịch vụ</th>
                  <th className="py-3 px-4">Bác sĩ phụ trách</th>
                  <th className="py-3 px-4">Thời gian khám</th>
                  <th className="py-3 px-4">Phòng / Ghế nha</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không tìm thấy lịch hẹn nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Cột 1: Dịch vụ & Mã hẹn */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                          {apt.service}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {apt.id}
                        </div>
                      </td>

                      {/* Cột 2: Bác sĩ */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm">
                          {apt.doctor}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {apt.specialty}
                        </div>
                      </td>

                      {/* Cột 3: Thời gian khám */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{apt.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {apt.date}
                        </div>
                      </td>

                      {/* Cột 4: Phòng / Ghế */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.room}</span>
                        </div>
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(apt.status)}
                      </td>

                      {/* Cột 6: Chi phí */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 font-mono">
                          {apt.cost}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Hiển thị {filteredAppointments.length} lịch khám cá nhân</span>
            <Link to="/booking" className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1">
              Đặt thêm lịch hẹn mới →
            </Link>
          </div>
        </div>

        {/* Cột phụ: Bác sĩ điều trị & Thẻ thành viên VIP (Chiếm 1 cột trên màn hình lớn) */}
        <div className="space-y-6">
          {/* Widget 1: Thẻ Thành Viên Điện Tử */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-5 rounded-2xl text-white shadow-lg shadow-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                Thẻ Bệnh Nhân Điện Tử
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-amber-300">
                VIP SILVER
              </span>
            </div>

            <div className="my-3">
              <div className="text-base font-bold tracking-tight">
                {currentUser?.fullName || 'Bệnh Nhân ZenBooking'}
              </div>
              <div className="text-xs text-blue-200 font-mono mt-0.5">
                SĐT: {currentUser?.phone || '0988...'}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
              <span>Tích lũy: <strong className="text-white">100 Điểm</strong></span>
              <span>Giảm 10% dịch vụ</span>
            </div>
          </div>

          {/* Widget 2: Bác sĩ điều trị chính */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Bác sĩ điều trị của bạn
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                MT
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">BS. CKI Trần Minh Tuấn</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Trưởng khoa Chỉnh nha & Răng khôn</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đang trực tại phòng khám
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                to="/booking"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Đặt hẹn khám với BS. Tuấn →
              </Link>
            </div>
          </div>

          {/* Widget 3: Lời dặn nha sĩ */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Lời khuyên răng miệng
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Bạn có lịch cạo vôi định kỳ vào <strong>30/10</strong>. Vui lòng ăn nhẹ trước khi đến khám và mang theo sổ khám bệnh (nếu có).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
