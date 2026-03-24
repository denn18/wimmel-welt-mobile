import type { AuthUser } from '../types/auth';

const AUTH_USER_KEY = 'ww:authUser';
const AUTH_TOKEN_KEY = 'ww:authToken';

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

const memoryStore: { user: AuthUser | null; token: string | null } = { user: null, token: null };


function extractAuthToken(user: AuthUser | null): string | null {
  if (!user) return null;

  if (typeof user.token === 'string' && user.token) return user.token;
  if (typeof user.accessToken === 'string' && user.accessToken) return user.accessToken;

  return null;
}

function withAuthToken(user: AuthUser | null, token: string | null): AuthUser | null {
  if (!user) return null;
  if (!token) return user;
  return { ...user, token, accessToken: token };
}

function readFromStorage(): AuthUser | null {
  const storage = getClientStorage();
  if (!storage) return withAuthToken(memoryStore.user, memoryStore.token);

  try {
    const raw = storage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    const storedToken = storage.getItem(AUTH_TOKEN_KEY);
    const token = storedToken || extractAuthToken(parsed);
    memoryStore.token = token;
    return withAuthToken(parsed, token);
  } catch (error) {
    return null;
  }
}

export async function loadStoredAuthUser(): Promise<AuthUser | null> {
  return readFromStorage();
}

export async function persistAuthUser(user: AuthUser): Promise<void> {
  const token = extractAuthToken(user);
  memoryStore.user = withAuthToken(user, token);
  memoryStore.token = token;
  const storage = getClientStorage();

  if (!storage) return;

  try {
    storage.setItem(AUTH_USER_KEY, JSON.stringify(withAuthToken(user, token)));
    if (token) storage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
  }
}

export async function removeStoredAuthUser(): Promise<void> {
  memoryStore.user = null;
  memoryStore.token = null;
  const storage = getClientStorage();

  if (!storage) return;

  try {
    storage.removeItem(AUTH_USER_KEY);
    storage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
  }
}

export async function loadStoredAuthToken(): Promise<string | null> {
  const user = await loadStoredAuthUser();
  return extractAuthToken(user);
}
