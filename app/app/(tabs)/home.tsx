import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStatus } from '../../hooks/use-auth-status';

const BRAND = '#3B57C4';

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
      console.info('Navigation zur Login-Seite von Home CTA (Mobile)');
      router.push('/login');
      return;
    }

    try {
      setAuthActionLoading(true);
      console.info('Nutzer abgemeldet über Home CTA (Mobile)');
      await logout();
    } catch (logoutError) {
      console.error('Abmelden fehlgeschlagen', logoutError);
    } finally {
      setAuthActionLoading(false);
    }
  }, [logout, router, user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.welcomeText}>Willkommen bei Wimmel Welt</Text>

          <Text style={styles.headline}>Gemeinsam schaffen wir einen sicheren Ort zum Wachsen.</Text>

          <View style={styles.heroImageShell}>
            <Image source={require('../../assets/images/hero-family.svg')} style={styles.heroImage} contentFit="contain" />
          </View>

          <Text style={styles.descriptionText}>
            Unsere Plattform verbindet Familien mit engagierten Kindertagespflegepersonen. Entdecke
            Betreuungsmöglichkeiten, koordiniere Anfragen und bleibe mit deinem Netzwerk in Kontakt – alles an einem
            Ort.
          </Text>

          <View style={styles.ctaWrap}>
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/(tabs)/dashboard')}>
              <Text style={styles.primaryBtnText}>Kindertagespflege finden</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={handleAuthPress} disabled={authActionLoading}>
              <Text style={styles.secondaryBtnText}>{user ? 'Abmelden' : 'Anmelden'}</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Wimmel Welt macht Kindertagespflege, Kindervermittlung und die Suche nach freien Betreuungsplätzen so
            einfach wie möglich – für Familien und Tagespflegepersonen gleichermaßen.
          </Text>
        </View>

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
    backgroundColor: '#ECF1F7',
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 24,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5ECF6',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2F5FE8',
  },
  headline: {
    marginTop: 10,
    fontSize: 58,
    fontWeight: '900',
    color: '#0f1b3d',
    lineHeight: 68,
  },
  heroImageShell: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#DEE5EF',
    height: 280,
    padding: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  descriptionText: {
    marginTop: 20,
    fontSize: 17,
    lineHeight: 36,
    color: '#4B5E7B',
  },
  ctaWrap: {
    marginTop: 20,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 999,
    backgroundColor: '#2F5FE8',
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#3654D4',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
  },
  secondaryBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BAD0FF',
    backgroundColor: '#F8FAFC',
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 20,
    color: BRAND,
    fontWeight: '800',
  },
  footerText: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 30,
    color: '#61718D',
  },
  featureList: {
    gap: 18,
  },
  featureCard: {
    backgroundColor: '#F3F5F8',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#E2E7EF',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BRAND,
  },
  featureDescription: {
    fontSize: 22,
    lineHeight: 42,
    color: '#4B5E7B',
  },
});
