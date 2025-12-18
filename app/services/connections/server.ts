// services/connection/server.ts
import { buildApiUrl, buildFallbackApiUrl, getApiBaseUrl } from '../../utils/url';

export type ConnectionCheckResult = {
  status: 'ok' | 'error';
  message: string;
  durationMs: number;
};

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

async function tryHealth(url: string) {
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

export async function checkServerConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();

  const primaryUrl = buildApiUrl('/health');
  const fallbackUrl = buildFallbackApiUrl('/health');

  try {
    // 1) Primary
    const a = await tryHealth(primaryUrl);

    if (a.res.ok && a.json?.status === 'ok') {
      return {
        status: 'ok',
        message: `Server erreichbar (${getApiBaseUrl()})`,
        durationMs: Date.now() - startedAt,
      };
    }

    // Wenn Primary antwortet aber nicht ok → Fehler zeigen (wichtig für Diagnose)
    if (!a.res.ok) {
      throw new Error(
        `Primary /health fehlgeschlagen (${a.res.status}). URL: ${primaryUrl}\nAntwort: ${a.text || '—'}`
      );
    }
    if (a.json?.status !== 'ok') {
      throw new Error(
        `Primary /health meldet keinen OK-Status. URL: ${primaryUrl}\nAntwort: ${a.text || '—'}`
      );
    }

    // 2) Fallback (nur wenn Primary “komisch” war – normalerweise nie nötig)
    const b = await tryHealth(fallbackUrl);

    if (b.res.ok && b.json?.status === 'ok') {
      return {
        status: 'ok',
        message: `Server erreichbar (Fallback Render)`,
        durationMs: Date.now() - startedAt,
      };
    }

    throw new Error(
      `Fallback /health fehlgeschlagen (${b.res.status}). URL: ${fallbackUrl}\nAntwort: ${b.text || '—'}`
    );
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unbekannter Serverfehler',
      durationMs: Date.now() - startedAt,
    };
  }
}














// import { buildApiUrl } from '../../utils/url';

// export type ConnectionCheckResult = {
//   status: 'ok' | 'error';
//   message: string;
//   durationMs: number;
// };

// export async function checkServerConnection(): Promise<ConnectionCheckResult> {
//   const startedAt = Date.now();

//   try {
//     const response = await fetch(buildApiUrl('/health'));

//     if (!response.ok) {
//       const body = await response.text();
//       throw new Error(`Server antwortet mit ${response.status}: ${body || 'Keine Details'}`);
//     }

//     const payload = (await response.json()) as { status?: string; uptime?: number };
//     const duration = Date.now() - startedAt;

//     if (payload?.status !== 'ok') {
//       throw new Error('Server meldet keinen OK-Status.');
//     }

//     return {
//       status: 'ok',
//       message: `Server erreichbar (Antwortzeit ~${duration}ms)`,
//       durationMs: duration,
//     };
//   } catch (error) {
//     const duration = Date.now() - startedAt;

//     return {
//       status: 'error',
//       message: error instanceof Error ? error.message : 'Unbekannter Serverfehler',
//       durationMs: duration,
//     };
//   }
// }
