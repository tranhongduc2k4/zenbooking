import React from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Smile, 
  Layers, 
  HeartPulse 
} from 'lucide-react';

/**
 * Hiển thị Icon SVG y tế chuẩn Lucide thay cho các emoji hoạt hình
 */
export const ServiceIcon = ({ service, className = "w-5 h-5", containerClassName = "" }) => {
  const iconKey = (service?.icon || '').toLowerCase();
  const name = (service?.name || service?.title || '').toLowerCase();
  const code = (service?.code || '').toLowerCase();
  const category = (service?.category || '').toLowerCase();

  let IconComponent = HeartPulse;

  // 1. Cạo vôi & Đánh bóng (Làm sạch vôi răng, sóng siêu âm) -> Luôn là Sparkles (Ưu tiên kiểm tra trước Tổng quát)
  if (
    iconKey === 'sparkles' || 
    iconKey === '✨' || 
    name.includes('cạo vôi') || 
    name.includes('đánh bóng') || 
    code.includes('scaling') || 
    code.includes('polishing') ||
    category.includes('vệ sinh')
  ) {
    IconComponent = Sparkles;
  } 
  // 2. Tẩy trắng răng Laser Whitening -> Tia Laser / Tia chớp (Zap)
  else if (
    iconKey === 'zap' || 
    iconKey === 'diamond' || 
    iconKey === '💎' || 
    name.includes('tẩy trắng') || 
    name.includes('laser') || 
    code.includes('whitening') ||
    code.includes('laser') ||
    category.includes('thẩm mỹ')
  ) {
    IconComponent = Zap;
  } 
  // 3. Nhổ răng khôn không đau Piezotome -> ShieldCheck (An toàn, bảo vệ)
  else if (
    iconKey === 'shieldcheck' || 
    iconKey === 'tooth' || 
    iconKey === '🦷' || 
    name.includes('nhổ răng') || 
    name.includes('piezotome') || 
    code.includes('piezotome') ||
    code.includes('extraction') ||
    category.includes('tiểu phẫu')
  ) {
    IconComponent = ShieldCheck;
  } 
  // 4. Niềng răng mắc cài / Khay trong suốt -> Smile (Nụ cười đều đẹp)
  else if (
    iconKey === 'smile' || 
    iconKey === '😁' || 
    name.includes('niềng răng') || 
    name.includes('mắc cài') || 
    name.includes('chỉnh nha') || 
    code.includes('orthodontics') ||
    code.includes('braces') ||
    category.includes('chỉnh nha')
  ) {
    IconComponent = Smile;
  } 
  // 5. Cấy ghép Implant thẩm mỹ -> Layers (Cấu trúc nhiều lớp / Trụ phục hình)
  else if (
    iconKey === 'layers' || 
    iconKey === '🔩' || 
    name.includes('implant') || 
    name.includes('cấy ghép') || 
    code.includes('implant') ||
    category.includes('implant')
  ) {
    IconComponent = Layers;
  } 
  // 6. Khám tổng quát & Tư vấn -> Stethoscope (Ống nghe y tế)
  else if (
    iconKey === 'stethoscope' || 
    iconKey === '🩺' || 
    name.includes('tổng quát') || 
    name.includes('tư vấn') || 
    code.includes('general') ||
    code.includes('exam') ||
    category.includes('tổng quát')
  ) {
    IconComponent = Stethoscope;
  }

  if (containerClassName) {
    return (
      <div className={containerClassName}>
        <IconComponent className={className} />
      </div>
    );
  }

  return <IconComponent className={className} />;
};

export default ServiceIcon;
