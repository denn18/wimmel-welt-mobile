// services/connection/mongo.ts
import { buildApiUrl } from '../../utils/url';
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

function looksLikeHtml(contentType: string | null, body: string) {
  if (!contentType && !body) return false;
  const isHtmlHeader = contentType?.toLowerCase().includes('text/html');
  const normalizedBody = body.trim().toLowerCase();
  return isHtmlHeader || normalizedBody.startsWith('<!doctype html') || normalizedBody.startsWith('<html');
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

  const contentType = res.headers.get('content-type');
  const htmlDetected = looksLikeHtml(contentType, text);

  return { res, text, json, parseError, contentType, htmlDetected };
}

function buildErrorDetails(url: string, res: Response, text: string, contentType: string | null, parseError: boolean, htmlDetected: boolean, dbStatus: string) {
  const details: string[] = [`URL: ${url}`, `HTTP Status: ${res.status}`, `Content-Type: ${contentType || '—'}`, `database=${dbStatus}`];
  const snippet = responseSnippet(text);
  details.push(`Antwort: ${snippet || '—'}`);
  if (htmlDetected || parseError) {
    details.push('HTML statt JSON (wahrscheinlich Static/Catch-all überschreibt /readiness)');
  }
  return details.join(' | ');
}

export async function checkMongoConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();
  const url = buildApiUrl('/readiness');

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

    const errorDetails = buildErrorDetails(
      url,
      result.res,
      result.text,
      result.contentType,
      result.parseError,
      result.htmlDetected,
      dbStatus,
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
