import axios from 'axios';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;

export const adminApi = {
  login: (email: string, password: string, deviceId: string) =>
    client.post('/auth/login', { email, password, deviceId, deviceName: 'Admin Browser' }).then((r) => r.data),

  getDashboard: () => client.get('/admin/dashboard').then((r) => r.data),

  getStores: () => client.get('/admin/stores').then((r) => r.data),

  updateSubscription: (storeId: string, data: { plan: string; expiryDate: string; isActive: boolean }) =>
    client.put(`/admin/stores/${storeId}/subscription`, data).then((r) => r.data),

  getStoreDevices: (storeId: string) => client.get(`/admin/stores/${storeId}/devices`).then((r) => r.data),

  forceLogout: (deviceId: string) => client.delete(`/admin/devices/${deviceId}`).then((r) => r.data),
};
