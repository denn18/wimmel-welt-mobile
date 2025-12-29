import { buildApiUrl } from '../utils/url';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = RequestInit & {
  method?: HttpMethod;
  headers?: HeadersInit;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';

  if (!response.ok) {
    const errorBody = hasContent
      ? contentType.includes('application/json')
        ? JSON.stringify(await response.json())
        : await response.text()
      : '';
    throw new Error(`Request failed with ${response.status}: ${errorBody}`);
  }

  if (!hasContent) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { headers = {}, body, method = 'GET', ...rest } = options;
  const url = buildApiUrl(path);

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Array.isArray(headers)
        ? Object.fromEntries(headers)
        : headers),
  };

  if (body && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  console.log('[API] ->', method, url, { hasBody: Boolean(body) }); // [LOG]

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body,
    credentials: 'include',
    ...rest,
  });

  console.log('[API] <-', response.status, url); // [LOG]

  return handleResponse<T>(response);
}
