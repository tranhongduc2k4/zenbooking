import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock3, 
  RefreshCw, 
  Stethoscope, 
  ChevronRight,
  Eye,
  FileText,
  CalendarCheck,
  CalendarX,
  X,
  Sparkles
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';

const AppointmentsManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, CONFIRMED, COMPLETED, CANCELLED
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Lấy vai trò user hiện tại
  const userRole = localStorage.getItem('user_role');
  const isDoctor = userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR';

  // Nạp danh sách và thống kê
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'ALL') params.status = activeTab;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [listRes, statsRes] = await Promise.all([
        appointmentApi.getAllAppointments(params),
        appointmentApi.getAppointmentStats()
      ]);

      if (listRes && listRes.data) {
        setAppointments(listRes.data);
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu lịch hẹn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const showNotification = (type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Cập nhật trạng thái lịch hẹn
  const handleUpdateStatus = async (appointmentId, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await appointmentApi.updateAppointmentStatus(appointmentId, {
        status: newStatus,
        cancellationReason: reason,
      });

      showNotification('success', `Đã chuyển lịch hẹn sang trạng thái: ${newStatus}`);
      setShowCancelModal(false);
      setShowDetailModal(false);
      setSelectedAppointment(null);
      setCancellationReason('');
      fetchData();
    } catch (err) {
      console.error('Không thể cập nhật trạng thái:', err);
      showNotification('error', 'Có lỗi xảy ra khi cập nhật lịch hẹn');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ xác nhận
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã xác nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Đã hoàn thành
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
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

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Hệ Thống Quản Lý Tiếp Nhận Bệnh Nhân
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isDoctor ? 'Lịch Khám Chuyên Khoa Của Tôi' : 'Quản Lý Lịch Hẹn Khám Nha'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, tiếp nhận, xác nhận và cập nhật tiến trình điều trị của các ca khám.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới danh sách
          </button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số lịch hẹn
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500">lượt đặt</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">Toàn hệ thống phòng khám</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Chờ tiếp nhận & duyệt
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {stats.pending}
            </span>
            <span className="text-xs text-slate-500">cần xử lý gấp</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium">Lịch hẹn từ website & app</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Lịch khám hôm nay
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-700 tracking-tight">
              {stats.today}
            </span>
            <span className="text-xs text-slate-500">ca tiếp đón</span>
          </div>
          <div className="mt-2 text-xs text-cyan-600 font-medium">Trong ngày làm việc</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Đã hoàn thành khám
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {stats.completed}
            </span>
            <span className="text-xs text-slate-500">ca điều trị</span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">Đã xuất viện & kê đơn</div>
        </div>
      </div>

      {/* Bộ Lọc & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        {/* Tabs Trạng Thái */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 border-b border-slate-100">
          {[
            { key: 'ALL', label: 'Tất cả lịch hẹn', count: stats.total },
            { key: 'PENDING', label: 'Chờ xác nhận', count: stats.pending, badgeColor: 'bg-amber-100 text-amber-800' },
            { key: 'CONFIRMED', label: 'Đã xác nhận', count: stats.confirmed, badgeColor: 'bg-emerald-100 text-emerald-800' },
            { key: 'COMPLETED', label: 'Đã hoàn thành', count: stats.completed, badgeColor: 'bg-purple-100 text-purple-800' },
            { key: 'CANCELLED', label: 'Đã hủy hẹn', count: stats.cancelled, badgeColor: 'bg-rose-100 text-rose-800' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor || 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Thanh Tìm Kiếm & Lọc Theo Ngày */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã ZB-AP-..., họ tên hoặc SĐT bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="p-2.5 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs"
                title="Xóa lọc ngày"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Bảng Danh Sách Lịch Hẹn */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4 sm:px-6">Mã phiếu</th>
                <th className="py-3.5 px-4 sm:px-6">Bệnh nhân</th>
                <th className="py-3.5 px-4 sm:px-6">Dịch vụ điều trị</th>
                <th className="py-3.5 px-4 sm:px-6">Bác sĩ phụ trách</th>
                <th className="py-3.5 px-4 sm:px-6">Thời gian hẹn</th>
                <th className="py-3.5 px-4 sm:px-6">Trạng thái</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Đang nạp danh sách lịch hẹn...</span>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <CalendarX className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700">Không tìm thấy lịch hẹn nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                    </p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã phiếu */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-blue-600">
                      {apt.appointmentCode}
                    </td>

                    {/* Bệnh nhân */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{apt.patientName}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{apt.patientPhone}</span>
                      </div>
                    </td>

                    {/* Dịch vụ & Giá */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-medium text-slate-800">{apt.serviceName}</div>
                      <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {apt.servicePrice && Number(apt.servicePrice) > 0
                          ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                          : 'Miễn phí'}
                      </div>
                    </td>

                    {/* Bác sĩ */}
                    <td className="py-4 px-4 sm:px-6 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                        <span>{apt.doctorName || 'Bác sĩ bất kỳ'}</span>
                      </div>
                    </td>

                    {/* Ngày & Giờ */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{apt.appointmentTime}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{apt.appointmentDate}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-4 sm:px-6">
                      {renderStatusBadge(apt.status)}
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Nếu đang PENDING -> nút Xác nhận */}
                        {apt.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs"
                            title="Xác nhận ca khám"
                          >
                            Xác nhận
                          </button>
                        )}

                        {/* Nếu đang CONFIRMED -> nút Đã khám xong */}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-xs"
                            title="Đánh dấu hoàn thành"
                          >
                            Hoàn thành
                          </button>
                        )}

                        {/* Nút hủy nếu chưa hủy hoặc chưa hoàn thành */}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowCancelModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hủy lịch hẹn"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi Tiết Lịch Hẹn */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  🦷
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Chi Tiết Lịch Hẹn {selectedAppointment.appointmentCode}
                  </h3>
                  <p className="text-xs text-slate-500">Thông tin ca khám nha khoa</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Họ tên bệnh nhân:</span>
                <span className="font-bold text-slate-900">{selectedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono font-medium text-slate-900">{selectedAppointment.patientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dịch vụ khám:</span>
                <span className="font-semibold text-blue-700">{selectedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bác sĩ phụ trách:</span>
                <span className="font-medium text-slate-900">{selectedAppointment.doctorName || 'Bác sĩ bất kỳ'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Thời gian khám:</span>
                <span className="font-bold text-slate-900">
                  {selectedAppointment.appointmentTime} ngày {selectedAppointment.appointmentDate}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                <div>{renderStatusBadge(selectedAppointment.status)}</div>
              </div>
              {selectedAppointment.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                  <div className="font-semibold text-slate-700 text-xs mb-1">Ghi chú triệu chứng:</div>
                  <p className="text-xs">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.cancellationReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
                  <div className="font-semibold text-rose-800 text-xs mb-1">Lý do hủy hẹn:</div>
                  <p className="text-xs">{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              {selectedAppointment.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'CONFIRMED')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                >
                  Xác nhận ca khám
                </button>
              )}
              {selectedAppointment.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition"
                >
                  Đánh dấu hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy Lịch Hẹn */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Hủy Lịch Hẹn</h3>
                <p className="text-xs text-slate-500">Mã: {selectedAppointment.appointmentCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn hủy lịch hẹn của bệnh nhân{' '}
              <strong className="text-slate-900">{selectedAppointment.patientName}</strong> không?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do hủy lịch:
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do hủy hẹn (ví dụ: Bệnh nhân bận việc đột xuất, đổi lịch sau...)"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED', cancellationReason)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Xác nhận hủy hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagementPage;
