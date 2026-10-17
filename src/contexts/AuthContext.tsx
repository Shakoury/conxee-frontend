import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, refreshSession, onSessionExpired } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  is_verified: boolean;
  student_verification_status: string;
  avatar_url?: string | null;
  avatarUrl?: string;
  role: string;
}
interface Auth {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<User | null>;
}
const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onSessionExpired(() => {
      if (active) setUser(null);
    });
    refreshSession()
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error('Session service unavailable');
        return api<User>('/users/me');
      })
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active)
          setError('Unable to restore your session. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function reload() {
    setError(null);
    try {
      const profile = await api<User>('/users/me');
      if (
        !profile ||
        typeof profile.id !== 'string' ||
        typeof profile.username !== 'string'
      )
        throw Error('Invalid profile');
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }
  async function login(credentials: { email: string; password: string }) {
    setError(null);
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const currentUser = await api<User>('/users/me');
    setUser(currentUser);
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: false, // The backend has a separate admin host and session.
        isLoading,
        error,
        login,
        logout,
        reload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw Error('useAuth requires AuthProvider');
  return value;
}
