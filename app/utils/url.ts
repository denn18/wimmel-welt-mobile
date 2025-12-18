
// utils/url.ts

/**
 * Production URLs
 * - Primary: deine Domain
 * - Fallback: Render
 */
const PROD_PRIMARY = 'https://www.wimmel-welt.de';
const PROD_FALLBACK = 'https://www.wimmel-welt.onrender.com';

/**
 * Optional: per ENV überschreiben (für Staging/Test)
 * In Expo:
 *   EXPO_PUBLIC_API_URL=https://staging.wimmel-welt.de
 */
function envApiUrl(): string | null {
  const v = process.env.EXPO_PUBLIC_API_URL?.trim();
  return v ? v.replace(/\/+$/, '') : null;
}

/**
 * Diese Funktion liefert IMMER eine gültige HTTPS Base URL.
 * Keine localhost-Logik mehr.
 */
export function getApiBaseUrl(): string {
  const env = envApiUrl();
  if (env) return env;

  // Default: Prod Primary Domain
  return PROD_PRIMARY;
}

export function getApiFallbackBaseUrl(): string {
  return PROD_FALLBACK;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export function buildFallbackApiUrl(path: string): string {
  const base = getApiFallbackBaseUrl();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}



















// import { environment } from '../config/environment';

// const absoluteUrlPattern = /^https?:\/\//i;

// type FileReferenceObject = { url?: string | null; key?: string | null };
// export type FileReference = string | FileReferenceObject | null | undefined;

// function normalizeCandidate(path?: FileReference) {
//   if (!path) return '';
//   if (typeof path === 'string') return path;
//   if (path.url) return path.url;
//   if (path.key) return `/api/files/${encodeURIComponent(path.key)}`;
//   return '';
// }

// export function getApiBaseUrl() {
//   const base = environment.apiUrl?.trim();
//   return base ? base.replace(/\/$/, '') : '';
// }

// export function buildApiUrl(path: string) {
//   if (absoluteUrlPattern.test(path)) {
//     return path;
//   }

//   const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
//   const baseUrl = getApiBaseUrl();
//   return baseUrl ? `${baseUrl}/${sanitizedPath}` : `/${sanitizedPath}`;
// }

// export function assetUrl(path?: FileReference) {
//   const candidate = normalizeCandidate(path);
//   if (!candidate) return '';

//   if (absoluteUrlPattern.test(candidate)) {
//     return candidate;
//   }

//   const normalizedCandidate = candidate.startsWith('/') ? candidate : `/${candidate}`;
//   const baseUrl = getApiBaseUrl();
//   return baseUrl ? `${baseUrl}${normalizedCandidate}` : normalizedCandidate;
// }
