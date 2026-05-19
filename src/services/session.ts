import type { AuthUser, LoginResponse } from '../interfaces/auth';

const ACCESS_TOKEN_KEY = 'jve2_admin_access_token';
const USER_KEY = 'jve2_admin_user';

const isBrowser = () => typeof window !== 'undefined';

export const getStoredAccessToken = () => {
  if (!isBrowser()) {
    return '';
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
};

export const getStoredUser = (): AuthUser | null => {
  if (!isBrowser()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
};

export const saveAccessToken = (accessToken: string) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const saveUser = (user: AuthUser) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const saveSession = (response: LoginResponse) => {
  saveAccessToken(response.accessToken);
  saveUser(response.user);
};

export const clearSession = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};
