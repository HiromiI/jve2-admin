import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { LoginResponse } from '../interfaces/auth';
import { clearSession, getStoredAccessToken, saveSession } from './session';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

const notifyLogout = () => {
  clearSession();
  window.dispatchEvent(new Event('auth:logout'));
};

const refreshAccessToken = async () => {
  const response = await refreshClient.post<LoginResponse>('/auth/refresh', {});

  saveSession(response.data);

  return response.data.accessToken;
};

api.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const accessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      notifyLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
