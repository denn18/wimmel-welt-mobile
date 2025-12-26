import { useEffect, useState } from 'react';

import { apiRequest } from '../services/api-client';

type AuthUser = { role?: string } | null;

type AuthStatus = {
  user: AuthUser;
  role: string | null;
  loading: boolean;
  refresh: () => Promise<AuthUser>;
};

async function fetchAuthUser(): Promise<AuthUser> {
  try {
    const response = await apiRequest<AuthUser>('api/auth/me');
    return response ?? null;
  } catch (error) {
    console.warn('Konnte Auth-Status nicht abrufen', error);
    return null;
  }
}

export function useAuthStatus(): AuthStatus {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const currentUser = await fetchAuthUser();
    setUser(currentUser);
    setLoading(false);
    return currentUser;
  };

  useEffect(() => {
    refresh();
  }, []);

  return { user, role: user?.role ?? null, loading, refresh };
}
