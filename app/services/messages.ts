import { apiRequest } from './api-client';

export type MessageAttachment = {
  key?: string | null;
  url?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  uploadedAt?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  participants: string[];
  senderId: string;
  recipientId: string;
  body?: string | null;
  attachments?: MessageAttachment[];
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchConversations(participantId?: string) {
  const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : '';
  return apiRequest<Message[]>(`api/messages${query}`);
}

export async function fetchMessages(conversationId: string) {
  return apiRequest<Message[]>(`api/messages/${conversationId}`);
}

export type SendMessagePayload = {
  conversationId: string;
  senderId?: string | number;
  recipientId: string | number;
  body?: string;
  senderRole?: string | null;
  recipientRole?: string | null;
  notifyWithPush?: boolean;
  attachments?: Array<{
    name?: string;
    data: string;
    mimeType?: string | null;
    size?: number | null;
  }>;
};

export async function sendMessage(payload: SendMessagePayload) {
  const { conversationId, ...body } = payload;
  const query = new URLSearchParams();

  if (payload.notifyWithPush !== false) {
    query.set('push', '1');
  }

  if (payload.senderRole) {
    query.set('senderRole', payload.senderRole);
  }

  if (payload.recipientRole) {
    query.set('recipientRole', payload.recipientRole);
  }

  query.set('context', 'direct-message');

  const querySuffix = query.toString() ? `?${query.toString()}` : '';

  return apiRequest<Message>(`api/messages/${conversationId}${querySuffix}`, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      recipientId: payload.recipientId,
      body: payload.body,
      attachments: payload.attachments ?? [],
    }),
  });
}
