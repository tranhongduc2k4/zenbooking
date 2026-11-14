import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Eye, 
  Printer, 
  RefreshCw, 
  Plus, 
  ChevronRight, 
  X, 
  Pill, 
  Image as ImageIcon,
  Sparkles,
  Award,
  CalendarPlus,
  Receipt,
  Edit3,
  Save,
  Droplet,
  HeartPulse
} from 'lucide-react';
import { patientApi } from '../../services/patientApi';
import { parseClinicalRecord } from '../../utils/clinicalHelpers';

const PatientsManagementPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modal / Drawer chi tiết hồ sơ bệnh nhân
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('HISTORY'); // 'HISTORY', 'NOTES', 'XRAY'

  // Modal phóng to ảnh X-Quang
  const [previewImage, setPreviewImage] = useState(null);

  // Chỉnh sửa chỉ số y tế (Nhóm máu & Tiền sử dị ứng)
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [editBloodType, setEditBloodType] = useState('O+');
  const [editAllergies, setEditAllergies] = useState('Không ghi nhận');
  const [savingMedical, setSavingMedical] = useState(false);
  const [medicalFeedback, setMedicalFeedback] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getAllPatients();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setPatients(list);
    } catch (err) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Mở hồ sơ bệnh án chi tiết
  const handleOpenPatientRecord = async (patient) => {
    setSelectedPatient(patient);
    setEditBloodType(patient.bloodType || 'O+');
    setEditAllergies(patient.allergies || 'Không ghi nhận');
    setIsEditingMedical(false);
    setShowDrawer(true);
    setActiveTab('HISTORY');
    try {
      setLoadingHistory(true);
      const res = await patientApi.getPatientHistory(patient.phone);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setPatientHistory(list);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử ca khám của bệnh nhân:', err);
      setPatientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cập nhật chỉ số y tế của bệnh nhân vào Database
  const handleSaveMedicalProfile = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPatient) return;
    try {
      setSavingMedical(true);
      await patientApi.updateMedicalProfile(selectedPatient.phone, {
        bloodType: editBloodType,
        allergies: editAllergies
      });
      // Cập nhật state selectedPatient
      setSelectedPatient(prev => ({
        ...prev,
        bloodType: editBloodType,
        allergies: editAllergies
      }));
      // Cập nhật danh sách bệnh nhân ngoài bảng
      setPatients(prev => prev.map(p => 
        p.phone === selectedPatient.phone 
          ? { ...p, bloodType: editBloodType, allergies: editAllergies }
          : p
      ));
      setIsEditingMedical(false);
      setMedicalFeedback({ type: 'success', text: 'Cập nhật chỉ số y tế thành công!' });
      setTimeout(() => setMedicalFeedback(null), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật chỉ số y tế:', err);
      setMedicalFeedback({ type: 'error', text: 'Không thể cập nhật chỉ số y tế.' });
      setTimeout(() => setMedicalFeedback(null), 3000);
    } finally {
      setSavingMedical(false);
    }
  };

  // Lọc bệnh nhân theo từ khóa và phân loại
  const filteredPatients = patients.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      (p.fullName && p.fullName.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.patientCode && p.patientCode.toLowerCase().includes(query));

    if (tierFilter === 'VIP') {
      return matchSearch && (p.membershipTier?.includes('VIP') || p.membershipTier?.includes('thân thiết'));
    }
    if (tierFilter === 'NEW') {
      return matchSearch && p.membershipTier?.includes('mới');
    }
    if (tierFilter === 'COMPLETED') {
      return matchSearch && p.completedVisits > 0;
    }
    return matchSearch;
  });

  // Helper mô phỏng đơn thuốc chuyên khoa nha khoa
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
        { name: 'Gel chống ê buốt GC Tooth Mousse', dose: 'Thoa 1 lớp mỏng trước khi ngủ', qty: '1 tuýp', usage: 'Tái khoáng men răng' },
        { name: 'Kem đánh răng Sensodyne Rapid Relief', dose: 'Đánh răng 2 lần/ngày', qty: '1 tuýp', usage: 'Giảm ê buốt' },
      ];
    }
    return [
      { name: 'Nước súc miệng Flouride 0.05%', dose: 'Ngậm 10ml trong 1 phút sau đánh răng', qty: '1 chai', usage: 'Ngừa sâu răng' },
      { name: 'Chỉ nha khoa nha khoa Oral-B Essential', dose: 'Dùng sau mỗi bữa ăn chính', qty: '1 cuộn', usage: 'Vệ sinh kẽ răng' },
    ];
  };

  const renderTierBadge = (tier) => {
    if (tier?.includes('VIP')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Award className="w-3.5 h-3.5 text-purple-600" />
          Hội viên VIP
        </span>
      );
    }
    if (tier?.includes('thân thiết')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Bệnh nhân thân thiết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Bệnh nhân mới
      </span>
    );
  };

  const totalCompletedVisits = patients.reduce((acc, p) => acc + (p.completedVisits || 0), 0);
  const totalAllVisits = patients.reduce((acc, p) => acc + (p.totalVisits || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Hồ Sơ Y Bạ & Quản Lý Bệnh Nhân · ZenBooking Dental
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Hồ Sơ Bệnh Nhân
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu tiền sử bệnh án, lịch sử điều trị nha khoa, đơn thuốc và kết quả cận lâm sàng của từng bệnh nhân.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchPatients}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới danh sách
          </button>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all duration-150"
          >
            <CalendarPlus className="w-4 h-4" />
            Tạo ca khám mới
          </Link>
        </div>
      </div>

      {/* 2. Bốn Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng số bệnh nhân */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng số bệnh nhân
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{patients.length}</span>
            <span className="text-xs text-slate-500">hồ sơ đã lưu</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đồng bộ từ hệ thống đặt khám</span>
          </div>
        </div>

        {/* Card 2: Bệnh nhân thân thiết & VIP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Thân thiết & VIP
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {patients.filter((p) => p.membershipTier?.includes('VIP') || p.membershipTier?.includes('thân thiết')).length}
            </span>
            <span className="text-xs text-slate-500">hội viên tích cực</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tái khám từ 2 lần trở lên</span>
          </div>
        </div>

        {/* Card 3: Ca điều trị hoàn tất */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Ca điều trị hoàn thành
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCompletedVisits}</span>
            <span className="text-xs text-slate-500">/ {totalAllVisits} lượt</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đã ghi nhận bệnh án hoàn tất</span>
          </div>
        </div>

        {/* Card 4: Bệnh nhân mới */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Bệnh nhân mới
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {patients.filter((p) => p.membershipTier?.includes('mới')).length}
            </span>
            <span className="text-xs text-slate-500">hồ sơ mới mở</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Tiếp nhận qua cổng trực tuyến</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã bệnh nhân..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTierFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tierFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Tất cả ({patients.length})
          </button>
          <button
            onClick={() => setTierFilter('VIP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tierFilter === 'VIP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Thân thiết / VIP
          </button>
          <button
            onClick={() => setTierFilter('NEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tierFilter === 'NEW'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Bệnh nhân mới
          </button>
          <button
            onClick={() => setTierFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tierFilter === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Đã xong điều trị
          </button>
        </div>
      </div>

      {/* 4. Master Patient Table (Bảng danh bạ bệnh nhân) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Bệnh nhân & Mã y bạ</th>
                <th className="py-3 px-4">Số điện thoại / Email</th>
                <th className="py-3 px-4">Tổng số ca khám</th>
                <th className="py-3 px-4">Lần khám gần nhất</th>
                <th className="py-3 px-4">Phân loại hội viên</th>
                <th className="py-3 px-4 text-right">Thao tác hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Đang nạp hồ sơ bệnh nhân từ cơ sở dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="font-medium text-slate-600">Không tìm thấy bệnh nhân nào</span>
                      <span className="text-xs text-slate-400">Thử tìm kiếm với tên hoặc số điện thoại khác</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, idx) => (
                  <tr 
                    key={p.phone || idx} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Cột 1: Tên & Mã y bạ */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {p.fullName ? p.fullName.charAt(0) : 'BN'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {p.fullName}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                            {p.patientCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: SĐT & Email */}
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                      {p.email && (
                        <div className="text-slate-400 text-[11px] mt-0.5 truncate max-w-[180px]">
                          {p.email}
                        </div>
                      )}
                    </td>

                    {/* Cột 3: Tổng ca khám */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">
                        {p.totalVisits} lượt khám
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{p.completedVisits} ca hoàn tất</span>
                      </div>
                    </td>

                    {/* Cột 4: Lần khám gần nhất */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 text-xs">
                        {p.lastServiceName || 'Khám tổng quát'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{p.lastVisitDate ? String(p.lastVisitDate) : 'Chưa xếp lịch'}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px] text-blue-600 font-medium">{p.lastDoctorName}</span>
                      </div>
                    </td>

                    {/* Cột 5: Phân loại */}
                    <td className="py-3.5 px-4">
                      {renderTierBadge(p.membershipTier)}
                    </td>

                    {/* Cột 6: Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenPatientRecord(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem bệnh án</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Hiển thị {filteredPatients.length} trên tổng số {patients.length} bệnh nhân</span>
          <span className="text-[11px] text-slate-400">ZenBooking Medical Electronic Health Record (EHR) System</span>
        </div>
      </div>

      {/* 5. Modal / Drawer Chi Tiết Bệnh Án Của Bệnh Nhân */}
      {showDrawer && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  {selectedPatient.fullName ? selectedPatient.fullName.charAt(0) : 'BN'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedPatient.fullName}</h3>
                    <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">
                      {selectedPatient.patientCode}
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-2">
                    <span>SĐT: {selectedPatient.phone}</span>
                    <span>•</span>
                    <span>{selectedPatient.membershipTier}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông báo cập nhật y bạ thành công */}
            {medicalFeedback && (
              <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between ${
                medicalFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
              }`}>
                <span>{medicalFeedback.text}</span>
              </div>
            )}

            {/* Thông tin y tế nhanh & Chỉnh sửa hồ sơ bệnh nhân */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {isEditingMedical ? (
                <form onSubmit={handleSaveMedicalProfile} className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      Chỉnh sửa chỉ số sức khỏe của bệnh nhân
                    </span>
                    <span className="text-[11px] text-slate-400">Dữ liệu được lưu vĩnh viễn vào hồ sơ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-rose-500" />
                        Nhóm máu:
                      </label>
                      <select
                        value={editBloodType}
                        onChange={(e) => setEditBloodType(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="O+">O+ (Phổ biến)</option>
                        <option value="O-">O- (Hiếm)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB- (Rất hiếm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Tiền sử dị ứng & Cảnh báo:
                      </label>
                      <input
                        type="text"
                        value={editAllergies}
                        onChange={(e) => setEditAllergies(e.target.value)}
                        placeholder="VD: Dị ứng Penicillin, Paracetamol, Aspirin..."
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingMedical(false)}
                      disabled={savingMedical}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingMedical}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingMedical ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu chỉ số y bạ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Nhóm máu:</span>
                    <strong className="text-rose-700 font-bold flex items-center gap-1 mt-0.5">
                      <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      {selectedPatient.bloodType || 'O+'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tiền sử dị ứng:</span>
                    <strong className="text-amber-800 font-semibold block mt-0.5 truncate" title={selectedPatient.allergies}>
                      {selectedPatient.allergies || 'Không ghi nhận'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tổng số lần khám:</span>
                    <strong className="text-blue-700 font-bold block mt-0.5">{selectedPatient.totalVisits} lần ({selectedPatient.completedVisits} xong)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Lần gần nhất:</span>
                      <strong className="text-slate-800 font-semibold block mt-0.5">{selectedPatient.lastVisitDate ? String(selectedPatient.lastVisitDate) : 'Chưa xếp'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingMedical(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer ml-auto"
                      title="Chỉnh sửa nhóm máu và tiền sử dị ứng"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-white">
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'HISTORY'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lịch sử các ca khám ({patientHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('NOTES')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'NOTES'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Ghi chú điều trị & Bệnh án
              </button>
              <button
                onClick={() => setActiveTab('XRAY')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'XRAY'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Phim X-Quang & Tư liệu
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 flex-1 space-y-4">
              {activeTab === 'HISTORY' && (
                <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang nạp toàn bộ lịch sử ca khám...</span>
                    </div>
                  ) : patientHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      Chưa ghi nhận ca khám nào cho bệnh nhân này.
                    </div>
                  ) : (
                    patientHistory.map((apt, i) => {
                      const clinical = parseClinicalRecord(apt.notes, apt.serviceName);
                      return (
                        <div key={apt.id || i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-100">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span>{apt.serviceName}</span>
                                <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                  {apt.appointmentCode}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Khám lúc {apt.appointmentTime} · Ngày {apt.appointmentDate} • Bác sĩ: <strong className="text-slate-700">{apt.doctorName || 'Bác sĩ phụ trách'}</strong>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              apt.status === 'COMPLETED' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : apt.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : apt.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {apt.status === 'COMPLETED' ? 'Đã hoàn thành' : apt.status === 'CONFIRMED' ? 'Đã duyệt' : apt.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ duyệt'}
                            </span>
                          </div>

                          {/* Chẩn đoán lâm sàng */}
                          <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 space-y-1">
                            <div>
                              <strong className="text-slate-900 block font-semibold">Chẩn đoán & Thủ thuật đã làm:</strong>
                              <span className="text-slate-700">{clinical.diagnosis}</span>
                            </div>
                            {clinical.advice && (
                              <div className="pt-1 border-t border-slate-200/60 mt-1">
                                <strong className="text-slate-900 block font-semibold text-[11px]">Dặn dò sau khám:</strong>
                                <span className="text-slate-600">{clinical.advice}</span>
                              </div>
                            )}
                            {clinical.reExam && (
                              <div className="pt-1 text-emerald-700 font-medium">
                                <strong>Lịch hẹn tái khám:</strong> {clinical.reExam}
                              </div>
                            )}
                          </div>

                          {/* Toa thuốc điện tử */}
                          {clinical.prescription && clinical.prescription.length > 0 && (
                            <div>
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Đơn thuốc đã kê ({clinical.prescription.length} loại):
                              </span>
                              <div className="overflow-x-auto rounded-lg border border-slate-200 text-xs">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase">
                                    <tr>
                                      <th className="py-1.5 px-2.5">Tên thuốc</th>
                                      <th className="py-1.5 px-2.5">Số lượng</th>
                                      <th className="py-1.5 px-2.5">Liều dùng & Hướng dẫn</th>
                                      <th className="py-1.5 px-2.5">Chỉ định</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {clinical.prescription.map((med, idx) => (
                                      <tr key={idx}>
                                        <td className="py-1.5 px-2.5 font-medium text-slate-800">{med.name}</td>
                                        <td className="py-1.5 px-2.5 text-slate-600 font-mono">{med.qty}</td>
                                        <td className="py-1.5 px-2.5 text-blue-700">{med.dose}</td>
                                        <td className="py-1.5 px-2.5 text-slate-500">{med.usage || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'NOTES' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-slate-900 mb-1 text-sm">Ghi chú chuyên môn lâm sàng:</h5>
                    <p className="leading-relaxed">
                      Bệnh nhân có men răng tự nhiên tương đối tốt. Vùng răng số 8 hàm dưới có dấu hiệu mọc nghiêng, đã được dặn dò theo dõi định kỳ. Đạt hiệu quả tốt sau các lần cạo vôi răng và chăm sóc nha chu.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-900 mb-1 text-sm">Lời dặn tiếp theo:</h5>
                    <p className="leading-relaxed text-slate-600">
                      Tái khám lấy vôi răng và kiểm tra nướu định kỳ sau 6 tháng. Khi có triệu chứng ê buốt đột ngột cần liên hệ ngay hotline phòng khám.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'XRAY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPreviewImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80')}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80"
                      alt="Phim X-Quang Panorex"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end p-2">
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-300" /> Phim X-Quang Panorex toàn cảnh
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPreviewImage('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80')}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80"
                      alt="Ảnh chụp nội soi cung hàm"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end p-2">
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-300" /> Ảnh chụp nội soi cung hàm
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-2xl">
              <span className="text-xs text-slate-500 font-mono">ZenBooking Medical Record System</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In hồ sơ bệnh án
                </button>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phóng To Ảnh */}
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

export default PatientsManagementPage;

