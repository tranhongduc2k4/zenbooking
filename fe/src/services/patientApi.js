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
};

export default patientApi;
