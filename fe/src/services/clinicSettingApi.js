import axiosClient from './axiosClient';

export const clinicSettingApi = {
  // Lấy thông tin cài đặt phòng khám
  getSettings: () => {
    return axiosClient.get('/settings');
  },

  // Admin cập nhật thông tin cài đặt phòng khám
  updateSettings: (data) => {
    return axiosClient.put('/settings', data);
  },

  // Đổi mật khẩu tài khoản
  changePassword: (data) => {
    return axiosClient.post('/settings/change-password', data);
  },
};

export default clinicSettingApi;
