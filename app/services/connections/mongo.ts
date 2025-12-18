// services/connection/mongo.ts
import { buildApiUrl, buildFallbackApiUrl } from '../../utils/url';
import type { ConnectionCheckResult } from './server';

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(t);
  }
}

async function tryReadiness(url: string) {
  const res = await fetchWithTimeout(url, 10_000);
  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  return { res, text, json };
}

export async function checkMongoConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();

  const primaryUrl = buildApiUrl('/readiness');
  const fallbackUrl = buildFallbackApiUrl('/readiness');

  try {
    // 1) Primary
    const a = await tryReadiness(primaryUrl);

    const dbStatus = a.json?.checks?.database ?? 'unbekannt';
    if (a.res.ok && a.json?.status === 'ok' && dbStatus === 'ok') {
      return {
        status: 'ok',
        message: `MongoDB verbunden`,
        durationMs: Date.now() - startedAt,
      };
    }

    if (!a.res.ok) {
      throw new Error(
        `Primary /readiness fehlgeschlagen (${a.res.status}). URL: ${primaryUrl}\nAntwort: ${a.text || '—'}`
      );
    }

    throw new Error(
      `Primary /readiness nicht ok. URL: ${primaryUrl}\nstatus=${a.json?.status ?? '—'}, database=${dbStatus}\nAntwort: ${a.text || '—'}`
    );

    // 2) Fallback (wenn gewünscht/optional)
    // const b = await tryReadiness(fallbackUrl);
    // ...
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unbekannter MongoDB-Fehler',
      durationMs: Date.now() - startedAt,
    };
  }
}





// import { buildApiUrl } from '../../utils/url';
// import { ConnectionCheckResult } from './server';

// export async function checkMongoConnection(): Promise<ConnectionCheckResult> {
//   const startedAt = Date.now();

//   try {
//     const response = await fetch(buildApiUrl('/readiness'));

//     if (!response.ok) {
//       const body = await response.text();
//       throw new Error(`Readiness fehlgeschlagen (${response.status}): ${body || 'Keine Details'}`);
//     }

//     const payload = (await response.json()) as { status?: string; checks?: { database?: string } };
//     const duration = Date.now() - startedAt;
//     const dbStatus = payload?.checks?.database ?? 'unbekannt';

//     if (payload?.status !== 'ok' || dbStatus !== 'ok') {
//       throw new Error(`MongoDB Status: ${dbStatus}`);
//     }

//     return {
//       status: 'ok',
//       message: `MongoDB verbunden (${duration}ms)`,
//       durationMs: duration,
//     };
//   } catch (error) {
//     const duration = Date.now() - startedAt;

//     return {
//       status: 'error',
//       message: error instanceof Error ? error.message : 'Unbekannter MongoDB-Fehler',
//       durationMs: duration,
//     };
//   }
// }
