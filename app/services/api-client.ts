// services/api-client.ts
import { buildApiUrl } from '../utils/url';
import AsyncStorage from '../utils/async-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const SESSION_USER_KEY = 'wimmelwelt.sessionUser';

async function loadAuthToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: unknown; accessToken?: unknown };

    if (typeof parsed.token === 'string' && parsed.token) return parsed.token;
    if (typeof parsed.accessToken === 'string' && parsed.accessToken) return parsed.accessToken;

    return null;
  } catch {
    return null;
  }
}

export class ApiUnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'ApiUnauthorizedError';
  }
}


export type ApiRequestOptions = RequestInit & {
  method?: HttpMethod;
  headers?: HeadersInit;
};

async function safeReadText(response: Response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

async function normalizeHeaders(headers?: HeadersInit, body?: BodyInit | null) {
  const normalized = new Headers(headers ?? {});

  if (!normalized.has('Accept')) {
    normalized.set('Accept', 'application/json'); // [FIX]
  }

  if (body && !normalized.has('Content-Type')) {
    normalized.set('Content-Type', 'application/json'); // [FIX]
  }

  const authToken = await loadAuthToken();
  if (authToken && !normalized.has('Authorization')) {
    normalized.set('Authorization', `Bearer ${authToken}`);
  }

  return normalized;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { headers, method = 'GET', body = null, ...rest } = options;

  const url = buildApiUrl(path);
  const normalizedHeaders = await normalizeHeaders(headers, body);

  console.log('[API] ->', method, url); // [LOG]
  console.log('[API] stack', new Error().stack); // [LOG]

  const response = await fetch(url, {
    method,
    headers: normalizedHeaders,
    body,
    ...rest,
    credentials: 'include', // [FIX]
  });

  const textPreview = await safeReadText(response);
  const previewBody = textPreview.slice(0, 300);

  console.log('[API] <-', response.status, url, previewBody); // [LOG]

  if (response.status === 401) {
    throw new ApiUnauthorizedError(`Request failed with 401: ${textPreview}`);
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(textPreview) as unknown;
        throw new Error(`Request failed with ${response.status}: ${JSON.stringify(parsed)}`);
      } catch {
        throw new Error(`Request failed with ${response.status}: ${textPreview}`);
      }
    }

    throw new Error(`Request failed with ${response.status}: ${textPreview}`);
  }

  if (response.status === 204 || textPreview.length === 0) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response but received ${contentType || 'unknown content-type'}`);
  }

  try {
    return JSON.parse(textPreview) as T;
  } catch {
    throw new Error('Invalid JSON response from API');
  }
}
