import { buildApiUrl } from '../../utils/url';

export type ConnectionCheckResult = {
  status: 'ok' | 'error';
  message: string;
  durationMs: number;
};

export async function checkServerConnection(): Promise<ConnectionCheckResult> {
  const startedAt = Date.now();

  try {
    const response = await fetch(buildApiUrl('/health'));

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Server antwortet mit ${response.status}: ${body || 'Keine Details'}`);
    }

    const payload = (await response.json()) as { status?: string; uptime?: number };
    const duration = Date.now() - startedAt;

    if (payload?.status !== 'ok') {
      throw new Error('Server meldet keinen OK-Status.');
    }

    return {
      status: 'ok',
      message: `Server erreichbar (Antwortzeit ~${duration}ms)`,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startedAt;

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unbekannter Serverfehler',
      durationMs: duration,
    };
  }
}
