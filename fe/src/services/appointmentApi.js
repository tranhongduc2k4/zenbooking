import axiosClient from './axiosClient';

export const appointmentApi = {
  // Bệnh nhân đặt lịch khám mới
  bookAppointment: (data) => {
    return axiosClient.post('/appointments', data);
  },

  // Bệnh nhân xem lịch hẹn cá nhân của mình
  getMyAppointments: () => {
    return axiosClient.get('/appointments/my-appointments');
  },

  // Admin & Bác sĩ xem toàn bộ danh sách lịch hẹn (kèm bộ lọc)
  getAllAppointments: (params = {}) => {
    return axiosClient.get('/appointments/admin', { params });
  },

  // Admin & Bác sĩ lấy số liệu thống kê lịch hẹn
  getAppointmentStats: () => {
    return axiosClient.get('/appointments/admin/stats');
  },

  // Lấy chi tiết lịch hẹn theo ID
  getAppointmentById: (id) => {
    return axiosClient.get(`/appointments/${id}`);
  },

  // Admin & Bác sĩ cập nhật trạng thái (CONFIRMED, COMPLETED, CANCELLED)
  updateAppointmentStatus: (id, statusData) => {
    return axiosClient.patch(`/appointments/${id}/status`, statusData);
  },

  // Bệnh nhân tự hủy lịch hẹn của mình
  cancelMyAppointment: (id, reason = '') => {
    return axiosClient.patch(`/appointments/${id}/cancel`, null, {
      params: { reason }
    });
  },
};

export default appointmentApi;
