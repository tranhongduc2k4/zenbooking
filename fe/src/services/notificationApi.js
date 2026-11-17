import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/notifications';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationApi = {
  // 1. Lấy danh sách thông báo và số lượng chưa đọc
  async getNotifications() {
    const res = await axios.get(API_BASE_URL, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 2. Đánh dấu 1 thông báo là đã đọc
  async markAsRead(id) {
    const res = await axios.put(`${API_BASE_URL}/${id}/read`, {}, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 3. Đánh dấu tất cả là đã đọc
  async markAllAsRead() {
    const res = await axios.put(`${API_BASE_URL}/read-all`, {}, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // 4. Xóa 1 thông báo
  async deleteNotification(id) {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  // 5. Kết nối luồng Server-Sent Events (SSE) thời gian thực
  createStream(onNotification, onConnected, onError) {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const streamUrl = `${API_BASE_URL}/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('connected', (e) => {
      if (onConnected) onConnected(e.data);
    });

    eventSource.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (onNotification) onNotification(data);
      } catch (err) {
        console.error('Lỗi parse dữ liệu thông báo SSE:', err);
      }
    });

    eventSource.addEventListener('ping', () => {
      // Heartbeat ping từ server giữ kết nối luôn hoạt động
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return eventSource;
  },
};
