import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError, setCsrfToken, setUnauthorizedHandler } from "./api";

interface Admin {
  email: string;
  name: string;
}
interface AuthState {
  admin: Admin | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  expired: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/** Сессия проверяется на сервере при каждом открытии/обновлении страницы */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAdmin(null);
      setCsrfToken("");
      setExpired(true);
    });
    api
      .get<{ admin: Admin; csrfToken: string }>("/auth/session")
      .then((r) => {
        setCsrfToken(r.csrfToken);
        setAdmin(r.admin);
      })
      .catch((e) => {
        if (!(e instanceof ApiError) || e.status !== 401) console.error(e);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.post<{ admin: Admin; csrfToken: string }>("/auth/login", { email, password });
    setCsrfToken(r.csrfToken);
    setExpired(false);
    setAdmin(r.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setCsrfToken("");
      setAdmin(null);
    }
  }, []);

  return <AuthContext.Provider value={{ admin, checking, login, logout, expired }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider не подключен");
  return ctx;
}
