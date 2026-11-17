import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  RefreshCw, 
  Filter, 
  Stethoscope, 
  Activity, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpRight, 
  Search, 
  FileSpreadsheet, 
  Sparkles, 
  PieChart, 
  BarChart3, 
  Phone
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';
import { doctorApi } from '../../services/doctorApi';
import { dentalServiceApi } from '../../services/dentalServiceApi';

// Format tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + ' VNĐ';
};

// Chuyển YYYY-MM-DD sang DD/MM/YYYY chuẩn tiếng Việt
const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const RevenueReportPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [datePreset, setDatePreset] = useState('ALL'); // 'TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'ALL', 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL', 'COMPLETED', 'CONFIRMED', 'CANCELLED'
  const [searchTerm, setSearchTerm] = useState('');

  // Phân trang bảng chi tiết
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Tải dữ liệu từ Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, docRes, srvRes] = await Promise.all([
        appointmentApi.getAllAppointments(),
        doctorApi.getAllDoctors().catch(() => ({ data: [] })),
        dentalServiceApi.getActiveServices().catch(() => ({ data: [] }))
      ]);

      setAppointments(aptRes.data || []);
      setDoctorsList(docRes.data || []);
      setServicesList(srvRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo doanh thu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xác định khoảng ngày theo Preset
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'TODAY') {
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === 'LAST_7_DAYS') {
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'LAST_30_DAYS') {
      const past = new Date(now);
      past.setDate(now.getDate() - 29);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { start: firstDay, end: lastDay };
    }
    if (datePreset === 'CUSTOM') {
      return { start: customStartDate, end: customEndDate };
    }
    return { start: '', end: '' }; // ALL
  }, [datePreset, customStartDate, customEndDate]);

  // Lọc danh sách lịch hẹn theo các tiêu chí
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Lọc ngày
      if (dateRange.start && apt.appointmentDate < dateRange.start) return false;
      if (dateRange.end && apt.appointmentDate > dateRange.end) return false;

      // Lọc bác sĩ
      if (selectedDoctor !== 'ALL' && apt.doctorName !== selectedDoctor) return false;

      // Lọc dịch vụ
      if (selectedService !== 'ALL' && apt.serviceName !== selectedService) return false;

      // Lọc trạng thái
      if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) return false;

      // Lọc từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const pName = (apt.patientName || '').toLowerCase();
        const pPhone = (apt.patientPhone || '').toLowerCase();
        const code = (apt.appointmentCode || '').toLowerCase();
        const sName = (apt.serviceName || '').toLowerCase();
        const dName = (apt.doctorName || '').toLowerCase();
        if (!pName.includes(q) && !pPhone.includes(q) && !code.includes(q) && !sName.includes(q) && !dName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, dateRange, selectedDoctor, selectedService, selectedStatus, searchTerm]);

  // Reset trang 1 khi lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [datePreset, customStartDate, customEndDate, selectedDoctor, selectedService, selectedStatus, searchTerm]);

  // 1. Thống kê KPI tổng quan
  const kpiStats = useMemo(() => {
    let actualRevenue = 0;       // Tiền từ COMPLETED
    let projectedRevenue = 0;    // Tiền từ CONFIRMED + PENDING
    let completedCount = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    filteredAppointments.forEach((apt) => {
      const price = Number(apt.servicePrice) || 0;
      if (apt.status === 'COMPLETED') {
        actualRevenue += price;
        completedCount++;
      } else if (apt.status === 'CONFIRMED') {
        projectedRevenue += price;
        confirmedCount++;
      } else if (apt.status === 'PENDING') {
        projectedRevenue += price;
        pendingCount++;
      } else if (apt.status === 'CANCELLED') {
        cancelledCount++;
      }
    });

    const averageTicket = completedCount > 0 ? Math.round(actualRevenue / completedCount) : 0;
    const totalProcessed = completedCount + cancelledCount;
    const completionRate = totalProcessed > 0 ? Math.round((completedCount / totalProcessed) * 100) : 100;

    return {
      actualRevenue,
      projectedRevenue,
      completedCount,
      confirmedCount,
      pendingCount,
      cancelledCount,
      totalCount: filteredAppointments.length,
      averageTicket,
      completionRate
    };
  }, [filteredAppointments]);

  // 2. Phân bổ Doanh thu theo Dịch vụ (Top Services)
  const serviceBreakdown = useMemo(() => {
    const map = {};
    filteredAppointments
      .filter((a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED')
      .forEach((apt) => {
        const name = apt.serviceName || 'Dịch vụ khác';
        const price = Number(apt.servicePrice) || 0;
        if (!map[name]) {
          map[name] = { name, revenue: 0, count: 0, completed: 0 };
        }
        map[name].revenue += price;
        map[name].count += 1;
        if (apt.status === 'COMPLETED') map[name].completed += 1;
      });

    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    const totalRev = list.reduce((sum, item) => sum + item.revenue, 0) || 1;
    return list.map((item) => ({
      ...item,
      percentage: Math.round((item.revenue / totalRev) * 100)
    }));
  }, [filteredAppointments]);

  // 3. Phân bổ Doanh thu theo Bác sĩ (Doctor Performance)
  const doctorBreakdown = useMemo(() => {
    const map = {};
    filteredAppointments
      .filter((a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED')
      .forEach((apt) => {
        const name = apt.doctorName || 'Bác sĩ phân công';
        const price = Number(apt.servicePrice) || 0;
        if (!map[name]) {
          map[name] = { name, revenue: 0, count: 0, completed: 0 };
        }
        map[name].revenue += price;
        map[name].count += 1;
        if (apt.status === 'COMPLETED') map[name].completed += 1;
      });

    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    const totalRev = list.reduce((sum, item) => sum + item.revenue, 0) || 1;
    return list.map((item) => ({
      ...item,
      percentage: Math.round((item.revenue / totalRev) * 100),
      avgPerCase: item.completed > 0 ? Math.round(item.revenue / item.completed) : item.revenue
    }));
  }, [filteredAppointments]);

  // 4. Biểu đồ doanh thu theo Ngày (Trend Data)
  const trendData = useMemo(() => {
    const dateMap = {};
    filteredAppointments.forEach((apt) => {
      const d = apt.appointmentDate;
      if (!d) return;
      if (!dateMap[d]) {
        dateMap[d] = { date: d, actual: 0, projected: 0, count: 0 };
      }
      const price = Number(apt.servicePrice) || 0;
      if (apt.status === 'COMPLETED') {
        dateMap[d].actual += price;
        dateMap[d].count += 1;
      } else if (apt.status === 'CONFIRMED') {
        dateMap[d].projected += price;
        dateMap[d].count += 1;
      }
    });

    const sortedDates = Object.keys(dateMap).sort();
    const result = sortedDates.map((date) => dateMap[date]);
    const maxVal = Math.max(...result.map((r) => r.actual + r.projected), 1000000);
    return { list: result, maxVal };
  }, [filteredAppointments]);

  // 5. Phân trang dữ liệu bảng chi tiết
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Xuất file CSV báo cáo tài chính chuẩn UTF-8
  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) {
      alert('Không có dữ liệu giao dịch nào để xuất báo cáo.');
      return;
    }

    const headers = [
      'STT',
      'Mã phiếu',
      'Tên bệnh nhân',
      'Số điện thoại',
      'Dịch vụ nha khoa',
      'Bác sĩ phụ trách',
      'Ngày khám',
      'Giờ khám',
      'Số tiền (VNĐ)',
      'Trạng thái'
    ];

    const statusLabels = {
      COMPLETED: 'Đã hoàn thành',
      CONFIRMED: 'Đã xác nhận',
      PENDING: 'Chờ xác nhận',
      CANCELLED: 'Đã hủy hẹn'
    };

    const rows = filteredAppointments.map((apt, index) => [
      index + 1,
      apt.appointmentCode || '',
      `"${(apt.patientName || '').replace(/"/g, '""')}"`,
      `"${apt.patientPhone || ''}"`,
      `"${(apt.serviceName || '').replace(/"/g, '""')}"`,
      `"${(apt.doctorName || '').replace(/"/g, '""')}"`,
      apt.appointmentDate || '',
      apt.appointmentTime || '',
      apt.servicePrice || 0,
      statusLabels[apt.status] || apt.status
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ZenBooking_Bao_Cao_Doanh_Thu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // In báo cáo tài chính
  const handlePrint = () => {
    window.print();
  };

  // Render badge trạng thái chuẩn WCAG
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* 1. Header Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-xs print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Phân tích Tài chính • ZenBooking Dental</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo cáo Doanh thu & Hiệu suất Phòng khám
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Thống kê doanh thu thực tế, dòng tiền dự kiến và năng suất điều trị theo thời gian thực từ cơ sở dữ liệu.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 print:hidden">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            title="Tải lại dữ liệu mới nhất"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Tải xuống tệp Excel CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="In trang báo cáo này"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Bộ Lọc Đa Chiều (Filters Toolbar) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Thời gian:
            </span>
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'TODAY', label: 'Hôm nay' },
              { key: 'LAST_7_DAYS', label: '7 ngày qua' },
              { key: 'LAST_30_DAYS', label: '30 ngày qua' },
              { key: 'THIS_MONTH', label: 'Tháng này' },
              { key: 'CUSTOM', label: 'Tùy chọn...' }
            ].map((tab) => {
              const active = datePreset === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDatePreset(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    active 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã phiếu, bệnh nhân, dịch vụ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Hàng lọc chi tiết Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Lọc Bác sĩ */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bác sĩ phụ trách:</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            >
              <option value="ALL">Tất cả Bác sĩ ({doctorsList.length})</option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.fullName}>
                  {doc.fullName} ({doc.specialty ? doc.specialty.split('·')[0].trim() : 'Bác sĩ'})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Dịch vụ */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dịch vụ điều trị:</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            >
              <option value="ALL">Tất cả Dịch vụ ({servicesList.length})</option>
              {servicesList.map((srv) => (
                <option key={srv.id} value={srv.name}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng thái thanh toán/ca khám */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trạng thái ca khám:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            >
              <option value="ALL">Toàn bộ trạng thái</option>
              <option value="COMPLETED">Đã hoàn thành (Thực thu)</option>
              <option value="CONFIRMED">Đã duyệt (Doanh thu dự kiến)</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CANCELLED">Đã hủy hẹn</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'CUSTOM' ? (
            <div className="flex items-center gap-1.5">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Từ ngày:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full py-1 px-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đến ngày:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full py-1 px-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] w-full flex items-center justify-between">
                <span>Khớp: <strong className="text-blue-700">{filteredAppointments.length}</strong> ca</span>
                <span className="text-slate-400">/ Tổng {appointments.length} ca</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bốn Thẻ Chỉ Số Tài Chính (4 KPI Financial Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu thực tế */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Doanh thu thực thu
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(kpiStats.actualRevenue)}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{kpiStats.completedCount} ca đã hoàn tất khám</span>
            </span>
            <span className="text-slate-400 text-[11px]">Đã thanh toán</span>
          </div>
        </div>

        {/* Card 2: Doanh thu dự kiến */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Doanh thu dự kiến
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(kpiStats.projectedRevenue)}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-800 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{kpiStats.confirmedCount + kpiStats.pendingCount} ca trong lịch hẹn</span>
            </span>
            <span className="text-slate-400 text-[11px]">Chờ thăm khám</span>
          </div>
        </div>

        {/* Card 3: Giá trị trung bình/ca khám */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Giá trị TB / Ca khám
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(kpiStats.averageTicket)}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-800 font-semibold">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>Doanh số TB / lượt điều trị</span>
            </span>
            <span className="text-slate-400 text-[11px]">AOV</span>
          </div>
        </div>

        {/* Card 4: Tỷ lệ hoàn tất ca khám */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors min-h-[148px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Tỷ lệ hoàn tất khám
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {kpiStats.completionRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">hiệu quả</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-900 font-semibold">
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{kpiStats.cancelledCount} ca hủy hẹn</span>
            </span>
            <span className="text-slate-400 text-[11px]">Hủy: {100 - kpiStats.completionRate}%</span>
          </div>
        </div>
      </div>

      {/* 4. Biểu Đồ Cột Xu Hướng Doanh Thu Theo Ngày (Visual Trend Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Biểu đồ Doanh thu theo Ngày khám
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ dòng tiền theo ngày thực tế (Xanh lá: Thực thu • Xanh dương: Dự kiến)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
              <span>Đã thu</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-md bg-blue-500 inline-block"></span>
              <span>Chờ thu</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ thanh Tailwind CSS Responsive */}
        {trendData.list.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Chưa có dữ liệu doanh thu trong khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-4 border-b border-slate-200 px-2 overflow-x-auto">
              {trendData.list.map((item) => {
                const totalDay = item.actual + item.projected;
                const actualPct = Math.round((item.actual / trendData.maxVal) * 100);
                const projectedPct = Math.round((item.projected / trendData.maxVal) * 100);

                return (
                  <div
                    key={item.date}
                    className="flex-1 min-w-[48px] max-w-[72px] flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip khi hover */}
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-xl shadow-lg whitespace-nowrap -translate-x-1/2 left-1/2">
                      <div className="font-bold text-cyan-300">{formatDateVN(item.date)}</div>
                      <div>Tổng: {formatCurrency(totalDay)}</div>
                      <div className="text-[10px] text-slate-300">
                        {item.count} ca khám ({formatCurrency(item.actual)} thực thu)
                      </div>
                    </div>

                    {/* Thanh xếp chồng (Stacked Bar) */}
                    <div className="w-full flex flex-col justify-end h-full">
                      {projectedPct > 0 && (
                        <div
                          style={{ height: `${projectedPct}%` }}
                          className="w-full bg-blue-400/80 rounded-t-md hover:bg-blue-500 transition-all"
                        />
                      )}
                      {actualPct > 0 && (
                        <div
                          style={{ height: `${actualPct}%` }}
                          className={`w-full bg-emerald-500 hover:bg-emerald-600 transition-all ${
                            projectedPct === 0 ? 'rounded-t-md' : ''
                          }`}
                        />
                      )}
                      {actualPct === 0 && projectedPct === 0 && (
                        <div className="w-full h-1 bg-slate-200 rounded-t-md" />
                      )}
                    </div>

                    {/* Nhãn ngày */}
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                      {item.date ? item.date.split('-').slice(1).reverse().join('/') : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Phân Tích Chuyên Sâu 2 Cột (Dịch Vụ & Bác Sĩ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Cơ cấu Doanh thu theo Dịch vụ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              Doanh thu theo Dịch vụ Nha khoa
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {serviceBreakdown.length} dịch vụ
            </span>
          </div>

          <div className="space-y-3.5">
            {serviceBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Không có dữ liệu dịch vụ.</p>
            ) : (
              serviceBreakdown.slice(0, 6).map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[65%]">
                      <span className="w-5 h-5 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">({item.count} ca)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatCurrency(item.revenue)}</span>
                      <span className="text-[11px] text-purple-600 font-bold ml-1.5">({item.percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột 2: Hiệu suất Doanh thu Bác sĩ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Hiệu suất Doanh thu theo Bác sĩ
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {doctorBreakdown.length} bác sĩ
            </span>
          </div>

          <div className="space-y-3">
            {doctorBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Không có dữ liệu bác sĩ.</p>
            ) : (
              doctorBreakdown.slice(0, 5).map((doc, idx) => (
                <div
                  key={doc.name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {doc.name ? doc.name.charAt(0) : 'BS'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.completed} ca hoàn thành • {doc.count} tổng ca
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(doc.revenue)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      TB: {formatCurrency(doc.avgPerCase)}/ca
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Bảng Kê Chi Tiết Ca Khám & Doanh Thu (Detailed Transactions Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Table Header with Search and count */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Bảng Kê Chi Tiết Giao Dịch & Ca Điều Trị
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {filteredAppointments.length} bản ghi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách chi tiết từng ca khám, số tiền thanh toán và bác sĩ thực hiện theo bộ lọc hiện tại.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-medium shrink-0">
            Tổng cộng: <strong className="text-emerald-700 font-bold">{formatCurrency(kpiStats.actualRevenue + kpiStats.projectedRevenue)}</strong>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-5 min-w-[210px]">Mã phiếu & Bệnh nhân</th>
                <th className="py-3.5 px-4 min-w-[170px]">Dịch vụ nha khoa</th>
                <th className="py-3.5 px-4 min-w-[160px]">Bác sĩ phụ trách</th>
                <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Thời gian khám</th>
                <th className="py-3.5 px-4 min-w-[140px] text-right whitespace-nowrap">Số tiền (VNĐ)</th>
                <th className="py-3.5 px-5 min-w-[140px] text-center whitespace-nowrap">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-slate-600 font-medium">Đang tải dữ liệu báo cáo tài chính...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <DollarSign className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-700">Không tìm thấy ca điều trị phù hợp</span>
                      <span className="text-xs text-slate-500">
                        Thử thay đổi mốc thời gian hoặc từ khóa tìm kiếm.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Cột 1: Mã phiếu & Bệnh nhân */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {apt.patientName ? apt.patientName.charAt(0) : 'BN'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                            {apt.patientName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 whitespace-nowrap">
                            <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                            <a
                              href={apt.patientPhone ? `tel:${apt.patientPhone}` : undefined}
                              className="font-medium text-slate-700 hover:text-blue-600 hover:underline"
                            >
                              {apt.patientPhone || 'Chưa có SĐT'}
                            </a>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                            {apt.appointmentCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Dịch vụ */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {apt.serviceName}
                      </div>
                    </td>

                    {/* Cột 3: Bác sĩ */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[170px]">{apt.doctorName || 'Bác sĩ phân công'}</span>
                      </div>
                    </td>

                    {/* Cột 4: Thời gian */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{apt.appointmentTime}</span>
                      </div>
                      <div className="text-[12px] text-slate-600 font-medium mt-0.5">
                        {formatDateVN(apt.appointmentDate)}
                      </div>
                    </td>

                    {/* Cột 5: Số tiền */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 text-sm tabular-nums">
                        {formatCurrency(apt.servicePrice)}
                      </span>
                    </td>

                    {/* Cột 6: Trạng thái */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      {renderStatusBadge(apt.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            Hiển thị <strong className="text-slate-800">{currentItems.length}</strong> trên tổng số{' '}
            <strong className="text-slate-800">{filteredAppointments.length}</strong> giao dịch
          </span>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700 text-xs">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Trang cuối"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueReportPage;
