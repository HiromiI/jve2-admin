export interface Board {
  id: number;
  description: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListBoardsParams {
  limit: number;
  offset: number;
}

export interface PaginatedBoardsResponse {
  items: Board[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface BoardPayload {
  description: string;
}
