import { useCallback, useEffect, useState } from 'react';

import { apiRequest } from '../services/api-client';
import { loadStoredAuthUser, persistAuthUser, removeStoredAuthUser } from '../services/auth-storage';
import type { AuthUser } from '../types/auth';

type AuthStatus = {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  setSessionUser: (user: AuthUser | null) => Promise<void>;
  clearSession: () => Promise<void>;
};

async function fetchAuthUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<AuthUser>('api/auth/me');
    return response ?? null;
  } catch (error) {
    console.warn('Konnte Auth-Status nicht abrufen', error);
    return null;
  }
}

export function useAuthStatus(): AuthStatus {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setSessionUser = useCallback(async (nextUser: AuthUser | null) => {
    if (nextUser) {
      await persistAuthUser(nextUser);
      setUser(nextUser);
      return;
    }

    await removeStoredAuthUser();
    setUser(null);
  }, []);

  const clearSession = useCallback(async () => {
    await removeStoredAuthUser();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);

    const storedUser = await loadStoredAuthUser();
    setUser((current) => current ?? storedUser);

    let latestUser = storedUser;

    if (storedUser) {
      const remoteUser = await fetchAuthUser();
      if (remoteUser) {
        latestUser = remoteUser;
        await persistAuthUser(remoteUser);
        setUser(remoteUser);
      }
    }

    if (!latestUser) {
      await removeStoredAuthUser();
      setUser(null);
    }

    setLoading(false);
    return latestUser;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedUser = await loadStoredAuthUser();
      if (cancelled) return;

      setUser((current) => current ?? storedUser);
      setLoading(false);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    role: typeof user?.role === 'string' ? (user.role as string) : null,
    loading,
    refresh,
    setSessionUser,
    clearSession,
  };
}
