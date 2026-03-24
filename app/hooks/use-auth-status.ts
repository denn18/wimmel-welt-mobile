// hooks/use-auth-status.ts
import { useCallback, useMemo } from 'react';
import { normalizeAuthUser, useAuth } from '../context/AuthContext';

type AnyUser = ReturnType<typeof normalizeAuthUser>;

/**
 * ✅ Verbesserte Version:
 * - user & role sind immer normalisiert
 * - refresh() liefert den (neuen) User zurück, damit Caller ihn sofort verwenden können (Navbar Fix!)
 * - setSessionUser() liefert ebenfalls den (gespeicherten) User zurück
 */
export function useAuthStatus() {
  const auth = useAuth();

  // Normalisierung nur einmal pro auth.user Änderung
  const user = useMemo(() => normalizeAuthUser(auth.user), [auth.user]);

  const role = useMemo(() => {
    const normalizedRole = typeof user?.role === 'string' ? user.role : null;
    return normalizedRole ?? auth.role ?? null;
  }, [user?.role, auth.role]);

  /**
   * ✅ KRITISCH:
   * In deiner Navbar hast du sowas:
   *   if (!user) await refresh();
   *   const authUser = user; // <-- bleibt in der selben Funktion oft "alt"
   *
   * Lösung: refresh() gibt den User zurück, damit du sofort damit weiterarbeiten kannst:
   *   const authUser = user ?? (await refresh());
   */
  const refresh = useCallback(async (): Promise<AnyUser | null> => {
    // auth.refresh() kann void sein — wir holen danach den "neuen" Zustand aus auth.user
    await auth.refresh?.();

    // Direkt danach nochmal normalisieren (wichtig, weil state update async ist)
    const next = normalizeAuthUser(auth.user);

    return next ?? null;
  }, [auth]);

  /**
   * Optional aber extrem hilfreich:
   * Login-Screen kann direkt den gespeicherten User bekommen.
   */
  const setSessionUser = useCallback(
    async (nextUser: unknown): Promise<AnyUser | null> => {
      const normalized = normalizeAuthUser(nextUser as any);

      await auth.setSessionUser?.(normalized ?? null);

      return normalized ?? null;
    },
    [auth],
  );

  return {
    ...auth,

    // ✅ überschreiben wir bewusst:
    user,
    role,

    // ✅ Fix-APIs:
    refresh, // returns user|null
    setSessionUser, // returns user|null
  };
}

