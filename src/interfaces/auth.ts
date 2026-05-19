export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  deletedAt: string | null;
  role: 'admin' | 'student' | 'professor';
  subjectIds: number[];
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  user: AuthUser;
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
}
