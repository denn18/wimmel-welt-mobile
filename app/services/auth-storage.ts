import type { AuthUser } from '../types/auth';

const AUTH_USER_KEY = 'ww:authUser';

function getClientStorage(): Storage | null {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }

  return null;
}

const memoryStore: { user: AuthUser | null } = { user: null };

function readFromStorage(): AuthUser | null {
  const storage = getClientStorage();
  if (!storage) return memoryStore.user;

  try {
    const raw = storage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.warn('Konnte gespeicherten Nutzer nicht lesen', error);
    return null;
  }
}

export async function loadStoredAuthUser(): Promise<AuthUser | null> {
  return readFromStorage();
}

export async function persistAuthUser(user: AuthUser): Promise<void> {
  memoryStore.user = user;
  const storage = getClientStorage();

  if (!storage) return;

  try {
    storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Konnte Nutzer nicht speichern', error);
  }
}

export async function removeStoredAuthUser(): Promise<void> {
  memoryStore.user = null;
  const storage = getClientStorage();

  if (!storage) return;

  try {
    storage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.warn('Konnte gespeicherten Nutzer nicht löschen', error);
  }
}
