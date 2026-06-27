import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, clearToken, getToken, setToken, type Quota, type User } from "./api";

interface AuthState {
  user: User | null;
  quota: Quota | null;
  loading: boolean;
  signInWithToken: (token: string, user: User) => void;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setQuota(null);
      setLoading(false);
      return;
    }
    try {
      const { user, quota } = await api.me();
      setUser(user);
      setQuota(quota);
    } catch {
      clearToken();
      setUser(null);
      setQuota(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signInWithToken = useCallback((token: string, nextUser: User) => {
    setToken(token);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    setQuota(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, quota, loading, signInWithToken, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
