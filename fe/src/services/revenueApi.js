import axiosClient from './axiosClient';

export const revenueApi = {
  // Lấy báo cáo doanh thu & phân tích tài chính tổng hợp từ Backend
  getRevenueReport: (params = {}) => {
    return axiosClient.get('/revenue/report', { params });
  },
};

export default revenueApi;
