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
import { CompleteAppointmentModal } from '../../components/admin/CompleteAppointmentModal';

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

  // Modal Hoàn tất ca khám & Kê đơn thuốc
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState(null);
  const [completingApt, setCompletingApt] = useState(false);

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

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
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

    // Mở modal hoàn tất ca khám & kê đơn thuốc
    const handleOpenCompleteModal = (apt) => {
      setAppointmentToComplete(apt);
      setCompleteModalOpen(true);
    };

    // Xác nhận lưu bệnh án và chuyển trạng thái COMPLETED
    const handleConfirmCompletion = async (aptId, clinicalNotes) => {
      try {
        setCompletingApt(true);
        await appointmentApi.updateAppointmentStatus(aptId, { 
          status: 'COMPLETED', 
          notes: clinicalNotes 
        });
        showNotification('success', 'Đã lưu đơn thuốc & hoàn tất ca khám thành công!');
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'COMPLETED', notes: clinicalNotes } : apt))
        );
        const statsRes = await appointmentApi.getAppointmentStats();
        const statsData = statsRes?.data || statsRes;
        if (statsData) setStats(statsData);
        setCompleteModalOpen(false);
        setAppointmentToComplete(null);
      } catch (err) {
        console.error('Không thể hoàn tất ca khám:', err);
        showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất ca khám.');
      } finally {
        setCompletingApt(false);
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

    // Render badge trạng thái với độ tương phản chuẩn WCAG >= 4.5:1
    const renderStatusBadge = (status) => {
      switch (status) {
        case 'PENDING':
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#FFF1DB] text-[#9A5B00] border border-[#FFE1B3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
              Chờ xác nhận
            </span>
          );
        case 'CONFIRMED':
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#DCE7FF] text-[#1747AE] border border-[#BED2FE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D5FE0]"></span>
              Đã xác nhận
            </span>
          );
        case 'COMPLETED':
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#E2F4E8] text-[#0B6B3A] border border-[#BCE8CB]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6B3A]" />
              Đã hoàn thành
            </span>
          );
        case 'CANCELLED':
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#FCE9E9] text-[#A12626] border border-[#F7C6C6]">
              <XCircle className="w-3.5 h-3.5 text-[#A12626]" />
              Đã hủy hẹn
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-800 border border-slate-200">
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
            className={`fixed top-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 text-xs font-medium border animate-fadeIn transition-all ${feedbackMessage.type === 'success'
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

        {/* Page Title & Welcome Bar - Gọn gàng, thoáng mắt */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDoctor ? 'Hệ thống Quản lý Lâm Sàng • Dành cho Bác sĩ' : 'Quản Trị Nha Khoa ZenBooking'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isDoctor ? `Bảng Điều Khiển - ${currentUser?.fullName || 'BS. Chuyên Khoa'}` : 'Tổng quan Hoạt động Phòng khám'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Hôm nay: <span className="font-semibold text-slate-800">{getFormattedVietnameseDate()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isDoctor ? 'Đang trong ca trực' : 'Phòng khám mở cửa (08:00 - 20:00)'}</span>
            </div>
          </div>
        </div>

        {/* 4 Thẻ thống kê (Overview Cards) - Đồng bộ phẳng và kích thước */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDoctor ? (
            /* Thống kê dành cho Bác sĩ */
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Ca khám hôm nay của tôi
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.today}</span>
                  <span className="text-xs text-slate-600 font-medium">ca hôm nay</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Theo dõi lịch khám trực tiếp</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Chờ duyệt & chuẩn bị
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold tracking-tight ${stats.pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {stats.pending}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">chờ phòng khám duyệt</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold">
                  {stats.pending > 0 ? (
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>{stats.pending} ca cần xử lý</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Không có ca chờ duyệt</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Ca đã duyệt & Hoàn thành
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.confirmed + stats.completed}</span>
                  <span className="text-xs text-slate-600 font-medium">/ {stats.total} ca</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span className="text-emerald-800 font-semibold">Đã duyệt: {stats.confirmed}</span>
                  <span>•</span>
                  <span className="text-blue-800 font-semibold">Hoàn thành: {stats.completed}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Tổng lượt đăng ký khám
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</span>
                  <span className="text-xs text-slate-600 font-medium">tổng lịch hẹn</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-purple-800 font-semibold">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Đồng bộ từ hệ thống</span>
                </div>
              </div>
            </>
          ) : (
            /* Thống kê dành cho Quản trị viên (Admin) */
            <>
              {/* Card 1: Lịch hẹn hôm nay */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Lịch hẹn hôm nay
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.today}</span>
                  <span className="text-xs text-slate-600 font-medium">ca trong ngày</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-800 font-semibold">
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{dateScope === 'TODAY' ? 'Đang lọc ca hôm nay' : 'Đồng bộ thời gian thực'}</span>
                </div>
              </div>

              {/* Card 2: Chờ duyệt */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Chờ phòng khám duyệt
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold tracking-tight ${stats.pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {stats.pending}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">cần xử lý</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold">
                  {stats.pending > 0 ? (
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>{stats.pending} ca cần xử lý ngay</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Không có ca chờ duyệt</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Ca đã xác nhận & Hoàn thành */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Đã duyệt & Hoàn thành
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.confirmed + stats.completed}</span>
                  <span className="text-xs text-slate-600 font-medium">/ {stats.total} ca</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-emerald-800">Hoàn thành: {stats.completed}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-rose-700">Đã hủy: {stats.cancelled || 0}</span>
                </div>
              </div>

              {/* Card 4: Doanh thu ước tính (Đồng bộ cỡ chữ và chiều cao) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Doanh thu dự kiến
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(totalRevenue)}
                  </span>
                  <span className="text-xs font-bold text-slate-600">VNĐ</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tính trên các ca đã duyệt & hoàn thành</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content: Bảng lịch hẹn & Cột thông tin phụ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Bảng lịch hẹn thực tế (Chiếm 9/12 cột trên màn hình lớn) */}
          <div className="xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {/* Table Header with Search & Single-layer Filter */}
            <div className="p-5 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {isDoctor ? 'Danh sách bệnh nhân trong ca trực' : 'Danh sách Lịch hẹn'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                      {filteredAppointments.length} ca
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {dateScope === 'TODAY'
                      ? `Đang lọc các ca hẹn vào ngày hôm nay (${formatDateVN(todayStr)})`
                      : 'Toàn bộ ca hẹn theo thời gian thực từ cơ sở dữ liệu'}
                  </p>
                </div>

                {/* Scope date pill + Search box */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Toggle Date Scope */}
                  <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDateScope('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        dateScope === 'ALL' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({stats.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateScope('TODAY')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        dateScope === 'TODAY' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hôm nay ({stats.today})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm tên, SĐT, mã ZB-AP-..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs - Đầy đủ 5 tab và đồng nhất nhãn */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {[
                  { key: 'ALL', label: 'Tất cả', count: appointments.length },
                  { key: 'PENDING', label: 'Chờ duyệt', count: appointments.filter(a => a.status === 'PENDING').length },
                  { key: 'CONFIRMED', label: 'Đã duyệt', count: appointments.filter(a => a.status === 'CONFIRMED').length },
                  { key: 'COMPLETED', label: 'Đã hoàn thành', count: appointments.filter(a => a.status === 'COMPLETED').length },
                  { key: 'CANCELLED', label: 'Đã hủy', count: appointments.filter(a => a.status === 'CANCELLED').length },
                ].map((tab) => {
                  const isActive = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
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

            {/* Table Element - 5 cột rõ ràng, không bị tràn cột thao tác */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-5 min-w-[210px]">Bệnh nhân & Liên hệ</th>
                    <th className="py-3.5 px-4 min-w-[170px]">Dịch vụ & Bác sĩ</th>
                    <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Thời gian hẹn</th>
                    <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Trạng thái</th>
                    <th className="py-3.5 px-5 min-w-[170px] text-right whitespace-nowrap">Thao tác xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-slate-600 font-medium">Đang đồng bộ dữ liệu lịch hẹn từ Database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Calendar className="w-8 h-8 text-slate-300" />
                          <span className="font-semibold text-slate-700">Không có lịch hẹn nào phù hợp</span>
                          <span className="text-xs text-slate-500">
                            {dateScope === 'TODAY'
                              ? 'Hôm nay chưa có ca khám nào theo bộ lọc này. Chọn "Toàn bộ lịch" để xem tất cả ca khám!'
                              : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang tab lọc khác'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr
                        key={apt.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Cột 1: Bệnh nhân & Liên hệ (Gộp SĐT và Mã phiếu để giải phóng không gian) */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {apt.patientName ? apt.patientName.charAt(0) : 'BN'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                                {apt.patientName}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                                <span className="font-mono text-[11px] font-bold text-blue-600 shrink-0">
                                  {apt.appointmentCode}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-600 font-medium truncate">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  {apt.patientPhone || 'Chưa cập nhật SĐT'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Dịch vụ & Bác sĩ */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">
                            {apt.serviceName}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate max-w-[170px]">{apt.doctorName || 'Bác sĩ phân công'}</span>
                          </div>
                        </td>

                        {/* Cột 3: Giờ & Ngày hẹn */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{apt.appointmentTime}</span>
                          </div>
                          <div className="text-[12px] text-slate-600 font-medium mt-0.5">
                            {formatDateVN(apt.appointmentDate)}
                          </div>
                        </td>

                        {/* Cột 4: Trạng thái */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderStatusBadge(apt.status)}
                        </td>

                        {/* Cột 5: Thao tác xử lý trực tiếp */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {apt.status === 'PENDING' && (
                              <>
                                <button
                                  disabled={updatingId === apt.id}
                                  onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                  title="Xác nhận duyệt lịch hẹn này"
                                  className="px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300 font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  {updatingId === apt.id ? 'Đang duyệt...' : 'Duyệt ca'}
                                </button>
                                <button
                                  disabled={updatingId === apt.id}
                                  onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                                  title="Hủy lịch hẹn này"
                                  className="px-2 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 font-medium cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  Hủy ca
                                </button>
                              </>
                            )}

                            {apt.status === 'CONFIRMED' && (
                              <button
                                disabled={updatingId === apt.id}
                                onClick={() => handleOpenCompleteModal(apt)}
                                title="Hoàn tất ca khám & kê đơn thuốc cho bệnh nhân"
                                className="px-2.5 py-1 text-xs text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-300 font-semibold cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                                <span>Hoàn thành</span>
                              </button>
                            )}

                            {apt.status === 'COMPLETED' && (
                              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                Đã hoàn tất
                              </span>
                            )}

                            {apt.status === 'CANCELLED' && (
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                Đã hủy
                              </span>
                            )}

                            <Link
                              to="/admin/appointments"
                              title="Xem chi tiết tại Quản lý lịch hẹn"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors inline-block ml-1"
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
            <div className="p-4 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span>Hiển thị <strong className="text-slate-800">{filteredAppointments.length}</strong> trên tổng số <strong className="text-slate-800">{appointments.length}</strong> lịch hẹn</span>
              <Link
                to="/admin/appointments"
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>Mở trang Quản lý lịch hẹn đầy đủ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Cột phụ: Ghế nha & Phòng khám */}
          <div className="space-y-6">
            {/* Widget 1: Tình trạng Ghế nha & Phòng điều trị */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Ghế nha & Phòng khám
                </h3>
                <span className="text-xs text-emerald-700 font-semibold shrink-0 whitespace-nowrap">
                  Hoạt động
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">Ghế nha số 1 & 2</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">Khám tổng quát & Cạo vôi</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 whitespace-nowrap">
                    Sẵn sàng
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">Phòng phẫu thuật Piezotome</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">Nhổ răng khôn & Tiểu phẫu</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0 whitespace-nowrap">
                    Đang dùng
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">Máy X-Quang CT Cone Beam</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">Chụp phim 3D Panorex</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 whitespace-nowrap">
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

                      {/* Modal Hoàn Tất Ca Khám & Kê Đơn Thuốc */}
                      <CompleteAppointmentModal
                        isOpen={completeModalOpen}
                        onClose={() => {
                          setCompleteModalOpen(false);
                          setAppointmentToComplete(null);
                        }}
                        appointment={appointmentToComplete}
                        onComplete={handleConfirmCompletion}
                        isSubmitting={completingApt}
                      />
                    </div>
                    );
};

export default DashboardPage;
