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

export async function fetchGroups() {
  return apiRequest<Group[]>('api/groups');
}

export async function fetchGroupMessages(groupId: string) {
  return apiRequest<GroupMessage[]>(`api/groups/${groupId}/messages`);
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
  return apiRequest<Group>('api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchGroupCandidates() {
  return apiRequest<GroupCandidate[]>('api/groups/candidates');
}

export async function addGroupMember(groupId: string, userId: string) {
  return apiRequest<Group>(`api/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return apiRequest<Group>(`api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function leaveGroup(groupId: string) {
  return apiRequest<void>(`api/groups/${groupId}/leave`, {
    method: 'POST',
  });
}

export async function muteGroup(groupId: string, mutedUntil: string | null) {
  return apiRequest<Group>(`api/groups/${groupId}/mute`, {
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
  return apiRequest<GroupMessage>(`api/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
