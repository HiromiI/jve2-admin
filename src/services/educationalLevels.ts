import type {
  EducationalLevel,
  EducationalLevelPayload,
  ListEducationalLevelsParams,
  PaginatedEducationalLevelsResponse,
} from '../interfaces/educationalLevel';
import api from './api';

export const listEducationalLevels = async (params: ListEducationalLevelsParams) => {
  const response = await api.get<PaginatedEducationalLevelsResponse>('/educational_levels', {
    params,
  });
  return response.data;
};

export const createEducationalLevel = async (payload: EducationalLevelPayload) => {
  const response = await api.post<EducationalLevel>('/educational_levels', payload);
  return response.data;
};

export const updateEducationalLevel = async (id: number, payload: EducationalLevelPayload) => {
  const response = await api.patch<EducationalLevel>(`/educational_levels/${id}`, payload);
  return response.data;
};

export const deleteEducationalLevel = async (id: number) => {
  await api.delete(`/educational_levels/${id}`);
};
