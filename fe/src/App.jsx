import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
          🦷
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ZenBooking</h1>
        <p className="text-sm text-slate-600 mb-6">
          Hệ thống quản lý và đặt lịch khám nha khoa thông minh.
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          ● Cấu trúc Frontend đã sẵn sàng
        </div>
      </div>
    </div>
  );
}

export default App;
