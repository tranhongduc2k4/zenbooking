import axiosClient from './axiosClient';

export const doctorApi = {
  // Lấy danh sách toàn bộ bác sĩ kèm thống kê ca khám
  getAllDoctors: () => {
    return axiosClient.get('/doctors');
  },

  // Thêm bác sĩ mới vào hệ thống
  createDoctor: (data) => {
    return axiosClient.post('/doctors', data);
  },

  // Chỉnh sửa thông tin bác sĩ
  updateDoctor: (id, data) => {
    return axiosClient.put(`/doctors/${id}`, data);
  },

  // Xóa bác sĩ khỏi hệ thống (nếu chưa có ca khám)
  deleteDoctor: (id) => {
    return axiosClient.delete(`/doctors/${id}`);
  },

  // Lấy danh sách ca khám phụ trách của một bác sĩ
  getDoctorAppointments: (id) => {
    return axiosClient.get(`/doctors/${id}/appointments`);
  },
};

export default doctorApi;
