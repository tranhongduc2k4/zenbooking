import { parseClinicalRecord } from './clinicalHelpers';

/**
 * Xuất Phiếu khám bệnh & Đơn thuốc điều trị ra chuẩn A4 / PDF Export
 * Sử dụng iframe in ấn cô lập, loại bỏ hoàn toàn thanh cuộn, backdrop modal, 
 * và đảm bảo hiển thị trọn vẹn 100% nội dung tài liệu y khoa.
 */
export const printMedicalRecord = (record, patientInfo = {}) => {
  if (!record) return;

  const clinical = parseClinicalRecord(record.notes, record.serviceName);
  const patientName = record.patientName || patientInfo?.fullName || 'Bệnh nhân';
  const patientPhone = record.patientPhone || patientInfo?.phone || 'Chưa cập nhật SĐT';
  const patientCode = patientInfo?.phone ? `BN-${patientInfo.phone}` : (record.patientPhone ? `BN-${record.patientPhone}` : 'BN-ZENBOOKING');
  const doctorName = record.doctorName || 'BS. Chuyên khoa ZenBooking';
  const serviceName = record.serviceName || 'Dịch vụ nha khoa';
  const rawPrice = Number(record.servicePrice || 0);
  const priceDisplay = rawPrice > 0 ? new Intl.NumberFormat('vi-VN').format(rawPrice) + ' VNĐ' : 'Miễn phí';
  const appointmentCode = record.appointmentCode || `ZB-AP-${record.id || '8838'}`;
  
  const now = new Date();
  const printDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  let appointmentDateStr = record.appointmentDate || '';
  if (appointmentDateStr && appointmentDateStr.includes('-')) {
    const [y, m, d] = appointmentDateStr.split('-');
    if (y && m && d) appointmentDateStr = `${d}/${m}/${y}`;
  }
  const appointmentTimeStr = record.appointmentTime ? `${record.appointmentTime} · ${appointmentDateStr}` : appointmentDateStr;

  const prescriptions = Array.isArray(clinical.prescription) ? clinical.prescription : [];

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Phiếu Khám Bệnh & Đơn Thuốc - ${appointmentCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 12.5px;
      line-height: 1.5;
    }
    .sheet {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    /* Clinic Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .clinic-logo-cell {
      vertical-align: top;
    }
    .clinic-badge {
      display: inline-block;
      background: #2563eb;
      color: white;
      font-weight: 800;
      font-size: 13px;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .clinic-title {
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .clinic-info {
      font-size: 11px;
      color: #475569;
      margin: 2px 0 0 0;
      line-height: 1.4;
    }
    .meta-cell {
      text-align: right;
      vertical-align: top;
    }
    .code-tag {
      display: inline-block;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-family: monospace;
      font-weight: 800;
      font-size: 14px;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .print-time {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 4px;
    }
    /* Title */
    .title-wrapper {
      text-align: center;
      margin: 14px 0 16px 0;
    }
    .main-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0;
    }
    .sub-title {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
      margin-top: 2px;
    }
    /* Section Headings */
    .section {
      margin-bottom: 13px;
    }
    .section-header {
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e40af;
      margin-bottom: 6px;
      border-left: 3.5px solid #2563eb;
      padding-left: 7px;
      letter-spacing: 0.3px;
    }
    /* Patient Info Table */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .info-table td {
      padding: 7px 12px;
      font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
    }
    .info-table td:last-child {
      border-right: none;
    }
    .info-table tr:last-child td {
      border-bottom: none;
    }
    .label {
      color: #64748b;
      width: 18%;
      font-size: 11.5px;
    }
    .val {
      color: #0f172a;
      font-weight: 600;
      width: 32%;
    }
    /* Service card */
    .service-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 9px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .service-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .service-category {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    .service-price {
      font-size: 14px;
      font-weight: 800;
      color: #047857;
      font-family: monospace;
    }
    /* Clinical Box */
    .clinical-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 13px;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.55;
    }
    /* Prescription Table */
    .presc-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    .presc-table th {
      background: #f1f5f9;
      color: #334155;
      font-size: 10.5px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    .presc-table td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .med-name {
      font-weight: 700;
      color: #0f172a;
    }
    .med-usage {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .med-dose {
      color: #1d4ed8;
      font-weight: 600;
    }
    /* Advice & ReExam */
    .advice-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 9px 13px;
      font-size: 12px;
      color: #14532d;
      line-height: 1.55;
    }
    .reexam-highlight {
      margin-top: 7px;
      background: #eff6ff;
      border: 1px dashed #3b82f6;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 12px;
      color: #1e40af;
      font-weight: 700;
    }
    /* Signatures */
    .sign-table {
      width: 100%;
      margin-top: 22px;
      page-break-inside: avoid;
    }
    .sign-col {
      width: 50%;
      text-align: center;
      vertical-align: top;
    }
    .sign-role {
      font-weight: 700;
      color: #0f172a;
      font-size: 12.5px;
    }
    .sign-sub {
      font-size: 10.5px;
      color: #64748b;
      font-style: italic;
      margin-top: 2px;
    }
    .sign-space {
      height: 50px;
    }
    .sign-name {
      font-weight: 800;
      color: #1e3a8a;
      font-size: 13px;
    }
    .seal-badge {
      display: inline-block;
      border: 1.5px solid #2563eb;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 9.5px;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    /* Footer */
    .sheet-footer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      text-align: center;
      font-size: 10.5px;
      color: #64748b;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- Header Phòng khám -->
    <table class="header-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="clinic-logo-cell">
          <span class="clinic-badge">ZENBOOKING DENTAL CARE</span>
          <h1 class="clinic-title">Hệ Thống Nha Khoa Quốc Tế ZenBooking</h1>
          <p class="clinic-info">
            Số GPBYT: 08642/BYT-CCHN • Tiêu chuẩn Y khoa Thụy Sĩ<br />
            Địa chỉ: 123 Đường Sức Khỏe, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh<br />
            Hotline cấp cứu 24/7: <strong>1900 8888</strong> • Website: <strong>https://zenbooking.vn</strong>
          </p>
        </td>
        <td class="meta-cell">
          <div class="code-tag">${appointmentCode}</div>
          <div class="print-time">Thời điểm in: ${printDate}</div>
          <div class="print-time">Trạng thái: <strong>Đã hoàn thành</strong></div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề văn bản -->
    <div class="title-wrapper">
      <h2 class="main-title">PHIẾU KHÁM BỆNH & TOA THUỐC ĐIỀU TRỊ</h2>
      <div class="sub-title">(Hồ sơ kết quả khám chữa bệnh & y bạ điện tử ngoại trú)</div>
    </div>

    <!-- Phần 1: Thông tin hành chính -->
    <div class="section">
      <div class="section-header">I. THÔNG TIN HÀNH CHÍNH BỆNH NHÂN</div>
      <table class="info-table" cellpadding="0" cellspacing="0">
        <tr>
          <td class="label">Họ và tên:</td>
          <td class="val"><strong style="font-size: 13px; text-transform: uppercase;">${patientName}</strong></td>
          <td class="label">Mã y bạ bệnh nhân:</td>
          <td class="val"><span style="font-family: monospace;">${patientCode}</span></td>
        </tr>
        <tr>
          <td class="label">Số điện thoại:</td>
          <td class="val"><span style="font-family: monospace;">${patientPhone}</span></td>
          <td class="label">Thời gian khám:</td>
          <td class="val">${appointmentTimeStr}</td>
        </tr>
        <tr>
          <td class="label">Bác sĩ điều trị:</td>
          <td class="val"><strong style="color: #1e40af;">${doctorName}</strong></td>
          <td class="label">Hình thức khám:</td>
          <td class="val">Khám theo lịch hẹn trực tuyến</td>
        </tr>
      </table>
    </div>

    <!-- Phần 2: Dịch vụ & Chi phí -->
    <div class="section">
      <div class="section-header">II. NỘI DUNG ĐIỀU TRỊ NHA KHOA</div>
      <div class="service-box">
        <div>
          <div class="service-name">${serviceName}</div>
          <div class="service-category">Phác đồ chuẩn y khoa Quốc tế · Công nghệ vô trùng Autoclave</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10.5px; color: #64748b;">Chi phí điều trị:</div>
          <div class="service-price">${priceDisplay}</div>
        </div>
      </div>
    </div>

    <!-- Phần 3: Chẩn đoán lâm sàng -->
    <div class="section">
      <div class="section-header">III. CHẨN ĐOÁN LÂM SÀNG & THỦ THUẬT ĐÃ THỰC HIỆN</div>
      <div class="clinical-box">
        ${clinical.diagnosis}
      </div>
    </div>

    <!-- Phần 4: Toa thuốc điều trị (nếu có) -->
    ${prescriptions.length > 0 ? `
    <div class="section">
      <div class="section-header">IV. TOA THUỐC ĐIỀU TRỊ NHA KHOA</div>
      <table class="presc-table" cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th style="width: 42%;">Tên thuốc & Hàm lượng</th>
            <th style="width: 15%; text-align: center;">Số lượng</th>
            <th>Liều dùng & Hướng dẫn sử dụng</th>
          </tr>
        </thead>
        <tbody>
          ${prescriptions.map((m, idx) => `
          <tr>
            <td style="text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
            <td>
              <div class="med-name">${m.name}</div>
              ${m.usage ? `<div class="med-usage">${m.usage}</div>` : ''}
            </td>
            <td style="text-align: center; font-weight: 700; font-family: monospace;">${m.qty}</td>
            <td class="med-dose">${m.dose}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Phần 5: Lời dặn & Hẹn tái khám -->
    <div class="section">
      <div class="section-header">V. HƯỚNG DẪN CHĂM SÓC & DẶN DÒ PHỤC HỒI</div>
      <div class="advice-box">
        ${clinical.advice}
      </div>
      ${clinical.reExam ? `
      <div class="reexam-highlight">
        📅 Lịch hẹn tái khám: ${clinical.reExam}
      </div>
      ` : ''}
    </div>

    <!-- Phần 6: Chữ ký xác nhận -->
    <table class="sign-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="sign-col">
          <div class="sign-role">BỆNH NHÂN / ĐẠI DIỆN</div>
          <div class="sign-sub">(Ký và ghi rõ họ tên)</div>
          <div class="sign-space"></div>
          <div class="sign-name" style="color: #64748b; font-weight: 600;">${patientName}</div>
        </td>
        <td class="sign-col">
          <div class="sign-role">BÁC SĨ ĐIỀU TRỊ</div>
          <div class="sign-sub">(Đã ký & xác nhận số điện tử)</div>
          <div style="margin-top: 10px;">
            <span class="seal-badge">✔ DIGITAL SIGNED · Y BẠ ĐIỆN TỬ</span>
          </div>
          <div class="sign-space" style="height: 25px;"></div>
          <div class="sign-name">${doctorName}</div>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div class="sheet-footer">
      * Quý khách vui lòng mang theo phiếu này hoặc mở hồ sơ y bạ trên ứng dụng khi đến tái khám định kỳ.<br />
      Phiếu khám bệnh & đơn thuốc điện tử được trích xuất trực tiếp từ Hệ thống Quản trị Nha khoa ZenBooking.
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

    // Chờ tài nguyên tải xong rồi kích hoạt hộp thoại in / xuất PDF của trình duyệt
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Dọn dẹp iframe sau khi in xong
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // Bỏ qua nếu đã được gỡ
        }
      }, 1500);
    }, 250);
  } catch (err) {
    console.error('Lỗi khi kích hoạt in phiếu khám:', err);
    // Fallback: nếu iframe bị chặn thì mở cửa sổ mới
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
