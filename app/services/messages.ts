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

export async function fetchConversations(participantId: string) {
  return apiRequest<Message[]>(`api/messages?participantId=${encodeURIComponent(participantId)}`);
}

export async function fetchMessages(conversationId: string) {
  return apiRequest<Message[]>(`api/messages/${conversationId}`);
}

export type SendMessagePayload = {
  conversationId: string;
  senderId: string | number;
  recipientId: string | number;
  body?: string;
  attachments?: Array<{
    name?: string;
    data: string;
    mimeType?: string | null;
    size?: number | null;
  }>;
};

export async function sendMessage(payload: SendMessagePayload) {
  const { conversationId, ...body } = payload;
  return apiRequest<Message>(`api/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      senderId: payload.senderId,
      recipientId: payload.recipientId,
      body: payload.body,
      attachments: payload.attachments ?? [],
    }),
  });
}
