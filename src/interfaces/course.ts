export interface Course {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  planCode: string | null;
  price: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListCoursesParams {
  limit: number;
  offset: number;
}

export interface PaginatedCoursesResponse {
  items: Course[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
