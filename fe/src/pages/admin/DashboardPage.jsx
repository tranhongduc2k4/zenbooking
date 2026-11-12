import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
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
  Pill,
  FileText,
  Activity,
  Stethoscope
} from 'lucide-react';

const DashboardPage = () => {
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
      console.error('Không thể nạp thông tin user:', e);
    }
  }, []);

  const userRole = localStorage.getItem('user_role') || currentUser?.role;
  const isDoctor = userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR';

  // Dữ liệu giả định (Mock Data) lịch hẹn
  const [appointments, setAppointments] = useState([
    {
      id: 'APT-1001',
      patientName: 'Lê Thị Mai',
      patientCode: 'BN-8801',
      phone: '0987 123 456',
      service: 'Nhổ răng khôn Piezotome',
      doctor: 'BS. CKI Trần Minh Tuấn',
      time: '08:30',
      date: 'Hôm nay',
      status: 'CONFIRMED', // Đã xác nhận
      room: 'Phòng tiểu phẫu 1',
    },
    {
      id: 'APT-1002',
      patientName: 'Nguyễn Hoàng Nam',
      patientCode: 'BN-8802',
      phone: '0912 345 678',
      service: 'Cạo vôi răng siêu âm',
      doctor: 'ThS. BS Lê Hoàng Yến',
      time: '09:15',
      date: 'Hôm nay',
      status: 'PENDING', // Chờ xác nhận
      room: 'Ghế nha số 3',
    },
    {
      id: 'APT-1003',
      patientName: 'Trần Bảo Châu',
      patientCode: 'BN-8803',
      phone: '0905 888 999',
      service: 'Niềng răng mắc cài',
      doctor: 'BS. CKI Trần Minh Tuấn',
      time: '10:00',
      date: 'Hôm nay',
      status: 'IN_PROGRESS', // Đang khám
      room: 'Phòng chỉnh nha 2',
    },
    {
      id: 'APT-1004',
      patientName: 'Phạm Đức Anh',
      patientCode: 'BN-8804',
      phone: '0976 555 444',
      service: 'Cấy ghép Implant Straumann',
      doctor: 'BS. Nguyễn Văn Hùng',
      time: '11:00',
      date: 'Hôm nay',
      status: 'CONFIRMED', // Đã xác nhận
      room: 'Phòng phẫu thuật vô trùng',
    },
    {
      id: 'APT-1005',
      patientName: 'Đỗ Thu Hà',
      patientCode: 'BN-8805',
      phone: '0934 666 777',
      service: 'Tẩy trắng răng Laser',
      doctor: 'ThS. BS Lê Hoàng Yến',
      time: '14:00',
      date: 'Hôm nay',
      status: 'PENDING', // Chờ xác nhận
      room: 'Ghế nha thẩm mỹ',
    },
    {
      id: 'APT-1006',
      patientName: 'Vũ Quốc Hưng',
      patientCode: 'BN-8806',
      phone: '0948 222 111',
      service: 'Khám tổng quát định kỳ',
      doctor: 'BS. CKI Trần Minh Tuấn',
      time: '15:30',
      date: 'Hôm nay',
      status: 'COMPLETED', // Hoàn thành
      room: 'Phòng khám 1',
    },
    {
      id: 'APT-1007',
      patientName: 'Hoàng Kim Ngân',
      patientCode: 'BN-8807',
      phone: '0988 777 666',
      service: 'Dán sứ Veneer Emax',
      doctor: 'ThS. BS Lê Hoàng Yến',
      time: '16:45',
      date: 'Hôm nay',
      status: 'CONFIRMED', // Đã xác nhận
      room: 'Phòng thẩm mỹ 1',
    },
  ]);

  // Cập nhật trạng thái nhanh (Demo tương tác)
  const handleUpdateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  // Lọc danh sách lịch hẹn
  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase());
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
            Đã duyệt
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            Đang tại ghế nha
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Đã hoàn thành
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
            Hôm nay: <span className="font-medium text-slate-700">Thứ Tư, 28/10/2026</span> • Dữ liệu cập nhật theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAppointments([...appointments])}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isDoctor ? 'Đang trong ca trực khám' : 'Phòng khám mở cửa (08:00 - 20:00)'}
          </div>
        </div>
      </div>

      {/* 4 Thẻ thống kê (Overview Cards) - Tự động điều chỉnh theo Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isDoctor ? (
          /* Thống kê dành cho Bác sĩ (Tập trung chuyên môn lâm sàng, không hiển thị doanh thu) */
          <>
            {/* Card 1: Ca khám hôm nay */}
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
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">8</span>
                <span className="text-xs text-slate-500">ca đã xếp</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2 ca so với hôm qua</span>
              </div>
            </div>

            {/* Card 2: Bệnh nhân đang chờ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Bệnh nhân tại phòng chờ
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">3</span>
                <span className="text-xs text-slate-500">đang đợi khám</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Ca tiếp theo: 10:00 (Niềng răng)</span>
              </div>
            </div>

            {/* Card 3: Ca hoàn thành */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ca đã khám xong
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">5</span>
                <span className="text-xs text-slate-500">/ 8 ca</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[62%] h-full bg-emerald-500 rounded-full"></div>
                </div>
                <span>Đạt 62% ca trực</span>
              </div>
            </div>

            {/* Card 4: Đơn thuốc đã kê */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Đơn thuốc & Dặn dò
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">4</span>
                <span className="text-xs text-slate-500">đơn thuốc lưu</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Đã cập nhật bệnh án</span>
              </div>
            </div>
          </>
        ) : (
          /* Thống kê dành cho Admin (Bao gồm Doanh thu & Toàn bộ phòng khám) */
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
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">28</span>
                <span className="text-xs text-slate-500">cuộc hẹn</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% so với hôm qua</span>
              </div>
            </div>

            {/* Card 2: Bệnh nhân mới */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Bệnh nhân mới
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">14</span>
                <span className="text-xs text-slate-500">hồ sơ mới</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.5% so với tuần trước</span>
              </div>
            </div>

            {/* Card 3: Ca hoàn thành */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ca hoàn thành
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">19</span>
                <span className="text-xs text-slate-500">/ 28 ca</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[68%] h-full bg-emerald-500 rounded-full"></div>
                </div>
                <span>Đạt 68% ca khám ngày</span>
              </div>
            </div>

            {/* Card 4: Doanh thu ước tính */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Doanh thu ước tính
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">38.500.000</span>
                <span className="text-xs font-semibold text-slate-600">VNĐ</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+15.2% so với dự tính</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content: Bảng lịch hẹn & Cột thông tin phụ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Bảng lịch hẹn sắp tới (Chiếm 3 cột trên màn hình lớn) */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          {/* Table Header with Search & Filter */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isDoctor ? 'Danh sách bệnh nhân trong ngày' : 'Lịch hẹn sắp tới (Upcoming Appointments)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDoctor 
                  ? 'Theo dõi bệnh nhân chuẩn bị đến khám và thực hiện chẩn đoán lâm sàng' 
                  : 'Danh sách bệnh nhân đăng ký khám trong ngày hôm nay'}
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
                  placeholder="Tìm tên, SĐT, dịch vụ..."
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
                  onClick={() => setStatusFilter('CONFIRMED')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'CONFIRMED' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã duyệt
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === 'IN_PROGRESS' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tại ghế nha
                </button>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Bệnh nhân</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Dịch vụ & Phòng khám</th>
                  <th className="py-3 px-4">Giờ hẹn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác lâm sàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không tìm thấy lịch hẹn phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Cột 1: Tên bệnh nhân */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {apt.patientName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                              {apt.patientName}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {apt.patientCode} • Hồ sơ y bạ điện tử
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: SĐT */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.phone}</span>
                        </div>
                      </td>

                      {/* Cột 3: Dịch vụ & Phòng khám */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm">
                          {apt.service}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          {apt.room}
                        </div>
                      </td>

                      {/* Cột 4: Giờ khám */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {apt.time}
                        </div>
                      </td>

                      {/* Cột 5: Trạng thái (Badge Tailwind) */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(apt.status)}
                      </td>

                      {/* Cột 6: Thao tác nhanh */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {apt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'IN_PROGRESS')}
                              title="Bắt đầu khám tại ghế"
                              className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 font-medium"
                            >
                              Khám ngay
                            </button>
                          )}
                          {apt.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                              title="Hoàn tất ca khám"
                              className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 font-medium"
                            >
                              Hoàn thành
                            </button>
                          )}
                          <button
                            title="Xem chi tiết bệnh án"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
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
            <span>Hiển thị {filteredAppointments.length} trên tổng số {appointments.length} bệnh nhân</span>
            <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
              {isDoctor ? 'Xem lịch sử điều trị trước đây →' : 'Xem báo cáo phòng khám trong tháng →'}
            </span>
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
