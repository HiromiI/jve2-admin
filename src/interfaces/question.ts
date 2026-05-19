export interface QuestionSkillSummary {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  subjectId: number;
  roleId: number;
  boardId: number;
  institutionId: number;
  educationalLevelId: number;
  year: number;
  question: string;
  image: string | null;
  alternative1: string;
  alternative1Image: string | null;
  alternative1Correct: 'Y' | 'N';
  alternative2: string;
  alternative2Image: string | null;
  alternative2Correct: 'Y' | 'N';
  alternative3: string;
  alternative3Image: string | null;
  alternative3Correct: 'Y' | 'N';
  alternative4: string;
  alternative4Image: string | null;
  alternative4Correct: 'Y' | 'N';
  alternative5: string;
  alternative5Image: string | null;
  alternative5Correct: 'Y' | 'N';
  skillIds: number[];
  skills: QuestionSkillSummary[];
  createdAt: string;
  deletedAt: string | null;
}

export interface ListQuestionsParams {
  limit: number;
  offset: number;
  roleId?: number;
  boardId?: number;
  institutionId?: number;
  educationalLevelId?: number;
  year?: number;
  search?: string;
}

export interface PaginatedQuestionsResponse {
  items: Question[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
