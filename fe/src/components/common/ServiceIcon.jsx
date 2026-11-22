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
  const iconKey = service?.icon?.toLowerCase() || '';
  const name = service?.name?.toLowerCase() || service?.title?.toLowerCase() || '';
  const category = service?.category?.toLowerCase() || '';

  let IconComponent = HeartPulse;

  if (
    iconKey === 'stethoscope' || 
    name.includes('tổng quát') || 
    name.includes('tư vấn') || 
    category.includes('tổng quát')
  ) {
    IconComponent = Stethoscope;
  } else if (
    iconKey === 'sparkles' || 
    name.includes('cạo vôi') || 
    name.includes('đánh bóng') || 
    category.includes('vệ sinh')
  ) {
    IconComponent = Sparkles;
  } else if (
    iconKey === 'zap' || 
    iconKey === 'diamond' || 
    name.includes('tẩy trắng') || 
    name.includes('laser') || 
    category.includes('thẩm mỹ')
  ) {
    IconComponent = Zap;
  } else if (
    iconKey === 'shieldcheck' || 
    name.includes('nhổ răng') || 
    name.includes('piezotome') || 
    category.includes('tiểu phẫu')
  ) {
    IconComponent = ShieldCheck;
  } else if (
    iconKey === 'smile' || 
    name.includes('niềng răng') || 
    name.includes('chỉnh nha') || 
    category.includes('chỉnh nha')
  ) {
    IconComponent = Smile;
  } else if (
    iconKey === 'layers' || 
    name.includes('implant') || 
    category.includes('implant')
  ) {
    IconComponent = Layers;
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
