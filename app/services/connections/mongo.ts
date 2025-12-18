// services/connection/mongo.ts
import { buildApiUrl, buildFallbackApiUrl } from '../../utils/url';
import type { ConnectionCheckResult } from './server';

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

async function tryReadiness(url: string) {
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

export async function checkMongoConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();
  const readinessUrls = [buildApiUrl('/readiness')];
  const fallbackUrl = buildFallbackApiUrl('/readiness');
  if (fallbackUrl && !readinessUrls.includes(fallbackUrl)) {
    readinessUrls.push(fallbackUrl);
  }

  const errors: string[] = [];

  for (const url of readinessUrls) {
    try {
      const result = await tryReadiness(url);
      const dbStatus = result.json?.checks?.database ?? 'unbekannt';

      if (result.res.ok && result.json?.status === 'ok' && dbStatus === 'ok') {
        return {
          status: 'ok',
          message: 'MongoDB verbunden',
          durationMs: Date.now() - startedAt,
        };
      }

      const errorDetails = buildErrorDetails(url, result.res, result.text, result.parseError);
      errors.push(`${errorDetails} | database=${dbStatus}`);
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
