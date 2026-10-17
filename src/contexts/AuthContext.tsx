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
  avatarUrl?: string;
  role: string;
}
interface Session {
  user: User;
}
interface Auth {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [isLoading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const unsubscribe = onSessionExpired(() => setUser(null));
    refreshSession()
      .then(async (r) => {
        if (r.status === 401) return null;
        if (!r.ok) throw Error('Session service unavailable');
        return r.json() as Promise<Session>;
      })
      .then((s) => {
        if (active) setUser(s?.user ?? null);
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
  async function login(credentials: { email: string; password: string }) {
    setError(null);
    const session = await api<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(session.user);
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
        isAdmin: user?.role === 'admin',
        isLoading,
        error,
        login,
        logout,
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
