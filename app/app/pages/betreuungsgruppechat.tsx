import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStatus } from '../../hooks/use-auth-status';
import { ApiUnauthorizedError, apiRequest } from '../../services/api-client';
import {
  fetchGroupMessages,
  loadCareGroup,
  sendGroupMessage,
  type CareGroup,
  type GroupMessage,
} from '../../services/groups';
import { pickSingleFile } from '../../utils/file-picker';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';

type UserProfile = {
  id?: string;
  role?: string;
  name?: string;
  profileImageUrl?: string | null;
};

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
  const { user, logout } = useAuthStatus();
  const userId = String(user?.id ?? '');

  const [group, setGroup] = useState<CareGroup | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, UserProfile | null>>({});
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const canWrite = useMemo(() => user?.role === 'caregiver' && group?.caregiverId === userId, [group?.caregiverId, user?.role, userId]);

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
    } catch {
      setMessages([]);
    }
  }, [group?.caregiverId]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    void loadMembers();
    void loadMessages();
  }, [loadMembers, loadMessages]);

  const handleSendText = async () => {
    if (!group?.caregiverId || !canWrite || !composer.trim() || sending) return;

    setSending(true);
    try {
      await sendGroupMessage(group.caregiverId, {
        body: composer.trim(),
        participantIds: [group.caregiverId, ...group.participantIds],
      });
      setComposer('');
      await loadMessages();
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
        participantIds: [group.caregiverId, ...group.participantIds],
        attachments: [{ name: picked.fileName, data: picked.dataUrl, mimeType: picked.mimeType }],
      });
      setComposer('');
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Betreuungsgruppechat</Text>
          <Text style={styles.muted}>Bitte melde dich an.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Betreuungsgruppe</Text>
            <Text style={styles.title}>Chat</Text>
          </View>
          {user.role === 'caregiver' ? (
            <Pressable style={styles.buttonPrimary} onPress={() => router.push('/pages/betreuungsgruppeerstellen')}>
              <Text style={styles.buttonPrimaryText}>{group ? 'Betreuungsgruppe bearbeiten' : 'Betreuungsgruppe erstellen'}</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={BRAND} />
          </View>
        ) : null}

        {!group && !loading ? (
          <View style={styles.card}>
            <Text style={styles.muted}>Es gibt aktuell keine Betreuungsgruppe.</Text>
          </View>
        ) : null}

        {group ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{group.daycareName}</Text>
            <View style={styles.memberRowWrap}>
              {[group.caregiverId, ...group.participantIds].map((id) => {
                const profile = memberProfiles[id];
                const imageUrl = profile?.profileImageUrl ? assetUrl(profile.profileImageUrl) : '';
                return (
                  <View key={id} style={styles.memberPill}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.memberAvatar} />
                    ) : (
                      <View style={styles.memberAvatarFallback}>
                        <Ionicons name="person" size={14} color={BRAND} />
                      </View>
                    )}
                    <Text style={styles.memberName}>
                      {id === group.caregiverId ? 'Tagespflege' : profile?.name || `Elternaccount ${id.slice(0, 6)}`}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.messageWrap}>
              {messages.map((message) => {
                const isOwn = message.senderId === userId;
                return (
                  <View key={message.id} style={[styles.messageBubble, isOwn ? styles.messageOwn : styles.messageOther]}>
                    <Text style={styles.messageMeta}>{isOwn ? 'Du' : memberProfiles[message.senderId]?.name || message.senderId} · {formatDate(message.createdAt)}</Text>
                    <Text style={styles.messageBody}>{message.body || '(Anhang)'}</Text>
                  </View>
                );
              })}
              {!messages.length ? <Text style={styles.muted}>Noch keine Nachrichten vorhanden.</Text> : null}
            </View>

            {!canWrite ? (
              <Text style={styles.muted}>Nur die betreuende Kindertagespflegeperson kann schreiben.</Text>
            ) : (
              <View style={styles.composer}>
                <TextInput
                  value={composer}
                  onChangeText={setComposer}
                  style={styles.input}
                  placeholder="Nachricht schreiben"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable onPress={handleSendAttachment} style={styles.iconButton} disabled={sending}>
                  <Ionicons name="attach" color={BRAND} size={20} />
                </Pressable>
                <Pressable onPress={handleSendText} style={styles.iconButton} disabled={sending}>
                  <Ionicons name="send" color={BRAND} size={20} />
                </Pressable>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, gap: 14, paddingBottom: 120 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  subtitle: { color: '#475569', fontWeight: '600' },
  title: { color: BRAND, fontSize: 24, fontWeight: '800' },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#d9e4ff', backgroundColor: '#fff', padding: 14, gap: 10 },
  buttonPrimary: { backgroundColor: BRAND, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
  sectionTitle: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
  muted: { color: '#64748b' },
  memberRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 999,
  },
  memberAvatar: { width: 22, height: 22, borderRadius: 11 },
  memberAvatarFallback: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' },
  memberName: { color: '#0f172a', fontSize: 12 },
  messageWrap: { gap: 8, marginTop: 8 },
  messageBubble: { borderRadius: 12, padding: 10 },
  messageOwn: { backgroundColor: '#dbeafe' },
  messageOther: { backgroundColor: '#f1f5f9' },
  messageMeta: { color: '#64748b', fontSize: 12, marginBottom: 2 },
  messageBody: { color: '#0f172a' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
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
});
