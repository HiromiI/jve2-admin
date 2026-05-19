export interface Subject {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListSubjectsParams {
  limit: number;
  offset: number;
}

export interface PaginatedSubjectsResponse {
  items: Subject[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
