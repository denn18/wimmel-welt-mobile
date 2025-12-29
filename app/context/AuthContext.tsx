import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthUser } from '../types/auth';
import AsyncStorage from '../utils/async-storage';

const STORAGE_KEY = 'wimmelwelt.sessionUser';

type AuthContextValue = {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  setSessionUser: (nextUser: AuthUser | null) => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveRole(user: AuthUser | null): string | null {
  if (!user) return null;
  if (typeof user.role === 'string' && user.role) return user.role;
  if (user.daycareName || user.hasAvailability) return 'caregiver';
  return 'parent';
}

export function normalizeAuthUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;
  const role = resolveRole(user);
  const id = user.id ?? null;

  return { ...user, id, role };
}

async function readStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('[AUTH] no stored session'); // [LOG]
      return null;
    }
    const parsed = JSON.parse(raw) as AuthUser;
    const normalized = normalizeAuthUser(parsed);
    console.log('[AUTH] hydrated from storage', normalized); // [LOG]
    return normalized ?? null;
  } catch (error) {
    console.log('[AUTH] failed to read storage', error); // [LOG]
    return null;
  }
}

async function writeStoredUser(nextUser: AuthUser | null) {
  try {
    if (nextUser) {
      const normalized = normalizeAuthUser(nextUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      console.log('[AUTH] stored session user', normalized); // [LOG]
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[AUTH] cleared stored session'); // [LOG]
    }
  } catch (error) {
    console.log('[AUTH] failed to write storage', error); // [LOG]
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    const storedUser = await readStoredUser();
    setUser(storedUser);
    setLoading(false);
    return storedUser;
  }, []);

  const setSessionUser = useCallback(async (nextUser: AuthUser | null) => {
    const normalized = normalizeAuthUser(nextUser);
    await writeStoredUser(normalized);
    setUser(normalized);
    console.log('[AUTH] setSessionUser', normalized); // [LOG]
  }, []);

  const refresh = useCallback(async () => {
    console.log('[AUTH] refresh requested'); // [LOG]
    return hydrate();
  }, [hydrate]);

  const logout = useCallback(async () => {
    console.log('[AUTH] logout called'); // [LOG]
    await setSessionUser(null);
  }, [setSessionUser]);

  useEffect(() => {
    console.log('[AUTH] initializing provider'); // [LOG]
    void hydrate();
  }, [hydrate]);

  const value = useMemo(
    () => ({
      user,
      role: typeof user?.role === 'string' ? (user.role as string) : null,
      loading,
      setSessionUser,
      refresh,
      logout,
    }),
    [loading, logout, refresh, setSessionUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
