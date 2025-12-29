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

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';

  if (!response.ok) {
    const errorBody = await safeReadText(response);
    throw new Error(`Request failed with ${response.status}: ${errorBody}`);
  }

  // 204 / empty responses
  const contentLength = response.headers.get('content-length');
  const hasContent = response.status !== 204 && contentLength !== '0';
  if (!hasContent) return undefined as T;

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

function normalizeHeaders(headers?: Record<string, string>) {
  const normalized: Record<string, string> = {
    Accept: 'application/json',
    ...(headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Array.isArray(headers)
        ? Object.fromEntries(headers)
        : headers),
  };
  // Nur setzen, wenn nicht vorhanden. (Wichtig für FormData etc.)
  if (!normalized['Content-Type']) {
    normalized['Content-Type'] = 'application/json';
  }
  return normalized;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { headers, method = 'GET', ...rest } = options;

  // buildApiUrl erwartet "api/..." oder "/api/..." -> macht immer korrekt absolute URL
  const url = buildApiUrl(path);

  // ✅ LOGS — HIER entstehen deine Logs
  // LOG-Quelle: apiRequest()
  // console.log('[API] ->', method, url);
  // eslint-disable-next-line no-console
  console.log('[API] ->', method, url); // <-- [API] -> GET https://.../api/....

  const response = await fetch(url, {
    method,
    headers: normalizeHeaders(headers),
    ...rest,
  });

  const textPreview = await safeReadText(response);

  // ✅ LOGS — HIER entstehen deine Logs
  // LOG-Quelle: apiRequest()
  // console.log('[API] <-', response.status, url, textPreview.slice(0, 500));
  // eslint-disable-next-line no-console
  console.log('[API] <-', response.status, url, textPreview.slice(0, 500)); // <-- [API] <- 200 https://... ...

  // Wir haben den Body schon gelesen (textPreview) -> für JSON sauber nochmal parsen:
  // Trick: Response kann nicht zweimal gelesen werden, also bauen wir es nach:
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${textPreview}`);
  }

  if (response.status === 204 || textPreview.length === 0) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(textPreview) as T;
    } catch {
      // Fallback: manche APIs liefern falsche Header
      return textPreview as unknown as T;
    }
  }

  return textPreview as unknown as T;
}




// import { buildApiUrl } from '../utils/url';

// type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// type ApiRequestOptions = RequestInit & {
//   method?: HttpMethod;
//   headers?: Record<string, string>;
// };

// async function handleResponse<T>(response: Response): Promise<T> {
//   if (!response.ok) {
//     const errorBody = await response.text();
//     throw new Error(`Request failed with ${response.status}: ${errorBody}`);
//   }

//   const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';
//   if (!hasContent) {
//     return undefined as T;
//   }

//   const contentType = response.headers.get('content-type') ?? '';
//   if (contentType.includes('application/json')) {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//     return (await response.json()) as T;
//   }

//   return (await response.text()) as unknown as T;
// }

// export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
//   const { headers, ...rest } = options;
//   const url = buildApiUrl(path);

//   const response = await fetch(url, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...headers,
//     },
//     credentials: 'include',
//     ...rest,
//   });

//   return handleResponse<T>(response);
// }
