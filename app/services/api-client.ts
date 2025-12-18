import { buildApiUrl } from '../utils/url';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiRequestOptions = RequestInit & {
  method?: HttpMethod;
  headers?: Record<string, string>;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Request failed with ${response.status}: ${errorBody}`);
  }

  const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0';
  if (!hasContent) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { headers, ...rest } = options;
  const url = buildApiUrl(path);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  return handleResponse<T>(response);
}
