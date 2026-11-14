import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Stethoscope, 
  AlertCircle, 
  Calendar, 
  Clock, 
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { getClinicalPresetByService, CLINICAL_PRESETS, formatClinicalNotes } from '../../utils/clinicalHelpers';

export const CompleteAppointmentModal = ({ isOpen, onClose, appointment, onComplete, isSubmitting }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [reExam, setReExam] = useState('');
  const [prescription, setPrescription] = useState([]);

  // Khởi tạo form khi modal mở hoặc appointment thay đổi
  useEffect(() => {
    if (appointment && isOpen) {
      // Nếu đã có notes dạng JSON từ trước, load nó
      if (appointment.notes) {
        try {
          const parsed = JSON.parse(appointment.notes);
          if (parsed && typeof parsed === 'object') {
            setDiagnosis(parsed.diagnosis || '');
            setAdvice(parsed.advice || '');
            setReExam(parsed.reExam || '');
            setPrescription(Array.isArray(parsed.prescription) ? parsed.prescription : []);
            return;
          }
        } catch (e) {
          // Bỏ qua nếu không phải JSON
        }
      }

      // Load smart template mặc định theo dịch vụ của ca khám
      const preset = getClinicalPresetByService(appointment.serviceName);
      setDiagnosis(preset.diagnosis);
      setAdvice(preset.advice);
      setReExam(preset.reExam);
      setPrescription([...preset.prescription.map(p => ({ ...p }))]);
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  // Thêm dòng thuốc mới
  const handleAddMedicine = () => {
    setPrescription([
      ...prescription,
      { name: '', qty: '10 viên', dose: '1 viên x 2 lần/ngày (sau ăn)', usage: '' }
    ]);
  };

  // Cập nhật từng trường của dòng thuốc
  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescription];
    updated[index] = { ...updated[index], [field]: value };
    setPrescription(updated);
  };

  // Xóa 1 dòng thuốc
  const handleRemoveMedicine = (index) => {
    setPrescription(prescription.filter((_, idx) => idx !== index));
  };

  // Áp dụng mẫu đơn thuốc nhanh
  const handleApplyPreset = (presetKey) => {
    const preset = CLINICAL_PRESETS[presetKey];
    if (preset) {
      setDiagnosis(preset.diagnosis);
      setAdvice(preset.advice);
      setReExam(preset.reExam);
      setPrescription([...preset.prescription.map(p => ({ ...p }))]);
    }
  };

  // Submit hoàn thành ca khám
  const handleSubmit = (e) => {
    e.preventDefault();
    const clinicalNotes = formatClinicalNotes({
      diagnosis,
      advice,
      reExam,
      prescription
    });
    onComplete(appointment.id, clinicalNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Hoàn Tất Ca Khám & Kê Đơn Thuốc</h3>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">
                  {appointment.appointmentCode}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-white">{appointment.patientName}</span>
                <span>•</span>
                <span>SĐT: {appointment.patientPhone}</span>
                <span>•</span>
                <span className="bg-white/10 px-1.5 py-0.2 rounded text-[11px]">{appointment.serviceName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs text-slate-600">
          <div className="flex items-center gap-1 font-semibold text-blue-700 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mẫu toa nhanh:</span>
          </div>
          <button
            type="button"
            onClick={() => handleApplyPreset('SURGERY')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition font-medium shrink-0 cursor-pointer text-[11px]"
          >
            Nhổ răng / Tiểu phẫu
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('CLEANING')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition font-medium shrink-0 cursor-pointer text-[11px]"
          >
            Cạo vôi răng
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('WHITENING')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition font-medium shrink-0 cursor-pointer text-[11px]"
          >
            Tẩy trắng răng
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('ORTHO')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition font-medium shrink-0 cursor-pointer text-[11px]"
          >
            Niềng răng
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('GENERAL')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition font-medium shrink-0 cursor-pointer text-[11px]"
          >
            Khám tổng quát
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1">
          {/* 1. Chẩn đoán lâm sàng */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. Chẩn đoán lâm sàng & Thủ thuật đã thực hiện:</span>
            </label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Nhập kết quả thăm khám, chẩn đoán chi tiết và thủ thuật nha khoa đã làm..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              required
            />
          </div>

          {/* 2. Đơn thuốc kê cho bệnh nhân */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-purple-600" />
                <span>2. Đơn thuốc điều trị ({prescription.length} loại):</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold border border-purple-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thuốc</span>
              </button>
            </div>

            {prescription.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Chưa kê thuốc nào. Bấm "Thêm thuốc" hoặc chọn mẫu toa ở trên.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/30">
                {prescription.map((med, idx) => (
                  <div key={idx} className="p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
                    <span className="w-5 text-center font-bold text-slate-400 text-[11px] shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Tên thuốc (VD: Augmentin 1g)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="flex-1 w-full sm:w-auto p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="SL (VD: 10 viên)"
                      value={med.qty}
                      onChange={(e) => handleMedicineChange(idx, 'qty', e.target.value)}
                      className="w-24 p-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-blue-500 focus:outline-none text-center"
                    />
                    <input
                      type="text"
                      placeholder="Liều dùng & Cách uống"
                      value={med.dose}
                      onChange={(e) => handleMedicineChange(idx, 'dose', e.target.value)}
                      className="flex-1 w-full sm:w-auto p-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Công dụng (VD: Kháng sinh)"
                      value={med.usage}
                      onChange={(e) => handleMedicineChange(idx, 'usage', e.target.value)}
                      className="w-32 p-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-blue-500 focus:outline-none text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Xóa thuốc này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Lời dặn dò y khoa */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>3. Lời dặn dò chăm sóc & Kiêng cữ:</span>
            </label>
            <textarea
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Dặn dò chế độ vệ sinh răng miệng, kiêng ăn uống, xử lý sưng đau..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
            />
          </div>

          {/* 4. Hẹn ngày tái khám */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>4. Lịch hẹn tái khám:</span>
            </label>
            <input
              type="text"
              value={reExam}
              onChange={(e) => setReExam(e.target.value)}
              placeholder="VD: Tái khám sau 7 ngày để cắt chỉ, hoặc kiểm tra sau 6 tháng"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu bệnh án...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu bệnh án & Hoàn tất ca khám</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

