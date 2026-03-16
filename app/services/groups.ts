import { apiRequest, type ApiRequestOptions } from './api-client';
import { fetchMatchHistory } from './matches';

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

const GROUP_BASE_PATHS = ['api/groups', 'api/group-chats', 'api/betreuungsgruppen'];

async function getWithFallback<T>(suffix = '') {
  let lastError: unknown;

  for (const basePath of GROUP_BASE_PATHS) {
    try {
      return await apiRequest<T>(`${basePath}${suffix}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No compatible group API endpoint found.');
}

async function mutateWithFallback<T>(suffix: string, options: ApiRequestOptions) {
  let lastError: unknown;

  for (const basePath of GROUP_BASE_PATHS) {
    try {
      return await apiRequest<T>(`${basePath}${suffix}`, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No compatible group API endpoint found.');
}

export async function fetchGroups(userId?: string) {
  const groups = await getWithFallback<Group[]>();
  if (!userId) return groups;

  return (groups ?? []).filter(
    (group) => group.createdByUserId === userId || group.members?.some((member) => member.userId === userId),
  );
}

export async function fetchGroupMessages(groupId: string) {
  return getWithFallback<GroupMessage[]>(`/${groupId}/messages`);
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
  return mutateWithFallback<Group>('', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchGroupCandidates(userId: string) {
  try {
    return await getWithFallback<GroupCandidate[]>('/candidates');
  } catch {
    const history = await fetchMatchHistory();
    const parentIds = history.filter((item) => item.caregiverId === userId).map((item) => item.parentId);

    return Array.from(new Set(parentIds)).map((parentId) => ({
      userId: parentId,
      name: `Elternaccount ${parentId.slice(0, 6)}`,
      source: 'contact' as const,
    }));
  }
}

export async function addGroupMember(groupId: string, userId: string) {
  return mutateWithFallback<Group>(`/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return mutateWithFallback<Group>(`/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function leaveGroup(groupId: string) {
  return mutateWithFallback<void>(`/${groupId}/leave`, {
    method: 'POST',
  });
}

export async function muteGroup(groupId: string, mutedUntil: string | null) {
  return mutateWithFallback<Group>(`/${groupId}/mute`, {
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
  return mutateWithFallback<GroupMessage>(`/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
