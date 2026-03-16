import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStatus } from '../../hooks/use-auth-status';
import {
  fetchGroupCandidates,
  loadCareGroup,
  persistCareGroup,
  type CareGroup,
  type GroupCandidate,
} from '../../services/groups';
import { fetchProfile } from '../../services/profile';

const BRAND = 'rgb(49,66,154)';

type UserProfile = {
  daycareName?: string;
  shortDescription?: string;
  bio?: string;
  logoImageUrl?: string | null;
};

export default function BetreuungsgruppeErstellenScreen() {
  const router = useRouter();
  const { user } = useAuthStatus();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [existingGroup, setExistingGroup] = useState<CareGroup | null>(null);
  const [candidates, setCandidates] = useState<GroupCandidate[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [participantsVisible, setParticipantsVisible] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCaregiver = user?.role === 'caregiver';

  useEffect(() => {
    async function loadData() {
      if (!user?.id || !isCaregiver) return;

      setLoading(true);
      try {
        const profileData = await fetchProfile<UserProfile>(user as never);
        const ownGroup = await loadCareGroup(String(user.id));
        const participantIds = ownGroup?.participantIds ?? [];
        const suggested = await fetchGroupCandidates(String(user.id), participantIds);

        setProfile(profileData ?? null);
        setExistingGroup(ownGroup);
        setSelectedParticipants(participantIds);
        setDescription(profileData?.shortDescription || profileData?.bio || '');
        setParticipantsVisible(true);
        setCandidates(suggested ?? []);
      } catch {
        Alert.alert('Fehler', 'Daten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [isCaregiver, user]);

  const candidatePool = useMemo(() => {
    if (!search.trim()) return candidates;
    const query = search.trim().toLowerCase();
    return candidates.filter((item) => item.name.toLowerCase().includes(query) || item.userId.toLowerCase().includes(query));
  }, [candidates, search]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSave = async () => {
    if (!isCaregiver || !user?.id) return;
    if (!profile?.daycareName && !existingGroup?.daycareName) {
      Alert.alert('Hinweis', 'Bitte pflege zuerst den Namen deiner Kindertagespflege im Profil.');
      return;
    }

    setSaving(true);
    try {
      await persistCareGroup({
        caregiverId: String(user.id),
        participantIds: selectedParticipants,
        daycareName: profile?.daycareName || existingGroup?.daycareName || 'Betreuungsgruppe',
        logoImageUrl: profile?.logoImageUrl ?? existingGroup?.logoImageUrl ?? null,
      });
      router.replace('/pages/betreuungsgruppechat');
    } catch {
      Alert.alert('Fehler', 'Betreuungsgruppe konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (!isCaregiver) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Betreuungsgruppe erstellen</Text>
          <Text style={styles.muted}>Nur Kindertagespflegepersonen können Betreuungsgruppen erstellen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </Pressable>
        <Text style={styles.title}>{existingGroup ? 'Betreuungsgruppe bearbeiten' : 'Betreuungsgruppe erstellen'}</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={styles.link}>{saving ? 'Speichern…' : 'Speichern'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholder="Kontakte suchen"
            placeholderTextColor="#94a3b8"
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textarea]}
            placeholder="Gruppenbeschreibung"
            placeholderTextColor="#94a3b8"
            multiline
          />

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Teilnehmer sichtbar</Text>
            <Switch value={participantsVisible} onValueChange={setParticipantsVisible} />
          </View>

          <Text style={styles.sectionTitle}>Elternaccounts auswählen</Text>
          {candidatePool.map((candidate) => {
            const selected = selectedParticipants.includes(candidate.userId);
            return (
              <Pressable key={candidate.userId} style={styles.memberRow} onPress={() => toggleParticipant(candidate.userId)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{candidate.name}</Text>
                  <Text style={styles.muted}>{candidate.source === 'contact' ? 'Kontakt' : 'Gruppenmitglied'}</Text>
                </View>
                <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? BRAND : '#94a3b8'} />
              </Pressable>
            );
          })}
          {!candidatePool.length ? <Text style={styles.muted}>Keine Elternkontakte gefunden.</Text> : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#dbeafe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: { padding: 16, gap: 12, paddingBottom: 120 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  title: { color: BRAND, fontSize: 20, fontWeight: '800', flex: 1 },
  link: { color: BRAND, fontWeight: '700' },
  sectionTitle: { color: '#0f172a', fontWeight: '700' },
  muted: { color: '#64748b' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
  },
  textarea: { minHeight: 92, textAlignVertical: 'top' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memberName: { color: '#0f172a', fontWeight: '600' },
});
