import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export const AdminPlaceholderPage = ({ title, description, icon: Icon = Construction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          {title || 'Chức năng đang được hoàn thiện'}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {description || 'Module này nằm trong giai đoạn phát triển tiếp theo của hệ thống nha khoa ZenBooking. Các dữ liệu sẽ sớm được đồng bộ trực tiếp.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Tổng quan</span>
          </Link>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <span>Xem Quản lý lịch hẹn</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPlaceholderPage;

