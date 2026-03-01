import axios from 'axios';

// Runtime override: localStorage 'zen_api_url' takes priority over build-time VITE_API_URL
export const getApiBase = () =>
  localStorage.getItem('zen_api_url') || import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: getApiBase(),
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',  // bypass localtunnel verification page
  },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, redirect to login
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
