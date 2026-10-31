import React, { useState, useEffect } from 'react';
import { dentalServiceApi } from '../../services/dentalServiceApi';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  CalendarPlus,
  RefreshCw,
  Info
} from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();

  // Danh mục dịch vụ
  const DEFAULT_SERVICES = [
  { id: '1', name: 'Khám tổng quát & Tư vấn', price: 'Miễn phí', time: '20 phút', icon: '🩺' },
  { id: '2', name: 'Cạo vôi & Đánh bóng siêu âm', price: '200.000đ', time: '30 phút', icon: '✨' },
  { id: '3', name: 'Tẩy trắng răng Laser Whitening', price: '1.500.000đ', time: '45 phút', icon: '💎' },
  { id: '4', name: 'Nhổ răng khôn không đau Piezotome', price: '1.000.000đ', time: '30 phút', icon: '🦷' },
  { id: '5', name: 'Niềng răng mắc cài / Khay trong suốt', price: 'Từ 18.000.000đ', time: '45 phút', icon: '😁' },
  { id: '6', name: 'Cấy ghép Implant thẩm mỹ', price: 'Từ 12.000.000đ', time: '60 phút', icon: '🔩' },
];

  // Danh sách bác sĩ
  const doctors = [
    { id: 'any', name: 'Bác sĩ bất kỳ (Hệ thống tự động sắp xếp sớm nhất)', specialty: 'Đội ngũ chuyên khoa' },
    { id: 'dr_tuan', name: 'BS. CKI Trần Minh Tuấn (12 năm KN)', specialty: 'Chuyên gia Chỉnh nha & Răng khôn' },
    { id: 'dr_yen', name: 'ThS. BS Lê Hoàng Yến (10 năm KN)', specialty: 'Chuyên gia Nha khoa Thẩm mỹ' },
    { id: 'dr_hung', name: 'BS. Nguyễn Văn Hùng (8 năm KN)', specialty: 'Chuyên gia Cấy ghép Implant' },
  ];

  // Khung giờ có sẵn (Slots)
  const morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
  const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '18:00', '19:00'];

  // State quản lý toàn bộ dữ liệu form
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState('1');
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].id);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

    // Tải danh mục dịch vụ điều trị từ Backend API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await dentalServiceApi.getActiveServices();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((item) => ({
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
        console.warn('Không thể tải dịch vụ động từ server, dùng danh mục dự phòng:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Tự động điền thông tin bệnh nhân từ tài khoản đã đăng nhập
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

  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  const homeUrl = token
    ? userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'
      ? '/admin'
      : '/patient-home'
    : '/';

  // Lấy chi tiết dịch vụ và bác sĩ hiện tại
  const currentService = services.find((s) => s.id === selectedService) || services[0];
  const currentDoctor = doctors.find((d) => d.id === selectedDoctor) || doctors[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại liên hệ!');
      return;
    }
    setFormError('');

    const bookingPayload = {
      service: currentService.name,
      doctor: currentDoctor.name,
      date: bookingDate,
      time: selectedTimeSlot,
      patientName,
      patientPhone,
      note,
    };

    console.log('Xác nhận đặt lịch khám:', bookingPayload);
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar đồng bộ chuẩn Portal Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Cổng Bệnh Nhân ZenBooking • Đặt lịch khám trực tuyến
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đặt Lịch Khám & Tư Vấn Nha Khoa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chủ động chọn bác sĩ, khung giờ khám và dịch vụ điều trị theo thời gian biểu của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/patient-home"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Bảng điều khiển
          </Link>
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Miễn phí chụp X-quang tư vấn
          </div>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center space-x-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Màn hình hiển thị kết quả đặt lịch thành công */}
      {isSubmitted ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-8 border border-slate-200/80 text-center animate-fade-in space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Đặt lịch khám thành công!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Hệ thống ZenBooking đã tiếp nhận lịch hẹn của <strong className="text-slate-800">{patientName}</strong>. Tin nhắn SMS xác nhận sẽ được gửi tới số <strong className="text-slate-800">{patientPhone}</strong>.
            </p>
          </div>

          {/* Phiếu xác nhận lịch khám */}
          <div className="bg-slate-50/80 rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm text-slate-700 border border-slate-200/80">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-900">Mã phiếu hẹn:</span>
              <span className="font-mono font-bold text-blue-600">ZB-AP-8924</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dịch vụ điều trị:</span>
              <span className="font-medium text-slate-900 text-right">{currentService.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bác sĩ phụ trách:</span>
              <span className="font-medium text-slate-900 text-right">{currentDoctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngày & Giờ khám:</span>
              <span className="font-semibold text-blue-700 text-right">
                {selectedTimeSlot} • {bookingDate}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Chi phí dự kiến:</span>
              <span className="font-bold text-emerald-600">{currentService.price}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/patient-home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              Xem trong Bảng điều khiển
            </Link>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Đặt thêm ca khám khác
            </button>
          </div>
        </div>
      ) : (
        /* Form đặt lịch 2 cột (8 Cols Form - 4 Cols Sticky Summary) */
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* CỘT TRÁI: CÁC BƯỚC ĐIỀN FORM (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* BƯỚC 1: CHỌN DỊCH VỤ */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Chọn dịch vụ điều trị
                    </h2>
                    <p className="text-xs text-slate-500">Lựa chọn nhu cầu chăm sóc răng miệng của bạn</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {services.map((item) => {
                    const isSelected = selectedService === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedService(item.id)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
                        <div className="flex-1 pr-6">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-bold text-blue-600">{item.price}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {item.time}
                            </span>
                          </div>
                        </div>

                        {/* Radio indicator */}
                        <div className="absolute top-4 right-4">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BƯỚC 2: CHỌN BÁC SĨ */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Chọn bác sĩ khám (Tùy chọn)
                    </h2>
                    <p className="text-xs text-slate-500">Đội ngũ bác sĩ giàu kinh nghiệm tại nha khoa ZenBooking</p>
                  </div>
                </div>

                <div className="relative">
                  <Stethoscope className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BƯỚC 3: CHỌN NGÀY & GIỜ KHÁM */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Chọn ngày & Giờ khám
                    </h2>
                    <p className="text-xs text-slate-500">Khung giờ hoạt động từ 08:00 đến 20:00 hàng ngày</p>
                  </div>
                </div>

                {/* Chọn ngày khám */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Ngày bạn muốn khám:
                  </label>
                  <div className="relative max-w-xs">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Grid chọn giờ khám: Buổi sáng */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Buổi sáng (08:00 - 11:30):
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {morningSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-1 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Buổi chiều */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Buổi chiều & Tối (14:00 - 20:00):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                      {afternoonSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-1 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
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

              {/* BƯỚC 4: THÔNG TIN BỆNH NHÂN & GHI CHÚ */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Thông tin liên hệ & Triệu chứng
                    </h2>
                    <p className="text-xs text-slate-500">Thông tin được bảo mật chuẩn hồ sơ bệnh án y tế</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ghi chú triệu chứng hoặc yêu cầu riêng (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Tôi hay bị ê buốt răng hàm dưới khi uống nước lạnh, muốn khám và tư vấn bọc sứ..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TỔNG KẾT & XÁC NHẬN (4 Cols Sticky) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Tóm tắt lịch hẹn
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px]">
                    Bệnh nhân
                  </span>
                </div>

                <div className="py-4 space-y-3.5 text-xs sm:text-sm text-slate-600 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-xs">Dịch vụ điều trị:</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentService.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Bác sĩ phụ trách:</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {currentDoctor.name}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-blue-600 block font-medium">Ngày khám</span>
                      <span className="font-bold text-slate-800">{bookingDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-blue-600 block font-medium">Giờ khám</span>
                      <span className="font-bold font-mono text-blue-700 text-sm">{selectedTimeSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Chi phí dự kiến:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {currentService.price}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>Xác nhận đặt lịch</span>
                    <ChevronRight size={16} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Cam kết bảo mật & Miễn phí hủy trước 2h</span>
                  </div>
                </div>
              </div>

              {/* Widget Trợ giúp nhanh */}
              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  Cần hỗ trợ đổi giờ khám?
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bạn có thể liên hệ hotline <strong>1900 8888</strong> để nhân viên tư vấn sắp xếp giờ theo yêu cầu đặc biệt.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingPage;
