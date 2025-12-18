import { buildApiUrl } from '../../utils/url';
import { ConnectionCheckResult } from './server';

export async function checkMongoConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();

  try {
    const response = await fetch(buildApiUrl('/readiness'));

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Readiness fehlgeschlagen (${response.status}): ${body || 'Keine Details'}`);
    }

    const payload = (await response.json()) as { status?: string; checks?: { database?: string } };
    const duration = Date.now() - startedAt;
    const dbStatus = payload?.checks?.database ?? 'unbekannt';

    if (payload?.status !== 'ok' || dbStatus !== 'ok') {
      throw new Error(`MongoDB Status: ${dbStatus}`);
    }

    return {
      status: 'ok',
      message: `MongoDB verbunden (${duration}ms)`,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startedAt;

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unbekannter MongoDB-Fehler',
      durationMs: duration,
    };
  }
}
