import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthUser, LoginResponse } from '../interfaces/auth';
import { getMe, logout } from '../services/auth';
import {
  clearSession,
  getStoredAccessToken,
  getStoredUser,
  saveSession,
  saveUser,
} from '../services/session';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (response: LoginResponse) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const signIn = useCallback((response: LoginResponse) => {
    saveSession(response);
    setUser(response.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      clearSession();
      setUser(null);
      return;
    }

    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = getStoredAccessToken();

      if (!storedAccessToken) {
        setUser(null);
        setIsBootstrapping(false);
        return;
      }

      try {
        const authenticatedUser = await getMe();
        saveUser(authenticatedUser);
        setUser(authenticatedUser);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void initializeAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      clearSession();
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      signIn,
      signOut,
    }),
    [isBootstrapping, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export { AuthProvider };
