export type UserRole = 'admin' | 'student' | 'professor';

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  deletedAt: string | null;
  role: UserRole;
  subjectIds: number[];
}

export interface ListUsersParams {
  limit: number;
  offset: number;
}

export interface PaginatedUsersResponse {
  items: User[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UserPayload {
  role: UserRole;
  name: string;
  email: string;
  password?: string;
  subjectIds?: number[];
}
