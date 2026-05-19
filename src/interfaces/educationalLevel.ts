export interface EducationalLevel {
  id: number;
  description: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListEducationalLevelsParams {
  limit: number;
  offset: number;
}

export interface PaginatedEducationalLevelsResponse {
  items: EducationalLevel[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface EducationalLevelPayload {
  description: string;
}
