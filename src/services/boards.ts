import type { Board, BoardPayload, ListBoardsParams, PaginatedBoardsResponse } from '../interfaces/board';
import api from './api';

export const listBoards = async (params: ListBoardsParams) => {
  const response = await api.get<PaginatedBoardsResponse>('/boards', {
    params,
  });
  return response.data;
};

export const createBoard = async (payload: BoardPayload) => {
  const response = await api.post<Board>('/boards', payload);
  return response.data;
};

export const updateBoard = async (id: number, payload: BoardPayload) => {
  const response = await api.patch<Board>(`/boards/${id}`, payload);
  return response.data;
};

export const deleteBoard = async (id: number) => {
  await api.delete(`/boards/${id}`);
};
