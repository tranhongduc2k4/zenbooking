import React, { useState, useEffect } from 'react';
import { dentalServiceApi } from '../../services/dentalServiceApi';
import { doctorApi } from '../../services/doctorApi';
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
  AlertTriangle,
  Search
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

  // Danh sách bác sĩ mặc định dự phòng
  const DEFAULT_DOCTORS = [
    { id: 'any', name: 'Bác sĩ bất kỳ (hệ thống tự sắp xếp)', specialty: 'Đội ngũ chuyên khoa', available: true },
    { id: 'dr_tuan', name: 'BS. CKI Trần Minh Tuấn', specialty: 'Chỉnh nha & Răng khôn · 12 năm KN', available: true },
    { id: 'dr_yen', name: 'ThS. BS Lê Hoàng Yến', specialty: 'Nha khoa Thẩm mỹ · 10 năm KN', available: true },
    { id: 'dr_hung', name: 'BS. Nguyễn Văn Hùng', specialty: 'Cấy ghép Implant · 8 năm KN', available: true },
  ];

  // Khung giờ khám mẫu
  const allMorningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
  const allAfternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '18:00', '19:00'];

  // Helper tính ngày hôm nay theo giờ địa phương YYYY-MM-DD
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('1');
  const [loadingServices, setLoadingServices] = useState(true);
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState('any');
  const [bookingDate, setBookingDate] = useState(getTodayDateString());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Lọc danh sách dịch vụ theo từ khóa tìm kiếm
   */
  const filteredServices = services.filter((s) => {
    const query = serviceSearchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      s.name.toLowerCase().includes(query) ||
      (s.category && s.category.toLowerCase().includes(query)) ||
      (s.description && s.description.toLowerCase().includes(query))
    );
  });

  /**
   * Kiểm tra khung giờ có hợp lệ không:
   * 1. Thời gian đặt phải > thời gian hiện tại
   * 2. Phải cách thời điểm hiện tại ít nhất 2 tiếng (120 phút)
   */
  const isSlotValid = (slotTime, dateStr) => {
    if (!slotTime || !dateStr) return false;
    const [hours, minutes] = slotTime.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day, hours, minutes, 0);

    const now = new Date();
    const minimumAllowedDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return slotDate > minimumAllowedDate;
  };

  // Tự động chọn khung giờ hợp lệ đầu tiên khi ngày hoặc danh sách giờ kín thay đổi
  useEffect(() => {
    const allSlots = [...allMorningSlots, ...allAfternoonSlots];
    const availableSlots = allSlots.filter(
      (slot) => isSlotValid(slot, bookingDate) && !bookedSlots.includes(slot)
    );

    if (availableSlots.length > 0) {
      if (!availableSlots.includes(selectedTimeSlot)) {
        setSelectedTimeSlot(availableSlots[0]);
      }
    } else {
      setSelectedTimeSlot('');
    }
  }, [bookingDate, bookedSlots]);

  // Tải danh sách các khung giờ đã kín lịch của bác sĩ vào ngày được chọn
  useEffect(() => {
    let isMounted = true;
    const fetchBookedSlots = async () => {
      if (!bookingDate) return;
      try {
        setLoadingSlots(true);
        const docId = selectedDoctor !== 'any' && !isNaN(Number(selectedDoctor)) ? Number(selectedDoctor) : null;
        const res = await appointmentApi.getBookedSlots(docId, bookingDate);
        const slots = Array.isArray(res) ? res : (res?.data || []);
        if (isMounted) {
          setBookedSlots(Array.isArray(slots) ? slots : []);
        }
      } catch (err) {
        console.warn('Không thể tải danh sách khung giờ đã kín lịch:', err);
        if (isMounted) setBookedSlots([]);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDoctor, bookingDate]);

  // Tải danh mục dịch vụ từ Backend API
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

  // Tải danh sách bác sĩ chuyên khoa từ Backend MySQL
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorApi.getDoctors();
        const dataList = Array.isArray(res) ? res : (res?.data || []);
        if (dataList && dataList.length > 0) {
          const mapped = [
            { id: 'any', name: 'Bác sĩ bất kỳ (hệ thống tự sắp xếp)', specialty: 'Đội ngũ chuyên khoa', available: true },
            ...dataList.map((d) => ({
              id: String(d.id),
              name: d.fullName,
              specialty: d.specialty || 'Bác sĩ chuyên khoa',
              available: true,
            }))
          ];
          setDoctors(mapped);
        }
      } catch (err) {
        console.warn('Không thể tải bác sĩ từ server, dùng danh sách dự phòng:', err);
      }
    };
    fetchDoctors();
  }, []);

  // Tự động điền thông tin người dùng đã đăng nhập
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

    if (!selectedTimeSlot) {
      setFormError('Ngày bạn chọn hiện không còn khung giờ hợp lệ (phải đặt trước giờ khám tối thiểu 2 tiếng). Vui lòng chọn ngày khác!');
      return;
    }

    if (!isSlotValid(selectedTimeSlot, bookingDate)) {
      setFormError('Khung giờ này đã quá hạn hoặc không đủ thời gian chuẩn bị tối thiểu 2 giờ. Vui lòng chọn khung giờ khác!');
      return;
    }

    if (bookedSlots.includes(selectedTimeSlot)) {
      setFormError('Khung giờ bạn chọn đã kín lịch. Vui lòng chọn khung giờ khác hoặc đổi bác sĩ!');
      return;
    }

    setFormError('');
    try {
      setIsSubmitting(true);
      const parsedServiceId = Number(selectedService);
      const isSpecificDoctor = selectedDoctor !== 'any' && !isNaN(Number(selectedDoctor));
      const bookingPayload = {
        serviceId: !isNaN(parsedServiceId) ? parsedServiceId : null,
        serviceName: currentService?.name,
        doctorId: isSpecificDoctor ? Number(selectedDoctor) : null,
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

  // Màn hình hiển thị khi đặt lịch thành công
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Đặt lịch thành công!</h1>
            <p className="text-xs text-slate-500">Hệ thống đã tiếp nhận phiếu hẹn của bạn</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold mb-1">Lịch hẹn đã được ghi nhận</h2>
            <p className="text-emerald-100 text-sm">
              Tin nhắn SMS xác nhận sẽ được gửi tới số <strong className="text-white">{patientPhone}</strong>
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-3 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <p className="text-xs text-blue-600 font-medium text-center">Mã phiếu hẹn khám</p>
                <p className="text-2xl font-mono font-extrabold text-blue-700 text-center">
                  {bookingResult?.appointmentCode || 'ZB-AP-XXXX'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'Dịch vụ điều trị', value: currentService?.name },
                { label: 'Bác sĩ phụ trách', value: currentDoctor?.name },
                { label: 'Thời gian khám', value: `${selectedTimeSlot} · ${bookingDate}`, highlight: true },
                { label: 'Chi phí dự kiến', value: currentService?.price, green: true },
              ].map(({ label, value, highlight, green }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-xs">{label}:</span>
                  <span className={`font-semibold text-right max-w-[55%] ${highlight ? 'text-blue-700 font-mono' : green ? 'text-emerald-600 font-mono' : 'text-slate-900'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/patient-home"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold text-center hover:bg-blue-700 transition-all shadow-xs"
              >
                Về Bảng điều khiển
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Đặt thêm ca khác
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            ZenBooking Dental · Đặt lịch khám trực tuyến
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đặt Lịch Khám & Tư Vấn</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thời gian khám linh hoạt, đặt trước tối thiểu 2 giờ để tiếp đón tốt nhất</p>
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

      {/* Thông báo lỗi nếu có */}
      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Đặt lịch */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* CỘT TRÁI: CÁC BƯỚC ĐIỀN FORM (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">

            {/* BƯỚC 1: Chọn dịch vụ (Kèm ô tìm kiếm dịch vụ trực quan Phương án A) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Chọn dịch vụ điều trị</h2>
                    <p className="text-xs text-slate-400">Lựa chọn nhu cầu chăm sóc răng miệng của bạn</p>
                  </div>
                </div>

                {/* Ô tìm kiếm lọc nhanh dịch vụ */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    placeholder="Tìm nhanh dịch vụ..."
                    className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Danh sách thẻ dịch vụ */}
              <div className="p-5">
                {loadingServices ? (
                  <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Đang nạp danh mục dịch vụ...</span>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Không tìm thấy dịch vụ nào khớp với từ khóa "{serviceSearchTerm}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredServices.map((item) => {
                      const isSelected = selectedService === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedService(item.id)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all relative group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400/50 shadow-xs'
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
                          <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-slate-400'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* BƯỚC 2: Chọn bác sĩ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Chọn bác sĩ khám (Tùy chọn)</h2>
                  <p className="text-xs text-slate-400">Đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm</p>
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
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400/50 shadow-xs'
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

            {/* BƯỚC 3: Chọn ngày & giờ khám */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Chọn ngày & Giờ khám</h2>
                    <p className="text-xs text-slate-400">Yêu cầu đặt trước tối thiểu 2 giờ so với thời điểm hiện tại</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200/80">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cách hiện tại ≥ 2h</span>
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
                      min={getTodayDateString()}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Khung giờ buổi sáng */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-600">🌅 Buổi sáng (08:00 - 11:30):</label>
                    {loadingSlots && <span className="text-[11px] text-slate-400">Đang kiểm tra lịch trống...</span>}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {allMorningSlots.map((slot) => {
                      const valid = isSlotValid(slot, bookingDate);
                      const isBooked = bookedSlots.includes(slot);
                      const canSelect = valid && !isBooked;
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={!canSelect}
                          onClick={() => setSelectedTimeSlot(slot)}
                          title={
                            isBooked
                              ? 'Khung giờ này đã kín lịch, vui lòng chọn giờ khác hoặc đổi bác sĩ'
                              : !valid
                              ? 'Khung giờ này đã qua hoặc không đủ trước 2 tiếng'
                              : `Chọn giờ ${slot}`
                          }
                          className={`py-2 px-1 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                            isBooked
                              ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-90'
                              : !valid
                              ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                          }`}
                        >
                          <div>{slot}</div>
                          {isBooked && (
                            <div className="text-[9px] font-sans font-medium text-rose-500 leading-none mt-0.5">
                              Kín lịch
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Khung giờ buổi chiều */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">🌆 Buổi chiều & Tối (14:00 - 20:00):</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {allAfternoonSlots.map((slot) => {
                      const valid = isSlotValid(slot, bookingDate);
                      const isBooked = bookedSlots.includes(slot);
                      const canSelect = valid && !isBooked;
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={!canSelect}
                          onClick={() => setSelectedTimeSlot(slot)}
                          title={
                            isBooked
                              ? 'Khung giờ này đã kín lịch, vui lòng chọn giờ khác hoặc đổi bác sĩ'
                              : !valid
                              ? 'Khung giờ này đã qua hoặc không đủ trước 2 tiếng'
                              : `Chọn giờ ${slot}`
                          }
                          className={`py-2 px-1 text-center font-mono text-xs font-semibold rounded-xl border transition-all ${
                            isBooked
                              ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-90'
                              : !valid
                              ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                          }`}
                        >
                          <div>{slot}</div>
                          {isBooked && (
                            <div className="text-[9px] font-sans font-medium text-rose-500 leading-none mt-0.5">
                              Kín lịch
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chú thích màu sắc */}
                <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-blue-600 inline-block shadow-xs"></span>
                    <span className="font-medium text-slate-700">Đang chọn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 inline-block"></span>
                    <span>Còn trống</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-50 border border-rose-200 inline-block"></span>
                    <span className="text-rose-600 font-medium">Đã kín lịch (bác sĩ bận)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 inline-block line-through text-[10px] flex items-center justify-center text-slate-400">✕</span>
                    <span>Không khả dụng (&lt; 2h)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BƯỚC 4: Thông tin liên hệ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Thông tin liên hệ</h2>
                  <p className="text-xs text-slate-400">Thông tin được bảo mật chuẩn y tế</p>
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
                        placeholder="Ví dụ: 0792275635"
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

          {/* CỘT PHẢI: TỔNG KẾT & XÁC NHẬN (4 Cols Sticky) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Tóm tắt */}
              <div className="bg-slate-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Tóm tắt lịch hẹn</h3>
                  <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-semibold">
                    Bệnh nhân
                  </span>
                </div>
                {/* Ngày giờ khám */}
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Ngày khám</p>
                    <p className="text-sm font-bold">{bookingDate}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-0.5">Giờ khám</p>
                    <p className="text-sm font-bold font-mono text-blue-300">
                      {selectedTimeSlot || 'Chưa chọn'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chi tiết dịch vụ */}
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

              {/* Nút bấm xác nhận */}
              <div className="px-5 pb-5 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTimeSlot}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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

            {/* Trợ giúp */}
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
