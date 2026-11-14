import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  AlertCircle,
  Lock
} from 'lucide-react';
import { doctorApi } from '../../services/doctorApi';

const SPECIALTY_OPTIONS = [
  'Chỉnh nha & Răng khôn · 12 năm KN',
  'Nha khoa Thẩm mỹ · 10 năm KN',
  'Cấy ghép Implant · 8 năm KN',
  'Nha khoa Tổng quát & Trám răng · 9 năm KN',
  'Nha chu & Răng trẻ em · 7 năm KN',
  'Phục hình Thẩm mỹ & Dán sứ Veneer · 11 năm KN',
  'Nha khoa Phòng ngừa & Tẩy trắng · 6 năm KN'
];

const DoctorsManagementPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Modal Thêm / Sửa bác sĩ
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null); // null = Thêm mới, object = Sửa
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    specialty: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal / Drawer Lịch trực & Ca khám của Bác sĩ
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);

  // Modal Xác nhận xóa
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState(null);

  const showNotification = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Nạp danh sách bác sĩ từ API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAllDoctors();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setDoctors(list);
    } catch (err) {
      console.error('Lỗi khi nạp danh sách bác sĩ:', err);
      showNotification('error', 'Không thể tải danh sách bác sĩ phòng khám.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Mở modal thêm bác sĩ
  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      specialty: SPECIALTY_OPTIONS[0],
      password: '123'
    });
    setShowDoctorModal(true);
  };

  // Mở modal sửa bác sĩ
  const handleOpenEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.fullName || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      specialty: doctor.specialty || SPECIALTY_OPTIONS[0],
      password: ''
    });
    setShowDoctorModal(true);
  };

  // Xử lý submit lưu bác sĩ
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.specialty.trim()) {
      showNotification('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDoctor) {
        // Cập nhật bác sĩ
        await doctorApi.updateDoctor(editingDoctor.id, formData);
        showNotification('success', `Cập nhật hồ sơ bác sĩ ${formData.fullName} thành công!`);
      } else {
        // Thêm bác sĩ mới
        await doctorApi.createDoctor(formData);
        showNotification('success', `Đã thêm bác sĩ ${formData.fullName} vào hệ thống phòng khám!`);
      }
      setShowDoctorModal(false);
      fetchDoctors();
    } catch (err) {
      console.error('Lỗi khi lưu bác sĩ:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bác sĩ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở drawer xem ca khám của bác sĩ
  const handleOpenDoctorSchedule = async (doctor) => {
    setSelectedDoctorForSchedule(doctor);
    setShowScheduleDrawer(true);
    try {
      setLoadingAppointments(true);
      const res = await doctorApi.getDoctorAppointments(doctor.id);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setDoctorAppointments(list);
    } catch (err) {
      console.error('Lỗi khi nạp ca khám của bác sĩ:', err);
      setDoctorAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Xóa bác sĩ
  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      setDeleting(true);
      await doctorApi.deleteDoctor(doctorToDelete.id);
      showNotification('success', `Đã xóa bác sĩ ${doctorToDelete.fullName} thành công!`);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      console.error('Lỗi khi xóa bác sĩ:', err);
      showNotification('error', err.response?.data?.message || 'Không thể xóa bác sĩ này.');
    } finally {
      setDeleting(false);
    }
  };

  // Lọc danh sách bác sĩ
  const filteredDoctors = doctors.filter((doc) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      (doc.fullName && doc.fullName.toLowerCase().includes(query)) ||
      (doc.phone && doc.phone.includes(query)) ||
      (doc.email && doc.email.toLowerCase().includes(query)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(query));

    if (specialtyFilter === 'ALL') return matchSearch;
    return matchSearch && doc.specialty && doc.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
  });

  // Tính tổng số ca khám của toàn bộ bác sĩ
  const totalAppointmentsCount = doctors.reduce((sum, d) => sum + (Number(d.totalAppointments) || 0), 0);
  const totalCompletedCount = doctors.reduce((sum, d) => sum + (Number(d.completedAppointments) || 0), 0);

  // Helper avatar màu sắc
  const getAvatarGradient = (id) => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-teal-600 to-emerald-600',
      'from-purple-600 to-pink-600',
      'from-cyan-600 to-blue-700',
      'from-amber-600 to-orange-600',
      'from-rose-600 to-red-600',
    ];
    return gradients[(id || 0) % gradients.length];
  };

  const getInitials = (name = '') => {
    const clean = name.replace(/^(BS\.\s*CKI\s*|ThS\.\s*BS\s*|BS\.\s*)/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 text-xs font-semibold border animate-fadeIn transition-all ${
            feedback.type === 'success'
              ? 'bg-white text-emerald-800 border-emerald-200 shadow-emerald-100/50'
              : 'bg-white text-rose-800 border-rose-200 shadow-rose-100/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Nhân sự Y tế Nha khoa ZenBooking
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đội Ngũ Bác Sĩ Chuyên Khoa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hồ sơ y bác sĩ, phân công chuyên môn và theo dõi ca khám tại phòng khám
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDoctors}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách bác sĩ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bác Sĩ Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê 4 Chỉ Số */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số bác sĩ
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {doctors.length}
            </span>
            <span className="text-xs text-slate-500">chuyên gia</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">Toàn hệ thống phòng khám</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Bác sĩ đang hoạt động
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {doctors.length}
            </span>
            <span className="text-xs text-slate-500">sẵn sàng khám</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">Đang nhận ca hẹn mới</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng ca khám phụ trách
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">
              {totalAppointmentsCount}
            </span>
            <span className="text-xs text-slate-500">lượt hẹn</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium">Phân công theo chuyên môn</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Ca điều trị hoàn thành
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {totalCompletedCount}
            </span>
            <span className="text-xs text-slate-500">ca thành công</span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Tỷ lệ: {totalAppointmentsCount > 0 ? Math.round((totalCompletedCount / totalAppointmentsCount) * 100) : 100}% hoàn tất
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ, SĐT, chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Chuyên khoa Filter & View mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSpecialtyFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                specialtyFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSpecialtyFilter('Chỉnh nha')}
              className={`px-3 py-1.5 rounded-lg transition ${
                specialtyFilter === 'Chỉnh nha' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chỉnh nha
            </button>
            <button
              onClick={() => setSpecialtyFilter('Implant')}
              className={`px-3 py-1.5 rounded-lg transition ${
                specialtyFilter === 'Implant' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Implant
            </button>
            <button
              onClick={() => setSpecialtyFilter('Thẩm mỹ')}
              className={`px-3 py-1.5 rounded-lg transition ${
                specialtyFilter === 'Thẩm mỹ' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thẩm mỹ
            </button>
          </div>

          {/* Toggle Grid / List view */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs border border-slate-200/80">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'GRID' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danh Sách Bác Sĩ */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Đang đồng bộ danh sách bác sĩ từ Database...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy bác sĩ nào</h3>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* DẠNG GRID CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header thẻ: Avatar & Huy hiệu */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                        doc.id
                      )} text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0`}
                    >
                      {getInitials(doc.fullName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors leading-tight">
                        {doc.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Đang trực khám
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">BS-{String(doc.id).padStart(3, '0')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chuyên môn điều trị */}
                <div className="mb-4 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/80 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{doc.specialty || 'Chuyên khoa Nha khoa Tổng quát'}</span>
                </div>

                {/* Thông tin liên hệ */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono font-medium text-slate-800">{doc.phone}</span>
                  </div>
                  {doc.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{doc.email}</span>
                    </div>
                  )}
                </div>

                {/* Thống kê ca khám của bác sĩ này */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Tổng ca khám:</span>
                    <strong className="text-slate-800 font-bold">{doc.totalAppointments || 0} ca</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Đã hoàn thành:</span>
                    <strong className="text-purple-700 font-bold">{doc.completedAppointments || 0} ca</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDoctorSchedule(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition cursor-pointer"
                  title="Xem lịch trực & danh sách ca khám"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lịch trực ({doc.totalAppointments || 0})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(doc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Chỉnh sửa thông tin bác sĩ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDoctorToDelete(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa bác sĩ khỏi hệ thống"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DẠNG BẢNG (TABLE VIEW) */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Bác sĩ chuyên khoa</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Chuyên môn & Kinh nghiệm</th>
                  <th className="py-3 px-4 text-center">Tổng ca khám</th>
                  <th className="py-3 px-4 text-center">Hoàn thành</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                            doc.id
                          )} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                        >
                          {getInitials(doc.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{doc.fullName}</div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Đang nhận ca</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{doc.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{doc.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {doc.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{doc.totalAppointments || 0}</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700">{doc.completedAppointments || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenDoctorSchedule(doc)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Xem lịch
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDoctorToDelete(doc)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modal Thêm / Chỉnh Sửa Bác Sĩ */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingDoctor ? 'Chỉnh Sửa Hồ Sơ Bác Sĩ' : 'Thêm Bác Sĩ Chuyên Khoa Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">Phân công nhân sự y tế tại ZenBooking</p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3.5 text-xs">
              {/* Họ và tên */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Họ và tên Bác sĩ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: BS. CKI Hoàng Minh Trí hoặc ThS. BS Lê Lan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Số điện thoại đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0988123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email phòng khám (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="VD: tri.doctor@zenbooking.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>

              {/* Chuyên môn & Kinh nghiệm */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Chuyên môn & Số năm kinh nghiệm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Chỉnh nha & Răng khôn · 10 năm KN"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs mb-1.5"
                  required
                />
                {/* Gợi ý chọn nhanh */}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {SPECIALTY_OPTIONS.slice(0, 4).map((spec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, specialty: spec })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md text-slate-600 transition"
                    >
                      {spec.split('·')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {editingDoctor ? 'Đổi mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder={editingDoctor ? '••••••••' : 'Mặc định: 123456'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingDoctor ? 'Lưu thay đổi' : 'Tạo bác sĩ'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Drawer Xem Lịch Trực & Ca Khám Của Bác Sĩ */}
      {showScheduleDrawer && selectedDoctorForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  {getInitials(selectedDoctorForSchedule.fullName)}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedDoctorForSchedule.fullName}</h3>
                  <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-2">
                    <span>{selectedDoctorForSchedule.specialty}</span>
                    <span>•</span>
                    <span>SĐT: {selectedDoctorForSchedule.phone}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleDrawer(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Danh sách ca khám phụ trách ({doctorAppointments.length})
                </span>
                <span className="text-slate-400 text-[11px]">Sắp xếp theo thời gian mới nhất</span>
              </div>

              {loadingAppointments ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Đang tải danh sách ca khám...</span>
                </div>
              ) : doctorAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Bác sĩ chưa có ca khám nào được phân công.
                </div>
              ) : (
                <div className="space-y-3">
                  {doctorAppointments.map((apt) => (
                    <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{apt.patientName}</span>
                          <span className="font-mono text-[11px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                            {apt.appointmentCode}
                          </span>
                        </div>
                        {renderStatusBadge(apt.status)}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                        <div>
                          <span className="text-slate-400 block">Dịch vụ:</span>
                          <strong className="text-slate-700">{apt.serviceName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Thời gian:</span>
                          <strong className="text-slate-700">{apt.appointmentTime} · {apt.appointmentDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">SĐT Bệnh nhân:</span>
                          <strong className="text-slate-700 font-mono">{apt.patientPhone}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowScheduleDrawer(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Xác Nhận Xóa Bác Sĩ */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-base">Xác nhận xóa bác sĩ?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa bác sĩ <strong className="text-slate-800">{doctorToDelete.fullName}</strong> khỏi hệ thống?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDoctorToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagementPage;
