// services/profile.ts
import { apiRequest } from './api-client';

export type ProfileUser = { id?: string | number | null; role?: string | null } & Record<string, unknown>;

function resolveRole(user: ProfileUser): string | null {
  if (typeof user.role === 'string' && user.role) return user.role;
  if (user.daycareName || user.hasAvailability) return 'caregiver';
  return 'parent';
}

export function profileEndpoint(user: ProfileUser) {
  const id = user?.id;
  const role = resolveRole(user);

  if (!id) {
    throw new Error('User id is required to resolve profile endpoint.');
  }

  if (!role) {
    throw new Error('User role is required to resolve profile endpoint.');
  }

  const endpoint = role === 'caregiver' ? `api/caregivers/${id}` : `api/parents/${id}`;

  console.log('[PROFILE] endpoint', endpoint, { id: user.id, role: user.role }); // [LOG]

  return endpoint;
}

export async function fetchProfile<T = unknown>(user: ProfileUser) {
  return apiRequest<T>(profileEndpoint(user), { method: 'GET' });
}

export async function updateProfile<T = unknown>(user: ProfileUser, payload: unknown) {
  return apiRequest<T>(profileEndpoint(user), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}



