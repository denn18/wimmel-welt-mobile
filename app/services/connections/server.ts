// services/connection/server.ts
import { buildApiUrl, getApiBaseUrl } from '../../utils/url';

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

function looksLikeHtml(contentType: string | null, body: string) {
  if (!contentType && !body) return false;
  const isHtmlHeader = contentType?.toLowerCase().includes('text/html');
  const normalizedBody = body.trim().toLowerCase();
  return isHtmlHeader || normalizedBody.startsWith('<!doctype html') || normalizedBody.startsWith('<html');
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

  const contentType = res.headers.get('content-type');
  const htmlDetected = looksLikeHtml(contentType, text);

  return { res, text, json, parseError, contentType, htmlDetected };
}

function buildErrorDetails(url: string, res: Response, text: string, contentType: string | null, parseError: boolean, htmlDetected: boolean) {
  const details: string[] = [`URL: ${url}`, `HTTP Status: ${res.status}`, `Content-Type: ${contentType || '—'}`];
  const snippet = responseSnippet(text);
  details.push(`Antwort: ${snippet || '—'}`);
  if (htmlDetected || parseError) {
    details.push('HTML statt JSON (wahrscheinlich Static/Catch-all überschreibt /health)');
  }
  return details.join(' | ');
}

export async function checkServerConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();
  const url = buildApiUrl('/health');

  try {
    const result = await tryHealth(url);
    if (result.res.ok && result.json?.status === 'ok') {
      return {
        status: 'ok',
        message: `Server erreichbar (${url})`,
        durationMs: Date.now() - startedAt,
      };
    }

    const errorDetails = buildErrorDetails(
      url,
      result.res,
      result.text,
      result.contentType,
      result.parseError,
      result.htmlDetected,
    );

    return {
      status: 'error',
      message: errorDetails,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: 'error',
      message: `URL: ${url} | Fehler: ${error instanceof Error ? error.message : String(error)}`,
      durationMs: Date.now() - startedAt,
    };
  }
}

export function getConnectionDebugInfo() {
  return {
    apiBaseUrl: getApiBaseUrl(),
  };
}
