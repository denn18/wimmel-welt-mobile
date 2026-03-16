import AsyncStorage from '../utils/async-storage';
import { ApiHttpError, apiRequest } from './api-client';
import { fetchConversations, type Message } from './messages';

const CARE_GROUP_STORAGE_PREFIX = 'wimmelwelt.caregroup.';

export type CareGroup = {
  caregiverId: string;
  participantIds: string[];
  daycareName: string;
  logoImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupAttachment = {
  key?: string | null;
  url?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

export type GroupMessage = {
  id: string;
  conversationId: string;
  participants: string[];
  senderId: string;
  body?: string | null;
  attachments?: GroupAttachment[];
  createdAt: string;
};

export type GroupCandidate = {
  userId: string;
  name: string;
  source: 'contact' | 'group_member';
  lastInteractionAt?: string;
  profileImageUrl?: string | null;
};

type UserProfile = {
  id?: string;
  role?: string;
  name?: string;
  daycareName?: string;
  profileImageUrl?: string | null;
};

function storageKey(userId: string) {
  return `${CARE_GROUP_STORAGE_PREFIX}${userId}`;
}

function normalizeCareGroup(group: Partial<CareGroup> | null | undefined): CareGroup | null {
  if (!group?.caregiverId) return null;

  return {
    caregiverId: String(group.caregiverId),
    participantIds: Array.from(new Set((group.participantIds ?? []).map((id) => String(id)).filter(Boolean))),
    daycareName: group.daycareName?.trim() || 'Betreuungsgruppe',
    logoImageUrl: group.logoImageUrl ?? null,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

async function readCareGroupFromStorage(userId: string) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return normalizeCareGroup(JSON.parse(raw) as Partial<CareGroup>);
  } catch {
    return null;
  }
}

async function writeCareGroupToStorage(userId: string, group: CareGroup | null) {
  try {
    if (!group) {
      await AsyncStorage.removeItem(storageKey(userId));
      return;
    }

    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(group));
  } catch {
    // noop
  }
}

export async function loadCareGroup(userId: string) {
  if (!userId) return null;

  try {
    const group = await apiRequest<CareGroup | null>(`api/care-groups?userId=${encodeURIComponent(userId)}`);
    const normalized = normalizeCareGroup(group);
    if (normalized) {
      await writeCareGroupToStorage(userId, normalized);
      return normalized;
    }

    await writeCareGroupToStorage(userId, null);
    return null;
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 403) {
      await writeCareGroupToStorage(userId, null);
      return null;
    }
    // fallback to local storage below
  }

  return readCareGroupFromStorage(userId);
}

export async function persistCareGroup(group: CareGroup) {
  const normalized = normalizeCareGroup(group);
  if (!normalized) {
    throw new Error('Ungültige Betreuungsgruppe.');
  }

  const previousGroup = (await readCareGroupFromStorage(normalized.caregiverId)) ?? null;

  const saved = await apiRequest<CareGroup>('api/care-groups', {
    method: 'PUT',
    body: JSON.stringify(normalized),
  });

  const normalizedSaved = normalizeCareGroup(saved) ?? normalized;
  await writeCareGroupToStorage(normalizedSaved.caregiverId, normalizedSaved);

  for (const participantId of normalizedSaved.participantIds) {
    await writeCareGroupToStorage(participantId, normalizedSaved);
  }

  const removedParticipantIds = (previousGroup?.participantIds ?? []).filter(
    (participantId) => !normalizedSaved.participantIds.includes(participantId),
  );
  await Promise.all(removedParticipantIds.map((participantId) => writeCareGroupToStorage(participantId, null)));

  return normalizedSaved;
}

export async function deleteCareGroup(caregiverId: string) {
  const existingGroup = (await loadCareGroup(caregiverId).catch(() => null)) ?? (await readCareGroupFromStorage(caregiverId));

  await apiRequest<void>(`api/care-groups/${encodeURIComponent(caregiverId)}`, {
    method: 'DELETE',
  });

  await writeCareGroupToStorage(caregiverId, null);

  const participantIds = existingGroup?.participantIds ?? [];
  await Promise.all(participantIds.map((participantId) => writeCareGroupToStorage(participantId, null)));
}

export async function fetchGroupMessages(caregiverId: string) {
  const conversationId = `caregroup--${caregiverId}`;
  return apiRequest<GroupMessage[]>(`api/messages/group/${conversationId}`);
}

async function fetchProfile(userId: string) {
  return apiRequest<UserProfile>(`api/users/${encodeURIComponent(userId)}`);
}

function resolvePartnerId(conversation: Message, userId: string) {
  return conversation.participants?.find((participant) => participant !== userId) || conversation.senderId || '';
}

export async function fetchGroupCandidates(
  userId: string,
  existingParticipantIds: string[] = [],
  conversationsInput?: Message[],
) {
  const conversations = conversationsInput ?? (await fetchConversations());
  const parentContacts = new Map<string, GroupCandidate>();

  await Promise.all(
    conversations.map(async (conversation) => {
      const partnerId = String(resolvePartnerId(conversation, userId));
      if (!partnerId || partnerId === userId) return;

      const profile = await fetchProfile(partnerId).catch(() => null);
      if (!profile || profile.role !== 'parent') return;

      parentContacts.set(partnerId, {
        userId: partnerId,
        name: profile.name || `Elternaccount ${partnerId.slice(0, 6)}`,
        source: 'contact',
        lastInteractionAt: conversation.createdAt,
        profileImageUrl: profile.profileImageUrl ?? null,
      });
    }),
  );

  for (const participantId of existingParticipantIds) {
    if (parentContacts.has(participantId)) continue;

    const profile = await fetchProfile(participantId).catch(() => null);
    if (!profile || profile.role !== 'parent') continue;

    parentContacts.set(participantId, {
      userId: participantId,
      name: profile.name || `Elternaccount ${participantId.slice(0, 6)}`,
      source: 'group_member',
      profileImageUrl: profile.profileImageUrl ?? null,
    });
  }

  return Array.from(parentContacts.values());
}

export async function sendGroupMessage(
  caregiverId: string,
  payload: {
    body?: string;
    participantIds: string[];
    attachments?: Array<{ name?: string; data: string; mimeType?: string | null; size?: number | null }>;
  },
) {
  return apiRequest<GroupMessage>(`api/messages/group/${encodeURIComponent(caregiverId)}`, {
    method: 'POST',
    body: JSON.stringify({
      body: payload.body,
      participantIds: payload.participantIds,
      attachments: payload.attachments ?? [],
    }),
  });
}
