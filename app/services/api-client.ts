// services/api-client.ts
import { buildApiUrl } from '../utils/url';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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

function normalizeHeaders(headers?: HeadersInit, body?: BodyInit | null) {
  const normalized = new Headers(headers ?? {});

  if (!normalized.has('Accept')) {
    normalized.set('Accept', 'application/json'); // [FIX]
  }

  if (body && !normalized.has('Content-Type')) {
    normalized.set('Content-Type', 'application/json'); // [FIX]
  }

  return normalized;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { headers, method = 'GET', body = null, ...rest } = options;

  const url = buildApiUrl(path);
  const normalizedHeaders = normalizeHeaders(headers, body);

  console.log('[API] ->', method, url); // [LOG]

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
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(textPreview) as T;
    } catch {
      // Wenn der Body kein valides JSON ist, geben wir die Rohdaten zurück
      return textPreview as unknown as T;
    }
  }

  return textPreview as unknown as T;
}
