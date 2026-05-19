import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '../interfaces/auth';
import type { ListUsersParams, PaginatedUsersResponse, User, UserPayload } from '../interfaces/user';
import api from './api';

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  return fallbackMessage;
};

export const listUsers = async (params: ListUsersParams) => {
  const response = await api.get<PaginatedUsersResponse>('/users', {
    params,
  });
  return response.data;
};

export const createUser = async (payload: UserPayload) => {
  try {
    const response = await api.post<User>('/users', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao cadastrar um novo Usuário.'));
  }
};

export const updateUser = async (id: number, payload: UserPayload) => {
  try {
    const response = await api.patch<User>(`/users/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao editar o Usuário. Tente novamente.'));
  }
};

export const deleteUser = async (id: number) => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao excluir o item. Tente novamente.'));
  }
};
