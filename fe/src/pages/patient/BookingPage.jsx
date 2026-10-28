import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const BookingPage = () => {
  // Danh mục dịch vụ
  const services = [
    { id: 'general', name: 'Khám tổng quát & Tư vấn', price: 'Miễn phí', time: '20 phút', icon: '🩺' },
    { id: 'scaling', name: 'Cạo vôi & Đánh bóng siêu âm', price: '200.000đ', time: '30 phút', icon: '✨' },
    { id: 'whitening', name: 'Tẩy trắng răng Laser Whitening', price: '1.500.000đ', time: '45 phút', icon: '💎' },
    { id: 'wisdom_tooth', name: 'Nhổ răng khôn không đau Piezotome', price: '1.000.000đ', time: '30 phút', icon: '🦷' },
    { id: 'braces', name: 'Niềng răng mắc cài / Khay trong suốt', price: 'Từ 18.000.000đ', time: '45 phút', icon: '😁' },
    { id: 'implant', name: 'Cấy ghép Implant thẩm mỹ', price: 'Từ 12.000.000đ', time: '60 phút', icon: '🔩' },
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
  const [selectedService, setSelectedService] = useState(services[0].id);
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

  // Lấy chi tiết dịch vụ và bác sĩ hiện tại
  const currentService = services.find((s) => s.id === selectedService) || services[0];
  const currentDoctor = doctors.find((d) => d.id === selectedDoctor) || doctors[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
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
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header trang */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-blue-600" />
            Đặt lịch khám trực tuyến nhanh chóng
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đặt Lịch Khám Nha Khoa
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Chủ động chọn bác sĩ và giờ khám phù hợp với lịch trình của bạn. Miễn phí tư vấn và chụp phim X-Quang tổng quát.
          </p>
        </div>

        {/* Modal / Màn hình đặt lịch thành công */}
        {isSubmitted ? (
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Đặt lịch khám thành công!</h2>
            <p className="text-sm text-slate-600 mb-6">
              Cảm ơn <span className="font-semibold text-slate-800">{patientName}</span>, đội ngũ ZenBooking đã tiếp nhận lịch hẹn của bạn và sẽ gửi tin nhắn xác nhận tới số <span className="font-semibold text-slate-800">{patientPhone}</span> trong ít phút.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 text-xs sm:text-sm text-slate-700 border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ:</span>
                <span className="font-semibold text-slate-900">{currentService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bác sĩ phụ trách:</span>
                <span className="font-medium text-slate-900">{currentDoctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian khám:</span>
                <span className="font-bold text-blue-600">{selectedTimeSlot} - Ngày {bookingDate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Chi phí ước tính:</span>
                <span className="font-bold text-emerald-600">{currentService.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Đặt thêm lịch mới
              </button>
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-md transition"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* CỘT TRÁI: CÁC BƯỚC ĐIỀN FORM (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">

                {/* BƯỚC 1: CHỌN DỊCH VỤ */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Chọn dịch vụ điều trị</h2>
                      <p className="text-xs text-slate-500">Lựa chọn nhu cầu chăm sóc răng miệng của bạn</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {services.map((svc) => {
                      const isSelected = selectedService === svc.id;
                      return (
                        <div
                          key={svc.id}
                          onClick={() => setSelectedService(svc.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                              : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <span className="text-2xl mt-0.5">{svc.icon}</span>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                {svc.name}
                              </h3>
                              <input
                                type="radio"
                                name="service"
                                checked={isSelected}
                                onChange={() => setSelectedService(svc.id)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs">
                              <span className="font-extrabold text-blue-600">{svc.price}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock size={12} /> {svc.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BƯỚC 2: CHỌN BÁC SĨ */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Chọn bác sĩ khám (Tùy chọn)</h2>
                      <p className="text-xs text-slate-500">Đội ngũ bác sĩ giàu kinh nghiệm tại ZenBooking</p>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-700 mb-2" htmlFor="doctor-select">
                      Bác sĩ chỉ định:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Stethoscope size={18} />
                      </div>
                      <select
                        id="doctor-select"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="block w-full pl-11 pr-10 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 3: CHỌN NGÀY VÀ GIỜ KHÁM */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      3
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Chọn ngày & Khung giờ khám</h2>
                      <p className="text-xs text-slate-500">Hệ thống hiển thị các khung giờ còn trống</p>
                    </div>
                  </div>

                  {/* Input chọn ngày */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-2" htmlFor="booking-date">
                      Ngày khám mong muốn:
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        id="booking-date"
                        type="date"
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Slot buổi sáng */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                        🌅 Khung giờ buổi sáng
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {morningSlots.map((time) => {
                          const isActive = selectedTimeSlot === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTimeSlot(time)}
                              className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slot buổi chiều */}
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                        🌇 Khung giờ buổi chiều & tối
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {afternoonSlots.map((time) => {
                          const isActive = selectedTimeSlot === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTimeSlot(time)}
                              className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 4: THÔNG TIN BỆNH NHÂN & GHI CHÚ */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      4
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Thông tin người khám & Triệu chứng</h2>
                      <p className="text-xs text-slate-500">Thông tin dùng để phòng khám liên hệ gửi mã lịch hẹn</p>
                    </div>
                  </div>

                  {formError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-600">
                      <AlertCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="name">
                        Họ và tên bệnh nhân <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User size={16} />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Ví dụ: Trần Hồng Đức"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="phone">
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone size={16} />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="Ví dụ: 0987654321"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="note">
                      Mô tả tình trạng răng / Ghi chú thêm
                    </label>
                    <textarea
                      id="note"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Tôi thường xuyên bị ê buốt răng hàm dưới khi uống nước đá, hoặc có tiền sử dị ứng thuốc tê..."
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: SUMMARY TỔNG KẾT & SUBMIT (4 Cols Sticky) */}
              <div className="lg:col-span-4 sticky top-28">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <span>Tóm tắt lịch hẹn</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Bệnh nhân
                    </span>
                  </h3>

                  <div className="py-4 space-y-3.5 text-xs text-slate-600 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Dịch vụ điều trị:</span>
                      <span className="font-bold text-slate-800 text-sm">{currentService.name}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Bác sĩ phụ trách:</span>
                      <span className="font-medium text-slate-800">{currentDoctor.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Ngày khám:</span>
                        <span className="font-bold text-slate-800">{bookingDate}</span>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                        <span className="text-blue-500 block text-[11px]">Giờ khám:</span>
                        <span className="font-extrabold text-blue-700 text-sm">{selectedTimeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Giá dự kiến */}
                  <div className="py-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Chi phí dự kiến:</span>
                      <span className="text-lg font-black text-blue-600">{currentService.price}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      Thanh toán tại quầy
                    </span>
                  </div>

                  {/* Nút Submit */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Xác nhận đặt lịch</span>
                    <ArrowRight size={16} />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center mt-3">
                    Bằng việc xác nhận, bạn đồng ý với chính sách tiếp nhận và bảo mật y tế của ZenBooking.
                  </p>
                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default BookingPage;
