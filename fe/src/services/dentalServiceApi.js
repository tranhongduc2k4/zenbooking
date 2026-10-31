import axiosClient from './axiosClient';

export const dentalServiceApi = {
  // Lấy danh sách dịch vụ đang hoạt động (Public cho bệnh nhân)
  getActiveServices: () => {
    return axiosClient.get('/services');
  },

  // Lấy chi tiết dịch vụ theo ID
  getServiceById: (id) => {
    return axiosClient.get(`/services/${id}`);
  },

  // Lấy toàn bộ danh sách dịch vụ cho Admin (kèm cả dịch vụ đã ẩn)
  getAllServicesForAdmin: () => {
    return axiosClient.get('/services/admin');
  },

  // Tạo dịch vụ mới (Admin)
  createService: (serviceData) => {
    return axiosClient.post('/services', serviceData);
  },

  // Cập nhật thông tin dịch vụ (Admin)
  updateService: (id, serviceData) => {
    return axiosClient.put(`/services/${id}`, serviceData);
  },

  // Bật/tắt trạng thái hiển thị của dịch vụ (Admin)
  toggleServiceStatus: (id) => {
    return axiosClient.patch(`/services/${id}/toggle`);
  },

  // Xóa dịch vụ (Admin)
  deleteService: (id) => {
    return axiosClient.delete(`/services/${id}`);
  },
};

export default dentalServiceApi;
