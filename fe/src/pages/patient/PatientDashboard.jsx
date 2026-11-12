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
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';

// ==========================================
// 1. COMPONENT: HERO BANNER (~120px)
// ==========================================
const HeroBanner = ({ userName, onRefresh, loading }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xs p-5 sm:p-6 min-h-[110px] flex items-center">
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 right-32 w-32 h-32 rounded-full bg-cyan-400/15 blur-lg pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-100 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Cổng Thông Tin Bệnh Nhân · ZenBooking Dental</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Chào mừng {userName || 'Bệnh nhân'} trở lại! 👋
          </h1>
          <p className="text-[13px] text-blue-100 font-normal leading-relaxed">
            Theo dõi lịch khám nha khoa, hồ sơ y bạ điện tử và quyền lợi hội viên của bạn.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Làm mới dữ liệu"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold text-blue-700 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-xs transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-white"
          >
            <CalendarPlus className="w-4 h-4 text-blue-600" />
            <span>Đặt lịch khám</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENT: STAT CARD (Hàng 4 thẻ)
// ==========================================
const StatCard = ({ title, icon: Icon, iconBg, iconColor, value, unit, statusText, statusColor, statusBadge, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs animate-pulse flex flex-col justify-between min-h-[148px]">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
        </div>
        <div className="my-3">
          <div className="h-7 w-28 bg-slate-200 rounded" />
        </div>
        <div className="h-3.5 w-36 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow duration-150 flex flex-col justify-between min-h-[148px]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="my-2.5">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-[13px] font-medium text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[12px] truncate">
        {statusBadge}
        <span className={`font-medium truncate ${statusColor || 'text-slate-600'}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 3. COMPONENT: APPOINTMENTS PANEL (Rộng hơn + Phân trang 8 mục/trang)
// ==========================================
const AppointmentsPanel = ({
  appointments,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onCancelClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // 8 nội dung 1 trang theo yêu cầu

  const filterTabs = [
    { key: 'ALL', label: 'Tất cả', count: appointments.length },
    { key: 'PENDING', label: 'Chờ duyệt', count: appointments.filter(a => a.status === 'PENDING').length },
    { key: 'CONFIRMED', label: 'Đã duyệt', count: appointments.filter(a => a.status === 'CONFIRMED').length },
    { key: 'COMPLETED', label: 'Hoàn thành', count: appointments.filter(a => a.status === 'COMPLETED').length },
    { key: 'CANCELLED', label: 'Đã hủy', count: appointments.filter(a => a.status === 'CANCELLED').length },
  ];

  // Lọc theo search và status
  const filtered = appointments.filter((apt) => {
    const sName = (apt.serviceName || '').toLowerCase();
    const dName = (apt.doctorName || '').toLowerCase();
    const code = (apt.appointmentCode || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchSearch = sName.includes(query) || dName.includes(query) || code.includes(query);
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Reset về trang 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Tính toán phân trang
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Chờ phòng khám duyệt
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Đã xác nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            Đã hủy hẹn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Lịch hẹn của tôi
            </h2>
            <p className="text-[13px] text-slate-600 mt-0.5">
              Danh sách ca khám nha khoa bạn đã đặt tại hệ thống ZenBooking
            </p>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm dịch vụ, bác sĩ, mã lịch..."
              className="w-full pl-9 pr-3.5 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Tab lọc có badge đếm */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-150 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-[320px]">
        {loading ? (
          /* Skeleton Loading */
          <div className="p-5 space-y-3.5 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 animate-pulse space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-3.5 w-64 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[320px]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch hẹn nào'}
            </h3>
            <p className="text-[13px] text-slate-600 mt-1 max-w-sm leading-relaxed">
              {searchTerm
                ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.'
                : 'Bạn chưa có ca khám nha khoa nào được ghi nhận. Hãy đặt lịch hẹn để được bác sĩ thăm khám sớm nhất!'}
            </p>
            <Link
              to="/booking"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Đặt lịch khám ngay</span>
            </Link>
          </div>
        ) : (
          /* Danh sách lịch hẹn đã cắt phân trang 8 mục */
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Dịch vụ & Mã hẹn</th>
                    <th className="py-3 px-4">Bác sĩ phụ trách</th>
                    <th className="py-3 px-4">Thời gian khám</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Chi phí</th>
                    <th className="py-3 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {currentItems.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-150">
                          {apt.serviceName}
                        </div>
                        <div className="text-[11px] text-blue-600 font-mono font-bold mt-0.5">
                          {apt.appointmentCode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{apt.doctorName || 'Bác sĩ chỉ định'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{apt.appointmentTime}</span>
                        </div>
                        <div className="text-[12px] text-slate-500 mt-0.5">
                          {apt.appointmentDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {renderStatusBadge(apt.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-slate-800 font-mono">
                          {apt.servicePrice && Number(apt.servicePrice) > 0
                            ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                            : 'Miễn phí'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') ? (
                          <button
                            type="button"
                            onClick={() => onCancelClick(apt)}
                            className="px-2.5 py-1 text-[12px] font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                          >
                            Hủy ca
                          </button>
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">
                            {apt.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Đã hủy'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 flex-1">
              {currentItems.map((apt) => (
                <div key={apt.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900 text-[14px]">
                        {apt.serviceName}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono font-bold mt-0.5">
                        {apt.appointmentCode}
                      </div>
                    </div>
                    {renderStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[13px] text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{apt.appointmentTime} · {apt.appointmentDate}</span>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-800">
                      {apt.servicePrice && Number(apt.servicePrice) > 0
                        ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ'
                        : 'Miễn phí'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[12px]">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[65%]">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{apt.doctorName || 'Bác sĩ chỉ định'}</span>
                    </div>

                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                      <button
                        type="button"
                        onClick={() => onCancelClick(apt)}
                        className="px-2.5 py-1 text-[12px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Hủy ca
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Thanh điều khiển phân trang (8 mục/trang) */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                <div className="text-[12px] text-slate-500">
                  Hiển thị <strong className="text-slate-800 font-semibold">{startIndex + 1}</strong> - <strong className="text-slate-800 font-semibold">{endIndex}</strong> trong tổng số <strong className="text-slate-800 font-semibold">{totalItems}</strong> lịch hẹn
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Danh sách các số trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENT: DOCTOR TIP CARD (Cột phải)
// ==========================================
const DoctorTipCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border-b border-blue-100/70 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
            🦷
          </div>
          <div>
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              Chăm sóc răng miệng
            </p>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Lời dặn từ Bác sĩ ZenBooking
            </h3>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-[13px] text-slate-600 leading-relaxed">
          Đánh răng đúng cách <strong className="text-slate-900 font-semibold">2 lần mỗi ngày</strong> bằng bàn chải lông mềm và kết hợp chỉ nha khoa sau bữa ăn giúp ngừa sâu răng và bảo vệ men răng tự nhiên tốt nhất.
        </p>

        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-[12px] border border-slate-100">
          <span className="text-slate-600 font-medium">Khám răng định kỳ</span>
          <span className="font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-lg">
            6 tháng / lần
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. COMPONENT: EMERGENCY CARD (Cột phải)
// ==========================================
const EmergencyCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-3.5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <h3 className="text-sm font-bold text-slate-900">
            Cần hỗ trợ khẩn cấp?
          </h3>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed">
          Nếu bạn gặp sự cố nha khoa đột xuất (ê buốt dữ dội, chấn thương răng), vui lòng gọi hotline để được tiếp nhận ưu tiên ngay:
        </p>
      </div>

      <a
        href="tel:19008888"
        className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100/80 active:bg-blue-100 border border-blue-100 rounded-xl transition-all duration-150 group cursor-pointer"
      >
        <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-150">
          <Phone className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-blue-700 tracking-wide">
            1900 8888
          </div>
          <div className="text-[11px] text-blue-600 font-medium">
            Tổng đài cấp cứu nha khoa 24/7 · Miễn phí
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
      </a>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT: PATIENT DASHBOARD
// ==========================================
const PatientDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal hủy ca khám
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
      console.error('Không thể đọc thông tin người dùng:', e);
    }
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getMyAppointments();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMyAppointments(list);
    } catch (err) {
      console.warn('Lỗi khi tải danh sách lịch khám:', err);
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
      showNotification('success', `Đã hủy lịch hẹn ${selectedAppointment.appointmentCode} thành công.`);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancelReason('');
      fetchMyAppointments();
    } catch (err) {
      console.error('Lỗi khi hủy lịch hẹn:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi hủy lịch khám.');
    } finally {
      setActionLoading(false);
    }
  };

  // Tìm ca khám sắp tới gần nhất (CONFIRMED hoặc PENDING)
  const nextAppointment = myAppointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Toast Alert */}
      {feedbackMessage && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 text-[13px] border animate-fadeIn transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-white text-emerald-800 border-emerald-200 shadow-emerald-100/50'
              : 'bg-white text-rose-800 border-rose-200 shadow-rose-100/50'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span className="font-medium leading-snug">{feedbackMessage.text}</span>
        </div>
      )}

      {/* 1. Hero Banner (~120px) */}
      <HeroBanner
        userName={currentUser?.fullName}
        onRefresh={fetchMyAppointments}
        loading={loading}
      />

      {/* 2. Hàng thống kê 4 thẻ bằng nhau (Grid 4 cột, gap 16px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Lịch khám kế tiếp */}
        <StatCard
          loading={loading}
          title="Lịch khám kế tiếp"
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          value={nextAppointment ? nextAppointment.appointmentTime : 'Chưa có hẹn'}
          unit={nextAppointment ? `· ${nextAppointment.appointmentDate}` : ''}
          statusText={nextAppointment ? 'Hệ thống đã tiếp nhận' : 'Phòng khám sẵn sàng tiếp đón'}
          statusColor={nextAppointment ? 'text-emerald-700' : 'text-slate-600'}
          statusBadge={
            <span className={`w-2 h-2 rounded-full ${nextAppointment ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse shrink-0`} />
          }
        />

        {/* Thẻ 2: Tổng số lượt khám */}
        <StatCard
          loading={loading}
          title="Tổng lịch khám"
          icon={TrendingUp}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          value={myAppointments.length}
          unit="lượt khám"
          statusText="Tổng số lượt khám đã ghi nhận"
          statusColor="text-slate-600"
          statusBadge={
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          }
        />

        {/* Thẻ 3: Đơn thuốc đang dùng */}
        <StatCard
          loading={loading}
          title="Đơn thuốc lưu"
          icon={Pill}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          value={myAppointments.length > 0 ? 1 : 0}
          unit="đơn đang dùng"
          statusText="Theo dõi liều lượng chuẩn y khoa"
          statusColor="text-slate-600"
          statusBadge={
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          }
        />

        {/* Thẻ 4: Điểm thưởng ZenZen */}
        <StatCard
          loading={loading}
          title="Điểm thưởng ZenZen"
          icon={Sparkles}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          value={100}
          unit="Điểm tích lũy"
          statusText="Hạng: Bệnh nhân Thân Thiết"
          statusColor="text-amber-700 font-semibold"
          statusBadge={
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          }
        />
      </div>

      {/* 3. Khu nội dung chính: Mở rộng cột lịch hẹn (9 Cols / 3 Cols trên xl) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Cột trái mở rộng: 8 cols trên lg, 9 cols trên xl */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <AppointmentsPanel
            appointments={myAppointments}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onCancelClick={(apt) => {
              setSelectedAppointment(apt);
              setCancelModalOpen(true);
            }}
          />
        </div>

        {/* Cột phải: 4 cols trên lg, 3 cols trên xl */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-4">
          <DoctorTipCard />
          <EmergencyCard />
        </div>
      </div>

      {/* Modal Hủy lịch hẹn */}
      {cancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hủy Ca Khám Nha Khoa</h3>
                <p className="text-[12px] text-slate-500">
                  Mã phiếu: <span className="font-mono font-bold text-blue-600">{selectedAppointment.appointmentCode}</span>
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              <div className="bg-slate-50 rounded-xl p-3 text-slate-700 leading-relaxed border border-slate-100">
                Bạn có chắc chắn muốn hủy ca khám <strong>{selectedAppointment.serviceName}</strong> vào ngày{' '}
                <strong>{selectedAppointment.appointmentDate}</strong> lúc <strong>{selectedAppointment.appointmentTime}</strong>?
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Lý do hủy (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Bận việc đột xuất, dời sang tuần sau..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 text-[13px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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
