import axios from 'axios';

// Uses relative path — Vite automatically proxies /api to http://localhost:5000
const API = axios.create({
  baseURL: '/api', 
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('servicedesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        localStorage.setItem('servicedesk_token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('servicedesk_token');
        localStorage.removeItem('servicedesk_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;