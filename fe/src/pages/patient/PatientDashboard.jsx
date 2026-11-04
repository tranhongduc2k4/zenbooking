import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  Phone, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  CalendarPlus,
  Pill,
  Award,
  Stethoscope,
  XCircle,
  TrendingUp,
  ArrowRight,
  ChevronRight
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
      if (stored) setCurrentUser(JSON.parse(stored));
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

  useEffect(() => { fetchMyAppointments(); }, []);

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
    const matchSearch =
      (apt.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.appointmentCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Tìm lịch khám kế tiếp
  const nextAppointment = myAppointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );

  // Thống kê theo trạng thái
  const countByStatus = (status) => myAppointments.filter(a => a.status === status).length;

  const renderStatusBadge = (status) => {
    const configs = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500 animate-pulse', label: 'Chờ duyệt' },
      CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Đã xác nhận' },
      COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Hoàn thành', icon: CheckCircle2 },
      CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', label: 'Đã hủy', icon: XCircle },
    };
    const cfg = configs[status] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: status };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {Icon 
          ? <Icon className="w-3 h-3 shrink-0" />
          : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        }
        <span className="truncate">{cfg.label}</span>
      </span>
    );
  };

  const filterTabs = [
    { key: 'ALL', label: 'Tất cả', count: myAppointments.length },
    { key: 'PENDING', label: 'Chờ duyệt', count: countByStatus('PENDING') },
    { key: 'CONFIRMED', label: 'Đã duyệt', count: countByStatus('CONFIRMED') },
    { key: 'COMPLETED', label: 'Hoàn thành', count: countByStatus('COMPLETED') },
    { key: 'CANCELLED', label: 'Đã hủy', count: countByStatus('CANCELLED') },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm sm:w-full z-50 p-4 rounded-2xl shadow-xl flex items-start gap-3 text-sm border animate-pulse ${
          feedbackMessage.type === 'success'
            ? 'bg-white text-emerald-800 border-emerald-200 shadow-emerald-100'
            : 'bg-white text-rose-800 border-rose-200 shadow-rose-100'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span className="font-medium leading-snug">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden shadow-sm">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cổng Thông Tin Bệnh Nhân · ZenBooking Dental
            </p>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
              Chào mừng {currentUser?.fullName || 'Bệnh nhân'} 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Theo dõi lịch hẹn, hồ sơ và tình trạng sức khỏe răng miệng của bạn.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button 
              onClick={fetchMyAppointments}
              disabled={loading}
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-100 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <Link
              to="/booking"
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarPlus className="w-4 h-4" />
              Đặt lịch khám
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Lịch khám kế tiếp */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Lịch kế tiếp</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
            </div>
          </div>
          {nextAppointment ? (
            <>
              <div className="text-base sm:text-lg font-bold text-blue-600 leading-tight">
                {nextAppointment.appointmentTime}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium truncate">{nextAppointment.appointmentDate}</div>
              <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">Đã tiếp nhận</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-slate-700 mt-1">Chưa có lịch hẹn</div>
              <div className="text-xs text-slate-400 mt-0.5 truncate">Đặt lịch định kỳ ngay</div>
              <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="truncate">Phòng khám sẵn sàng</span>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Tổng số */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng lịch</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{myAppointments.length}</span>
            <span className="text-xs text-slate-400 font-medium">lần</span>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-slate-400 truncate">Hồ sơ y bạ số</div>
        </div>

        {/* Card 3: Đơn thuốc */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Đơn thuốc</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">1</span>
            <span className="text-xs text-slate-400 font-medium">đơn</span>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 font-medium truncate">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Phục hồi tốt</span>
          </div>
        </div>

        {/* Card 4: Điểm thưởng */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">ZenZen Points</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">100</span>
            <span className="text-xs text-slate-400 font-medium">điểm</span>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-amber-600 font-semibold truncate">
            <Award className="w-3 h-3 shrink-0" />
            <span className="truncate">Khách thân thiết</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Bảng lịch hẹn - 2/3 width */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Lịch hẹn của tôi</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {myAppointments.length} lịch hẹn được ghi nhận tại ZenBooking
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo dịch vụ, bác sĩ..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    statusFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Body & Mobile List */}
          <div>
            {loading ? (
              <div className="py-12 sm:py-16 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-12 sm:py-16 text-center px-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Không tìm thấy lịch hẹn nào</p>
                <p className="text-xs text-slate-400 mt-1">Hãy đặt lịch khám hoặc thử lọc lại</p>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Đặt lịch ngay
                </Link>
              </div>
            ) : (
              <>
                {/* 1. Mobile Cards View (< sm screens) */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {apt.serviceName}
                          </div>
                          <div className="text-[11px] text-blue-600 font-mono font-bold mt-0.5">
                            {apt.appointmentCode}
                          </div>
                        </div>
                        {renderStatusBadge(apt.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-slate-800">{apt.appointmentTime}</span>
                          <span className="text-slate-400">· {apt.appointmentDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 font-mono">
                            {apt.servicePrice && Number(apt.servicePrice) > 0
                              ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                              : 'Miễn phí'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-[65%]">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{apt.doctorName || 'Bác sĩ bất kỳ'}</span>
                        </div>

                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                          <button
                            onClick={() => { setSelectedAppointment(apt); setCancelModalOpen(true); }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                          >
                            Hủy ca
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Desktop & Tablet Table View (>= sm screens) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-3 px-4 sm:px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dịch vụ & Mã hẹn</th>
                        <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bác sĩ</th>
                        <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thời gian</th>
                        <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                        <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Chi phí</th>
                        <th className="py-3 px-4 sm:px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3.5 px-4 sm:px-5">
                            <div className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                              {apt.serviceName}
                            </div>
                            <div className="text-[11px] text-blue-500 font-mono font-bold mt-0.5">
                              {apt.appointmentCode}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[120px]">{apt.doctorName || 'Bác sĩ bất kỳ'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                              {apt.appointmentTime}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{apt.appointmentDate}</div>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4">
                            {renderStatusBadge(apt.status)}
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 text-right">
                            <span className="text-xs font-bold text-slate-700 font-mono">
                              {apt.servicePrice && Number(apt.servicePrice) > 0
                                ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                                : 'Miễn phí'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 text-right">
                            {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                              <button
                                onClick={() => { setSelectedAppointment(apt); setCancelModalOpen(true); }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-lg transition-all"
                              >
                                Hủy ca
                              </button>
                            )}
                            {apt.status === 'COMPLETED' && (
                              <span className="text-[11px] text-slate-400 italic">Đã khám</span>
                            )}
                            {apt.status === 'CANCELLED' && (
                              <span className="text-[11px] text-slate-400 italic">Đã hủy</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cột phụ - 1/3 width */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* Lịch khám kế tiếp - Card chi tiết */}
          {nextAppointment ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden shadow-sm">
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Lịch hẹn kế tiếp</span>
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold mb-1">{nextAppointment.appointmentTime}</div>
                <div className="text-blue-200 text-sm font-medium mb-3">{nextAppointment.appointmentDate}</div>
                <div className="bg-white/10 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Dịch vụ:</span>
                    <span className="font-semibold text-right max-w-[55%] truncate">{nextAppointment.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Bác sĩ:</span>
                    <span className="font-semibold truncate">{nextAppointment.doctorName || 'Bác sĩ bất kỳ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Trạng thái:</span>
                    <span className="font-semibold">
                      {nextAppointment.status === 'CONFIRMED' ? '✅ Đã xác nhận' : '⏳ Chờ duyệt'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-dashed border-blue-200 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CalendarPlus className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Chưa có lịch khám</p>
              <p className="text-xs text-slate-400 mb-4">Đặt lịch định kỳ để bảo vệ sức khỏe răng miệng</p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Đặt lịch ngay
              </Link>
            </div>
          )}

          {/* Lời khuyên bác sĩ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Chăm sóc răng miệng</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Lời dặn từ bác sĩ</p>
              </div>
              <span className="text-2xl">🦷</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Đánh răng đúng cách <strong className="text-slate-800">2 lần/ngày</strong> với bàn chải lông mềm và sử dụng chỉ nha khoa sau mỗi bữa ăn để bảo vệ men răng tự nhiên.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Kiểm tra định kỳ</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">6 tháng/lần</span>
              </div>
            </div>
          </div>

          {/* Hotline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5">Cần hỗ trợ khẩn cấp?</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Liên hệ hotline để được ưu tiên sắp xếp lại lịch khám hoặc hỗ trợ y tế nha khoa 24/7.
            </p>
            <a
              href="tel:19008888"
              className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-blue-700">1900 8888</div>
                <div className="text-[11px] text-blue-500 truncate">Hotline 24/7 · Miễn phí</div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Modal Hủy lịch hẹn */}
      {cancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-rose-50 border-b border-rose-100 px-5 sm:px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hủy Ca Khám Nha Khoa</h3>
                <p className="text-xs text-slate-500">Mã hẹn: <span className="font-mono font-bold text-blue-600">{selectedAppointment.appointmentCode}</span></p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-5 sm:px-6 py-4 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                Bạn có chắc muốn hủy ca khám <strong className="text-slate-900">{selectedAppointment.serviceName}</strong> vào ngày{' '}
                <strong className="text-slate-900">{selectedAppointment.appointmentDate}</strong> lúc{' '}
                <strong className="text-slate-900">{selectedAppointment.appointmentTime}</strong>?
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lý do hủy (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Bận công việc đột xuất, muốn dời sang tuần sau..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 resize-none transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setCancelModalOpen(false); setCancelReason(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-rose-500/20"
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
