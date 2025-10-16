import axios from 'axios';

const baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

if (import.meta.env.DEV && import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[api] Ignorando VITE_API_BASE_URL en desarrollo; usando proxy de Vite.');
}

// No agregamos Authorization; usamos cookie HttpOnly gestionada por el backend

// Manejo global de respuestas 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('user');
      // Evitar bucle de recarga: no redirigir si ya estamos en /login
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
