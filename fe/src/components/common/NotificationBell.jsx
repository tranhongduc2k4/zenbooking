import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  X,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBell = ({ theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  const { 
    notifications, 
    unreadCount, 
    loading, 
    activeToast, 
    setActiveToast, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format thời gian tương đối thân thiện
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Vừa xong';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Cấu hình Icon & Màu sắc theo từng loại thông báo y tế
  const getNotificationVisuals = (type) => {
    switch (type) {
      case 'APPOINTMENT_NEW':
        return {
          icon: <Calendar className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-100',
          badgeText: 'Lịch mới',
          badgeColor: 'bg-blue-100 text-blue-700',
        };
      case 'APPOINTMENT_CONFIRMED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
          badgeText: 'Đã xác nhận',
          badgeColor: 'bg-emerald-100 text-emerald-700',
        };
      case 'APPOINTMENT_COMPLETED':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-100',
          badgeText: 'Hoàn thành',
          badgeColor: 'bg-purple-100 text-purple-700',
        };
      case 'APPOINTMENT_CANCELLED':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-100',
          badgeText: 'Hủy hẹn',
          badgeColor: 'bg-rose-100 text-rose-700',
        };
      case 'SYSTEM_REMINDER':
      default:
        return {
          icon: <Bell className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
          badgeText: 'Nhắc hẹn',
          badgeColor: 'bg-amber-100 text-amber-700',
        };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Nút Chuông Thông báo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
          isOpen
            ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20'
            : theme === 'dark'
            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
        }`}
        title="Thông báo hệ thống"
      >
        <Bell className="w-5 h-5" />

        {/* Chấm đỏ / Badge số lượng chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-md shadow-red-500/30 ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 pt-2 gap-4 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 transition-colors relative cursor-pointer ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2 transition-colors relative cursor-pointer ${
                filter === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Chưa có thông báo nào</p>
                <p className="text-xs text-slate-400 mt-1">
                  {filter === 'unread' ? 'Bạn đã đọc toàn bộ thông báo!' : 'Các cập nhật lịch hẹn sẽ hiển thị ở đây.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const visuals = getNotificationVisuals(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors group flex gap-3 relative ${
                      !notif.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Visual Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${visuals.bg}`}>
                      {visuals.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${visuals.badgeColor}`}>
                          {visuals.badgeText}
                        </span>
                        {notif.referenceCode && (
                          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1 rounded">
                            {notif.referenceCode}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>

                    {/* Thao tác nhanh bên phải */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Dấu chấm xanh báo chưa đọc */}
                    {!notif.read && (
                      <span className="absolute bottom-3 right-3 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              ⚡ Hệ thống thông báo thời gian thực ZenBooking Dental
            </span>
          </div>
        </div>
      )}

      {/* Floating Real-time Toast Banner (hiển thị góc trên khi có SSE event mới) */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 animate-in slide-in-from-top duration-300 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Thông báo mới</span>
              <button
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">{activeToast.title}</h5>
            <p className="text-xs text-slate-600 mt-1 leading-snug line-clamp-2">{activeToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
