import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { useAuthStatus } from '../../hooks/use-auth-status';
import { ApiUnauthorizedError, apiRequest } from '../../services/api-client';
import { fetchGroupMessages, loadCareGroup, sendGroupMessage, type CareGroup, type GroupMessage } from '../../services/groups';
import { pickSingleFile } from '../../utils/file-picker';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';
const BG = '#EAF2FF';

type UserProfile = { id?: string; role?: string; name?: string; profileImageUrl?: string | null };

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BetreuungsgruppechatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStatus();
  const userId = String(user?.id ?? '');
  const listRef = useRef<FlatList<GroupMessage>>(null);

  const [group, setGroup] = useState<CareGroup | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, UserProfile | null>>({});
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const canWrite = useMemo(() => user?.role === 'caregiver' && group?.caregiverId === userId, [group?.caregiverId, user?.role, userId]);

  const scrollToLatest = useCallback((animated = false) => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
  }, []);

  const loadGroup = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const loaded = await loadCareGroup(String(user.id));
      setGroup(loaded);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        await logout();
        router.replace('/pages/login');
        return;
      }
      Alert.alert('Fehler', 'Betreuungsgruppe konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [logout, router, user?.id]);

  const loadMembers = useCallback(async () => {
    if (!group) {
      setMemberProfiles({});
      return;
    }

    const ids = [group.caregiverId, ...group.participantIds];
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const profile = await apiRequest<UserProfile>(`api/users/${id}`);
          return [id, profile] as const;
        } catch {
          return [id, null] as const;
        }
      }),
    );

    setMemberProfiles(Object.fromEntries(entries));
  }, [group]);

  const loadMessages = useCallback(async () => {
    if (!group?.caregiverId) {
      setMessages([]);
      return;
    }

    try {
      const items = await fetchGroupMessages(group.caregiverId);
      setMessages(items ?? []);
      setTimeout(() => scrollToLatest(false), 40);
    } catch {
      setMessages([]);
    }
  }, [group?.caregiverId, scrollToLatest]);

  const backgroundSync = useCallback(async () => {
    if (!user?.id) {
      setGroup(null);
      setMemberProfiles({});
      setMessages([]);
      return;
    }

    try {
      const currentGroup = await loadCareGroup(String(user.id));
      setGroup(currentGroup);

      if (!currentGroup) {
        setMemberProfiles({});
        setMessages([]);
        return;
      }

      const participantIds = [currentGroup.caregiverId, ...currentGroup.participantIds];
      const [loadedProfiles, loadedMessages] = await Promise.all([
        Promise.all(
          participantIds.map(async (id) => {
            try {
              const profile = await apiRequest<UserProfile>(`api/users/${id}`);
              return [id, profile] as const;
            } catch {
              return [id, null] as const;
            }
          }),
        ),
        fetchGroupMessages(currentGroup.caregiverId).catch(() => [] as GroupMessage[]),
      ]);

      setMemberProfiles(Object.fromEntries(loadedProfiles));
      setMessages(loadedMessages ?? []);
      setTimeout(() => scrollToLatest(false), 40);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        await logout();
        router.replace('/pages/login');
      }
    }
  }, [logout, router, scrollToLatest, user?.id]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    void loadMembers();
    void loadMessages();
  }, [loadMembers, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      void backgroundSync();
    }, [backgroundSync]),
  );

  useEffect(() => {
    if (messages.length) scrollToLatest(false);
  }, [messages.length, scrollToLatest]);

  const handleSendText = async () => {
    if (!group?.caregiverId || !canWrite || !composer.trim() || sending) return;

    setSending(true);
    try {
      await sendGroupMessage(group.caregiverId, {
        body: composer.trim(),
        participantIds: group.participantIds,
      });
      setComposer('');
      await loadMessages();
      scrollToLatest(true);
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async () => {
    if (!group?.caregiverId || !canWrite || sending) return;
    const picked = await pickSingleFile({ type: '*/*' });
    if (!picked) return;

    setSending(true);
    try {
      await sendGroupMessage(group.caregiverId, {
        body: composer.trim() || undefined,
        participantIds: group.participantIds,
        attachments: [{ name: picked.fileName, data: picked.dataUrl, mimeType: picked.mimeType }],
      });
      setComposer('');
      await loadMessages();
      scrollToLatest(true);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Betreuungsgruppe</Text>
          <Text style={styles.muted}>Bitte melde dich an.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Betreuungsgruppe</Text>
          {user.role === 'caregiver' ? (
            <Pressable style={styles.buttonPrimary} onPress={() => router.push('/pages/betreuungsgruppeerstellen')}>
              <Text style={styles.buttonPrimaryText}>Erstellen</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.centered}>
          <Text style={styles.muted}>Es gibt aktuell keine Betreuungsgruppe.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
        style={styles.flex}
      >
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.title}>{group?.daycareName || 'Betreuungsgruppe'}</Text>
            {!!group ? (
              <Text style={styles.membersInline} numberOfLines={1}>
                {[group.caregiverId, ...group.participantIds]
                  .map((id) => (id === group.caregiverId ? 'Kindertagespflege' : memberProfiles[id]?.name || `Elternaccount ${id.slice(0, 6)}`))
                  .join(', ')}
              </Text>
            ) : null}
          </View>
          {user.role === 'caregiver' ? (
            <Pressable style={styles.buttonPrimary} onPress={() => router.push('/pages/betreuungsgruppeerstellen')}>
              <Text style={styles.buttonPrimaryText}>Bearbeiten</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}><ActivityIndicator color={BRAND} /></View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => scrollToLatest(false)}
            ListEmptyComponent={<Text style={styles.muted}>Noch keine Nachrichten vorhanden.</Text>}
            renderItem={({ item }) => {
              const isOwn = item.senderId === userId;
              const avatar = memberProfiles[item.senderId]?.profileImageUrl ? assetUrl(memberProfiles[item.senderId]?.profileImageUrl || '') : '';
              return (
                <View style={[styles.messageRow, { justifyContent: isOwn ? 'flex-end' : 'flex-start' }]}>
                  {!isOwn ? (
                    avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Ionicons name="person" size={14} color={BRAND} /></View>
                  ) : null}
                  <View style={[styles.messageBubble, isOwn ? styles.messageOwn : styles.messageOther]}>
                    <Text style={styles.messageMeta}>{isOwn ? 'Du' : memberProfiles[item.senderId]?.name || item.senderId} · {formatDate(item.createdAt)}</Text>
                    <Text style={[styles.messageBody, isOwn ? styles.messageBodyOwn : null]}>{item.body || '(Anhang)'}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {!canWrite ? (
          <Text style={styles.mutedBar}>Nur die betreuende Kindertagespflegeperson kann schreiben.</Text>
        ) : (
          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 6) }]}>
            <TextInput
              value={composer}
              onChangeText={setComposer}
              style={styles.input}
              placeholder="Nachricht schreiben"
              placeholderTextColor="#94a3b8"
              multiline
            />
            <Pressable onPress={handleSendAttachment} style={styles.iconButton} disabled={sending}>
              <Ionicons name="attach" color={BRAND} size={20} />
            </Pressable>
            <Pressable onPress={handleSendText} style={[styles.iconButton, styles.sendButton]} disabled={sending || !composer.trim()}>
              <Ionicons name="send" color="#fff" size={18} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: BG },
   //safeArea: { flex: 1, backgroundColor: '#e9edf5' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  header: {
    // backgroundColor: '#fff', erstmal nicht farblich absetzen
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerMain: { flex: 1, gap: 2 },
  title: { color: BRAND, fontSize: 20, fontWeight: '800' },
  membersInline: { color: '#64748b', fontSize: 12 },
  buttonPrimary: { backgroundColor: BRAND, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
  muted: { color: '#64748b' },
  listContent: { gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  avatarFallback: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' },
  messageBubble: { borderRadius: 12, padding: 10, maxWidth: '84%' },
  messageOwn: { backgroundColor: BRAND },
  messageOther: { backgroundColor: '#fff' },
  messageMeta: { color: '#94a3b8', fontSize: 12, marginBottom: 2 },
  messageBody: { color: '#0f172a' },
  messageBodyOwn: { color: '#fff' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    maxHeight: 120,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: { backgroundColor: BRAND, borderColor: BRAND },
  mutedBar: {
   // backgroundColor: '#fff', erstmal nicht farblich absetzen
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
});
