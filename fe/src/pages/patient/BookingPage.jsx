import React, { useState, useEffect } from 'react';
import { dentalServiceApi } from '../../services/dentalServiceApi';
import { appointmentApi } from '../../services/appointmentApi';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  CalendarPlus,
  RefreshCw,
  Info,
  Tag,
  Star
} from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();

  // Danh mục dịch vụ mặc định (fallback)
  const DEFAULT_SERVICES = [
    { id: '1', name: 'Khám tổng quát & Tư vấn', price: 'Miễn phí', time: '20 phút', icon: '🩺', category: 'Tổng quát' },
    { id: '2', name: 'Cạo vôi & Đánh bóng siêu âm', price: '200.000đ', time: '30 phút', icon: '✨', category: 'Vệ sinh' },
    { id: '3', name: 'Tẩy trắng răng Laser Whitening', price: '1.500.000đ', time: '45 phút', icon: '💎', category: 'Thẩm mỹ' },
    { id: '4', name: 'Nhổ răng khôn Piezotome', price: '1.000.000đ', time: '30 phút', icon: '🦷', category: 'Tiểu phẫu' },
    { id: '5', name: 'Niềng răng / Khay trong suốt', price: 'Từ 18.000.000đ', time: '45 phút', icon: '😁', category: 'Chỉnh nha' },
    { id: '6', name: 'Cấy ghép Implant thẩm mỹ', price: 'Từ 12.000.000đ', time: '60 phút', icon: '🔩', category: 'Implant' },
  ];

  // Danh sách bác sĩ
  const doctors = [
    { id: 'any', name: 'Bác sĩ bất kỳ (hệ thống tự sắp xếp)', specialty: 'Đội ngũ chuyên khoa', available: true },
    { id: 'dr_tuan', name: 'BS. CKI Trần Minh Tuấn', specialty: 'Chỉnh nha & Răng khôn · 12 năm KN', available: true },
    { id: 'dr_yen', name: 'ThS. BS Lê Hoàng Yến', specialty: 'Nha khoa Thẩm mỹ · 10 năm KN', available: true },
    { id: 'dr_hung', name: 'BS. Nguyễn Văn Hùng', specialty: 'Cấy ghép Implant · 8 năm KN', available: true },
  ];

  // Khung giờ
  const morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
  const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '18:00', '19:00'];

  // State
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState('1');
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('any');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải dịch vụ từ API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await dentalServiceApi.getActiveServices();
        const dataList = Array.isArray(res) ? res : (res?.data || []);
        if (dataList && dataList.length > 0) {
          const mapped = dataList.map((item) => ({
            id: String(item.id),
            name: item.name,
            price: Number(item.price) === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(item.price) + 'đ',
            time: `${item.estimatedDurationMinutes} phút`,
            icon: item.icon || '🦷',
            category: item.category,
            description: item.description,
          }));
          setServices(mapped);
          setSelectedService(mapped[0].id);
        }
      } catch (err) {
        console.warn('Không thể tải dịch vụ từ server, dùng fallback:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Auto-fill thông tin từ tài khoản đăng nhập
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.fullName) setPatientName(u.fullName);
        if (u.phone) setPatientPhone(u.phone);
      }
    } catch (e) {
      console.error('Không thể nạp thông tin user:', e);
    }
  }, []);

  const currentService = services.find((s) => s.id === selectedService) || services[0];
  const currentDoctor = doctors.find((d) => d.id === selectedDoctor) || doctors[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại liên hệ!');
      return;
    }
    setFormError('');
    try {
      setIsSubmitting(true);
      const parsedServiceId = Number(selectedService);
      const bookingPayload = {
        serviceId: !isNaN(parsedServiceId) ? parsedServiceId : null,
        serviceName: currentService?.name,
        doctorId: null,
        doctorName: currentDoctor?.name,
        appointmentDate: bookingDate,
        appointmentTime: selectedTimeSlot,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        notes: note ? note.trim() : null,
      };
      const res = await appointmentApi.bookAppointment(bookingPayload);
      const result = res?.data || res;
      if (result && (result.id || result.appointmentCode)) {
        setBookingResult(result);
        setIsSubmitted(true);
      } else {
        setFormError('Không nhận được mã xác nhận lịch khám từ máy chủ.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi đặt lịch:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Màn hình thành công
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Đặt lịch thành công!</h1>
            <p className="text-xs text-slate-500">Hệ thống đã tiếp nhận lịch hẹn của bạn</p>
          </div>
        </div>

        {/* Success card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold mb-1">Lịch hẹn đã được ghi nhận</h2>
            <p className="text-emerald-100 text-sm">
              Tin nhắn SMS xác nhận sẽ gửi tới <strong className="text-white">{patientPhone}</strong>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Mã phiếu hẹn */}
            <div className="flex items-center justify-center gap-3 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <p className="text-xs text-blue-600 font-medium text-center">Mã phiếu hẹn của bạn</p>
                <p className="text-2xl font-mono font-extrabold text-blue-700 text-center">
                  {bookingResult?.appointmentCode || 'ZB-AP-XXXX'}
                </p>
              </div>
            </div>

            {/* Chi tiết */}
            <div className="space-y-3 text-sm">
              {[
                { label: 'Dịch vụ điều trị', value: currentService?.name },
                { label: 'Bác sĩ phụ trách', value: currentDoctor?.name },
                { label: 'Thời gian khám', value: `${selectedTimeSlot} · ${bookingDate}`, highlight: true },
                { label: 'Chi phí dự kiến', value: currentService?.price, green: true },
              ].map(({ label, value, highlight, green }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-xs">{label}:</span>
                  <span className={`font-semibold text-right max-w-[55%] ${highlight ? 'text-blue-700' : green ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/patient-home"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold text-center hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
              >
                Xem Bảng điều khiển
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Đặt thêm lịch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            ZenBooking Dental · Đặt lịch khám trực tuyến
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đặt Lịch Khám Nha Khoa</h1>
          <p className="text-sm text-slate-500 mt-0.5">Chọn bác sĩ, dịch vụ và khung giờ phù hợp với bạn</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/patient-home"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại
          </Link>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Miễn phí chụp X-quang tư vấn
          </div>
        </div>
      </div>

      {/* Error */}
      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Cột trái: Form steps */}
          <div className="lg:col-span-8 space-y-5">

            {/* BƯỚC 1: Chọn dịch vụ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Chọn dịch vụ điều trị</h2>
                  <p className="text-xs text-slate-400">Lựa chọn nhu cầu chăm sóc răng miệng của bạn</p>
                </div>
                {loadingServices && <RefreshCw className="w-4 h-4 animate-spin text-blue-500 ml-auto" />}
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((item) => {
                  const isSelected = selectedService === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedService(item.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all relative group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3 pr-5">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                              {item.price}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Radio */}
                      <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 2: Chọn bác sĩ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Chọn bác sĩ khám</h2>
                  <p className="text-xs text-slate-400">Tùy chọn - hệ thống tự phân công nếu để trống</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {doc.id === 'any' ? '🩺' : doc.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {doc.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate">{doc.specialty}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 3: Chọn ngày & giờ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Chọn ngày & Giờ khám</h2>
                  <p className="text-xs text-slate-400">Phòng khám hoạt động 08:00 - 20:00 hàng ngày</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Chọn ngày */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày khám:</label>
                  <div className="relative max-w-xs">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Khung giờ buổi sáng */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">🌅 Buổi sáng (08:00 - 11:30):</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {morningSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Khung giờ buổi chiều */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">🌆 Buổi chiều & Tối (14:00 - 20:00):</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {afternoonSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* BƯỚC 4: Thông tin bệnh nhân */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Thông tin liên hệ</h2>
                  <p className="text-xs text-slate-400">Thông tin được bảo mật chuẩn hồ sơ bệnh án</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Họ và tên bệnh nhân <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Ví dụ: Trần Hồng Đức"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại nhận SMS <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="Ví dụ: 0987 654 321"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ghi chú triệu chứng (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Mô tả triệu chứng hoặc yêu cầu riêng của bạn..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt lịch hẹn (sticky) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Summary header */}
              <div className="bg-slate-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Tóm tắt lịch hẹn</h3>
                  <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-semibold">
                    Bệnh nhân
                  </span>
                </div>
                {/* Datetime highlight */}
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Ngày khám</p>
                    <p className="text-sm font-bold">{bookingDate}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-0.5">Giờ khám</p>
                    <p className="text-sm font-bold font-mono text-blue-300">{selectedTimeSlot}</p>
                  </div>
                </div>
              </div>

              {/* Summary details */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400">Dịch vụ điều trị:</span>
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-lg">{currentService?.icon}</span>
                    <span className="text-sm font-semibold text-slate-900 leading-tight">{currentService?.name}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Bác sĩ phụ trách:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{currentDoctor?.name}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Chi phí dự kiến:</span>
                  <span className="text-lg font-extrabold text-blue-600">{currentService?.price}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5 space-y-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Xác nhận đặt lịch
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Miễn phí hủy trước 2 giờ · Bảo mật tuyệt đối</span>
                </div>
              </div>
            </div>

            {/* Help widget */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Cần hỗ trợ đổi giờ khám?
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Liên hệ hotline <strong className="text-blue-700">1900 8888</strong> để sắp xếp theo yêu cầu đặc biệt.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
