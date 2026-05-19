export interface Role {
  id: number;
  description: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListRolesParams {
  limit: number;
  offset: number;
}

export interface PaginatedRolesResponse {
  items: Role[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface RolePayload {
  description: string;
}
