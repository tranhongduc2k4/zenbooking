import axiosClient from './axiosClient';

const bookingApi = {
  getAvailableSlots: (doctorId, date) => {
    return axiosClient.get('/appointments/available-slots', {
      params: { doctorId, date },
    });
  },
  createBooking: (bookingData) => {
    return axiosClient.post('/appointments', bookingData);
  },
  getMyAppointments: () => {
    return axiosClient.get('/appointments/my-appointments');
  },
};

export default bookingApi;
