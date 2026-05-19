import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '../interfaces/auth';
import type { ListQuestionsParams, PaginatedQuestionsResponse, Question } from '../interfaces/question';
import api from './api';

const normalizeApiErrorMessage = (message: unknown): string => {
  if (typeof message === 'string') {
    return message.trim();
  }

  if (Array.isArray(message)) {
    return message
      .map((item) => normalizeApiErrorMessage(item))
      .filter(Boolean)
      .join('\n');
  }

  if (message && typeof message === 'object' && 'message' in message) {
    return normalizeApiErrorMessage((message as { message?: unknown }).message);
  }

  return '';
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseMessage = error.response?.data?.message;

    const normalizedMessage = normalizeApiErrorMessage(responseMessage);

    if (normalizedMessage) {
      return normalizedMessage;
    }
  }

  return fallbackMessage;
};

export const listQuestions = async (courseId: number, subjectId: number, params: ListQuestionsParams) => {
  const response = await api.get<PaginatedQuestionsResponse>(`/courses/${courseId}/subjects/${subjectId}/questions`, {
    params,
  });
  return response.data;
};

export const createQuestion = async (
  courseId: number,
  subjectId: number,
  payload: FormData,
  fallbackMessage: string,
) => {
  try {
    const response = await api.post<Question>(`/courses/${courseId}/subjects/${subjectId}/questions`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const updateQuestion = async (
  courseId: number,
  subjectId: number,
  id: number,
  payload: FormData,
  fallbackMessage: string,
) => {
  try {
    const response = await api.patch<Question>(`/courses/${courseId}/subjects/${subjectId}/questions/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const deleteQuestion = async (courseId: number, subjectId: number, id: number) => {
  try {
    await api.delete(`/courses/${courseId}/subjects/${subjectId}/questions/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao excluir o item. Tente novamente.'));
  }
};
