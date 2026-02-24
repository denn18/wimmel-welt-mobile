import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStatus } from '../../hooks/use-auth-status';

const BRAND = 'rgb(49,66,154)';

const features = [
  {
    key: 'personal',
    title: 'Persönliche Kindertagespflege',
    description:
      'Finde liebevolle Kindertagespflegepersonen in deiner Nähe, die genau zu den Bedürfnissen deiner Familie passen.',
    icon: 'heart-circle',
  },
  {
    key: 'transparent',
    title: 'Transparente Kindertagespflege',
    description:
      'Vergleiche pädagogische Konzepte, freie Kindertagespflegeplätze und Altersgrenzen auf einen Blick.',
    icon: 'layers',
  },
  {
    key: 'chat',
    title: 'Direkte Kommunikation',
    description:
      'Nutze unseren Messenger für schnelle Absprachen, Kennenlerntermine und individuelle Fragen rund um deine Betreuung.',
    icon: 'chatbubble-ellipses',
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
    <SafeAreaView style={styles.safeArea}>
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
              <View style={styles.featureIconWrap}>
                <Ionicons name={feature.icon as never} size={20} color="#2F5FE8" />
              </View>

              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
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
    backgroundColor: '#f5f7fb',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.78)',
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
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#2F5FE8',
  },
  headline: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 36,
  },
  heroImageShell: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#DCEBFF',
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
    color: '#475569',
  },
  ctaWrap: {
    marginTop: 16,
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 999,
    backgroundColor: '#2F5FE8',
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#2F5FE8',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFD3FF',
    backgroundColor: '#fff',
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: BRAND,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
  featureList: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#A7C2FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
});
