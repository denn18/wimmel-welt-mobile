import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthUser } from '../types/auth';

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

async function readStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('[AUTH] no stored session'); // [LOG]
      return null;
    }
    const parsed = JSON.parse(raw) as AuthUser;
    console.log('[AUTH] hydrated from storage', parsed); // [LOG]
    return parsed ?? null;
  } catch (error) {
    console.log('[AUTH] failed to read storage', error); // [LOG]
    return null;
  }
}

async function writeStoredUser(nextUser: AuthUser | null) {
  try {
    if (nextUser) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      console.log('[AUTH] stored session user', nextUser); // [LOG]
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
    await writeStoredUser(nextUser);
    setUser(nextUser);
    console.log('[AUTH] setSessionUser', nextUser); // [LOG]
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
