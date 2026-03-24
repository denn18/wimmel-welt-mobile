import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStatus } from '../hooks/use-auth-status';
import { ApiUnauthorizedError, apiRequest } from '../services/api-client';
import { fetchMessages, sendMessage as sendMessageRequest, type Message, type MessageAttachment } from '../services/messages';
import { pickMultipleFiles, type PickedFile } from '../utils/file-picker';
import { assetUrl } from '../utils/url';

const BRAND = 'rgb(49,66,154)';
const BG = '#EAF2FF';

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

type UserProfile = { id?: string; role?: string; name?: string; daycareName?: string };

function AttachmentList({ attachments }: { attachments?: MessageAttachment[] }) {
  if (!attachments?.length) return null;

  return (
    <View style={styles.attachmentList}>
      {attachments.map((attachment) => {
        const url = assetUrl(attachment);
        const label = attachment.fileName || 'Anhang';

        return (
          <Pressable
            key={attachment.key || attachment.url || label}
            style={styles.attachment}
            onPress={() => {
              if (url) Linking.openURL(url).catch(() => undefined);
            }}
          >
            <Ionicons name="document" size={18} color={BRAND} />
            <View style={{ flex: 1 }}>
              <Text style={styles.attachmentLabel}>{label}</Text>
              {attachment.size ? <Text style={styles.attachmentMeta}>{Math.round(attachment.size / 1024)} KB</Text> : null}
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
  const { user, loading: authLoading, logout } = useAuthStatus();
  const insets = useSafeAreaInsets();

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollToLatest = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    async function loadPartner() {
      if (!targetId) return;
      try {
        const response = await apiRequest<UserProfile>(`api/users/${targetId}`);
        setPartner(response);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          await logout();
          router.replace('/LoginPage');
        }
      }
    }

    void loadPartner();
  }, [logout, router, targetId]);

  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) return;
      setLoadingMessages(true);
      try {
        const data = await fetchMessages(conversationId);
        setMessages(data);
        setTimeout(() => scrollToLatest(false), 40);
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          await logout();
          router.replace('/LoginPage');
          return;
        }
      } finally {
        setLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [conversationId, logout, router, scrollToLatest]);

  useEffect(() => {
    if (!messages.length) return;
    scrollToLatest(false);
  }, [messages.length, scrollToLatest]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const partnerName = useMemo(() => {
    if (!partner) return 'Kontakt';
    if (partner.role === 'caregiver') {
      return `${partner.name || 'Kontakt'}${partner.daycareName ? ` – ${partner.daycareName}` : ''}`;
    }
    return partner.name || partner.daycareName || 'Kontakt';
  }, [partner]);

  const handlePickAttachments = async () => {
    try {
      const files = await pickMultipleFiles({ type: ['image/*', 'application/pdf', '*/*'] });
      setPendingAttachments((current) => [...current, ...files]);
    } catch {
      return;
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
        recipientId: String(targetId),
        body: trimmedBody,
        senderRole: typeof user.role === 'string' ? user.role : null,
        recipientRole: typeof partner?.role === 'string' ? partner.role : null,
        notifyWithPush: true,
        attachments: pendingAttachments.map((file) => ({ name: file.fileName, data: file.dataUrl, mimeType: file.mimeType })),
      });
      setMessages((current) => [...current, sent]);
      setMessageBody('');
      setPendingAttachments([]);
      scrollToLatest();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        await logout();
        router.replace('/LoginPage');
      }
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}><ActivityIndicator size="large" color={BRAND} /></View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Nachrichten</Text>
          <Text style={styles.hint}>Bitte melde dich an.</Text>
          <Pressable style={styles.buttonPrimary} onPress={() => router.push('/LoginPage')}>
            <Text style={styles.buttonPrimaryText}>Anmelden</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'height' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={BRAND} />
          </Pressable>
          <Text numberOfLines={1} style={styles.threadTitle}>{partnerName}</Text>
        </View>

        {loadingMessages ? (
          <View style={styles.centered}><ActivityIndicator color={BRAND} /></View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustContentInsets={false}
            contentInset={{ top: 0, bottom: 0 }}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => scrollToLatest(false)}
            ListEmptyComponent={<Text style={styles.hint}>Noch keine Nachrichten vorhanden.</Text>}
            renderItem={({ item }) => {
              const isOwn = item.senderId === String(user.id);
              return (
                <View style={{ alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 4 }}>
                  <View style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubblePartner]}>
                    {item.body ? <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : null]}>{item.body}</Text> : null}
                    <AttachmentList attachments={item.attachments} />
                    <Text style={[styles.metaText, isOwn ? styles.metaOwn : styles.metaPartner]}>{formatTime(item.createdAt)}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {pendingAttachments.length ? (
          <View style={styles.pendingAttachments}>
            {pendingAttachments.map((attachment, index) => (
              <View key={`${attachment.fileName}-${index}`} style={styles.pendingPill}>
                <Ionicons name="document" size={14} color={BRAND} />
                <Text style={styles.pendingLabel}>{attachment.fileName}</Text>
                <Pressable onPress={() => setPendingAttachments((current) => current.filter((_, i) => i !== index))}>
                  <Ionicons name="close" size={14} color="#475569" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.composer, { paddingBottom: keyboardVisible ? 0 : insets.bottom }]}>
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
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: BG },
  //safeArea: { flex: 1, backgroundColor: '#e9edf5' },
  header: {
    height: 56,
   // backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  backBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  threadTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  messageList: { gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 0 },
  messageBubble: { maxWidth: '85%', borderRadius: 14, padding: 10, gap: 6 },
  bubbleOwn: { backgroundColor: BRAND },
  bubblePartner: { backgroundColor: '#fff' },
  messageText: { color: '#0f172a' },
  messageTextOwn: { color: '#fff' },
  metaText: { fontSize: 11 },
  metaOwn: { color: 'rgba(255,255,255,0.8)' },
  metaPartner: { color: '#64748b' },
  attachmentList: { gap: 8, marginTop: 6 },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  attachmentLabel: { fontWeight: '700', color: '#0f172a' },
  attachmentMeta: { color: '#475569', fontSize: 12 },
  pendingAttachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e0e7ff',
  },
  pendingLabel: { color: BRAND, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
   // backgroundColor: '#fff', erstmal nicht farblich absetzeh
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#0f172a',
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: BRAND,
  },
  sendBtnDisabled: { backgroundColor: '#cbd5e1' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  hint: { color: '#475569', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  buttonPrimary: { backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
});
