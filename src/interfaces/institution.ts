export interface Institution {
  id: number;
  description: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListInstitutionsParams {
  limit: number;
  offset: number;
}

export interface PaginatedInstitutionsResponse {
  items: Institution[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface InstitutionPayload {
  description: string;
}
