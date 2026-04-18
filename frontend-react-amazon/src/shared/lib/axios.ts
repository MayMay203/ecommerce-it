import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

// Access token lives in memory only — never localStorage
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly refresh_token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Never retry the refresh endpoint itself — prevents infinite loop.
    // Let useInitAuth handle refresh failures gracefully.
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.data.accessToken as string);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api.request(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
