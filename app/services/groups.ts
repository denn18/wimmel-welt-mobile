import { apiRequest } from './api-client';

export type GroupRole = 'admin' | 'member';

export type GroupMember = {
  userId: string;
  name: string;
  role: GroupRole;
  joinedAt?: string;
  lastReadAt?: string;
  mutedUntil?: string | null;
  profileImageUrl?: string | null;
};

export type GroupSettings = {
  onlyAdminsCanWrite: boolean;
  participantsVisible: boolean;
};

export type Group = {
  id: string;
  facilityId?: string;
  createdByUserId: string;
  name: string;
  description?: string;
  logoImageUrl?: string | null;
  careTimes?: Array<{ startTime?: string; endTime?: string; activity?: string }>;
  settings: GroupSettings;
  members: GroupMember[];
  memberCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessageId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupAttachment = {
  url?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

export type GroupMessage = {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  body?: string | null;
  type?: 'message' | 'system';
  attachments?: GroupAttachment[];
  createdAt: string;
  readBy?: Array<{ userId: string; readAt: string }>;
};

export type GroupCandidate = {
  userId: string;
  name: string;
  source: 'contact' | 'recent_chat';
  lastInteractionAt?: string;
  profileImageUrl?: string | null;
};

async function requestWithFallback<T>(paths: string[], options?: Parameters<typeof apiRequest<T>>[1]) {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await apiRequest<T>(path, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function fetchGroups() {
  return requestWithFallback<Group[]>(['api/groups', 'api/betreuungsgruppen']);
}

export async function fetchGroupMessages(groupId: string) {
  return requestWithFallback<GroupMessage[]>([
    `api/groups/${groupId}/messages`,
    `api/betreuungsgruppen/${groupId}/messages`,
  ]);
}

export async function createGroup(payload: {
  facilityId?: string;
  name: string;
  description?: string;
  logoImageUrl?: string | null;
  careTimes?: Array<{ startTime?: string; endTime?: string; activity?: string }>;
  participantIds: string[];
  settings?: Partial<GroupSettings>;
}) {
  return requestWithFallback<Group>(['api/groups', 'api/betreuungsgruppen'], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchGroupCandidates() {
  return requestWithFallback<GroupCandidate[]>(['api/groups/candidates', 'api/betreuungsgruppen/candidates']);
}

export async function addGroupMember(groupId: string, userId: string) {
  return requestWithFallback<Group>([`api/groups/${groupId}/members`, `api/betreuungsgruppen/${groupId}/members`], {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return requestWithFallback<Group>([`api/groups/${groupId}/members/${userId}`, `api/betreuungsgruppen/${groupId}/members/${userId}`], {
    method: 'DELETE',
  });
}

export async function leaveGroup(groupId: string) {
  return requestWithFallback<void>([`api/groups/${groupId}/leave`, `api/betreuungsgruppen/${groupId}/leave`], {
    method: 'POST',
  });
}

export async function muteGroup(groupId: string, mutedUntil: string | null) {
  return requestWithFallback<Group>([`api/groups/${groupId}/mute`, `api/betreuungsgruppen/${groupId}/mute`], {
    method: 'POST',
    body: JSON.stringify({ mutedUntil }),
  });
}

export async function sendGroupMessage(
  groupId: string,
  payload: {
    body?: string;
    attachments?: Array<{ name?: string; data: string; mimeType?: string | null; size?: number | null }>;
  },
) {
  return requestWithFallback<GroupMessage>([
    `api/groups/${groupId}/messages`,
    `api/betreuungsgruppen/${groupId}/messages`,
  ], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
