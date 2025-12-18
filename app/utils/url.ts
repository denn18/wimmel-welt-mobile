import { environment } from '../config/environment';

const absoluteUrlPattern = /^https?:\/\//i;

type FileReferenceObject = { url?: string | null; key?: string | null };
export type FileReference = string | FileReferenceObject | null | undefined;

function normalizeCandidate(path?: FileReference) {
  if (!path) return '';
  if (typeof path === 'string') return path;
  if (path.url) return path.url;
  if (path.key) return `/api/files/${encodeURIComponent(path.key)}`;
  return '';
}

export function getApiBaseUrl() {
  const base = environment.apiUrl?.trim();
  return base ? base.replace(/\/$/, '') : '';
}

export function buildApiUrl(path: string) {
  if (absoluteUrlPattern.test(path)) {
    return path;
  }

  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/${sanitizedPath}` : `/${sanitizedPath}`;
}

export function assetUrl(path?: FileReference) {
  const candidate = normalizeCandidate(path);
  if (!candidate) return '';

  if (absoluteUrlPattern.test(candidate)) {
    return candidate;
  }

  const normalizedCandidate = candidate.startsWith('/') ? candidate : `/${candidate}`;
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedCandidate}` : normalizedCandidate;
}
