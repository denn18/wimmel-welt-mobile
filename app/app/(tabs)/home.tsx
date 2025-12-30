import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '../../services/api-client';
import { useAuthStatus } from '../../hooks/use-auth-status';

const BRAND_TITLE_COLOR = 'rgb(49,66,154)';

const featureCards = [
  {
    key: 'personal',
    title: 'Persönliche Kindertagespflege',
    description:
      'Finde liebevolle Kindertagespflegepersonen in deiner Nähe, die genau zu den Bedürfnissen deiner Familie passen.',
    fallbackIcon: 'heart-circle',
  },
  {
    key: 'transparent',
    title: 'Transparente Kindertagespflege',
    description:
      'Vergleiche pädagogische Konzepte, freie Kindertagespflegeplätze und Altersgrenzen auf einen Blick.',
    fallbackIcon: 'layers',
  },
  {
    key: 'chat',
    title: 'Direkte Kommunikation',
    description:
      'Nutze unseren Messenger für schnelle Absprachen und individuelle Fragen rund um deine Betreuung.',
    fallbackIcon: 'chatbubble-ellipses',
  },
];

type Caregiver = { id: string };
type Parent = { id: string };
type Match = { id: string };

type OverviewStats = {
  caregivers: number;
  parents: number;
  matches: number;
};

const initialStats: OverviewStats = { caregivers: 0, parents: 0, matches: 0 };

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStatus();
  const [stats, setStats] = useState<OverviewStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [caregivers, parents, matches] = await Promise.all([
        apiRequest<Caregiver[]>('api/caregivers'),
        apiRequest<Parent[]>('api/parents'),
        apiRequest<Match[]>('api/matches'),
      ]);

      setStats({
        caregivers: caregivers.length,
        parents: parents.length,
        matches: matches.length,
      });
    } catch (err) {
      console.error('Failed to load overview stats', err);
      setError('Daten konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats])
  );

  const handleAuthPress = useCallback(async () => {
    if (user) {
      await logout();
      router.push('/login');
      return;
    }

    router.push('/login');
  }, [logout, router, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={undefined} style={styles.bg} imageStyle={styles.bgImage}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Title */}
          <View style={styles.topHeader}>
            <Text style={styles.topTitle}>Wimmel Welt</Text>
          </View>

          {/* Hero Image */}
          <View style={styles.heroImageShell}>
            <Image
              source={require('../../assets/images/hero-family.svg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>

          {/* Main Text + CTAs */}
          <View style={styles.mainBlock}>
            <Text style={styles.headline}>
              Gemeinsam schaffen wir einen sicheren Ort zum Wachsen.
            </Text>

            <Text style={styles.subheadline}>
              Finde schnell und einfach die passende Kindertagespflegeperson oder melde dich als Tagesmutter an,
              um deine Betreuungsdienste anzubieten - alles in einem Ort.
            </Text>

            <View style={styles.ctaRow}>
              <Pressable style={styles.primaryBtn} onPress={() => router.push('/(tabs)/dashboard')}>
                <Text style={styles.primaryBtnText}>Betreuungsplatz finden</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={handleAuthPress}>
                <Text style={styles.secondaryBtnText}>{user ? 'Abmelden' : 'Anmelden'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={styles.featureList}>
            {featureCards.map((item) => (
              <View key={item.key} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={item.fallbackIcon as never} size={22} color="#2F5FE8" />
                </View>

                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Error Box */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

      </ScrollView>

      {/* Bottom Navigation
      Navbar, die Icons können wir später übernehmen, erstmal bleibt diese auskommentiert sonst habe wir eine doppelte.
        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={22} color={BRAND_TITLE_COLOR} />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)/dashboard')}>
            <Ionicons name="grid" size={22} color={BRAND_TITLE_COLOR} />
            <Text style={styles.navLabel}>Dashboard</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="chatbubbles" size={22} color={BRAND_TITLE_COLOR} />
            <Text style={styles.navLabel}>Nachrichten</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-circle" size={22} color={BRAND_TITLE_COLOR} />
            <Text style={styles.navLabel}>Profil</Text>
          </Pressable>
        </View> */}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_TITLE_COLOR,
  },

  bg: {
    flex: 1,
    backgroundColor: BRAND_TITLE_COLOR,
  },
  bgImage: {
    resizeMode: 'cover',
  },

  screen: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 96,
  },

  topHeader: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 10,
  },
  topTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },

  heroImageShell: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#DCEBFF',
    height: 250,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  mainBlock: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 26,
    padding: 16,
    gap: 10,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },

  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 32,
  },

  subheadline: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },

  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#2F5FE8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F5FE8',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
    paddingHorizontal: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  secondaryBtn: {
    flex: 1.1,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#BFD3FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryBtnText: {
    color: 'rgb(49,66,154)',
    fontWeight: '800',
    fontSize: 12.5,
    textAlign: 'center',
  },

  featureList: {
    marginTop: 14,
    gap: 12,
  },

  featureCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#A7C2FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },

  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: 'rgb(49,66,154)', // ✅ wie gewünscht
  },
  featureDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  errorBox: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
  },

  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(191,211,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 8,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 64,
  },

  navLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: 'rgb(49,66,154)',
  },
});
