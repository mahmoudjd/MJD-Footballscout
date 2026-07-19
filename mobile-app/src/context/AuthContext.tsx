import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthResponse, AuthSession } from "@/src/data/Types";
import { googleLoginUser, loginUser, refreshAccessToken, registerUser } from "@/src/apiServices";
import { loadAuthSession, saveAuthSession } from "@/src/utils/authSessionStorage";

const SESSION_TTL_MS = 60 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextType = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthReady: boolean;
  isAuthLoading: boolean;
  login: (input: LoginInput) => Promise<AuthSession>;
  loginWithGoogleIdToken: (idToken: string) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => void;
  refreshSession: () => Promise<AuthSession | null>;
  updateSession: (session: AuthSession | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toSession(response: AuthResponse): AuthSession {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    role: response.role,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const refreshInFlightRef = useRef<Promise<AuthSession | null> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      setIsAuthLoading(true);
      try {
        const storedSession = await loadAuthSession();
        if (!isMounted) return;
        if (!storedSession) {
          setSession(null);
          return;
        }

        const shouldRefreshSoon = storedSession.expiresAt <= Date.now() + REFRESH_THRESHOLD_MS;
        if (!shouldRefreshSoon) {
          setSession(storedSession);
          return;
        }

        try {
          const refreshed = await refreshAccessToken(storedSession.refreshToken);
          if (!isMounted) return;
          const refreshedSession: AuthSession = {
            ...storedSession,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || storedSession.refreshToken,
            role: refreshed.role || storedSession.role,
            expiresAt: Date.now() + SESSION_TTL_MS,
          };
          setSession(refreshedSession);
          await saveAuthSession(refreshedSession);
        } catch {
          if (!isMounted) return;
          setSession(null);
          await saveAuthSession(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
          setIsAuthReady(true);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (input: LoginInput) => {
    setIsAuthLoading(true);
    try {
      const response = await loginUser(input);
      const nextSession = toSession(response);
      setSession(nextSession);
      await saveAuthSession(nextSession);
      return nextSession;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsAuthLoading(true);
    try {
      const response = await registerUser(input);
      const nextSession = toSession(response);
      setSession(nextSession);
      await saveAuthSession(nextSession);
      return nextSession;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithGoogleIdToken = async (idToken: string) => {
    setIsAuthLoading(true);
    try {
      const response = await googleLoginUser({ idToken });
      const nextSession = toSession(response);
      setSession(nextSession);
      await saveAuthSession(nextSession);
      return nextSession;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    refreshInFlightRef.current = null;
    setSession(null);
    void saveAuthSession(null);
  };

  const refreshSession = async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const currentSession = session;
    if (!currentSession?.refreshToken) return null;

    refreshInFlightRef.current = (async () => {
      try {
        const refreshed = await refreshAccessToken(currentSession.refreshToken);
        const next: AuthSession = {
          ...currentSession,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || currentSession.refreshToken,
          role: refreshed.role || currentSession.role,
          expiresAt: Date.now() + SESSION_TTL_MS,
        };
        setSession(next);
        await saveAuthSession(next);
        return next;
      } catch (_error) {
        setSession(null);
        await saveAuthSession(null);
        return null;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    return refreshInFlightRef.current;
  };

  const updateSession = (next: AuthSession | null) => {
    setSession(next);
    void saveAuthSession(next);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isAdmin: session?.role === "admin",
      isAuthReady,
      isAuthLoading,
      login,
      loginWithGoogleIdToken,
      register,
      logout,
      refreshSession,
      updateSession,
    }),
    [session, isAuthReady, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
