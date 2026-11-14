import axiosClient from './axiosClient';

export const doctorApi = {
  // Lấy danh sách bác sĩ chuyên khoa từ Backend MySQL
  getDoctors: () => {
    return axiosClient.get('/doctors');
  },
};

export default doctorApi;

