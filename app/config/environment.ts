export type AppEnvironment = 'development' | 'staging' | 'production';

const allowedEnvironments: AppEnvironment[] = ['development', 'staging', 'production'];

const rawEnv = process.env.EXPO_PUBLIC_APP_ENV?.toLowerCase() as AppEnvironment | undefined;
const normalizedEnv: AppEnvironment = rawEnv && allowedEnvironments.includes(rawEnv) ? rawEnv : 'staging';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}

export const environment = {
  name: normalizedEnv,
  apiUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:2000'),
  otlpEndpoint: normalizeBaseUrl(
    process.env.EXPO_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ?? 'https://otel.wimmelwelt.de'
  ),
  logEndpoint: normalizeBaseUrl(process.env.EXPO_PUBLIC_LOG_ENDPOINT ?? 'https://logs.wimmelwelt.de'),
};

export const isProduction = environment.name === 'production';
