import { apiRequest } from './api-client';

export type MatchRecord = {
  id: string;
  parentId: string;
  caregiverId: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchMatchHistory() {
  return apiRequest<MatchRecord[]>('api/matches/history');
}
