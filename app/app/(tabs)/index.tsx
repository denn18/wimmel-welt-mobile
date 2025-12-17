import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '@/services/api-client';

type Caregiver = { id: string };
type Parent = { id: string };
type Match = { id: string };

type OverviewStats = {
  caregivers: number;
  parents: number;
  matches: number;
};

const initialStats: OverviewStats = {
  caregivers: 0,
  parents: 0,
  matches: 0,
};

const featureCards = [
  {
    icon: 'shield-checkmark',
    title: 'Persönliche Kindertagespflege',
    description:
      'Finde liebevolle Kindertagespflegepersonen in deiner Nähe, die genau zu den Bedürfnissen deiner Familie passen.',
  },
  {
    icon: 'document-lock',
    title: 'Transparente Kindertagespflege',
    description:
      'Vergleiche pädagogische Konzepte, freie Kindertagespflegeplätze und Altersgrenzen auf einen Blick.',
  },
  {
    icon: 'chatbubbles',
    title: 'Direkte Kommunikation',
    description:
      'Nutze unseren Messenger für schnelle Absprachen, Kennenlerntermine und individuelle Fragen rund um deine Betreuung.',
  },
];

export default function HomeScreen() {
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor="#0f172a" />}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>Willkommen bei Wimmel Welt</Text>
          </View>
          <Text style={styles.headline}>Gemeinsam schaffen wir einen sicheren Ort zum Wachsen.</Text>
          <Text style={styles.subheadline}>
            Unsere Plattform verbindet Familien mit engagierten Kindertagespflegepersonen. Entdecke Betreuungsmöglichkeiten,
            koordiniere Anfragen und bleibe mit deinem Netzwerk in Kontakt – alles an einem Ort.
          </Text>
          <View style={styles.ctaRow}>
            <Pressable style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Jetzt registrieren</Text>
            </Pressable>
            <Pressable style={styles.secondaryCta}>
              <Text style={styles.secondaryCtaText}>Bereits registriert? Jetzt einloggen</Text>
            </Pressable>
          </View>
          <Text style={styles.helperText}>
            Wimmel Welt macht Kindertagespflege, Kindervermittlung und die Suche nach freien Betreuungsplätzen so einfach wie
            möglich – für Familien und Tagespflegepersonen gleichermaßen.
          </Text>
        </View>
        <View style={styles.heroIllustrationWrapper}>
          <Image
            source={require('@/assets/images/hero-family.svg')}
            style={styles.heroIllustration}
            contentFit="contain"
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Tagespflegepersonen" value={stats.caregivers} hint="in deiner Umgebung" />
        <StatCard label="Familien" value={stats.parents} hint="nutzen Wimmel Welt" />
        <StatCard label="Platzierungen" value={stats.matches} hint="erfolgreich vermittelt" />
        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statLabel}>Sicherheit</Text>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
            <Text style={styles.securityText}>Geprüfte Profile & sichere Betreuung</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureList}>
        {featureCards.map((item) => (
          <View key={item.title} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={item.icon as never} size={22} color="#2563eb" />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={18} color="#b91c1c" style={{ marginTop: 2 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
};

function StatCard({ label, value, hint }: StatCardProps) {
  const formatted = value ? value.toLocaleString('de-DE') : '—';

  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{formatted}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e7efff',
  },
  content: {
    padding: 22,
    paddingBottom: 36,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#fdfefe',
    borderRadius: 32,
    padding: 20,
    flexDirection: 'row',
    gap: 18,
    shadowColor: '#9fb9f5',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroTextContainer: {
    flex: 1,
    gap: 10,
  },
  heroIllustrationWrapper: {
    width: 160,
    height: 180,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e4edff',
    borderRadius: 999,
  },
  brandPillText: {
    color: '#1d4ed8',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 32,
  },
  subheadline: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  ctaRow: {
    flexDirection: 'column',
    gap: 10,
  },
  primaryCta: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  primaryCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryCta: {
    borderWidth: 1,
    borderColor: '#bfd5ff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#f5f7ff',
  },
  secondaryCtaText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
  },
  helperText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#f8fbff',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  statHint: {
    color: '#64748b',
    marginTop: 2,
  },
  secondaryCard: {
    justifyContent: 'center',
    gap: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
    lineHeight: 18,
  },
  featureList: {
    marginTop: 18,
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#f8fbff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e4f1ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginTop: 14,
  },
  errorText: {
    color: '#b91c1c',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
