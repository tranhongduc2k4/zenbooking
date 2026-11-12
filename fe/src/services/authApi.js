import axiosClient from './axiosClient';

const authApi = {
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },
  register: (userData) => {
    return axiosClient.post('/auth/register', userData);
  },
  getProfile: () => {
    return axiosClient.get('/auth/me');
  },
};

export default authApi;
