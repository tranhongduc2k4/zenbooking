import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Calendar, Phone, Clock, MapPin, Menu, X, Shield, ChevronRight } from 'lucide-react';

const PatientLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header thông tin nhanh */}
      <div className="bg-blue-900 text-blue-100 text-xs py-2 px-4 sm:px-8 border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-blue-300" /> Hotline: 1900 8888 (24/7)
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock size={13} className="text-blue-300" /> Giờ làm việc: 08:00 - 20:00 (Hàng ngày)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-blue-200">Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</span>
            <Link to="/login" className="hover:text-white underline font-medium">Cổng Bác sĩ / Quản trị</Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar chính */}
      <nav className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                🦷
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Zen<span className="text-blue-600">Booking</span>
                </span>
                <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
                  Dental Clinic & Care
                </span>
              </div>
            </Link>

            {/* Menu Links trên Desktop */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
              <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                Trang chủ
              </Link>
              <a href="#services" className="hover:text-blue-600 transition-colors">
                Dịch vụ nha khoa
              </a>
              <Link to="/booking" className="hover:text-blue-600 transition-colors">
                Lịch khám
              </Link>
              <a href="#about" className="hover:text-blue-600 transition-colors">
                Về chúng tôi
              </a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">
                Liên hệ
              </a>
            </div>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Calendar size={16} />
                Đặt lịch khám ngay
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-blue-600"
            >
              Trang chủ
            </Link>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
            >
              Dịch vụ nha khoa
            </a>
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
            >
              Đặt lịch khám
            </Link>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow"
              >
                Đặt lịch khám ngay
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Nội dung chính của từng trang */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer chung */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Giới thiệu */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
                  🦷
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Zen<span className="text-blue-400">Booking</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hệ thống phòng khám nha khoa tiêu chuẩn quốc tế. Chăm sóc tận tâm, công nghệ hiện đại kiến tạo nụ cười hoàn mỹ.
              </p>
              <div className="flex items-center space-x-2 text-xs text-emerald-400">
                <Shield size={16} />
                <span>Giấy phép hoạt động Sở Y Tế cấp</span>
              </div>
            </div>

            {/* Col 2: Dịch vụ */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dịch vụ nổi bật</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#services" className="hover:text-white transition">Cạo vôi & Đánh bóng răng</a></li>
                <li><a href="#services" className="hover:text-white transition">Tẩy trắng răng công nghệ Laser</a></li>
                <li><a href="#services" className="hover:text-white transition">Nhổ răng khôn không đau</a></li>
                <li><a href="#services" className="hover:text-white transition">Niềng răng trong suốt & Mắc cài</a></li>
                <li><a href="#services" className="hover:text-white transition">Cấy ghép Implant thẩm mỹ</a></li>
              </ul>
            </div>

            {/* Col 3: Giờ làm việc */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thời gian khám bệnh</h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex justify-between">
                  <span>Thứ 2 - Thứ 6:</span>
                  <span className="text-white font-medium">08:00 - 20:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Thứ 7 - Chủ Nhật:</span>
                  <span className="text-white font-medium">08:00 - 18:00</span>
                </li>
                <li className="text-xs text-amber-400 pt-2">
                  * Khuyến khích đặt lịch hẹn trước để không phải chờ đợi.
                </li>
              </ul>
            </div>

            {/* Col 4: Liên hệ & Hotline */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Thông tin liên hệ</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start space-x-2.5">
                  <MapPin size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Phone size={18} className="text-blue-400 flex-shrink-0" />
                  <span className="text-white font-semibold">1900 8888 / 0987 654 321</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Clock size={18} className="text-blue-400 flex-shrink-0" />
                  <span>zenbooking.clinic@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>© 2026 ZenBooking Dental Clinic. Bản quyền thuộc về tranhongduc2k4.</p>
            <div className="flex space-x-6">
              <a href="#privacy" className="hover:text-slate-400">Chính sách bảo mật</a>
              <a href="#terms" className="hover:text-slate-400">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;
