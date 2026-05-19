import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '../interfaces/auth';
import type { ListSubjectsParams, PaginatedSubjectsResponse, Subject } from '../interfaces/subject';
import api from './api';

interface SubjectPayload {
  name: string;
  description?: string;
}

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  return fallbackMessage;
};

export const listSubjects = async (courseId: number, params: ListSubjectsParams) => {
  const response = await api.get<PaginatedSubjectsResponse>(`/courses/${courseId}/subjects`, {
    params,
  });
  return response.data;
};

export const getSubjectById = async (courseId: number, id: number) => {
  try {
    const response = await api.get<Subject>(`/courses/${courseId}/subjects/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao carregar dados.'));
  }
};

export const createSubject = async (courseId: number, payload: SubjectPayload, fallbackMessage: string) => {
  try {
    const response = await api.post<Subject>(`/courses/${courseId}/subjects`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const updateSubject = async (courseId: number, id: number, payload: SubjectPayload, fallbackMessage: string) => {
  try {
    const response = await api.patch<Subject>(`/courses/${courseId}/subjects/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const deleteSubject = async (courseId: number, id: number) => {
  try {
    await api.delete(`/courses/${courseId}/subjects/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao excluir o item. Tente novamente.'));
  }
};
