import { apiRequest } from './api-client';

export type ProfileUser = { id?: string | number | null; role?: string | null };

export function profileEndpoint(user: ProfileUser) {
  const { id, role } = user;
  if (!id || !role) {
    throw new Error('User id and role are required to resolve profile endpoint.');
  }

  return role === 'caregiver' ? `api/caregivers/${id}` : `api/parents/${id}`;
}

export async function fetchProfile<T = unknown>(user: ProfileUser) {
  return apiRequest<T>(profileEndpoint(user));
}

export async function updateProfile<T = unknown>(user: ProfileUser, payload: unknown) {
  return apiRequest<T>(profileEndpoint(user), { method: 'PATCH', body: JSON.stringify(payload) });
}
