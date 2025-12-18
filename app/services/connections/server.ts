// services/connection/server.ts
import { buildApiUrl, buildFallbackApiUrl, getApiBaseUrl } from '../../utils/url';

export type ConnectionCheckResult = {
  status: 'ok' | 'error';
  message: string;
  durationMs: number;
};

const REQUEST_TIMEOUT_MS = 10_000;
const RESPONSE_SNIPPET_LIMIT = 500;

async function fetchWithTimeout(url: string, timeoutMs: number = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function responseSnippet(text: string) {
  if (!text) return '';
  if (text.length <= RESPONSE_SNIPPET_LIMIT) return text;
  return `${text.slice(0, RESPONSE_SNIPPET_LIMIT)}…`;
}

async function tryHealth(url: string) {
  const res = await fetchWithTimeout(url);
  const text = await res.text();

  let json: any = null;
  let parseError = false;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    parseError = true;
  }

  return { res, text, json, parseError };
}

function buildErrorDetails(url: string, res: Response, text: string, parseError: boolean) {
  const details: string[] = [`URL: ${url}`, `HTTP Status: ${res.status}`];
  const snippet = responseSnippet(text);
  details.push(`Antwort: ${snippet || '—'}`);
  if (parseError) {
    details.push('Antwort konnte nicht als JSON gelesen werden (HTML statt JSON?)');
  }
  return details.join(' | ');
}

export async function checkServerConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();
  const healthUrls = [buildApiUrl('/health')];
  const fallbackUrl = buildFallbackApiUrl('/health');
  if (fallbackUrl && !healthUrls.includes(fallbackUrl)) {
    healthUrls.push(fallbackUrl);
  }

  const errors: string[] = [];

  for (const url of healthUrls) {
    try {
      const result = await tryHealth(url);
      if (result.res.ok && result.json?.status === 'ok') {
        return {
          status: 'ok',
          message: `Server erreichbar (${url})`,
          durationMs: Date.now() - startedAt,
        };
      }

      const errorDetails = buildErrorDetails(url, result.res, result.text, result.parseError);
      errors.push(errorDetails);
    } catch (error) {
      errors.push(`URL: ${url} | Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    status: 'error',
    message: errors.join(' || '),
    durationMs: Date.now() - startedAt,
  };
}

export function getConnectionDebugInfo() {
  return {
    apiBaseUrl: getApiBaseUrl(),
  };
}
