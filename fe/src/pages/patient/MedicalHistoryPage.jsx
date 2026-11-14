import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  Pill, 
  Eye, 
  CalendarPlus, 
  RefreshCw,
  HeartPulse,
  Activity,
  Image as ImageIcon,
  Receipt,
  FileCheck2,
  X
} from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';
import { parseClinicalRecord } from '../../utils/clinicalHelpers';

const MedicalHistoryPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, COMPLETED, IN_PROGRESS
  
  // Modal xem chi tiết phiếu y bạ / In hóa đơn
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Modal xem ảnh X-Quang phóng to
  const [previewImage, setPreviewImage] = useState(null);

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

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getMyAppointments();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAppointments(list);
    } catch (err) {
      console.warn('Lỗi khi tải lịch sử điều trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Lọc danh sách theo từ khóa tìm kiếm và tab trạng thái
  const filteredRecords = appointments.filter((apt) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      (apt.serviceName && apt.serviceName.toLowerCase().includes(query)) ||
      (apt.doctorName && apt.doctorName.toLowerCase().includes(query)) ||
      (apt.appointmentCode && apt.appointmentCode.toLowerCase().includes(query)) ||
      (apt.notes && apt.notes.toLowerCase().includes(query));

    if (statusFilter === 'COMPLETED') {
      return matchSearch && apt.status === 'COMPLETED';
    }
    if (statusFilter === 'IN_PROGRESS') {
      return matchSearch && (apt.status === 'CONFIRMED' || apt.status === 'PENDING');
    }
    return matchSearch;
  });

  // Tìm ca khám hoàn thành gần nhất
  const lastCompletedVisit = appointments.find((a) => a.status === 'COMPLETED') || appointments[0];

  // Helper mô phỏng đơn thuốc chuyên khoa nha khoa theo loại dịch vụ
  const getPrescriptionForService = (serviceName) => {
    const s = (serviceName || '').toLowerCase();
    if (s.includes('nhổ') || s.includes('piezotome') || s.includes('implant')) {
      return [
        { name: 'Augmentin 1g (Amoxicillin/Clavulanate)', dose: '1 viên x 2 lần/ngày (sau ăn)', qty: '10 viên', usage: 'Kháng sinh chống nhiễm khuẩn' },
        { name: 'Efferalgan 500mg (Paracetamol)', dose: '1 viên khi đau (cách 4 - 6 giờ)', qty: '10 viên', usage: 'Giảm đau, hạ sốt' },
        { name: 'Nước súc miệng Chlorohexidine 0.12%', dose: 'Súc miệng nhẹ 15ml x 3 lần/ngày', qty: '1 chai', usage: 'Sát khuẩn khoang miệng' },
      ];
    }
    if (s.includes('tẩy trắng') || s.includes('laser')) {
      return [
        { name: 'Gel chống ê buốt GC Tooth Mousse', dose: 'Thoa 1 lớp mỏng trước khi ngủ', qty: '1 tuýp', usage: 'Tái khoáng hóa men răng' },
        { name: 'Kem đánh răng Sensodyne Rapid Relief', dose: 'Đánh răng 2 lần/ngày', qty: '1 tuýp', usage: 'Giảm ê buốt chân răng' },
      ];
    }
    return [
      { name: 'Nước súc miệng Flouride 0.05%', dose: 'Ngậm 10ml trong 1 phút sau đánh răng', qty: '1 chai', usage: 'Ngừa sâu răng, chắc men' },
      { name: 'Chỉ nha khoa nha khoa Oral-B Essential', dose: 'Dùng sau mỗi bữa ăn chính', qty: '1 cuộn', usage: 'Làm sạch mảng bám kẽ răng' },
    ];
  };

  // Helper dặn dò y khoa
  const getAdviceForService = (serviceName, notes) => {
    if (notes && notes.trim()) return notes;
    const s = (serviceName || '').toLowerCase();
    if (s.includes('nhổ') || s.includes('implant')) {
      return 'Cắn chặt bông gòn trong 45 phút đầu. Tuyệt đối không súc miệng mạnh hoặc dùng ống hút trong 24 giờ. Chườm lạnh má ngoài nếu thấy sưng. Tái khám sau 7 ngày để kiểm tra lành thương.';
    }
    if (s.includes('cạo vôi') || s.includes('tẩy trắng')) {
      return 'Tránh sử dụng thực phẩm quá nóng/lạnh hoặc có màu đậm (cà phê, trà, sốt cà chua, cà ri) trong 48 giờ đầu. Duy trì đánh răng lông mềm 2 lần/ngày.';
    }
    return 'Duy trì vệ sinh răng miệng đúng chuẩn nha khoa. Khám tổng quát định kỳ mỗi 6 tháng một lần để phòng ngừa sâu răng và viêm nướu sớm.';
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã hoàn thành điều trị
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock3 className="w-3.5 h-3.5 text-blue-600" />
            Đã duyệt · Chờ thăm khám
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đang chờ phòng khám duyệt
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Đã hủy hẹn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            Bệnh Án Điện Tử & Nhật Ký Nha Khoa · ZenBooking
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lịch Sử Khám & Hồ Sơ Y Bạ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bệnh nhân: <strong className="text-slate-800">{currentUser?.fullName || 'Trần Hồng Đức'}</strong> • Mã y bạ: <span className="font-mono text-blue-600 font-semibold">BN-{currentUser?.phone || '0792275635'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all duration-150"
          >
            <CalendarPlus className="w-4 h-4" />
            Đặt lịch khám mới
          </Link>
        </div>
      </div>

      {/* 2. Top Summary 4 Cards: Sức Khỏe Răng Miệng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lần khám gần nhất */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lần khám gần nhất
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-sm font-bold text-slate-900 truncate">
              {lastCompletedVisit ? lastCompletedVisit.serviceName : 'Khám tổng quát'}
            </div>
            <div className="text-xs text-blue-600 font-mono font-medium mt-0.5">
              {lastCompletedVisit ? `${lastCompletedVisit.appointmentDate}` : 'Đang cập nhật'}
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{lastCompletedVisit?.doctorName || 'Bác sĩ chuyên khoa'}</span>
          </div>
        </div>

        {/* Card 2: Khuyến nghị tái khám */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Khuyến nghị nha khoa
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-base font-bold text-emerald-700">
              6 tháng / lần
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Kiểm tra vôi răng & men răng
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nên tái khám vào tháng 04/2027</span>
          </div>
        </div>

        {/* Card 3: Hồ sơ y bạ điện tử */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hồ sơ y bạ điện tử
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {appointments.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Phiếu khám & kết quả điều trị
            </div>
          </div>
          <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bảo mật y tế điện tử</span>
          </div>
        </div>

        {/* Card 4: Nhóm máu & Tiền sử */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chỉ số sức khỏe
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Nhóm máu O+</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Bình thường</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Huyết áp: 120/80 mmHg
            </div>
          </div>
          <div className="text-xs text-slate-600">
            Tiền sử dị ứng: <strong className="text-slate-800">Không ghi nhận</strong>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo dịch vụ, bác sĩ, mã y bạ..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Đã hoàn thành ({appointments.filter(a => a.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Đang theo dõi / Đặt lịch ({appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length})
          </button>
        </div>
      </div>

      {/* 4. Treatment Timeline (Dòng thời gian y bạ điện tử) */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang nạp hồ sơ y bạ điện tử của bạn...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy hồ sơ phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm 
                ? 'Không có kết quả nào trùng khớp với từ khóa tìm kiếm của bạn.' 
                : 'Bạn chưa có hồ sơ ca khám nào trong danh mục này.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-8 ml-3 sm:ml-4">
            {filteredRecords.map((apt, index) => {
              const clinical = parseClinicalRecord(apt.notes, apt.serviceName);
              const isFinished = apt.status === 'COMPLETED';

              return (
                <div key={apt.id || index} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-xs ${
                    isFinished ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-blue-600 ring-2 ring-blue-200'
                  }`} />

                  {/* Main Record Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden">
                    {/* Header: Ngày & Dịch vụ */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {apt.serviceName ? apt.serviceName.charAt(0) : '🩺'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {apt.serviceName}
                            </h3>
                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {apt.appointmentCode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Khám lúc {apt.appointmentTime} · Ngày {apt.appointmentDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderStatusBadge(apt.status)}
                        <button
                          onClick={() => {
                            setSelectedRecord(apt);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Phiếu y bạ</span>
                        </button>
                      </div>
                    </div>

                    {/* Body: Bác sĩ, Chẩn đoán, Đơn thuốc, Cận lâm sàng */}
                    <div className="p-5 space-y-5">
                      {/* Bác sĩ & Phòng khám */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Bác sĩ thực hiện:</span>
                            <strong className="text-slate-800 text-sm font-semibold">{apt.doctorName || 'BS. Chuyên khoa ZenBooking'}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Chi phí điều trị:</span>
                            <strong className="text-emerald-700 text-sm font-bold font-mono">
                              {apt.servicePrice && Number(apt.servicePrice) > 0 
                                ? new Intl.NumberFormat('vi-VN').format(apt.servicePrice) + 'đ' 
                                : 'Miễn phí khám'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Chẩn đoán lâm sàng & Lời dặn */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Chẩn đoán lâm sàng & Thủ thuật:
                          </h4>
                          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-800 leading-relaxed font-medium">
                            {clinical.diagnosis}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Lời dặn chăm sóc & Chế độ ăn uống:
                          </h4>
                          <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs text-slate-700 leading-relaxed">
                            {clinical.advice}
                          </div>
                        </div>

                        {clinical.reExam && (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span><strong>Lịch hẹn tái khám:</strong> {clinical.reExam}</span>
                          </div>
                        )}
                      </div>

                      {/* Đơn thuốc điện tử */}
                      {clinical.prescription && clinical.prescription.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Pill className="w-4 h-4 text-purple-600" />
                            Toa thuốc điện tử chỉ định ({clinical.prescription.length} loại):
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                                  <th className="py-2.5 px-3">Tên thuốc & Hàm lượng</th>
                                  <th className="py-2.5 px-3">Số lượng</th>
                                  <th className="py-2.5 px-3">Cách dùng</th>
                                  <th className="py-2.5 px-3">Chỉ định / Ghi chú</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {clinical.prescription.map((m, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                                    <td className="py-2.5 px-3 font-mono font-medium">{m.qty}</td>
                                    <td className="py-2.5 px-3 text-blue-700 font-medium">{m.dose}</td>
                                    <td className="py-2.5 px-3 text-slate-500">{m.usage || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Tư liệu hình ảnh & Cận lâm sàng */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-cyan-600" />
                          Kết quả phim X-Quang & Tư liệu lâm sàng:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div 
                            onClick={() => setPreviewImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80')}
                            className="group/img relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img
                              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80"
                              alt="Phim X-Quang Panorex"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200 opacity-90 group-hover/img:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end p-2">
                              <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-300" /> Phim X-Quang Panorex
                              </span>
                            </div>
                          </div>

                          <div 
                            onClick={() => setPreviewImage('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80')}
                            className="group/img relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img
                              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80"
                              alt="Hình ảnh khoang miệng sau điều trị"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200 opacity-90 group-hover/img:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end p-2">
                              <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-300" /> Ảnh chụp nội soi hàm
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Chi tiết Phiếu Y Bạ & Hóa Đơn (Hỗ trợ In trực tiếp) */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white rounded-t-2xl">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 block">
                  Phòng Khám Nha Khoa Quốc Tế ZenBooking
                </span>
                <h3 className="text-base font-bold">Phiếu Khám Y Bạ & Hóa Đơn Điện Tử</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700" id="printable-record">
              {/* Thông tin phòng khám */}
              <div className="flex justify-between items-start border-b pb-3 border-slate-200">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">NHA KHOA ZENBOOKING DENTAL CLINIC</h4>
                  <p className="text-slate-500 mt-0.5">Địa chỉ: 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh</p>
                  <p className="text-slate-500">Hotline cấp cứu 24/7: 1900 8888</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-700 text-sm">{selectedRecord.appointmentCode}</div>
                  <div className="text-[11px] text-slate-400">Ngày in: {new Date().toLocaleDateString('vi-VN')}</div>
                </div>
              </div>

              {/* Thông tin bệnh nhân */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px] block">Họ và tên bệnh nhân:</span>
                  <strong className="text-slate-900 text-sm">{selectedRecord.patientName || currentUser?.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Số điện thoại liên hệ:</span>
                  <strong className="text-slate-900 text-sm font-mono">{selectedRecord.patientPhone || currentUser?.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Bác sĩ phụ trách:</span>
                  <strong className="text-slate-900">{selectedRecord.doctorName || 'BS. Chuyên khoa'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Thời gian thực hiện:</span>
                  <strong className="text-slate-900">{selectedRecord.appointmentTime} · {selectedRecord.appointmentDate}</strong>
                </div>
              </div>

              {/* Chi tiết dịch vụ */}
              <div>
                <h5 className="font-bold text-slate-800 uppercase mb-1.5">Nội dung điều trị nha khoa:</h5>
                <div className="p-3 border rounded-xl border-slate-200 flex justify-between items-center bg-white">
                  <div>
                    <div className="font-bold text-slate-900">{selectedRecord.serviceName}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Dịch vụ nha khoa công nghệ cao</div>
                  </div>
                  <div className="font-bold font-mono text-sm text-emerald-700">
                    {selectedRecord.servicePrice && Number(selectedRecord.servicePrice) > 0
                      ? new Intl.NumberFormat('vi-VN').format(selectedRecord.servicePrice) + 'đ'
                      : 'Miễn phí'}
                  </div>
                </div>
              </div>

              {/* Chẩn đoán & Thủ thuật */}
              <div>
                <h5 className="font-bold text-slate-800 uppercase mb-1">Chẩn đoán lâm sàng & Thủ thuật:</h5>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).diagnosis}
                </p>
              </div>

              {/* Đơn thuốc trong phiếu y bạ */}
              {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).prescription?.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 uppercase mb-1.5">Toa thuốc điều trị:</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Tên thuốc</th>
                          <th className="py-2 px-3">Số lượng</th>
                          <th className="py-2 px-3">Liều dùng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).prescription.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-800">{m.name}</td>
                            <td className="py-2 px-3 font-mono">{m.qty}</td>
                            <td className="py-2 px-3 text-blue-700">{m.dose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Lời dặn & Hẹn tái khám */}
              <div>
                <h5 className="font-bold text-slate-800 uppercase mb-1">Dặn dò & Hướng dẫn phục hồi:</h5>
                <p className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700 leading-relaxed">
                  {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).advice}
                </p>
                {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).reExam && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    Lịch hẹn tái khám: {parseClinicalRecord(selectedRecord.notes, selectedRecord.serviceName).reExam}
                  </div>
                )}
              </div>

              {/* Chữ ký */}
              <div className="pt-4 flex justify-between text-center border-t border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">Bệnh nhân</div>
                  <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Bác sĩ điều trị</div>
                  <div className="text-[11px] text-slate-400 italic mt-0.5">(Đã ký điện tử y bạ)</div>
                  <div className="font-bold text-blue-700 mt-2">{selectedRecord.doctorName || 'BS. ZenBooking'}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                In phiếu y bạ
              </button>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Xem ảnh Phóng To */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Phóng to tư liệu y khoa"
              className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;

