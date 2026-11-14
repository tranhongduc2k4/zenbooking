import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Container chính */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Header / Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
            <span className="text-3xl">🦷</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Chào mừng trở lại!</h2>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập vào tài khoản ZenBooking của bạn</p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Số điện thoại hoặc Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="identifier">
              Số điện thoại hoặc Email <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Nhập SĐT hoặc Email..."
                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Input Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <a href="#forgot" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Chuyển hướng sang đăng ký */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Đăng ký ngay
          </Link>
        </div>

        {/* Footer bảo mật chuẩn y tế */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={15} className="text-emerald-500" />
          <span>Bảo mật thông tin chuẩn y tế • ZenBooking Dental</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
