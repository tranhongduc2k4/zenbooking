import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  RefreshCw,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck
} from 'lucide-react';
import authApi from '../services/authApi';

const UserAccountDropdown = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // State cho Modal Login thêm tài khoản
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [addAccountData, setAddAccountData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'ZB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const currentRole = localStorage.getItem('user_role') || currentUser?.role;
  const isDoctorRole = currentRole === 'ROLE_DOCTOR' || currentRole === 'DOCTOR';
  const isAdminRole = currentRole === 'ROLE_ADMIN' || currentRole === 'ADMIN';

  const roleLabel = isDoctorRole 
    ? 'Bác sĩ điều trị' 
    : isAdminRole 
    ? 'Quản trị viên' 
    : 'Bệnh nhân thân thiết';

  // Xử lý đăng nhập từ Modal Thêm tài khoản
  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    if (!addAccountData.identifier.trim() || !addAccountData.password) {
      setLoginError('Vui lòng nhập đầy đủ SĐT/Email và mật khẩu!');
      return;
    }

    setLoginError('');
    try {
      setIsLoggingIn(true);
      const res = await authApi.login({
        identifier: addAccountData.identifier.trim(),
        password: addAccountData.password,
      });

      if (res && res.token) {
        localStorage.setItem('access_token', res.token);
        localStorage.setItem('user_role', res.role);
        localStorage.setItem('user', JSON.stringify(res));

        setShowAddAccountModal(false);
        setIsOpen(false);

        if (res.role === 'ROLE_ADMIN' || res.role === 'ADMIN' || res.role === 'ROLE_DOCTOR' || res.role === 'DOCTOR') {
          navigate('/admin');
        } else {
          navigate('/patient-home');
        }
        window.location.reload();
      } else {
        setLoginError('Không nhận được thông tin xác thực từ máy chủ.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập thêm tài khoản:', err);
      setLoginError(err.response?.data?.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Pill Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ${
            isDoctorRole 
              ? 'bg-teal-100 text-teal-700 ring-teal-50' 
              : isAdminRole
              ? 'bg-purple-100 text-purple-700 ring-purple-50'
              : 'bg-blue-100 text-blue-700 ring-blue-50'
          }`}>
            {getInitials(currentUser?.fullName)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-[13px] font-semibold text-slate-800 leading-tight">
              {currentUser?.fullName || 'Người dùng'}
            </span>
            <span className="block text-[11px] text-slate-500 font-medium">
              {roleLabel}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-scaleUp">
            {/* Header: Thông tin tài khoản đang đăng nhập */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs bg-gradient-to-tr ${
                isDoctorRole 
                  ? 'from-teal-500 to-cyan-600' 
                  : isAdminRole 
                  ? 'from-purple-500 to-indigo-600' 
                  : 'from-blue-500 to-indigo-600'
              }`}>
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.fullName || 'Người dùng'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {currentUser?.phone || currentUser?.email || 'Đang đăng nhập'}
                </div>
                <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  {roleLabel}
                </div>
              </div>
            </div>

            {/* Section: Thêm tài khoản */}
            <div className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setLoginError('');
                  setAddAccountData({ identifier: '', password: '' });
                  setShowAddAccountModal(true);
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-blue-600 hover:bg-blue-50/80 active:bg-blue-100/80 transition-colors cursor-pointer border border-dashed border-blue-200"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-700">
                    + Thêm tài khoản khác
                  </div>
                  <div className="text-[11px] text-blue-500">
                    Đăng nhập tài khoản Bác sĩ, Admin, Bệnh nhân
                  </div>
                </div>
              </button>
            </div>

            {/* Footer: Đăng xuất */}
            <div className="pt-2 px-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất khỏi thiết bị này</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL ĐĂNG NHẬP THÊM TÀI KHOẢN (Add Account Login Modal) */}
      {/* ========================================================= */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Thêm tài khoản</h3>
              <p className="text-xs text-blue-100 mt-1">
                Đăng nhập tài khoản Bác sĩ, Quản trị viên hoặc Bệnh nhân khác.
              </p>
            </div>

            {/* Modal Body: Form Login */}
            <form onSubmit={handleAddAccountSubmit} className="p-6 space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Input SĐT / Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số điện thoại hoặc Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 0901234567 hoặc email..."
                    value={addAccountData.identifier}
                    onChange={(e) => setAddAccountData({ ...addAccountData, identifier: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Input Mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={addAccountData.password}
                    onChange={(e) => setAddAccountData({ ...addAccountData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <span>Đăng nhập & Chuyển</span>
                  )}
                </button>
              </div>

              {/* Note an toàn */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật JWT chuẩn y tế • ZenBooking Dental</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAccountDropdown;
