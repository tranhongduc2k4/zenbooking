import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  ShieldAlert, 
  Check, 
  LogOut, 
  ChevronDown, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import authApi from '../services/authApi';

// Danh sách các tài khoản chuyển đổi nhanh (Preset accounts cho Demo & Pair-testing)
const PRESET_ACCOUNTS = [
  {
    role: 'PATIENT',
    label: 'Bệnh nhân',
    name: 'Trần Hồng Đức',
    identifier: '0792275635_demo',
    password: 'password123',
    badge: 'Bệnh nhân thân thiết',
    icon: User,
    color: 'from-blue-500 to-indigo-600',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    role: 'DOCTOR',
    label: 'Bác sĩ điều trị',
    name: 'BS. Trần Minh Tuấn',
    identifier: '0901234567',
    password: 'password123',
    badge: 'Chuyên khoa Nha Chu',
    icon: Stethoscope,
    color: 'from-teal-500 to-cyan-600',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    role: 'ADMIN',
    label: 'Quản trị viên',
    name: 'Admin Quản Trị Viên',
    identifier: '0909999888',
    password: 'password123',
    badge: 'Quản lý phòng khám',
    icon: ShieldAlert,
    color: 'from-purple-500 to-indigo-700',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

const UserAccountDropdown = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSwitch = async (account) => {
    try {
      setIsSwitching(true);
      const res = await authApi.login({
        identifier: account.identifier,
        password: account.password,
      });

      if (res && res.token) {
        localStorage.setItem('access_token', res.token);
        localStorage.setItem('user_role', res.role);
        localStorage.setItem('user', JSON.stringify(res));

        setIsOpen(false);

        // Điều hướng theo vai trò mới
        if (res.role === 'ROLE_ADMIN' || res.role === 'ADMIN' || res.role === 'ROLE_DOCTOR' || res.role === 'DOCTOR') {
          navigate('/admin');
        } else {
          navigate('/patient-home');
        }
        window.location.reload(); // Reload để nạp mới toàn bộ state và layout
      }
    } catch (err) {
      console.error('Lỗi khi chuyển đổi tài khoản:', err);
      alert('Không thể chuyển đổi tài khoản: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSwitching(false);
    }
  };

  return (
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
          {/* Header Thông tin tài khoản hiện tại */}
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

          {/* Section: Chuyển đổi tài khoản (Switch Account) */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Chuyển đổi tài khoản (Switch)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            {PRESET_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isCurrent = (
                (acc.role === 'PATIENT' && !isDoctorRole && !isAdminRole) ||
                (acc.role === 'DOCTOR' && isDoctorRole) ||
                (acc.role === 'ADMIN' && isAdminRole)
              );

              return (
                <button
                  key={acc.role}
                  type="button"
                  disabled={isSwitching || isCurrent}
                  onClick={() => handleSwitch(acc)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-50 border border-slate-200/80 cursor-default'
                      : 'hover:bg-slate-100/80 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 bg-gradient-to-tr ${acc.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="truncate">{acc.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${acc.tagColor}`}>
                          {acc.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {acc.badge}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading indicator khi chuyển đổi */}
          {isSwitching && (
            <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang chuyển quyền đăng nhập...</span>
            </div>
          )}

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
  );
};

export default UserAccountDropdown;
