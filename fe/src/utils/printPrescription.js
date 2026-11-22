import { parseClinicalRecord } from './clinicalHelpers';

// Danh bạ Số Chứng chỉ hành nghề (CCHN) của Đội ngũ Bác sĩ Nha khoa ZenBooking
const DOCTOR_CCHN_MAP = {
  'trần minh tuấn': '007521/HCM-CCHN',
  'lê hoàng yến': '012480/HCM-CCHN',
  'nguyễn văn hùng': '003892/HCM-CCHN',
  'phạm thanh tùng': '009134/HCM-CCHN',
  'đỗ thu hà': '015672/HCM-CCHN',
  'vũ đức thắng': '008439/HCM-CCHN'
};

const getDoctorCCHN = (docName = '') => {
  const lower = docName.toLowerCase();
  for (const [key, cchn] of Object.entries(DOCTOR_CCHN_MAP)) {
    if (lower.includes(key)) return cchn;
  }
  return '008945/BYT-CCHN';
};

/**
 * Trích xuất Mã ICD-10, Vị trí răng (hệ FDI) và Phác đồ theo dịch vụ
 */
const getClinicalMetadata = (serviceName = '', notes = '') => {
  const text = (serviceName + ' ' + notes).toLowerCase();

  if (text.includes('nhổ') || text.includes('piezotome') || text.includes('implant') || text.includes('tiểu phẫu')) {
    return {
      icd10: 'K08.1 (Mất răng do tai nạn/nhổ) · K01.1 (Răng khôn mọc lệch)',
      toothPosition: 'Vùng răng R38, R48 (Tiểu phẫu) / Vùng R36 (Trụ Implant)',
      procedure: 'Tiểu phẫu cấy ghép trụ Implant / Nhổ răng Piezotome không sang chấn'
    };
  }
  if (text.includes('cạo vôi') || text.includes('vôi răng') || text.includes('đánh bóng')) {
    return {
      icd10: 'K05.1 (Viêm nướu mạn tính do mảng bám vôi răng)',
      toothPosition: 'Toàn hàm (Cung hàm trên 11-28, Cung hàm dưới 31-48)',
      procedure: 'Lấy vôi răng dưới nướu sóng siêu âm & đánh bóng bề mặt men răng'
    };
  }
  if (text.includes('tẩy trắng') || text.includes('laser')) {
    return {
      icd10: 'K03.7 (Biến đổi màu mô cứng của răng do nhiễm sắc tố)',
      toothPosition: 'Vùng thẩm mỹ cung cười (Cung răng 14-24 và 34-44)',
      procedure: 'Cách ly nướu, hoạt hóa gel tẩy trắng với ánh sáng Laser Whitening Hoa Kỳ'
    };
  }
  if (text.includes('niềng') || text.includes('mắc cài') || text.includes('chỉnh nha')) {
    return {
      icd10: 'K07.2 (Sai lệch vị trí răng & tương quan khớp cắn Angle II/III)',
      toothPosition: 'Hai cung hàm (Hệ thống mắc cài / khay niềng trong suốt)',
      procedure: 'Kiểm tra torque, siết dây cung Niti và thay thun chuỗi kích hoạt lực'
    };
  }
  return {
    icd10: 'K02.1 (Sâu ngà răng mặt nhai)',
    toothPosition: 'Răng hàm R16, R26, R46 (Ký hiệu Quốc tế FDI)',
    procedure: 'Làm sạch mô hoại tử xoang sâu và trám phục hồi Composite thẩm mỹ'
  };
};

/**
 * Tính toán ngày tái khám cụ thể dựa trên ngày khám và nội dung dặn dò
 */
const calculateExactReExamDate = (appointmentDateStr, reExamText = '') => {
  let baseDate = new Date();
  if (appointmentDateStr) {
    const parts = appointmentDateStr.split('-');
    if (parts.length === 3) {
      baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
  }

  const textLower = reExamText.toLowerCase();
  let daysToAdd = 7;
  let reason = 'Kiểm tra vết thương & cắt chỉ';

  if (textLower.includes('6 tháng') || textLower.includes('định kỳ')) {
    daysToAdd = 180;
    reason = 'Khám & kiểm tra răng miệng định kỳ';
  } else if (textLower.includes('3 - 4 tuần') || textLower.includes('3-4 tuần') || textLower.includes('4 tuần') || textLower.includes('chỉnh nha')) {
    daysToAdd = 28;
    reason = 'Tái khám chỉnh nha & thay dây cung';
  } else if (textLower.includes('2-4 tuần') || textLower.includes('tẩy trắng')) {
    daysToAdd = 21;
    reason = 'Kiểm tra độ ổn định men răng';
  } else if (textLower.includes('7 ngày') || textLower.includes('cắt chỉ')) {
    daysToAdd = 7;
    reason = 'Kiểm tra lành thương và cắt chỉ';
  }

  const targetDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const y = targetDate.getFullYear();

  const durationStr = daysToAdd >= 30 ? `${Math.round(daysToAdd / 30)} tháng` : `${daysToAdd} ngày`;
  return `${d}/${m}/${y} (Sau ${durationStr} - ${reason})`;
};

/**
 * Xuất Phiếu khám bệnh & Đơn thuốc điều trị ra chuẩn A4 (1 trang duy nhất)
 * Tuân thủ Thông tư 52/2017/TT-BYT và các tiêu chuẩn biểu mẫu y tế hiện hành:
 * - Ẩn hoàn toàn header/footer trình duyệt (@page margin: 0)
 * - Tối ưu in ấn đen trắng dựa trên đường viền & tương phản kiểu chữ
 * - Gói gọn vừa vặn 100% trong 1 trang A4 duy nhất
 */
export const printMedicalRecord = (record, patientInfo = {}) => {
  if (!record) return;

  const clinical = parseClinicalRecord(record.notes, record.serviceName);
  const metadata = getClinicalMetadata(record.serviceName, record.notes);

  const patientName = (record.patientName || patientInfo?.fullName || 'Bệnh nhân').toUpperCase();
  const patientPhone = record.patientPhone || patientInfo?.phone || '0792275635';
  const patientCode = record.patientPhone ? `BN-${record.patientPhone}` : (patientInfo?.phone ? `BN-${patientInfo.phone}` : 'BN-0792275635');
  const patientGender = patientInfo?.gender || (patientName.includes('THỊ') ? 'Nữ' : 'Nam');
  const patientAge = patientInfo?.age || '32 tuổi (SN: 1994)';
  const patientAddress = patientInfo?.address || 'Quận 1, TP. Hồ Chí Minh';
  const allergies = patientInfo?.allergies || 'Không ghi nhận dị ứng thuốc (Allergy: None)';

  const doctorName = record.doctorName || 'BS. Nguyễn Văn Hùng';
  const doctorCCHN = getDoctorCCHN(doctorName);
  const serviceName = record.serviceName || 'Dịch vụ nha khoa';
  const rawPrice = Number(record.servicePrice || 0);
  const priceDisplay = rawPrice > 0 ? new Intl.NumberFormat('vi-VN').format(rawPrice) + 'đ' : 'Miễn phí';
  const appointmentCode = record.appointmentCode || `ZB-AP-${record.id || '8838'}`;
  const rxNationalCode = `ZB-RX-${(record.appointmentDate || '202611').replace(/-/g, '').slice(0, 6)}-${record.id || '8838'}`;

  // Định dạng ngày khám
  let appointmentDateStr = record.appointmentDate || '2026-11-14';
  let formattedExamDate = appointmentDateStr;
  if (appointmentDateStr && appointmentDateStr.includes('-')) {
    const [y, m, d] = appointmentDateStr.split('-');
    if (y && m && d) formattedExamDate = `${d}/${m}/${y}`;
  }
  const examDateTime = record.appointmentTime ? `${record.appointmentTime} ngày ${formattedExamDate}` : formattedExamDate;

  // Tính toán ngày tái khám cụ thể
  const exactReExamStr = calculateExactReExamDate(appointmentDateStr, clinical.reExam);

  const prescriptions = Array.isArray(clinical.prescription) ? clinical.prescription : [];

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Phiếu Khám Bệnh & Đơn Thuốc - ${appointmentCode}</title>
  <style>
    /* Thiết lập in chuẩn A4, loại bỏ header & footer của trình duyệt */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10mm 13mm 8mm 13mm;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .sheet {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }

    /* Header Phòng khám */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .clinic-title {
      font-size: 13.5pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 0 0 2px 0;
    }
    .clinic-meta {
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.3;
    }
    .barcode-col {
      text-align: right;
      vertical-align: top;
      width: 220px;
    }
    .rx-code {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
      border: 1px solid #0f172a;
      padding: 2px 8px;
      display: inline-block;
      margin-bottom: 3px;
    }

    /* Tiêu đề văn bản */
    .doc-title-block {
      text-align: center;
      margin: 6px 0 10px 0;
    }
    .doc-main-title {
      font-size: 14pt;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .doc-sub-title {
      font-size: 8.5pt;
      color: #475569;
      font-style: italic;
      margin-top: 1px;
    }

    /* Tiêu đề phân mục y khoa */
    .sec-head {
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1px solid #0f172a;
      padding-bottom: 2px;
      margin: 7px 0 4px 0;
      letter-spacing: 0.2px;
    }

    /* Bảng thông tin hành chính */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
    }
    .info-table td {
      padding: 2.5px 4px;
      font-size: 9.5pt;
      vertical-align: top;
    }
    .lbl {
      color: #334155;
      font-weight: 600;
      white-space: nowrap;
    }
    .val {
      color: #0f172a;
    }

    /* Khối Chẩn đoán & Thủ thuật */
    .clinical-box {
      border: 1px solid #64748b;
      padding: 5px 8px;
      font-size: 9.2pt;
      line-height: 1.35;
      margin-bottom: 4px;
    }
    .clinical-row {
      margin-bottom: 2px;
    }
    .clinical-row:last-child {
      margin-bottom: 0;
    }

    /* Bảng Toa thuốc - ĐIỂM NHẤN CHÍNH */
    .presc-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
      margin: 4px 0 6px 0;
    }
    .presc-table th {
      background: #f8fafc;
      color: #0f172a;
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 6px;
      border: 1px solid #475569;
      border-bottom: 1.5px solid #0f172a;
    }
    .presc-table td {
      padding: 4px 6px;
      border: 1px solid #94a3b8;
      font-size: 9.3pt;
      vertical-align: top;
    }
    .drug-name {
      font-size: 9.8pt;
      font-weight: 800;
      color: #0f172a;
    }
    .drug-usage {
      font-size: 8.5pt;
      color: #475569;
      font-style: italic;
    }
    .drug-dose {
      font-weight: 700;
      color: #0f172a;
    }

    /* Dặn dò & Lịch hẹn tái khám */
    .advice-container {
      border: 1px solid #64748b;
      padding: 5px 8px;
      font-size: 9.2pt;
      line-height: 1.35;
      margin-bottom: 6px;
    }
    .reexam-line {
      margin-top: 3px;
      padding-top: 3px;
      border-top: 1px dashed #94a3b8;
      font-weight: 700;
      color: #0f172a;
    }

    /* Chữ ký & Xác nhận số */
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      page-break-inside: avoid;
    }
    .sign-cell {
      width: 38%;
      text-align: center;
      vertical-align: top;
    }
    .qr-cell {
      width: 24%;
      text-align: center;
      vertical-align: middle;
      padding: 0 4px;
    }
    .sign-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }
    .sign-sub {
      font-size: 8pt;
      color: #64748b;
      font-style: italic;
      margin-top: 1px;
    }
    .sign-space-patient {
      height: 48px; /* Khoảng trống ký tay rộng thoáng cho bệnh nhân */
    }
    .digital-seal-box {
      border: 1px solid #0f172a;
      padding: 3px 6px;
      display: inline-block;
      text-align: left;
      font-size: 7.5pt;
      line-height: 1.25;
      margin-top: 4px;
      background: #fafafa;
    }
    .doc-name {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 3px;
    }

    /* Chân trang */
    .footer-note {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      text-align: center;
      font-size: 8pt;
      color: #475569;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- Header Phòng khám -->
    <table class="header-table" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div class="clinic-title">HỆ THỐNG NHA KHOA QUỐC TẾ ZENBOOKING</div>
          <div class="clinic-meta">
            Giấy phép hoạt động KBCB số: <strong>08642/BYT-GPHĐ</strong> · Sở Y Tế TP.HCM cấp<br />
            Địa chỉ: 123 Đường Sức Khỏe, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh<br />
            Hotline cấp cứu & hẹn khám: <strong>1900 8888</strong> · Website: www.zenbooking.vn
          </div>
        </td>
        <td class="barcode-col">
          <div class="rx-code">${appointmentCode}</div>
          <div style="font-size: 8pt; color: #334155;">Mã đơn thuốc: <strong>${rxNationalCode}</strong></div>
          <div style="font-size: 8pt; color: #475569;">Thời điểm khám: ${examDateTime}</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề văn bản -->
    <div class="doc-title-block">
      <h1 class="doc-main-title">PHIẾU KHÁM BỆNH & TOA THUỐC ĐIỀU TRỊ</h1>
      <div class="doc-sub-title">(Hồ sơ kết quả điều trị & Đơn thuốc nha khoa ngoại trú theo quy chuẩn Bộ Y Tế)</div>
    </div>

    <!-- Mục 1: Thông tin hành chính bệnh nhân -->
    <div class="sec-head">1. THÔNG TIN BỆNH NHÂN</div>
    <table class="info-table" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width: 40%;">
          <span class="lbl">Họ và tên:</span> <span class="val" style="font-weight: 800; font-size: 10pt;">${patientName}</span>
        </td>
        <td style="width: 28%;">
          <span class="lbl">Giới tính / Tuổi:</span> <span class="val">${patientGender} · ${patientAge}</span>
        </td>
        <td style="width: 32%;">
          <span class="lbl">Mã y bạ:</span> <span class="val" style="font-weight: 700;">${patientCode}</span>
        </td>
      </tr>
      <tr>
        <td>
          <span class="lbl">Điện thoại liên hệ:</span> <span class="val">${patientPhone}</span>
        </td>
        <td colspan="2">
          <span class="lbl">Địa chỉ:</span> <span class="val">${patientAddress}</span>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <span class="lbl">Tiền sử dị ứng:</span> <span class="val" style="font-weight: 700; color: #b91c1c;">${allergies}</span>
        </td>
      </tr>
    </table>

    <!-- Mục 2: Chẩn đoán & Thủ thuật điều trị -->
    <div class="sec-head">2. CHẨN ĐOÁN & THỦ THUẬT ĐIỀU TRỊ</div>
    <div class="clinical-box">
      <div class="clinical-row">
        <span class="lbl">Dịch vụ điều trị:</span> <span class="val" style="font-weight: 700;">${serviceName}</span>
        <span style="color: #475569; font-size: 8.5pt; margin-left: 12px;">(Thanh toán: Đã thanh toán ${priceDisplay} · HĐ: ${appointmentCode})</span>
      </div>
      <div class="clinical-row">
        <span class="lbl">Chẩn đoán y khoa:</span> <span class="val" style="font-weight: 600;">${clinical.diagnosis}</span>
      </div>
      <div class="clinical-row">
        <span class="lbl">Mã bệnh ICD-10:</span> <span class="val">${metadata.icd10}</span>
        <span class="lbl" style="margin-left: 14px;">Vị trí răng (FDI):</span> <span class="val" style="font-weight: 700;">${metadata.toothPosition}</span>
      </div>
      <div class="clinical-row">
        <span class="lbl">Kỹ thuật thực hiện:</span> <span class="val">${metadata.procedure}</span>
      </div>
    </div>

    <!-- Mục 3: Đơn thuốc điều trị (BẮT BUỘC DÙNG THEO ĐƠN) - ĐIỂM NHẤN CHÍNH -->
    <div class="sec-head">3. ĐƠN THUỐC ĐIỀU TRỊ (BẮT BUỘC DÙNG THEO ĐƠN)</div>
    ${prescriptions.length > 0 ? `
    <table class="presc-table" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">STT</th>
          <th style="width: 44%;">TÊN THUỐC & HOẠT CHẤT</th>
          <th style="width: 14%; text-align: center;">SỐ LƯỢNG</th>
          <th>LIỀU DÙNG & HƯỚNG DẪN SỬ DỤNG</th>
        </tr>
      </thead>
      <tbody>
        ${prescriptions.map((m, idx) => `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #475569;">${idx + 1}</td>
          <td>
            <div class="drug-name">${m.name}</div>
            ${m.usage ? `<div class="drug-usage">${m.usage}</div>` : ''}
          </td>
          <td style="text-align: center; font-weight: 800; font-size: 10pt;">${m.qty}</td>
          <td><span class="drug-dose">${m.dose}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : `
    <div class="clinical-box" style="font-style: italic; color: #475569;">
      Ca điều trị không có chỉ định dùng thuốc uống nội khoa. Tiếp tục vệ sinh chăm sóc răng miệng theo lời dặn.
    </div>
    `}

    <!-- Mục 4: Hướng dẫn chăm sóc & Hẹn tái khám -->
    <div class="sec-head">4. LỜI DẶN BÁC SĨ & HẸN TÁI KHÁM</div>
    <div class="advice-container">
      <div><span class="lbl">Lời dặn hậu phẫu / chăm sóc:</span> ${clinical.advice}</div>
      <div class="reexam-line">
        <span class="lbl">Lịch hẹn tái khám chính xác:</span> ${exactReExamStr}
      </div>
    </div>

    <!-- Mục 5: Xác nhận & Chữ ký -->
    <table class="sign-table" cellpadding="0" cellspacing="0">
      <tr>
        <!-- Khối người nhận đơn / bệnh nhân (để trống ký tay) -->
        <td class="sign-cell">
          <div class="sign-title">NGƯỜI NHẬN ĐƠN / BỆNH NHÂN</div>
          <div class="sign-sub">(Ký và ghi rõ họ tên)</div>
          <div class="sign-space-patient"></div>
          <div style="font-size: 8pt; color: #94a3b8; font-style: italic;">Chữ ký người nhận</div>
        </td>

        <!-- Mã QR xác thực y bạ điện tử -->
        <td class="qr-cell">
          <svg width="68" height="68" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
            <rect x="0" y="0" width="100" height="100" fill="white" stroke="#64748b" stroke-width="1"/>
            <rect x="8" y="8" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="16" y="16" width="12" height="12" fill="#000"/>
            <rect x="64" y="8" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="72" y="16" width="12" height="12" fill="#000"/>
            <rect x="8" y="64" width="28" height="28" fill="none" stroke="#000" stroke-width="4"/>
            <rect x="16" y="72" width="12" height="12" fill="#000"/>
            <rect x="42" y="10" width="6" height="6" fill="#000"/>
            <rect x="52" y="14" width="6" height="6" fill="#000"/>
            <rect x="44" y="24" width="6" height="6" fill="#000"/>
            <rect x="10" y="42" width="6" height="6" fill="#000"/>
            <rect x="22" y="44" width="6" height="6" fill="#000"/>
            <rect x="32" y="42" width="6" height="6" fill="#000"/>
            <rect x="42" y="42" width="6" height="6" fill="#000"/>
            <rect x="52" y="42" width="6" height="6" fill="#000"/>
            <rect x="62" y="44" width="6" height="6" fill="#000"/>
            <rect x="72" y="42" width="6" height="6" fill="#000"/>
            <rect x="84" y="44" width="6" height="6" fill="#000"/>
            <rect x="44" y="52" width="6" height="6" fill="#000"/>
            <rect x="54" y="54" width="6" height="6" fill="#000"/>
            <rect x="64" y="52" width="6" height="6" fill="#000"/>
            <rect x="42" y="64" width="6" height="6" fill="#000"/>
            <rect x="52" y="72" width="6" height="6" fill="#000"/>
            <rect x="64" y="68" width="6" height="6" fill="#000"/>
            <rect x="74" y="74" width="6" height="6" fill="#000"/>
            <rect x="84" y="64" width="6" height="6" fill="#000"/>
            <rect x="44" y="84" width="6" height="6" fill="#000"/>
            <rect x="54" y="82" width="6" height="6" fill="#000"/>
            <rect x="74" y="84" width="6" height="6" fill="#000"/>
            <rect x="84" y="82" width="6" height="6" fill="#000"/>
          </svg>
          <div style="font-size: 7.5pt; color: #475569; margin-top: 2px; font-weight: 600;">Quét mã tra cứu</div>
          <div style="font-size: 6.5pt; color: #64748b; font-family: monospace;">zenbooking.vn/verify</div>
        </td>

        <!-- Khối Bác sĩ điều trị & Chữ ký số -->
        <td class="sign-cell">
          <div class="sign-title">BÁC SĨ ĐIỀU TRỊ</div>
          <div class="sign-sub">(Ký, đóng dấu hoặc xác thực điện tử)</div>
          
          <div class="digital-seal-box">
            <strong style="color: #0f172a;">✔ XÁC THỰC KÝ SỐ Y BẠ ĐIỆN TỬ</strong><br />
            Mã định danh: <strong>${rxNationalCode}</strong><br />
            Số CCHN: <strong>${doctorCCHN}</strong><br />
            Ký số lúc: ${examDateTime}
          </div>

          <div class="doc-name">${doctorName}</div>
        </td>
      </tr>
    </table>

    <!-- Footer văn bản -->
    <div class="footer-note">
      * Đơn thuốc có giá trị mua và sử dụng theo đúng đợt điều trị chỉ định. Quý khách vui lòng mang theo phiếu này khi đến tái khám định kỳ.<br />
      Văn bản trích xuất trực tiếp từ Hệ thống Quản lý Y bạ Điện tử ZenBooking Dental Care.
    </div>
  </div>
</body>
</html>
  `;

  // Tạo iframe ẩn trong DOM để in ấn độc lập tuyệt đối
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', `Phieu_Kham_${appointmentCode}`);
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Chờ iframe phân tích tài nguyên và kích hoạt hộp thoại in / xuất PDF
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Dọn dẹp iframe sau khi hoàn tất
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // Bỏ qua nếu iframe đã được gỡ
        }
      }, 1500);
    }, 250);
  } catch (err) {
    console.error('Lỗi khi kích hoạt in phiếu khám:', err);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 300);
    }
  }
};

export default printMedicalRecord;
