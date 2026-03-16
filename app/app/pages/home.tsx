import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../components/BottomNavbar';
import { useAuthStatus } from '../../hooks/use-auth-status';

// Vorgaben aus deiner Web-Version / neuen Werten
const BG = '#EAF2FF';
const CARD_BG = 'rgba(255,255,255,0.7)';

const BRAND_50 = '#EEF4FF';
const BRAND_200 = '#BFD3FF';
const BRAND_400 = '#9DBBFF';

// Primary Button
const BRAND_600 = '#3758c4';
const BRAND_700 = '#2c43a0';

// Feature Headlines
const FEATURE_TITLE = '#2c43a0';

// Kleine Textfarben
const SLATE_900 = '#0f172a';
const SLATE_600 = '#475569';
const SLATE_500 = '#64748b';

const features = [
  {
    key: 'personal',
    title: 'Persönliche Kindertagespflege',
    description:
      'Finde liebevolle Kindertagespflegepersonen in deiner Nähe, die genau zu den Bedürfnissen deiner Familie passen.',
  },
  {
    key: 'transparent',
    title: 'Transparente Kindertagespflege',
    description:
      'Vergleiche pädagogische Konzepte, freie Kindertagespflegeplätze und Altersgrenzen auf einen Blick.',
  },
  {
    key: 'chat',
    title: 'Direkte Kommunikation',
    description:
      'Nutze unseren Messenger für schnelle Absprachen, Kennenlerntermine und individuelle Fragen rund um deine Betreuung.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStatus();
  const [authActionLoading, setAuthActionLoading] = useState(false);

  const handleAuthPress = useCallback(async () => {
    if (!user) {
      router.push('/pages/login');
      return;
    }

    try {
      setAuthActionLoading(true);
      await logout();
    } catch (logoutError) {
      console.error('Abmelden fehlgeschlagen', logoutError);
    } finally {
      setAuthActionLoading(false);
    }
  }, [logout, router, user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wimmel Welt</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.welcomeText}>WILLKOMMEN BEI WIMMEL WELT</Text>

          <Text style={styles.headline}>Gemeinsam schaffen wir einen sicheren Ort zum Wachsen.</Text>

          <View style={styles.heroImageShell}>
            <Image
              source={require('../../assets/images/hero-family.svg')}
              style={styles.heroImage}
              contentFit="contain"
            />
          </View>

          <Text style={styles.descriptionText}>
            Unsere Plattform verbindet Familien mit engagierten Kindertagespflegepersonen. Entdecke
            Betreuungsmöglichkeiten, koordiniere Anfragen und bleibe mit deinem Netzwerk in Kontakt – alles an einem
            Ort.
          </Text>

          <View style={styles.ctaWrap}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
              onPress={() => router.push('/pages/dashboard')}
            >
              <Text style={styles.primaryBtnText}>Kindertagespflege finden</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
              onPress={handleAuthPress}
              disabled={authActionLoading}
            >
              <Text style={styles.secondaryBtnText}>{user ? 'Abmelden' : 'Anmelden'}</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Wimmel Welt macht Kindertagespflege, Kindervermittlung und die Suche nach freien Betreuungsplätzen so
            einfach wie möglich – für Familien und Tagespflegepersonen gleichermaßen.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature.key} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  screen: {
    flex: 1,
    //war vorher farblich abgehoben, erstmal so lassen
    //backgroundColor: '#f5f7fb',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 0, // kein extra Abstand vor Navbar
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: BRAND_700,
  },

  heroCard: {
    borderRadius: 24,
    backgroundColor: CARD_BG,
    padding: 16,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: BRAND_600,
  },
  headline: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: SLATE_900,
    lineHeight: 36,
  },

  heroImageShell: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BRAND_50,
    height: 224,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  descriptionText: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: SLATE_600,
  },

  ctaWrap: {
    marginTop: 16,
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 999,
    backgroundColor: BRAND_600,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: BRAND_600,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  primaryBtnPressed: {
    backgroundColor: BRAND_700,
  },
  primaryBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },

  secondaryBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BRAND_200,
    backgroundColor: '#fff',
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnPressed: {
    backgroundColor: BRAND_50,
    borderColor: BRAND_400,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: BRAND_700,
    fontWeight: '700',
  },

  footerText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: SLATE_500,
  },

  featureList: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#A7C2FF',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FEATURE_TITLE,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: SLATE_600,
  },
});