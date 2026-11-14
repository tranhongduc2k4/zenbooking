import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Search, 
  Phone, 
  ChevronRight, 
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Pill,
  FileText,
  Stethoscope,
  XCircle,
  CalendarCheck
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';

const DashboardPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateScope, setDateScope] = useState('ALL'); // 'TODAY' hoặc 'ALL'
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
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Helper tính ngày hôm nay theo giờ địa phương YYYY-MM-DD
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedVietnameseDate = () => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${dayName}, ${date}/${month}/${year}`;
  };

  const todayStr = getTodayDateString();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Không thể nạp thông tin user:', e);
    }
  }, []);

  const userRole = localStorage.getItem('user_role') || currentUser?.role;
  const isDoctor = userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR';

  const showNotification = (type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Nạp dữ liệu thực tế từ Backend Database qua API
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateScope === 'TODAY') {
        params.date = todayStr;
      }
      if (isDoctor && currentUser?.id) {
        params.doctorId = currentUser.id;
      }

      const [listRes, statsRes] = await Promise.all([
        appointmentApi.getAllAppointments(params),
        appointmentApi.getAppointmentStats()
      ]);

      const list = Array.isArray(listRes) ? listRes : (listRes?.data || []);
      setAppointments(list);

      const statsData = statsRes?.data || statsRes;
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          confirmed: statsData.confirmed || 0,
          completed: statsData.completed || 0,
          cancelled: statsData.cancelled || 0,
          today: statsData.today || 0,
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang tổng quan:', err);
      showNotification('error', 'Không thể kết nối máy chủ để tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateScope]);

  // Cập nhật trạng thái lịch hẹn trực tiếp vào Database
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await appointmentApi.updateAppointmentStatus(id, { status: newStatus });
      showNotification('success', `Cập nhật trạng thái lịch hẹn thành công.`);
      // Cập nhật state nội bộ mượt mà
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      // Tải lại thống kê
      const statsRes = await appointmentApi.getAppointmentStats();
      const statsData = statsRes?.data || statsRes;
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Không thể cập nhật trạng thái:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Tính tổng doanh thu từ các ca đã xác nhận & hoàn thành trong danh sách
  const totalRevenue = appointments
    .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (Number(a.servicePrice) || 0), 0);

  // Lọc danh sách lịch hẹn theo ô tìm kiếm và tab trạng thái
  const filteredAppointments = appointments.filter((apt) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      (apt.patientName && apt.patientName.toLowerCase().includes(query)) ||
      (apt.patientPhone && apt.patientPhone.includes(query)) ||
      (apt.appointmentCode && apt.appointmentCode.toLowerCase().includes(query)) ||
      (apt.serviceName && apt.serviceName.toLowerCase().includes(query)) ||
      (apt.doctorName && apt.doctorName.toLowerCase().includes(query));

    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Render badge trạng thái với Tailwind color styling
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedbackMessage && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 text-xs font-medium border animate-fadeIn transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-white text-emerald-800 border-emerald-200 shadow-emerald-100/50'
              : 'bg-white text-rose-800 border-rose-200 shadow-rose-100/50'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Page Title & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            {isDoctor 
              ? 'Hệ thống Quản lý Lâm Sàng Nha Khoa • Dành cho Bác sĩ' 
              : 'Hệ thống Quản trị Nha Khoa ZenBooking'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isDoctor 
              ? `Bảng Điều Khiển Bác Sĩ - ${currentUser?.fullName || 'BS. Chuyên Khoa'}` 
              : 'Tổng quan Hoạt động Phòng khám'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hôm nay: <span className="font-medium text-slate-700">{getFormattedVietnameseDate()}</span> • Dữ liệu kết nối trực tiếp từ Cơ sở dữ liệu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Nút lọc phạm vi ngày */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium border border-slate-200">
            <button
              onClick={() => setDateScope('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateScope === 'ALL' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn bộ lịch ({stats.total})
            </button>
            <button
              onClick={() => setDateScope('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateScope === 'TODAY' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay ({stats.today})
            </button>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isDoctor ? 'Đang trong ca trực' : 'Phòng khám mở cửa (08:00 - 20:00)'}
          </div>
        </div>
      </div>

      {/* 4 Thẻ thống kê (Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isDoctor ? (
          /* Thống kê dành cho Bác sĩ */
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ca khám hôm nay của tôi
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.today}</span>
                <span className="text-xs text-slate-500">ca hôm nay</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Theo dõi lịch khám trực tiếp</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Chờ duyệt & chuẩn bị
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.pending}</span>
                <span className="text-xs text-slate-500">chờ phòng khám duyệt</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Cần xác nhận lịch hẹn</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ca đã duyệt & Hoàn thành
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.confirmed + stats.completed}</span>
                <span className="text-xs text-slate-500">/ {stats.total} ca</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Hoàn thành: {stats.completed} ca</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Tổng lượt đăng ký khám
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</span>
                <span className="text-xs text-slate-500">tổng lịch hẹn</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Đồng bộ từ hệ thống</span>
              </div>
            </div>
          </>
        ) : (
          /* Thống kê dành cho Quản trị viên (Admin) */
          <>
            {/* Card 1: Lịch hẹn hôm nay */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Lịch hẹn hôm nay
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.today}</span>
                <span className="text-xs text-slate-500">cuộc hẹn trong ngày</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{dateScope === 'TODAY' ? 'Đang xem ca hôm nay' : 'Nhấn xem ca hôm nay'}</span>
              </div>
            </div>

            {/* Card 2: Chờ duyệt */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Chờ phòng khám duyệt
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{stats.pending}</span>
                <span className="text-xs text-slate-500">cần xử lý</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Bệnh nhân đang chờ phản hồi</span>
              </div>
            </div>

            {/* Card 3: Ca đã xác nhận & Hoàn thành */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Đã duyệt & Hoàn thành
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.confirmed + stats.completed}</span>
                <span className="text-xs text-slate-500">/ {stats.total} ca</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-emerald-600 font-medium">Đã duyệt: {stats.confirmed}</span>
                <span>•</span>
                <span className="text-purple-600 font-medium">Đã xong: {stats.completed}</span>
              </div>
            </div>

            {/* Card 4: Doanh thu ước tính từ các ca đã duyệt */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Doanh thu dự kiến
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {new Intl.NumberFormat('vi-VN').format(totalRevenue)}
                </span>
                <span className="text-xs font-semibold text-slate-600">VNĐ</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tính trên các ca Đã duyệt & Xong</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content: Bảng lịch hẹn & Cột thông tin phụ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Bảng lịch hẹn thực tế (Chiếm 3 cột trên màn hình lớn) */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          {/* Table Header with Search & Filter */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {isDoctor ? 'Danh sách bệnh nhân trong ca trực' : 'Danh sách Lịch hẹn (Dữ liệu thực tế)'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
                  {filteredAppointments.length} ca
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {dateScope === 'TODAY' 
                  ? `Đang lọc các ca hẹn vào ngày hôm nay (${todayStr})` 
                  : 'Hiển thị toàn bộ các ca hẹn theo thời gian thực từ cơ sở dữ liệu'}
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
                  placeholder="Tìm tên, SĐT, mã phiếu, dịch vụ..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({appointments.length})
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
                  onClick={() => setStatusFilter('CONFIRMED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'CONFIRMED' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã duyệt
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'COMPLETED' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã xong
                </button>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Bệnh nhân & Mã phiếu</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Dịch vụ & Bác sĩ</th>
                  <th className="py-3 px-4">Thời gian hẹn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Đang đồng bộ dữ liệu lịch hẹn từ Database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Calendar className="w-8 h-8 text-slate-300" />
                        <span className="font-medium text-slate-600">Không có lịch hẹn nào phù hợp</span>
                        <span className="text-xs text-slate-400">
                          {dateScope === 'TODAY' 
                            ? 'Ngày hôm nay chưa có ca khám nào. Bấm nút "Toàn bộ lịch" ở trên để xem tất cả ca khám!' 
                            : 'Hãy thử tìm kiếm với từ khóa khác'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Cột 1: Tên bệnh nhân & Mã phiếu */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {apt.patientName ? apt.patientName.charAt(0) : 'BN'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                              {apt.patientName}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                              {apt.appointmentCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: SĐT */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.patientPhone}</span>
                        </div>
                      </td>

                      {/* Cột 3: Dịch vụ & Bác sĩ phụ trách */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm">
                          {apt.serviceName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[160px]">{apt.doctorName || 'Bác sĩ bất kỳ'}</span>
                        </div>
                      </td>

                      {/* Cột 4: Giờ & Ngày hẹn */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {apt.appointmentTime}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {apt.appointmentDate}
                        </div>
                      </td>

                      {/* Cột 5: Trạng thái (Badge Tailwind) */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(apt.status)}
                      </td>

                      {/* Cột 6: Thao tác nhanh */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {apt.status === 'PENDING' && (
                            <button
                              disabled={updatingId === apt.id}
                              onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                              title="Xác nhận duyệt lịch hẹn này"
                              className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 font-medium cursor-pointer"
                            >
                              {updatingId === apt.id ? 'Đang duyệt...' : 'Duyệt ca'}
                            </button>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <button
                              disabled={updatingId === apt.id}
                              onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                              title="Hoàn tất ca khám này"
                              className="px-2.5 py-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 font-medium cursor-pointer"
                            >
                              {updatingId === apt.id ? 'Đang lưu...' : 'Hoàn thành'}
                            </button>
                          )}
                          <Link
                            to="/admin/appointments"
                            title="Xem chi tiết tại Quản lý lịch hẹn"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Hiển thị {filteredAppointments.length} trên tổng số {appointments.length} lịch hẹn</span>
            <Link 
              to="/admin/appointments"
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Mở trang Quản lý lịch hẹn đầy đủ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Cột phụ: Bác sĩ trực ca / Ghế nha (Chiếm 1 cột trên màn hình lớn) */}
        <div className="space-y-6">
          {/* Widget 1: Tình trạng Ghế nha & Phòng điều trị */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Ghế nha & Phòng khám
              </h3>
              <span className="text-xs text-emerald-600 font-medium">Hoạt động</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Ghế nha số 1 & 2</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Khám tổng quát & Cạo vôi</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Sẵn sàng
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Phòng phẫu thuật Piezotome</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Nhổ răng khôn & Tiểu phẫu</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Đang dùng
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Máy X-Quang CT Cone Beam</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Chụp phim 3D Panorex</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Sẵn sàng
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: Lưu ý quy chuẩn y tế */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-lg shadow-slate-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              Quy chuẩn vô trùng y tế
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              Khử khuẩn dụng cụ autoclave
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Mỗi ca điều trị bắt buộc sử dụng 1 bộ khay khám riêng biệt đã qua máy sấy hấp sấy vô trùng 134°C và đóng gói niêm phong.
            </p>
            <div className="text-[11px] text-cyan-300/80 border-t border-white/10 pt-3">
              Ban Kiểm Soát Nhiễm Khuẩn ZenBooking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
