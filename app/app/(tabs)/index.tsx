import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

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
      'Finde individuelle Betreuungsmodelle in deiner Nähe, die genau zur Lebensrealität deiner Familie passen.',
  },
  {
    icon: 'document-lock',
    title: 'Transparente Kindertagespflege',
    description:
      'Übersichtliche pädagogische Konzepte, freie Betreuungsplätze und Öffnungszeiten – alles in einem Ort.',
  },
  {
    icon: 'chatbubbles',
    title: 'Direkte Kommunikation',
    description: 'Tausche dich direkt mit Tagespflegepersonen aus, um Bedürfnisse, Fragen oder Termine abzustimmen.',
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
      <View style={styles.heroContainer}>
        <View style={styles.heroBackground}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.heroImage}
            contentFit="contain"
          />
        </View>
        <View style={styles.heroTextContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Wimmel Welt</Text>
            <View style={styles.brandBadge}>
              <View style={[styles.badgeDot, { backgroundColor: '#6ca3ff' }]} />
              <View style={[styles.badgeDot, { backgroundColor: '#f4a261' }]} />
            </View>
          </View>
          <Text style={styles.headline}>Gemeinsam schaffen wir einen sicheren Ort zum Wachsen.</Text>
          <Text style={styles.subheadline}>
            Finde schnell und einfach die passende Kindertagespflegeperson oder registriere dich als Tagesmutter, um deine
            Betreuungsdienste anzubieten – alles an einem Ort.
          </Text>
        </View>
      </View>

      <View style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Platz finden</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Tagespflegepersonen" value={stats.caregivers} hint="in deiner Umgebung" />
        <StatCard label="Familien" value={stats.parents} hint="nutzen Wimmel Welt" />
      </View>

      <View style={styles.statsRow}>
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
              <Ionicons name={item.icon as never} size={20} color="#2563eb" />
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
    backgroundColor: '#eef5ff',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heroContainer: {
    backgroundColor: '#f8fbff',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 18,
    elevation: 4,
  },
  heroBackground: {
    width: 96,
    height: 96,
    backgroundColor: '#e4f1ff',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 72,
    height: 72,
  },
  heroTextContainer: {
    flex: 1,
    gap: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  brandBadge: {
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    backgroundColor: '#e4f1ff',
    borderRadius: 999,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  subheadline: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 14,
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
    gap: 10,
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
