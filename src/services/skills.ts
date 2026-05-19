import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '../interfaces/auth';
import type { ListSkillsParams, PaginatedSkillsResponse, Skill } from '../interfaces/skill';
import api from './api';

interface SkillPayload {
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

export const listSkills = async (courseId: number, subjectId: number, params: ListSkillsParams) => {
  const response = await api.get<PaginatedSkillsResponse>(`/courses/${courseId}/subjects/${subjectId}/skills`, {
    params,
  });
  return response.data;
};

export const createSkill = async (
  courseId: number,
  subjectId: number,
  payload: SkillPayload,
  fallbackMessage: string,
) => {
  try {
    const response = await api.post<Skill>(`/courses/${courseId}/subjects/${subjectId}/skills`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const updateSkill = async (
  courseId: number,
  subjectId: number,
  id: number,
  payload: SkillPayload,
  fallbackMessage: string,
) => {
  try {
    const response = await api.patch<Skill>(`/courses/${courseId}/subjects/${subjectId}/skills/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};

export const deleteSkill = async (courseId: number, subjectId: number, id: number) => {
  try {
    await api.delete(`/courses/${courseId}/subjects/${subjectId}/skills/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Erro ao excluir o item. Tente novamente.'));
  }
};
