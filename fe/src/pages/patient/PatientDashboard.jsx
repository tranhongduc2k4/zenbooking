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
  Smile,
  XCircle
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';

const PatientDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Hủy lịch hẹn
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

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

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getMyAppointments();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMyAppointments(list);
    } catch (err) {
      console.warn('Lỗi khi nạp lịch hẹn của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const showNotification = (type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      await appointmentApi.cancelMyAppointment(selectedAppointment.id, cancelReason);
      showNotification('success', `Đã hủy lịch hẹn ${selectedAppointment.appointmentCode} thành công`);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancelReason('');
      fetchMyAppointments();
    } catch (err) {
      console.error('Lỗi khi hủy lịch hẹn:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi hủy lịch hẹn');
    } finally {
      setActionLoading(false);
    }
  };

  // Lọc danh sách lịch hẹn
  const filteredAppointments = myAppointments.filter((apt) => {
    const sName = apt.serviceName || '';
    const dName = apt.doctorName || '';
    const code = apt.appointmentCode || '';
    const matchSearch =
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Tìm lịch khám kế tiếp (CONFIRMED hoặc PENDING gần nhất)
  const nextAppointment = myAppointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ phòng khám duyệt
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
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Đã hoàn thành ca khám
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Đã hủy hẹn
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
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm border animate-fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Page Title & Welcome Bar */}
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
            onClick={fetchMyAppointments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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

      {/* 4 Thống kê cá nhân (Overview Cards) */}
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
            {nextAppointment ? (
              <>
                <div className="text-lg font-extrabold text-blue-600 tracking-tight">
                  {nextAppointment.appointmentTime} - {nextAppointment.appointmentDate}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {nextAppointment.doctorName || 'Bác sĩ phụ trách'}
                </div>
              </>
            ) : (
              <>
                <div className="text-base font-bold text-slate-500">Chưa có lịch hẹn</div>
                <div className="text-xs text-slate-400 mt-0.5">Đặt lịch khám định kỳ ngay</div>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{nextAppointment ? 'Hệ thống đã tiếp nhận' : 'Phòng khám sẵn sàng tiếp đón'}</span>
          </div>
        </div>

        {/* Card 2: Tổng số lần khám */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số lịch hẹn
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {myAppointments.length}
            </span>
            <span className="text-xs text-slate-500">lượt khám nha</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Dữ liệu y bạ điện tử</span>
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
                Danh sách các ca khám nha khoa bạn đã đăng ký tại hệ thống ZenBooking
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative min-w-[200px]">
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
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Mã hẹn & Dịch vụ</th>
                  <th className="py-3 px-4">Bác sĩ phụ trách</th>
                  <th className="py-3 px-4">Thời gian khám</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Chi phí</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                      <span>Đang nạp danh sách lịch hẹn...</span>
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
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
                          {apt.serviceName}
                        </div>
                        <div className="text-[11px] text-blue-600 font-mono font-bold mt-0.5">
                          {apt.appointmentCode}
                        </div>
                      </td>

                      {/* Cột 2: Bác sĩ */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                          <span>{apt.doctorName || 'Bác sĩ bất kỳ'}</span>
                        </div>
                      </td>

                      {/* Cột 3: Thời gian khám */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{apt.appointmentTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {apt.appointmentDate}
                        </div>
                      </td>

                      {/* Cột 4: Trạng thái */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(apt.status)}
                      </td>

                      {/* Cột 5: Chi phí */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-xs sm:text-sm text-emerald-600 font-mono">
                          {apt.servicePrice && Number(apt.servicePrice) > 0
                            ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                            : 'Miễn phí'}
                        </span>
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setCancelModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition"
                          >
                            Hủy ca khám
                          </button>
                        )}
                        {apt.status === 'CANCELLED' && apt.cancellationReason && (
                          <span className="text-[11px] text-slate-400 italic">
                            Đã hủy
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Phụ: Lời khuyên bác sĩ & Hỗ trợ khẩn cấp (1 cột) */}
        <div className="space-y-6">
          {/* Card Lời khuyên */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Chăm sóc răng miệng
                </span>
                <span className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                  🦷
                </span>
              </div>
              <h3 className="font-bold text-base mb-2">
                Lời dặn từ Bác sĩ ZenBooking
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Đánh răng đúng cách 2 lần/ngày với bàn chải lông mềm và sử dụng chỉ nha khoa sau mỗi bữa ăn để bảo vệ men răng tự nhiên.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-blue-200">Kiểm tra định kỳ</span>
              <span className="font-bold">6 tháng/lần</span>
            </div>
          </div>

          {/* Hotline Hỗ trợ nhanh */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Cần hỗ trợ đổi lịch khẩn cấp?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nếu bạn có việc đột xuất không thể tới khám đúng giờ, vui lòng gọi hotline tiếp đón của phòng khám để được ưu tiên sắp xếp lại khung giờ phù hợp.
            </p>
            <div className="pt-2 flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Phone className="w-4 h-4" />
              <span>1900 8888 (24/7)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Bệnh nhân xác nhận hủy lịch hẹn */}
      {cancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hủy Ca Khám Nha Khoa</h3>
                <p className="text-xs text-slate-500">Mã phiếu hẹn: {selectedAppointment.appointmentCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn hủy ca khám <strong>{selectedAppointment.serviceName}</strong> vào ngày <strong>{selectedAppointment.appointmentDate}</strong> lúc <strong>{selectedAppointment.appointmentTime}</strong> không?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do bạn muốn hủy ca khám (Tùy chọn):
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Bận công việc đột xuất, muốn dời sang tuần sau..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
              >
                {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
