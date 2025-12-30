import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../components/BottomNavbar';
import { useAuthStatus } from '../../hooks/use-auth-status';
import { apiRequest } from '../../services/api-client';
import {
  fetchMessages,
  sendMessage as sendMessageRequest,
  type Message,
  type MessageAttachment,
} from '../../services/messages';
import { pickMultipleFiles, type PickedFile } from '../../utils/file-picker';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';

function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type UserProfile = {
  id?: string;
  role?: string;
  name?: string;
  daycareName?: string;
};

function AttachmentList({ attachments }: { attachments?: MessageAttachment[] }) {
  if (!attachments?.length) return null;

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      {attachments.map((attachment) => {
        const url = assetUrl(attachment);
        const label = attachment.fileName || 'Anhang';

        return (
          <Pressable
            key={attachment.key || attachment.url || label}
            style={styles.attachment}
            onPress={() => {
              if (url) {
                Linking.openURL(url).catch((error) => console.warn('Konnte Anhang nicht öffnen', error));
              }
            }}
          >
            <Ionicons name="document" size={18} color={BRAND} />
            <View style={{ flex: 1 }}>
              <Text style={styles.attachmentLabel}>{label}</Text>
              {attachment.size ? (
                <Text style={styles.attachmentMeta}>{Math.round(attachment.size / 1024)} KB</Text>
              ) : null}
            </View>
            <Ionicons name="download" size={16} color={BRAND} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MessageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const targetId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id || ''), [params.id]);
  const { user, loading: authLoading } = useAuthStatus();
  const listRef = useRef<FlatList<Message>>(null);

  const conversationId = useMemo(() => {
    if (!user?.id || !targetId) return '';
    return [String(user.id), String(targetId)].sort().join('--');
  }, [user?.id, targetId]);

  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PickedFile[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadPartner() {
      if (!targetId) return;
      try {
        const response = await apiRequest<UserProfile>(`api/users/${targetId}`);
        setPartner(response);
      } catch (error) {
        console.error('Konnte Gesprächspartner nicht laden', error);
      }
    }

    void loadPartner();
  }, [targetId]);

  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) return;
      setLoadingMessages(true);
      try {
        const data = await fetchMessages(conversationId);
        setMessages(data);
      } catch (error) {
        console.error('Konnte Nachrichten nicht laden', error);
      } finally {
        setLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [conversationId]);

  const handlePickAttachments = async () => {
    try {
      const files = await pickMultipleFiles({ type: ['image/*', 'application/pdf', '*/*'] });
      setPendingAttachments((current) => [...current, ...files]);
    } catch (error) {
      console.warn('Konnte Anhänge nicht laden', error);
    }
  };

  const handleSendMessage = async () => {
    const trimmedBody = messageBody.trim();
    const hasAttachments = pendingAttachments.length > 0;

    if (!conversationId || !targetId || !user?.id) return;
    if (!trimmedBody && !hasAttachments) return;

    setSending(true);
    try {
      const sent = await sendMessageRequest({
        conversationId,
        senderId: String(user.id),
        recipientId: String(targetId),
        body: trimmedBody,
        attachments: pendingAttachments.map((file) => ({
          name: file.fileName,
          data: file.dataUrl,
        mimeType: file.mimeType,
        })),
      });
      setMessages((current) => {
        const next = [...current, sent];
        return next;
      });
      setMessageBody('');
      setPendingAttachments([]);
      scrollToBottom();
    } catch (error) {
      console.error('Konnte Nachricht nicht senden', error);
    } finally {
      setSending(false);
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((current) => current.filter((_, i) => i !== index));
  };

  const partnerName = partner?.daycareName || partner?.name || 'Kontakt';

  const scrollToBottom = useCallback(
    (animated = true) => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated });
      });
    },
    []
  );

  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [loadingMessages, messages.length, scrollToBottom]);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}> 
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.hint}>Lade Anmeldestatus…</Text>
        </View>
        <BottomNavbar />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}> 
          <Ionicons name="chatbubbles" size={48} color={BRAND} />
          <Text style={styles.title}>Nachrichten</Text>
          <Text style={styles.hint}>Erstelle einen Account und melde dich an, um die Chatfunktion zu nutzen.</Text>
          <Pressable style={styles.buttonPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.buttonPrimaryText}>Anmelden</Text>
          </Pressable>
        </View>
        <BottomNavbar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.partnerLabel}>Gesprächspartner :</Text>
              <Text style={styles.threadTitle}>{partnerName}</Text>
            </View>

            <View style={styles.body}>
              {loadingMessages ? (
                <View style={styles.centered}>
                  <ActivityIndicator color={BRAND} />
                  <Text style={styles.hint}>Nachrichten werden geladen…</Text>
                </View>
              ) : (
                <FlatList
                  ref={listRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                  ListEmptyComponent={
                    <Text style={styles.hint}>Noch keine Nachrichten vorhanden. Schreibe die erste Nachricht.</Text>
                  }
                  onContentSizeChange={() => scrollToBottom()}
                  renderItem={({ item }) => {
                    const isOwn = item.senderId === String(user.id);
                    const bubbleStyles = isOwn ? styles.bubbleOwn : styles.bubblePartner;
                    const metaStyles = isOwn ? styles.metaOwn : styles.metaPartner;

                    return (
                      <View style={{ alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 4 }}>
                        <Text style={styles.senderLabel}>{isOwn ? 'Du' : partnerName}</Text>
                        <View style={[styles.messageBubble, bubbleStyles]}>
                          {item.body ? (
                            <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : null]}>{item.body}</Text>
                          ) : null}
                          <AttachmentList attachments={item.attachments} />
                          <Text style={[styles.metaText, metaStyles]}>{formatTime(item.createdAt)}</Text>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>

            {pendingAttachments.length ? (
              <View style={styles.pendingAttachments}>
                {pendingAttachments.map((attachment, index) => (
                  <View key={`${attachment.fileName}-${index}`} style={styles.pendingPill}>
                    <Ionicons name="document" size={14} color={BRAND} />
                    <Text style={styles.pendingLabel}>{attachment.fileName}</Text>
                    <Pressable onPress={() => removePendingAttachment(index)}>
                      <Ionicons name="close" size={14} color="#475569" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.composer}>
              <Pressable style={styles.attachButton} onPress={handlePickAttachments} disabled={sending}>
                <Ionicons name="attach" size={18} color={BRAND} />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="Nachricht schreiben…"
                placeholderTextColor="#94A3B8"
                value={messageBody}
                onChangeText={setMessageBody}
                multiline
              />
              <Pressable
                style={[styles.sendBtn, sending || (!messageBody.trim() && pendingAttachments.length === 0) ? styles.sendBtnDisabled : null]}
                disabled={sending || (!messageBody.trim() && pendingAttachments.length === 0)}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendText}>{sending ? 'Senden…' : 'Senden'}</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND,
    padding: 12,
    gap: 12,
    paddingBottom: 90,
  },
  container: { flex: 1, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  partnerLabel: { color: BRAND, fontWeight: '800', fontSize: 14 },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND,
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#0f172a',
    minHeight: 48,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  bubbleOwn: {
    backgroundColor: BRAND,
  },
  bubblePartner: {
    backgroundColor: '#eef2ff',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  messageText: {
    color: '#0f172a',
  },
  messageTextOwn: {
    color: '#fff',
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND,
  },
  metaText: {
    fontSize: 11,
  },
  metaOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  metaPartner: {
    color: '#475569',
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  attachmentLabel: {
    fontWeight: '700',
    color: '#0f172a',
  },
  attachmentMeta: {
    color: '#475569',
    fontSize: 12,
  },
  pendingAttachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e0e7ff',
  },
  pendingLabel: {
    color: BRAND,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  hint: {
    color: '#475569',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  buttonPrimary: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
});
