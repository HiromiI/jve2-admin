import api from './api';
import type { AuthUser, LoginPayload, LoginResponse } from '../interfaces/auth';

export const login = async (payload: LoginPayload) => {
  const response = await api.post<LoginResponse>('/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post<{ message: string }>('/auth/logout');
  return response.data;
};
