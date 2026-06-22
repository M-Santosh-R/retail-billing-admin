import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://localhost:3000/api`,
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

  updateSubscription: (storeId: string, data: { plan: string; expiryDate: string; isActive: boolean; maxDevices: number }) =>
    client.put(`/admin/stores/${storeId}/subscription`, data).then((r) => r.data),

  getStoreDevices: (storeId: string) => client.get(`/admin/stores/${storeId}/devices`).then((r) => r.data),

  forceLogout: (deviceId: string) => client.delete(`/admin/devices/${deviceId}`).then((r) => r.data),

  getStoreBills: (storeId: string, params?: { search?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    client.get(`/admin/stores/${storeId}/bills`, { params }).then((r) => r.data),

  getStoreBill: (storeId: string, billId: string) =>
    client.get(`/admin/stores/${storeId}/bills/${billId}`).then((r) => r.data),

  getStoreReports: (storeId: string, params?: { startDate?: string; endDate?: string }) =>
    client.get(`/admin/stores/${storeId}/reports`, { params }).then((r) => r.data),

  getStore: (storeId: string) =>
    client.get(`/admin/stores/${storeId}`).then((r) => r.data),

  createStore: (data: { storeName: string; address?: string; phone?: string; gstNumber?: string; ownerName: string; ownerEmail: string; ownerPassword: string }) =>
    client.post('/admin/stores', data).then((r) => r.data),

  updateStoreDetails: (storeId: string, data: { name?: string; address?: string; phone?: string; gstNumber?: string; footerMessage?: string; invoicePrefix?: string }) =>
    client.put(`/admin/stores/${storeId}/details`, data).then((r) => r.data),

  deleteStore: (storeId: string) =>
    client.delete(`/admin/stores/${storeId}`).then((r) => r.data),
};
