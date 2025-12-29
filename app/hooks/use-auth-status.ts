import { normalizeAuthUser, useAuth } from '../context/AuthContext';

export function useAuthStatus() {
  const auth = useAuth();
  const normalizedUser = normalizeAuthUser(auth.user);

  return {
    ...auth,
    user: normalizedUser,
    role: typeof normalizedUser?.role === 'string' ? (normalizedUser.role as string) : auth.role,
  };
}
