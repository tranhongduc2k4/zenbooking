import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, Stethoscope, Calendar, Star } from 'lucide-react';
import authApi from '../../services/authApi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('expired') ? 'Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại để tiếp tục!' : '';
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authApi.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      if (res.token) localStorage.setItem('access_token', res.token);
      if (res.role) localStorage.setItem('user_role', res.role);
      localStorage.setItem('user', JSON.stringify(res));

      const userRole = res.role;
      if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN' || userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR') {
        navigate('/admin');
      } else {
        navigate('/patient-home');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác!';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Calendar, text: 'Đặt lịch nha khoa 24/7' },
    { icon: Stethoscope, text: 'Đội ngũ bác sĩ chuyên nghiệp' },
    { icon: Star, text: 'Tích điểm ZenZen Rewards' },
    { icon: ShieldCheck, text: 'Bảo mật thông tin y tế' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Panel trái - Brand */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <span className="text-xl">🦷</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ZenBooking</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Chăm sóc nụ cười<br />
            <span className="text-cyan-300">của bạn</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Hệ thống đặt lịch nha khoa thông minh, giúp bạn chủ động trong việc chăm sóc sức khỏe răng miệng.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-50 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">2,500+ bệnh nhân tin tưởng</p>
              <p className="text-blue-200 text-xs">Tỷ lệ hài lòng 98%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel phải - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-xl">🦷</span>
            </div>
            <span className="text-xl font-bold text-slate-800">ZenBooking</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Chào mừng trở lại!</h2>
            <p className="text-slate-500 text-sm">Đăng nhập vào tài khoản ZenBooking của bạn</p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="identifier">
                Số điện thoại hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Nhập SĐT hoặc Email..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
                <a href="#forgot" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bảo mật thông tin chuẩn y tế • ZenBooking Dental</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
