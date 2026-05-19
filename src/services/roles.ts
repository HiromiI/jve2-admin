import type { ListRolesParams, PaginatedRolesResponse, Role, RolePayload } from '../interfaces/role';
import api from './api';

export const listRoles = async (params: ListRolesParams) => {
  const response = await api.get<PaginatedRolesResponse>('/roles', {
    params,
  });
  return response.data;
};

export const createRole = async (payload: RolePayload) => {
  const response = await api.post<Role>('/roles', payload);
  return response.data;
};

export const updateRole = async (id: number, payload: RolePayload) => {
  const response = await api.patch<Role>(`/roles/${id}`, payload);
  return response.data;
};

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`);
};
