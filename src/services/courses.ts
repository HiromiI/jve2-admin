import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '../interfaces/auth';
import type { Course, ListCoursesParams, PaginatedCoursesResponse } from '../interfaces/course';
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

export const listCourses = async (params: ListCoursesParams) => {
  const response = await api.get<PaginatedCoursesResponse>('/courses', {
    params,
  });
  return response.data;
};

export const getCourseById = async (id: number) => {
  try {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao carregar dados.'));
  }
};

export const createCourse = async (payload: FormData) => {
  try {
    const response = await api.post<Course>('/courses', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao cadastrar um novo Curso.'));
  }
};

export const updateCourse = async (id: number, payload: FormData) => {
  try {
    const response = await api.patch<Course>(`/courses/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao editar o Curso. Tente novamente.'));
  }
};

export const deleteCourse = async (id: number) => {
  try {
    await api.delete(`/courses/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao excluir o item. Tente novamente.'));
  }
};
