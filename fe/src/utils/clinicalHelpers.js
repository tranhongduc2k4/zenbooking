// Utility functions & smart clinical presets for dental examinations & prescriptions

export const CLINICAL_PRESETS = {
  SURGERY: {
    label: 'Nhổ răng & Tiểu phẫu / Implant',
    diagnosis: 'Chỉ định tiểu phẫu nhổ răng/cấy ghép implant hoàn tất thuận lợi, ổ răng sạch và đã cầm máu tốt.',
    advice: 'Cắn chặt gạc bông trong 45 phút đầu. Tuyệt đối không súc miệng mạnh, không khạc nhổ hoặc dùng ống hút trong 24 giờ. Chườm lạnh ngoài má 15 phút/lần trong ngày đầu. Uống thuốc đúng giờ theo đơn.',
    reExam: 'Tái khám kiểm tra vết thương và cắt chỉ sau 7 ngày.',
    prescription: [
      { name: 'Augmentin 1g (Amoxicillin/Clavulanate)', qty: '10 viên', dose: '1 viên x 2 lần/ngày (sau ăn sáng & tối)', usage: 'Kháng sinh chống nhiễm khuẩn' },
      { name: 'Efferalgan 500mg (Paracetamol)', qty: '10 viên', dose: '1 viên khi đau nhức (cách 4 - 6 giờ)', usage: 'Giảm đau, hạ sốt' },
      { name: 'Nước súc miệng Chlorhexidine 0.12%', qty: '1 chai', dose: 'Súc miệng nhẹ nhàng 15ml x 2-3 lần/ngày', usage: 'Sát khuẩn khoang miệng' }
    ]
  },
  CLEANING: {
    label: 'Cạo vôi răng & Đánh bóng',
    diagnosis: 'Mảng bám vôi răng dưới nướu độ 1-2, nướu viêm nhẹ. Đã làm sạch vôi răng siêu âm và đánh bóng toàn hàm sạch sẽ.',
    advice: 'Đánh răng nhẹ nhàng bằng bàn chải lông mềm 2 lần/ngày. Sử dụng chỉ nha khoa sau mỗi bữa ăn. Tránh đồ ăn quá chua hoặc nước ngọt có ga trong 24 giờ.',
    reExam: 'Khám định kỳ và cạo vôi răng sau 6 tháng.',
    prescription: [
      { name: 'Nước súc miệng Kin Gingival / Fluoride', qty: '1 chai', dose: 'Súc miệng 15ml trong 1 phút x 2 lần/ngày', usage: 'Chống viêm nướu & chắc men' },
      { name: 'Chỉ nha khoa Oral-B Essential', qty: '1 cuộn', dose: 'Vệ sinh các kẽ răng sau bữa ăn', usage: 'Làm sạch mảng bám kẽ răng' }
    ]
  },
  WHITENING: {
    label: 'Tẩy trắng răng & Men răng',
    diagnosis: 'Men răng sậm màu mức độ trung bình. Đã thực hiện tẩy trắng răng Laser Whitening công nghệ cao, nâng 2-3 tông màu sáng.',
    advice: 'Kiêng hoàn toàn thực phẩm và thức uống sẫm màu (cà phê, trà, sốt tương, cari) trong 48 giờ. Tránh đồ uống quá nóng hoặc quá lạnh.',
    reExam: 'Tái khám kiểm tra độ ổn định màu răng sau 2-4 tuần nếu cần.',
    prescription: [
      { name: 'Gel chống ê buốt GC Tooth Mousse', qty: '1 tuýp', dose: 'Thoa 1 lớp mỏng lên mặt răng trước khi ngủ', usage: 'Tái khoáng men răng, chống ê buốt' },
      { name: 'Kem đánh răng Sensodyne Rapid Relief', qty: '1 tuýp', dose: 'Đánh răng 2 lần/ngày', usage: 'Bảo vệ men răng nhạy cảm' }
    ]
  },
  ORTHO: {
    label: 'Niềng răng & Chỉnh nha',
    diagnosis: 'Sai lệch khớp cắn và răng chen chúc. Đã kiểm tra lực siết dây cung, thay thun và kích hoạt lực kéo định kỳ.',
    advice: 'Không cắn xé đồ ăn quá cứng, dai hoặc dính vào mắc cài. Sử dụng sáp nha khoa nếu mắc cài cọ xát niêm mạc má. Vệ sinh bằng bàn chải kẽ.',
    reExam: 'Hẹn tái khám chỉnh nha và thay dây cung sau 3 - 4 tuần.',
    prescription: [
      { name: 'Sáp nha khoa Orthodontic Wax', qty: '1 hộp', dose: 'Đặt một lượng nhỏ lên vị trí mắc cài cọ xát', usage: 'Bảo vệ niêm mạc miệng chống trầy xước' },
      { name: 'Nước súc miệng Ortho Kin', qty: '1 chai', dose: 'Súc miệng 15ml x 2 lần/ngày sau đánh răng', usage: 'Chăm sóc răng niềng, ngừa mảng bám' }
    ]
  },
  GENERAL: {
    label: 'Khám tổng quát & Điều trị phục hồi',
    diagnosis: 'Khám răng miệng định kỳ, phát hiện sâu men sớm mặt nhai. Đã làm sạch và trám phục hồi xoang sâu bằng Composite thẩm mỹ.',
    advice: 'Hạn chế nhai thức ăn quá cứng tại vị trí răng mới trám trong 24 giờ đầu. Đánh răng đúng kỹ thuật 2 lần/ngày.',
    reExam: 'Khám tổng quát và kiểm tra răng miệng định kỳ sau 6 tháng.',
    prescription: [
      { name: 'Nước súc miệng Flouride 0.05%', qty: '1 chai', dose: 'Ngậm súc 15ml trong 1 phút trước khi ngủ', usage: 'Bảo vệ men răng và ngừa sâu răng' }
    ]
  }
};

/**
 * Lấy template mẫu phù hợp với tên dịch vụ
 */
export const getClinicalPresetByService = (serviceName = '') => {
  const s = serviceName.toLowerCase();
  if (s.includes('nhổ') || s.includes('piezotome') || s.includes('implant') || s.includes('tiểu phẫu')) {
    return CLINICAL_PRESETS.SURGERY;
  }
  if (s.includes('tẩy trắng') || s.includes('laser') || s.includes('veneer') || s.includes('sứ')) {
    return CLINICAL_PRESETS.WHITENING;
  }
  if (s.includes('niềng') || s.includes('mắc cài') || s.includes('chỉnh nha') || s.includes('invisalign')) {
    return CLINICAL_PRESETS.ORTHO;
  }
  if (s.includes('cạo vôi') || s.includes('vôi răng') || s.includes('đánh bóng')) {
    return CLINICAL_PRESETS.CLEANING;
  }
  return CLINICAL_PRESETS.GENERAL;
};

/**
 * Parse trường notes của appointment:
 * Nếu là JSON hợp lệ chứa thông tin khám: { diagnosis, advice, reExam, prescription }
 * Nếu là text thường hoặc null: chuyển đổi thành định dạng chuẩn với fallback theo serviceName
 */
export const parseClinicalRecord = (notes, serviceName = '') => {
  const preset = getClinicalPresetByService(serviceName);
  
  if (!notes || !notes.trim()) {
    return {
      isCustom: false,
      diagnosis: preset.diagnosis,
      advice: preset.advice,
      reExam: preset.reExam,
      prescription: preset.prescription,
      rawNotes: ''
    };
  }

  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object') {
      return {
        isCustom: true,
        diagnosis: parsed.diagnosis || preset.diagnosis,
        advice: parsed.advice || preset.advice,
        reExam: parsed.reExam || preset.reExam,
        prescription: Array.isArray(parsed.prescription) && parsed.prescription.length > 0 
          ? parsed.prescription 
          : preset.prescription,
        rawNotes: notes
      };
    }
  } catch (e) {
    // Không phải JSON, là ghi chú text bình thường
  }

  return {
    isCustom: true,
    diagnosis: preset.diagnosis,
    advice: notes, // Sử dụng chuỗi text của bác sĩ làm lời dặn
    reExam: preset.reExam,
    prescription: preset.prescription,
    rawNotes: notes
  };
};

/**
 * Đóng gói dữ liệu khám & kê đơn thuốc thành chuỗi JSON lưu vào notes
 */
export const formatClinicalNotes = ({ diagnosis, advice, reExam, prescription }) => {
  return JSON.stringify({
    diagnosis: diagnosis || '',
    advice: advice || '',
    reExam: reExam || '',
    prescription: Array.isArray(prescription) ? prescription : []
  });
};
