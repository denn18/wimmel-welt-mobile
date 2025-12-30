// utils/url.ts

const DEFAULT_API_URL = 'https://www.wimmel-welt.de';

const absoluteUrlPattern = /^https?:\/\//i;
const localHostPattern = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])/i;

export type FileReference = string | { url?: string | null; key?: string | null } | null | undefined;

function normalizeToHttps(candidate: string): string | null {
  if (!candidate) return null;
  const withProtocol = absoluteUrlPattern.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'https:') return null;
    if (localHostPattern.test(url.hostname)) return null;
    return url.origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function envApiUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) return null;
  return normalizeToHttps(value);
}

export function getApiBaseUrl(): string {
  return envApiUrl() || DEFAULT_API_URL;
}

function ensureLeadingSlash(path: string): string {
  if (!path) return '/';
  const normalized = path.replace(/^\/+/, '');
  return `/${normalized}`;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, ''); // [FIX]
  const cleanPath = ensureLeadingSlash(path); // [FIX]
  return `${base}${cleanPath}`;
}

function normalizeCandidate(path?: FileReference) {
  if (!path) return '';
  if (typeof path === 'string') return path;
  if (path.url) return path.url;
  if (path.key) return `/api/files/${encodeURIComponent(path.key)}`;
  return '';
}

export function assetUrl(path?: FileReference) {
  const candidate = normalizeCandidate(path);
  if (!candidate) return '';

  if (absoluteUrlPattern.test(candidate)) {
    return candidate;
  }

  const normalizedCandidate = candidate.startsWith('/') ? candidate : `/${candidate}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${normalizedCandidate}`;
}

export function logApiBaseUrlForDebug() {
  // eslint-disable-next-line no-console
  console.log('[API] Base URL:', getApiBaseUrl());
}

export function getConnectionDebugInfo() {
  return {
    apiBaseUrl: getApiBaseUrl(),
  };
}