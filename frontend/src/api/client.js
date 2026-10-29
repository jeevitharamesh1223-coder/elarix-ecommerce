import axios from 'axios';

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // If running on Vite dev server (port 5173), point to backend server port 5000
    if (isLocalhost && window.location.port !== '5000') {
      return 'http://localhost:5000';
    }
    // If served by the production server or behind reverse proxy, use current origin
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = resolveBaseUrl().replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
