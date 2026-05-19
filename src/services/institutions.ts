import type {
  Institution,
  InstitutionPayload,
  ListInstitutionsParams,
  PaginatedInstitutionsResponse,
} from '../interfaces/institution';
import api from './api';

export const listInstitutions = async (params: ListInstitutionsParams) => {
  const response = await api.get<PaginatedInstitutionsResponse>('/institutions', {
    params,
  });
  return response.data;
};

export const createInstitution = async (payload: InstitutionPayload) => {
  const response = await api.post<Institution>('/institutions', payload);
  return response.data;
};

export const updateInstitution = async (id: number, payload: InstitutionPayload) => {
  const response = await api.patch<Institution>(`/institutions/${id}`, payload);
  return response.data;
};

export const deleteInstitution = async (id: number) => {
  await api.delete(`/institutions/${id}`);
};
