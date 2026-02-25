import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStatus } from '../../hooks/use-auth-status';
import { ApiUnauthorizedError } from '../../services/api-client';
import {
  addGroupMember,
  createGroup,
  fetchGroupCandidates,
  fetchGroupMessages,
  fetchGroups,
  leaveGroup,
  muteGroup,
  removeGroupMember,
  sendGroupMessage,
  type Group,
  type GroupCandidate,
  type GroupMember,
  type GroupMessage,
} from '../../services/groups';
import { fetchConversations } from '../../services/messages';
import { fetchProfile } from '../../services/profile';
import { pickSingleFile } from '../../utils/file-picker';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type UserProfile = {
  daycareName?: string;
  shortDescription?: string;
  bio?: string;
  logoImageUrl?: string | null;
  careTimes?: Array<{ startTime?: string; endTime?: string; activity?: string }>;
};

function uniqueByUserId(items: GroupCandidate[]) {
  const map = new Map<string, GroupCandidate>();
  items.forEach((item) => {
    const current = map.get(item.userId);
    if (!current) {
      map.set(item.userId, item);
      return;
    }

    const currentTime = current.lastInteractionAt ? new Date(current.lastInteractionAt).getTime() : 0;
    const nextTime = item.lastInteractionAt ? new Date(item.lastInteractionAt).getTime() : 0;
    if (nextTime > currentTime) map.set(item.userId, item);
  });
  return Array.from(map.values());
}

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isWithinRetention(createdAt?: string) {
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() <= WEEK_MS;
}

export default function KindertagespflegegruppeScreen() {
  const { user, logout } = useAuthStatus();
  const userId = String(user?.id ?? '');
  const isCaregiver = user?.role === 'caregiver';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [candidates, setCandidates] = useState<GroupCandidate[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composer, setComposer] = useState('');
  const [search, setSearch] = useState('');

  const [createVisible, setCreateVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(true);
  const [description, setDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId],
  );

  const amIAdmin = useMemo(() => {
    if (!selectedGroup || !userId) return false;
    return selectedGroup.members.some((member) => member.userId === userId && member.role === 'admin');
  }, [selectedGroup, userId]);

  const canWrite = isCaregiver && amIAdmin && Boolean(selectedGroup) && !selectedGroup?.settings.onlyAdminsCanWrite
    ? true
    : isCaregiver && amIAdmin;

  const candidatePool = useMemo(() => {
    const normalized = uniqueByUserId(candidates)
      .sort((a, b) => {
        const aTime = a.lastInteractionAt ? new Date(a.lastInteractionAt).getTime() : 0;
        const bTime = b.lastInteractionAt ? new Date(b.lastInteractionAt).getTime() : 0;
        return bTime - aTime;
      });

    if (!search.trim()) return normalized;
    const query = search.trim().toLowerCase();
    return normalized.filter((item) => {
      const byName = item.name.toLowerCase().includes(query);
      const byId = item.userId.toLowerCase().includes(query);
      return byName || byId;
    });
  }, [candidates, search]);

  const loadScreen = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [profileData, groupData] = await Promise.all([
        fetchProfile<UserProfile>(user as never),
        fetchGroups(),
      ]);
      setProfile(profileData ?? null);
      setGroups(groupData ?? []);

      if ((groupData ?? []).length) {
        setSelectedGroupId((current) => current ?? groupData[0].id);
      }

      try {
        const suggested = await fetchGroupCandidates();
        setCandidates(suggested ?? []);
      } catch {
        const fallbackChats = await fetchConversations();
        const fallback = (fallbackChats ?? []).map((conversation) => {
          const partnerId =
            conversation.participants?.find((participant) => participant !== String(user.id)) || conversation.senderId;
          return {
            userId: String(partnerId),
            name: `Kontakt ${String(partnerId).slice(0, 6)}`,
            source: 'recent_chat' as const,
            lastInteractionAt: conversation.createdAt,
          };
        });
        setCandidates(fallback);
      }
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        await logout();
        return;
      }
      Alert.alert('Fehler', 'Gruppen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [logout, user]);

  const loadMessages = useCallback(async () => {
    if (!selectedGroup?.id) {
      setMessages([]);
      return;
    }

    try {
      const items = await fetchGroupMessages(selectedGroup.id);
      setMessages((items ?? []).filter((item) => isWithinRetention(item.createdAt)));
    } catch {
      setMessages([]);
    }
  }, [selectedGroup?.id]);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleCreateGroup = async () => {
    if (!isCaregiver) return;
    if (!profile?.daycareName) {
      Alert.alert('Hinweis', 'Bitte pflege zuerst den Namen deiner Kindertagespflege im Profil.');
      return;
    }

    setSaving(true);
    try {
      const created = await createGroup({
        name: profile.daycareName,
        description: description || profile.shortDescription || profile.bio || '',
        logoImageUrl: profile.logoImageUrl ?? null,
        participantIds: selectedParticipants,
        careTimes: profile.careTimes ?? [],
        settings: {
          onlyAdminsCanWrite: true,
          participantsVisible,
        },
      });

      setGroups((current) => [created, ...current.filter((group) => group.id !== created.id)]);
      setSelectedGroupId(created.id);
      setCreateVisible(false);
      setDescription('');
      setSelectedParticipants([]);
      Alert.alert('Erstellt', 'Betreuungsgruppe wurde erstellt.');
    } catch {
      Alert.alert('Fehler', 'Gruppe konnte nicht erstellt werden. Prüfe API /api/groups.');
    } finally {
      setSaving(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSendAttachment = async () => {
    if (!selectedGroup?.id || !canWrite) return;
    const picked = await pickSingleFile({ type: '*/*' });
    if (!picked) return;

    await sendGroupMessage(selectedGroup.id, {
      body: composer.trim() || undefined,
      attachments: [
        {
          name: picked.fileName,
          data: picked.dataUrl,
          mimeType: picked.mimeType,
        },
      ],
    });

    setComposer('');
    await loadMessages();
  };

  const handleSendText = async () => {
    if (!selectedGroup?.id || !canWrite || !composer.trim()) return;
    await sendGroupMessage(selectedGroup.id, { body: composer.trim() });
    setComposer('');
    await loadMessages();
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup?.id) return;
    await leaveGroup(selectedGroup.id);
    await loadScreen();
  };

  const handleMuteToggle = async () => {
    if (!selectedGroup?.id) return;
    const myMember = selectedGroup.members.find((member) => member.userId === userId);
    const currentlyMuted = Boolean(myMember?.mutedUntil && new Date(myMember.mutedUntil).getTime() > Date.now());
    const until = currentlyMuted ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await muteGroup(selectedGroup.id, until);
    await loadScreen();
  };

  const handleAddMember = async (candidate: GroupCandidate) => {
    if (!selectedGroup?.id || !amIAdmin) return;
    await addGroupMember(selectedGroup.id, candidate.userId);
    await loadScreen();
  };

  const handleRemoveMember = async (member: GroupMember) => {
    if (!selectedGroup?.id || !amIAdmin) return;
    await removeGroupMember(selectedGroup.id, member.userId);
    await loadScreen();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Gruppe</Text>
          <Text style={styles.muted}>Bitte melde dich an, um Gruppen zu sehen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Kindertagespflege Gruppenchat</Text>
            <Text style={styles.title}>Gruppe</Text>
          </View>
          {isCaregiver ? (
            <Pressable style={styles.buttonPrimary} onPress={() => setCreateVisible(true)}>
              <Text style={styles.buttonPrimaryText}>Betreuungsgruppe erstellen</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={BRAND} />
          </View>
        ) : null}

        {selectedGroup ? (
          <View style={styles.card}>
            <Pressable style={styles.banner}>
              {selectedGroup.logoImageUrl ? <Image source={{ uri: assetUrl(selectedGroup.logoImageUrl) }} style={styles.logo} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.groupName}>{selectedGroup.name}</Text>
                <Text style={styles.muted}>{selectedGroup.description || 'Gruppenbeschreibung noch leer.'}</Text>
              </View>
            </Pressable>

            <View style={styles.tile}>
              <Text style={styles.tileTitle}>Betreuungszeiten</Text>
              {(selectedGroup.careTimes ?? []).length ? (
                selectedGroup.careTimes?.map((slot, index) => (
                  <Text key={`${slot.startTime}-${index}`} style={styles.tileText}>
                    {slot.startTime || '--'} - {slot.endTime || '--'} · {slot.activity || 'Betreuung'}
                  </Text>
                ))
              ) : (
                <Text style={styles.tileText}>Keine Zeiten hinterlegt.</Text>
              )}
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Teilnehmende ({selectedGroup.memberCount})</Text>
              {!isCaregiver ? (
                <Pressable onPress={handleLeaveGroup}>
                  <Text style={styles.linkDanger}>Gruppe verlassen</Text>
                </Pressable>
              ) : null}
            </View>

            {selectedGroup.members.map((member) => (
              <View key={member.userId} style={styles.memberRow}>
                <Text style={styles.memberName}>
                  {member.name} {member.role === 'admin' ? '· Admin' : ''}
                </Text>
                {amIAdmin && member.userId !== userId ? (
                  <Pressable onPress={() => handleRemoveMember(member)}>
                    <Text style={styles.linkDanger}>Entfernen</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}

            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Stumm schalten</Text>
              <Switch
                value={Boolean(
                  selectedGroup.members.find((member) => member.userId === userId)?.mutedUntil &&
                    new Date(selectedGroup.members.find((member) => member.userId === userId)?.mutedUntil || '').getTime() >
                      Date.now(),
                )}
                onValueChange={handleMuteToggle}
              />
            </View>

            {amIAdmin ? (
              <View style={styles.addMemberWrap}>
                <Text style={styles.sectionTitle}>Eltern/Kontakte hinzufügen</Text>
                {candidatePool.slice(0, 6).map((candidate) => (
                  <Pressable key={candidate.userId} style={styles.memberRow} onPress={() => handleAddMember(candidate)}>
                    <Text style={styles.memberName}>{candidate.name}</Text>
                    <Text style={styles.link}>Hinzufügen</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.muted}>Noch keine Gruppe vorhanden.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nachrichten (max. 1 Woche)</Text>
          {messages.map((message) => (
            <View key={message.id} style={styles.messageRow}>
              <Text style={styles.messageMeta}>
                {message.type === 'system' ? 'System' : message.senderName || message.senderId} · {formatDate(message.createdAt)}
              </Text>
              <Text style={styles.messageBody}>{message.body || '(Anhang)'}</Text>
              <Text style={styles.readMeta}>Gelesen von: {message.readBy?.length ?? 0}</Text>
            </View>
          ))}

          {!messages.length ? <Text style={styles.muted}>Noch keine Nachrichten.</Text> : null}

          {!canWrite ? (
            <Text style={styles.muted}>Nur die Kindertagespflegeperson kann schreiben. Eltern haben Leserechte.</Text>
          ) : (
            <View style={styles.composer}>
              <TextInput
                value={composer}
                onChangeText={setComposer}
                style={styles.input}
                placeholder="Nachricht an die Gruppe"
                placeholderTextColor="#94a3b8"
              />
              <Pressable onPress={handleSendAttachment} style={styles.iconButton}>
                <Ionicons name="attach" color={BRAND} size={20} />
              </Pressable>
              <Pressable onPress={handleSendText} style={styles.iconButton}>
                <Ionicons name="send" color={BRAND} size={20} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={createVisible} animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Neue Betreuungsgruppe</Text>
            <Pressable onPress={() => setCreateVisible(false)}>
              <Ionicons name="close" size={24} color={BRAND} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#64748b" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Kontakte / Chatpartner suchen (Name oder MongoDB ID)"
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Gruppenbeschreibung"
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Teilnehmer sichtbar</Text>
            <Switch value={participantsVisible} onValueChange={setParticipantsVisible} />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {candidatePool.map((candidate) => {
              const selected = selectedParticipants.includes(candidate.userId);
              return (
                <Pressable key={candidate.userId} style={styles.memberRow} onPress={() => toggleParticipant(candidate.userId)}>
                  <View>
                    <Text style={styles.memberName}>{candidate.name}</Text>
                    <Text style={styles.muted}>{candidate.source === 'contact' ? 'Kontakt' : 'Letzter Chatpartner'}</Text>
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={BRAND} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={[styles.buttonPrimary, saving && { opacity: 0.6 }]} onPress={handleCreateGroup} disabled={saving}>
            <Text style={styles.buttonPrimaryText}>{saving ? 'Erstelle…' : 'Betreuungsgruppe erstellen'}</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9e4ff',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  buttonPrimary: {
    backgroundColor: BRAND,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
  muted: { color: '#64748b' },
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  logo: { width: 48, height: 48, borderRadius: 24 },
  groupName: { color: '#0f172a', fontSize: 18, fontWeight: '700' },
  tile: { backgroundColor: '#eef4ff', borderRadius: 12, padding: 10, gap: 4 },
  tileTitle: { color: BRAND, fontWeight: '700' },
  tileText: { color: '#334155' },
  sectionTitle: { color: '#0f172a', fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkDanger: { color: '#b91c1c', fontWeight: '700' },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
  },
  memberName: { color: '#0f172a', fontWeight: '600' },
  link: { color: BRAND, fontWeight: '700' },
  addMemberWrap: { gap: 4 },
  messageRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#e2e8f0', gap: 3 },
  messageMeta: { color: '#64748b', fontSize: 12 },
  messageBody: { color: '#0f172a' },
  readMeta: { color: '#475569', fontSize: 12 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  searchWrap: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, height: 42, color: '#0f172a' },
  descriptionInput: { margin: 16, minHeight: 80, textAlignVertical: 'top' },
  modalList: { paddingHorizontal: 16, paddingBottom: 16 },
});
