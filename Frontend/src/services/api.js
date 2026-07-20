import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dispatch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || '';
      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('access denied')) {
        localStorage.removeItem('dispatch_token');
        localStorage.removeItem('dispatch_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
