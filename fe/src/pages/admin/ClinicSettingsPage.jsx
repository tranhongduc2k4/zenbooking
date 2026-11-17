import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  Stethoscope, 
  Bell, 
  Eye, 
  EyeOff, 
  KeyRound, 
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { clinicSettingApi } from '../../services/clinicSettingApi';

const DEFAULT_SETTINGS = {
  clinicName: 'Nha khoa Quốc tế ZenBooking Dental',
  medicalLicense: 'GP-10824/BYT-CCHN',
  hotlineEmergency: '1900 8989',
  hotlineConsulting: '0909 999 999',
  email: 'contact@zenbooking.dental',
  addressMain: '124 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  addressBranch: '45 Hoàng Hoa Thám, Phường 6, Quận Bình Thạnh, TP. Hồ Chí Minh',
  description: 'Hệ thống nha khoa kỹ thuật cao tiêu chuẩn Thụy Sĩ, ứng dụng công nghệ Piezotome, CT Cone Beam 3D và phòng mổ vô trùng chuẩn quốc tế.',
  openTime: '08:00',
  closeTime: '20:00',
  breakStartTime: '12:00',
  breakEndTime: '13:30',
  slotDurationMinutes: 30,
  totalDentalChairs: 3,
  cancelAdvanceHours: 2,
  workingDays: 'Thứ 2 - Chủ Nhật (Không nghỉ trưa)',
  sterilizationStandard: 'Khử trùng Autoclave 134°C chu kỳ Class B - Đóng gói niêm phong 1 khay/bệnh nhân',
  autoReminderSms: true,
  autoReminderEmail: true
};

export const ClinicSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'SCHEDULE' | 'HEALTH_STANDARDS' | 'SECURITY'
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Tải cài đặt từ Backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await clinicSettingApi.getSettings();
      const data = res?.data || res;
      if (data && data.clinicName) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data
        });
      }
    } catch (err) {
      console.warn('Dùng cài đặt mặc định do chưa nạp được từ server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const showPasswordToast = (type, text) => {
    setPasswordFeedback({ type, text });
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

  // Cập nhật giá trị input cài đặt
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Lưu cấu hình phòng khám
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await clinicSettingApi.updateSettings(settings);
      const updated = res?.data || res;
      if (updated && updated.clinicName) {
        setSettings({ ...DEFAULT_SETTINGS, ...updated });
      }
      showToast('success', 'Đã lưu toàn bộ cấu hình phòng khám thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu cài đặt:', err);
      showToast('error', err.response?.data?.message || 'Không thể lưu cài đặt. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  // Khôi phục cài đặt mặc định
  const handleResetDefault = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục về các giá trị chuẩn mặc định của phòng khám ZenBooking?')) {
      setSettings(DEFAULT_SETTINGS);
      showToast('info', 'Đã đặt lại thông số mặc định trên biểu mẫu. Hãy bấm "Lưu thay đổi" để áp dụng!');
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showPasswordToast('error', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showPasswordToast('error', 'Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showPasswordToast('error', 'Xác nhận mật khẩu mới không khớp.');
      return;
    }

    try {
      setChangingPassword(true);
      await clinicSettingApi.changePassword(passwordForm);
      showPasswordToast('success', 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      showPasswordToast('error', err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { key: 'PROFILE', label: 'Cơ sở & Liên hệ', icon: Building2, desc: 'Tên, hotline, địa chỉ phòng khám' },
    { key: 'SCHEDULE', label: 'Khung giờ & Vận hành', icon: Clock, desc: 'Giờ mở cửa, thời lượng ca khám' },
    { key: 'HEALTH_STANDARDS', label: 'Quy chuẩn & Nhắc hẹn', icon: ShieldCheck, desc: 'Vô trùng y tế, gửi SMS/Email' },
    { key: 'SECURITY', label: 'Bảo mật & Mật khẩu', icon: Lock, desc: 'Đổi mật khẩu tài khoản Admin' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl flex items-start gap-3 text-xs border animate-fadeIn transition-all ${
            feedback.type === 'success'
              ? 'bg-white text-emerald-800 border-emerald-200 shadow-emerald-100/50'
              : feedback.type === 'info'
              ? 'bg-white text-blue-800 border-blue-200 shadow-blue-100/50'
              : 'bg-white text-rose-800 border-rose-200 shadow-rose-100/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : feedback.type === 'info' ? (
            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span className="font-semibold leading-relaxed">{feedback.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Hệ thống Quản trị • Cấu hình Cơ sở</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt Hệ thống Phòng khám
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Tùy chỉnh thông tin thương hiệu, hotline cấp cứu, khung giờ làm việc và quy chuẩn bảo mật phòng khám.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Khôi phục thông số chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                isActive
                  ? 'bg-blue-50/80 border-blue-400/80 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                  {tab.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang nạp cấu hình hệ thống...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: CƠ SỞ & LIÊN HỆ */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Thông tin Thương hiệu & Giấy phép Hoạt động
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thông tin hiển thị trên tiêu đề hệ thống, phiếu khám bệnh nhân và hợp đồng điều trị.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tên cơ sở phòng khám <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={settings.clinicName}
                      onChange={(e) => handleChange('clinicName', e.target.value)}
                      placeholder="Ví dụ: Nha khoa Quốc tế ZenBooking Dental"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số Giấy phép Hoạt động Y tế:
                    </label>
                    <input
                      type="text"
                      value={settings.medicalLicense}
                      onChange={(e) => handleChange('medicalLicense', e.target.value)}
                      placeholder="Ví dụ: GP-10824/BYT-CCHN"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hotline Cấp cứu & Trực 24/7 <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settings.hotlineEmergency}
                        onChange={(e) => handleChange('hotlineEmergency', e.target.value)}
                        placeholder="1900 8989"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hotline Tư vấn & Đặt hẹn Zalo:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settings.hotlineConsulting}
                        onChange={(e) => handleChange('hotlineConsulting', e.target.value)}
                        placeholder="0909 999 999"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hộp thư Email tiếp nhận thông tin:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="contact@zenbooking.dental"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Thời gian làm việc tóm tắt:
                    </label>
                    <input
                      type="text"
                      value={settings.workingDays}
                      onChange={(e) => handleChange('workingDays', e.target.value)}
                      placeholder="Thứ 2 - Chủ Nhật (Không nghỉ trưa)"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Địa chỉ Trụ sở chính:
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settings.addressMain}
                        onChange={(e) => handleChange('addressMain', e.target.value)}
                        placeholder="124 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Địa chỉ Chi nhánh 2 (Nếu có):
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-cyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settings.addressBranch}
                        onChange={(e) => handleChange('addressBranch', e.target.value)}
                        placeholder="45 Hoàng Hoa Thám, Phường 6, Quận Bình Thạnh, TP. Hồ Chí Minh"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mô tả giới thiệu phòng khám:
                    </label>
                    <textarea
                      rows={3}
                      value={settings.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Mô tả công nghệ nha khoa, tầm nhìn chất lượng và lời cam kết đối với bệnh nhân..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KHUNG GIỜ & VẬN HÀNH */}
            {activeTab === 'SCHEDULE' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Cấu hình Giờ Làm Việc & Phân Bổ Ca Khám
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống sẽ dựa vào các thông số này để tự động tính toán các khung giờ trống (slot) cho bệnh nhân đặt lịch.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Giờ mở cửa đón khách:
                    </label>
                    <input
                      type="time"
                      value={settings.openTime}
                      onChange={(e) => handleChange('openTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Giờ đóng cửa kết thúc ca:
                    </label>
                    <input
                      type="time"
                      value={settings.closeTime}
                      onChange={(e) => handleChange('closeTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Thời lượng mỗi ca khám (Slot duration):
                    </label>
                    <select
                      value={settings.slotDurationMinutes}
                      onChange={(e) => handleChange('slotDurationMinutes', Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value={20}>20 phút / ca</option>
                      <option value={30}>30 phút / ca (Tiêu chuẩn)</option>
                      <option value={45}>45 phút / ca (Chuyên sâu)</option>
                      <option value={60}>60 phút / ca (Phẫu thuật/Implant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Giờ nghỉ trưa bắt đầu:
                    </label>
                    <input
                      type="time"
                      value={settings.breakStartTime}
                      onChange={(e) => handleChange('breakStartTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Giờ nghỉ trưa kết thúc:
                    </label>
                    <input
                      type="time"
                      value={settings.breakEndTime}
                      onChange={(e) => handleChange('breakEndTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số ghế nha điều trị đồng thời tối đa:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.totalDentalChairs}
                      onChange={(e) => handleChange('totalDentalChairs', Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hạn cho phép bệnh nhân hủy lịch khám:
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={settings.cancelAdvanceHours}
                        onChange={(e) => handleChange('cancelAdvanceHours', Number(e.target.value))}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                      >
                        <option value={1}>Trước 1 tiếng</option>
                        <option value={2}>Trước 2 tiếng (Khuyên dùng)</option>
                        <option value={4}>Trước 4 tiếng</option>
                        <option value={12}>Trước 12 tiếng</option>
                        <option value={24}>Trước 24 tiếng</option>
                      </select>
                      <span className="text-slate-500 text-xs">
                        Bệnh nhân không thể tự hủy lịch khám trên web nếu sát giờ hẹn hơn mốc này.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QUY CHUẨN Y TẾ & NHẮC HẸN */}
            {activeTab === 'HEALTH_STANDARDS' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Quy chuẩn Vô trùng Y tế & Thông báo Nhắc hẹn
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cấu hình tiêu chuẩn kiểm soát nhiễm khuẩn và kênh tự động gửi thông báo lịch hẹn tới bệnh nhân.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tiêu chuẩn vô trùng dụng cụ y tế:
                    </label>
                    <textarea
                      rows={2}
                      value={settings.sterilizationStandard}
                      onChange={(e) => handleChange('sterilizationStandard', e.target.value)}
                      placeholder="Quy chuẩn hấp sấy tiệt trùng, đóng gói niêm phong..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      Tự động hóa thông báo nhắc hẹn bệnh nhân
                    </div>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={settings.autoReminderSms}
                        onChange={(e) => handleChange('autoReminderSms', e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Gửi tin nhắn SMS nhắc hẹn trước ca khám 24 giờ
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tự động gửi thông tin mã lịch hẹn, giờ khám và bác sĩ phụ trách đến SĐT bệnh nhân.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={settings.autoReminderEmail}
                        onChange={(e) => handleChange('autoReminderEmail', e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Gửi Email xác nhận đặt lịch & Kê đơn thuốc điện tử
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Gửi phiếu khám PDF và đơn thuốc có chữ ký số của bác sĩ ngay khi hoàn tất ca điều trị.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BẢO MẬT & ĐỔI MẬT KHẨU ADMIN */}
            {activeTab === 'SECURITY' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Đổi Mật Khẩu Tài Khoản Quản Trị Viên
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bảo vệ an toàn cho hệ thống phòng khám bằng cách thường xuyên cập nhật mật khẩu có độ bảo mật cao.
                  </p>
                </div>

                {/* Password Toast */}
                {passwordFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-semibold">{passwordFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mật khẩu hiện tại <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Nhập mật khẩu đang dùng"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Nhập mật khẩu mới an toàn"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
                    >
                      {changingPassword ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Cập nhật mật khẩu mới</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicSettingsPage;
