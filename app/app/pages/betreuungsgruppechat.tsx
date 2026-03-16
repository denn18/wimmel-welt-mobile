import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStatus } from '../../hooks/use-auth-status';
import { ApiUnauthorizedError } from '../../services/api-client';
import { fetchGroups, fetchGroupMessages, sendGroupMessage, type Group, type GroupMessage } from '../../services/groups';
import { pickSingleFile } from '../../utils/file-picker';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';

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

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId],
  );

  const amIAdmin = useMemo(() => {
    if (!selectedGroup || !userId) return false;
    return selectedGroup.members.some((member) => member.userId === userId && member.role === 'admin');
  }, [selectedGroup, userId]);

  const canWrite = Boolean(selectedGroup) && user?.role === 'caregiver' && amIAdmin;

  const loadGroups = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const groupData = await fetchGroups(String(user.id));
      setGroups(groupData ?? []);
      if ((groupData ?? []).length) {
        setSelectedGroupId((current) => current ?? groupData[0].id);
      } else {
        setSelectedGroupId(null);
      }
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        await logout();
        router.replace('/pages/login');
        return;
      }
      Alert.alert('Fehler', 'Betreuungsgruppen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [logout, router, user?.id]);

  const loadMessages = useCallback(async () => {
    if (!selectedGroup?.id) {
      setMessages([]);
      return;
    }

    try {
      const items = await fetchGroupMessages(selectedGroup.id);
      setMessages(items ?? []);
    } catch {
      setMessages([]);
    }
  }, [selectedGroup?.id]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSendText = async () => {
    if (!selectedGroup?.id || !canWrite || !composer.trim() || sending) return;

    setSending(true);
    try {
      await sendGroupMessage(selectedGroup.id, { body: composer.trim() });
      setComposer('');
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async () => {
    if (!selectedGroup?.id || !canWrite || sending) return;
    const picked = await pickSingleFile({ type: '*/*' });
    if (!picked) return;

    setSending(true);
    try {
      await sendGroupMessage(selectedGroup.id, {
        body: composer.trim() || undefined,
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
              <Text style={styles.buttonPrimaryText}>Betreuungsgruppe erstellen</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={BRAND} />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Meine Gruppen</Text>
          {groups.map((group) => {
            const active = selectedGroup?.id === group.id;
            return (
              <Pressable key={group.id} style={[styles.groupRow, active && styles.groupRowActive]} onPress={() => setSelectedGroupId(group.id)}>
                {group.logoImageUrl ? <Image source={{ uri: assetUrl(group.logoImageUrl) }} style={styles.logo} /> : <View style={styles.logoFallback}><Ionicons name="people" size={18} color={BRAND} /></View>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.muted}>{group.memberCount} Teilnehmende</Text>
                </View>
              </Pressable>
            );
          })}
          {!groups.length && !loading ? <Text style={styles.muted}>Es gibt aktuell keine Betreuungsgruppe.</Text> : null}
        </View>

        {selectedGroup ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{selectedGroup.name}</Text>
            <Text style={styles.muted}>{selectedGroup.description || 'Keine Gruppenbeschreibung vorhanden.'}</Text>

            <View style={styles.messageWrap}>
              {messages.map((message) => {
                const isOwn = message.senderId === userId;
                return (
                  <View key={message.id} style={[styles.messageBubble, isOwn ? styles.messageOwn : styles.messageOther]}>
                    <Text style={styles.messageMeta}>
                      {isOwn ? 'Du' : message.senderName || message.senderId} · {formatDate(message.createdAt)}
                    </Text>
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
  },
  groupRowActive: { borderColor: BRAND, backgroundColor: '#eef2ff' },
  logo: { width: 36, height: 36, borderRadius: 18 },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  groupName: { color: '#0f172a', fontWeight: '700' },
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
