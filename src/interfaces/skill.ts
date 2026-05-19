export interface Skill {
  id: number;
  subjectId: number;
  name: string;
  description: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ListSkillsParams {
  limit: number;
  offset: number;
}

export interface PaginatedSkillsResponse {
  items: Skill[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
