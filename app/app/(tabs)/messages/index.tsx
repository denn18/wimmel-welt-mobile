import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStatus } from '../../../hooks/use-auth-status';
import { apiRequest } from '../../../services/api-client';
import { fetchConversations, type Message } from '../../../services/messages';
import { assetUrl } from '../../../utils/url';

const BRAND = 'rgb(49,66,154)';

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

type UserProfile = {
  id?: string;
  role?: string;
  name?: string;
  daycareName?: string;
  profileImageUrl?: string | null;
  logoImageUrl?: string | null;
};

async function fetchUserProfiles(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  if (!uniqueIds.length) return {} as Record<string, UserProfile | null>;

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const response = await apiRequest<UserProfile>(`api/users/${id}`);
        return [id, response];
      } catch (error) {
        console.warn('Konnte Benutzerprofil nicht laden', id, error);
        return [id, null];
      }
    }),
  );

  return Object.fromEntries(entries) as Record<string, UserProfile | null>;
}

function ConversationCard({
  conversation,
  partner,
  onPress,
}: {
  conversation: Message;
  partner: UserProfile | null;
  onPress: () => void;
}) {
  const partnerName =
    partner?.role === 'caregiver'
      ? [partner?.name || 'Unbekannter Kontakt', partner?.daycareName]
          .filter(Boolean)
          .join(' – ')
      : partner?.name || partner?.daycareName || 'Unbekannter Kontakt';
  const partnerRole = partner?.role === 'caregiver' ? 'Kindertagespflegeperson' : 'Elternteil';
  const profileUrl = partner?.profileImageUrl ? assetUrl(partner.profileImageUrl) : '';
  const logoUrl = partner?.logoImageUrl ? assetUrl(partner.logoImageUrl) : '';
  const initials = partnerName.trim().charAt(0).toUpperCase();

  const hasAttachments = Array.isArray(conversation.attachments) && conversation.attachments.length > 0;
  const previewText = conversation.body?.trim();
  const preview = previewText
    ? previewText.length > 80
      ? `${previewText.slice(0, 77)}…`
      : previewText
    : hasAttachments
      ? `${conversation.attachments?.length ?? 0} ${
          (conversation.attachments?.length ?? 0) === 1 ? 'Anhang' : 'Anhänge'
        }`
      : 'Keine Vorschau verfügbar';

  return (
    <Pressable onPress={onPress} style={styles.threadCard}>
      <View style={styles.threadIcon}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logoImage} />
        ) : null}
        <View style={[styles.avatar, logoUrl ? styles.avatarInset : null]}>
          {profileUrl ? (
            <Image source={{ uri: profileUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>{initials}</Text>
          )}
        </View>
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadName}>{partnerName}</Text>
          <Text style={styles.threadTime}>{formatTimestamp(conversation.createdAt)}</Text>
        </View>
        <Text style={styles.threadPreview}>{preview}</Text>
        <Text style={styles.threadMeta}>{partnerRole}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={BRAND} />
    </Pressable>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStatus();
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
        console.error('Konnte Nachrichten nicht laden', requestError);
        setError('Nachrichten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    void loadConversations();
  }, [user?.id]);

  const handleOpenConversation = (partnerId: string) => {
    router.push({ pathname: '/nachrichten/[id]', params: { id: partnerId } });
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}> 
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.hint}>Lade Anmeldestatus…</Text>
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
          <View style={styles.ctaRow}>
            <Pressable style={styles.buttonPrimary} onPress={() => router.push('/login')}>
              <Text style={styles.buttonPrimaryText}>Anmelden</Text>
            </Pressable>
            <Pressable style={styles.buttonGhost} onPress={() => router.push('/anmelden')}>
              <Text style={styles.buttonGhostText}>Account erstellen</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}> 
          <View>
            <Text style={styles.subtitle}>Alle Chats auf einen Blick</Text>
            <Text style={styles.title}>Nachrichten</Text>
          </View>
          {/* 
          Button um Benachrichtigungen ein/ausschalten, wird erstmal nicht gebraucht
          <View style={styles.badge}>
            <Ionicons name="notifications" size={16} color={BRAND} />
            <Text style={styles.badgeText}>Benachrichtigungen aktiv</Text>
          </View> */}
        </View>

        {loading ? (
          <View style={styles.loadingRow}> 
            <ActivityIndicator color={BRAND} />
            <Text style={styles.hint}>Nachrichten werden geladen…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses" size={32} color={BRAND} />
            <Text style={styles.emptyText}>Noch keine Nachrichten vorhanden. Besuche das Familienzentrum, um Gespräche zu starten.</Text>
          </View>
        ) : null}

        {conversations.map((conversation) => {
          const partnerId =
            conversation.participants?.find((participant) => participant !== String(user.id)) || conversation.senderId;
          const partnerProfile = profiles[partnerId] ?? null;

          return (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              partner={partnerProfile}
              onPress={() => handleOpenConversation(partnerId)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF2FF',
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BRAND,
  },
  subtitle: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e8f0ff',
    borderRadius: 999,
  },
  badgeText: {
    color: BRAND,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  threadIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInset: {
    marginLeft: -12,
    borderColor: '#fff',
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarInitials: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 16,
  },
  threadContent: {
    flex: 1,
    gap: 6,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  threadName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  threadTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  threadPreview: {
    color: '#475569',
    lineHeight: 18,
  },
  threadMeta: {
    color: BRAND,
    fontWeight: '700',
    fontSize: 12,
  },
  error: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 10,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
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
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
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
  buttonGhost: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  buttonGhostText: {
    color: BRAND,
    fontWeight: '700',
  },
});
