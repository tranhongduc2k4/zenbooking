import axiosClient from './axiosClient';

export const patientApi = {
  // Lấy danh sách toàn bộ hồ sơ bệnh nhân
  getAllPatients: () => {
    return axiosClient.get('/patients');
  },

  // Lấy chi tiết lịch sử ca khám của một bệnh nhân theo SĐT
  getPatientHistory: (phone) => {
    return axiosClient.get(`/patients/${phone}/history`);
  },

  // Cập nhật chỉ số y tế (nhóm máu, tiền sử dị ứng) cho bệnh nhân
  updateMedicalProfile: (phone, data) => {
    return axiosClient.put(`/patients/${phone}/medical-profile`, data);
  },
};

export default patientApi;

