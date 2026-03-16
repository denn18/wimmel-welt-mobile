import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStatus } from '../../hooks/use-auth-status';
import { ApiUnauthorizedError, apiRequest } from '../../services/api-client';
import { fetchConversations, type Message } from '../../services/messages';
import { assetUrl } from '../../utils/url';

const BRAND = 'rgb(49,66,154)';

type UserProfile = {
  id?: string;
  role?: string;
  name?: string;
  daycareName?: string;
  profileImageUrl?: string | null;
  logoImageUrl?: string | null;
};

function formatTimestamp(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function fetchUserProfiles(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  if (!uniqueIds.length) return {} as Record<string, UserProfile | null>;

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const response = await apiRequest<UserProfile>(`api/users/${id}`);
        return [id, response];
      } catch {
        return [id, null];
      }
    }),
  );

  return Object.fromEntries(entries) as Record<string, UserProfile | null>;
}

function ConversationRow({ conversation, partner, onPress }: { conversation: Message; partner: UserProfile | null; onPress: () => void }) {
  const partnerName =
    partner?.role === 'caregiver'
      ? [partner?.name || 'Unbekannter Kontakt', partner?.daycareName].filter(Boolean).join(' – ')
      : partner?.name || partner?.daycareName || 'Unbekannter Kontakt';
  const profileUrl = partner?.profileImageUrl ? assetUrl(partner.profileImageUrl) : '';
  const initials = partnerName.trim().charAt(0).toUpperCase();

  const previewText = conversation.body?.trim();
  const preview = previewText
    ? previewText.length > 80
      ? `${previewText.slice(0, 77)}…`
      : previewText
    : conversation.attachments?.length
      ? `${conversation.attachments.length} ${conversation.attachments.length === 1 ? 'Anhang' : 'Anhänge'}`
      : 'Keine Vorschau verfügbar';

  return (
    <Pressable onPress={onPress} style={styles.threadRow}>
      <View style={styles.avatar}>
        {profileUrl ? <Image source={{ uri: profileUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarInitials}>{initials}</Text>}
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadName} numberOfLines={1}>{partnerName}</Text>
          <Text style={styles.threadTime}>{formatTimestamp(conversation.createdAt)}</Text>
        </View>
        <Text style={styles.threadPreview} numberOfLines={1}>{preview}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}

export default function MessengerPageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading, logout } = useAuthStatus();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      if (!user?.id) {
        setConversations([]);
        setProfiles({});
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchConversations(String(user.id));
        setConversations(data);
        const loadedProfiles = await fetchUserProfiles(
          data
            .map((conversation) => conversation.participants?.find((participant) => participant !== String(user.id)) || '')
            .filter(Boolean) as string[],
        );
        setProfiles(loadedProfiles);
      } catch (requestError) {
        if (requestError instanceof ApiUnauthorizedError) {
          await logout();
          router.replace('/pages/login');
          return;
        }
        setError('Nachrichten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    void loadConversations();
  }, [logout, router, user?.id]);

  const rows = useMemo(
    () =>
      conversations.map((conversation) => {
        const partnerId = conversation.participants?.find((participant) => participant !== String(user?.id)) || conversation.senderId;
        return {
          conversation,
          partnerId,
          partner: profiles[partnerId] ?? null,
        };
      }),
    [conversations, profiles, user?.id],
  );

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
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
          <Pressable style={styles.buttonPrimary} onPress={() => router.push('/pages/login')}>
            <Text style={styles.buttonPrimaryText}>Anmelden</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.conversation.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 74 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Nachrichten</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}><ActivityIndicator color={BRAND} /></View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.hint}>{error || 'Noch keine Nachrichten vorhanden.'}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item.conversation}
            partner={item.partner}
            onPress={() => router.push({ pathname: '/pages/nachrichtendetail', params: { id: item.partnerId } })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 safeArea: { flex: 1, backgroundColor: '#e9edf5' }, 
  //safeArea: { flex: 1, backgroundColor: '#ffffff' },  
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '800', color: BRAND },
  threadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 24 },
  avatarInitials: { color: BRAND, fontWeight: '800' },
  threadContent: { flex: 1, gap: 3 },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  threadName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a' },
  threadTime: { color: '#94a3b8', fontSize: 12 },
  threadPreview: { color: '#475569' },
  separator: { height: 1, backgroundColor: '#e2e8f0', marginLeft: 74 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  hint: { color: '#475569', textAlign: 'center' },
  buttonPrimary: { backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
});
