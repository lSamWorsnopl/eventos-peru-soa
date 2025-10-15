import axios from 'axios';

const baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 10000,
});

if (import.meta.env.DEV && import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[api] Ignorando VITE_API_BASE_URL en desarrollo; usando proxy de Vite.');
}

// Interceptor para agregar el token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de respuestas 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
