import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  ChevronRight, 
  Star,
  CheckCircle,
  PhoneCall
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  // LandingPage chỉ dành cho người CHƯA đăng nhập. Nếu đã đăng nhập, tự động chuyển về dashboard phù hợp.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    if (token) {
      if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/patient-home', { replace: true });
      }
    }
  }, [navigate]);
  // Danh sách các dịch vụ nổi bật
  const services = [
    {
      id: 1,
      title: 'Cạo Vôi & Đánh Bóng',
      icon: '✨',
      price: 'Từ 200.000đ',
      description: 'Làm sạch mảng bám, vôi răng bằng công nghệ sóng siêu âm êm ái, mang lại hơi thở thơm tho.',
      tag: 'Phổ biến',
    },
    {
      id: 2,
      title: 'Tẩy Trắng Răng Laser',
      icon: '💎',
      price: 'Từ 1.500.000đ',
      description: 'Bật từ 2-3 tông chỉ sau 45 phút với công nghệ Laser Whitening độc quyền, an toàn men răng.',
      tag: 'Bán chạy',
    },
    {
      id: 3,
      title: 'Nhổ Răng Khôn Siêu Âm',
      icon: '🩺',
      price: 'Từ 800.000đ',
      description: 'Công nghệ nhổ răng Piezotome không đau, không sưng, lành thương nhanh chóng trong 24h.',
      tag: 'Không đau',
    },
    {
      id: 4,
      title: 'Niềng Răng Thẩm Mỹ',
      icon: '😁',
      price: 'Từ 18.000.000đ',
      description: 'Niềng răng mắc cài hoặc khay trong suốt Invisalign, lập phác đồ dịch chuyển răng 3D chuẩn xác.',
      tag: 'Trả góp 0%',
    },
  ];

  // Lý do chọn ZenBooking
  const features = [
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: 'Bác Sĩ Chuyên Khoa Đầu Ngành',
      desc: '100% Bác sĩ tốt nghiệp Đại học Y Dược, có chứng chỉ hành nghề và trên 10 năm kinh nghiệm.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Thiết Bị Vô Trùng Chuẩn Y Tế',
      desc: 'Hệ thống phòng vô trùng một chiều, mỗi khách hàng một bộ dụng cụ riêng biệt tuyệt đối.',
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: 'Đặt Lịch Thông Minh 24/7',
      desc: 'Chủ động chọn bác sĩ và khung giờ còn trống trong tích tắc, không cần bốc số xếp hàng.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Cột văn bản */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles size={14} className="text-blue-600" />
                Công nghệ nha khoa không đau 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Nụ cười rạng rỡ, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Tự tin tỏa sáng
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                ZenBooking cung cấp giải pháp chăm sóc răng miệng toàn diện. Đặt lịch khám trực tuyến nhanh chóng, 
                chọn bác sĩ yêu thích và theo dõi hồ sơ bệnh án số hóa trực quan.
              </p>

              {/* Nút Call To Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Calendar size={18} />
                  Đặt lịch khám ngay
                </Link>
                <a
                  href="#services"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition"
                >
                  Xem bảng giá dịch vụ
                </a>
              </div>

              {/* Số liệu thống kê */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">10k+</div>
                  <div className="text-xs text-slate-500">Khách hàng tin tưởng</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">15+</div>
                  <div className="text-xs text-slate-500">Bác sĩ chuyên khoa</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">99.8%</div>
                  <div className="text-xs text-slate-500">Đánh giá hài lòng</div>
                </div>
              </div>
            </div>

            {/* Cột minh họa / Banner Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 overflow-hidden">
                  <div className="w-full h-64 sm:h-72 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex flex-col justify-center items-center text-white p-6 text-center relative overflow-hidden shadow-inner">
                    <div className="text-7xl mb-4 animate-bounce">✨🦷✨</div>
                    <h3 className="text-xl font-bold mb-1">ZenBooking Dental Care</h3>
                    <p className="text-xs text-blue-100">Chuẩn chất lượng Quốc tế - Giá niêm yết minh bạch</p>
                  </div>

                  {/* Card đánh giá nổi bật */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">Trải nghiệm 5 sao</div>
                      <div className="text-[11px] text-slate-500">Không đau - Không chờ đợi</div>
                    </div>
                    <Link
                      to="/booking"
                      className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Dịch vụ nha khoa
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dịch Vụ Nổi Bật Tại ZenBooking
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Ứng dụng công nghệ hiện đại mang lại kết quả điều trị tối ưu và nụ cười tự nhiên, khỏe đẹp nhất.
          </p>
        </div>

        {/* Lưới Grid Dịch vụ (1 cột mobile, 2 cột tablet, 4 cột PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400 mb-1">Chi phí ước tính:</div>
                <div className="text-base font-extrabold text-blue-600 mb-4">{item.price}</div>
                <Link
                  to="/booking"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Đặt lịch khám <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TẠI SAO CHỌN ZENBOOKING */}
      <section id="about" className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Tại Sao Bạn Nên Chọn ZenBooking?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Chúng tôi luôn đặt trải nghiệm và sự an tâm của người bệnh lên hàng đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BANNER KÊU GỌI HÀNH ĐỘNG CUỐI TRANG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 sm:p-12 shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sẵn sàng cho một nụ cười rạng ngời?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Đặt lịch khám ngay hôm nay để nhận tư vấn miễn phí cùng đội ngũ bác sĩ chuyên khoa răng hàm mặt giàu kinh nghiệm.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm shadow hover:bg-blue-50 transition transform hover:-translate-y-0.5"
            >
              <Calendar size={16} />
              Đặt hẹn trực tuyến
            </Link>
            <a
              href="tel:19008888"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm border border-blue-400/30 transition"
            >
              <PhoneCall size={16} />
              Hotline 1900 8888
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
