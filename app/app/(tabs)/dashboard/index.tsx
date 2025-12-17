import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '@/services/api-client';

const sections = [
  {
    title: 'Heute zu erledigen',
    items: [
      'Neue Anfragen prüfen und beantworten',
      'Offene Profileinträge aktualisieren',
      'Chat-Nachrichten der Familien beantworten',
    ],
    icon: 'checkmark-done',
  },
  {
    title: 'Nächste Schritte',
    items: ['Profil komplettieren', 'Betreuungsplätze bestätigen', 'Termin für Kennenlernen planen'],
    icon: 'sparkles',
  },
];

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

export default function DashboardScreen() {
  const [stats, setStats] = useState<OverviewStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [caregivers, parents, matches] = await Promise.all([
        apiRequest<{ id: string }[]>('api/caregivers'),
        apiRequest<{ id: string }[]>('api/parents'),
        apiRequest<{ id: string }[]>('api/matches'),
      ]);

      setStats({
        caregivers: caregivers.length,
        parents: parents.length,
        matches: matches.length,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
      setError('Übersicht konnte nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats])
  );

  const highlightStats = useMemo(
    () => [
      { label: 'aktive Tagespflegepersonen', value: stats.caregivers, icon: 'people' },
      { label: 'Familien in Betreuung', value: stats.parents, icon: 'home' },
      { label: 'erfolgreiche Platzierungen', value: stats.matches, icon: 'ribbon' },
    ],
    [stats]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor="#0f172a" />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Dein Tagespflege-Cockpit</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={16} color="#1d4ed8" />
            <Text style={styles.pillText}>Sicher verbunden</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          {highlightStats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name={item.icon as never} size={18} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{item.value ? item.value.toLocaleString('de-DE') : '—'}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live-Aktivitäten</Text>
          <View style={styles.activityList}>
            <ActivityRow icon="mail" title="Neue Anfrage" description="Familie Schröder hat dir geschrieben." time="vor 5 Min" />
            <ActivityRow icon="chatbubbles" title="Chat" description="Kita Sonnenschein antwortete im Gruppenchat." time="vor 12 Min" />
            <ActivityRow icon="calendar" title="Termin bestätigt" description="Kennenlernen am Freitag, 14:00 Uhr" time="vor 32 Min" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To-Dos</Text>
          <View style={styles.todoGrid}>
            {sections.map((section) => (
              <View key={section.title} style={styles.todoCard}>
                <View style={styles.todoHeader}>
                  <View style={styles.todoIcon}>
                    <Ionicons name={section.icon as never} size={18} color="#2563eb" />
                  </View>
                  <Text style={styles.todoTitle}>{section.title}</Text>
                </View>
                {section.items.map((item) => (
                  <View key={item} style={styles.todoRow}>
                    <Ionicons name="ellipse" size={8} color="#94a3b8" />
                    <Text style={styles.todoText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={18} color="#b91c1c" style={{ marginTop: 2 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type ActivityRowProps = {
  icon: string;
  title: string;
  description: string;
  time: string;
};

function ActivityRow({ icon, title, description, time }: ActivityRowProps) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <Ionicons name={icon as never} size={18} color="#1d4ed8" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 48,
    paddingTop: 16,
    gap: 18,
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
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e0ebff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    gap: 8,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ebf2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    color: '#475569',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  activityList: {
    gap: 10,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  activityDescription: {
    color: '#475569',
    lineHeight: 18,
  },
  activityTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  todoGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  todoCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#f6f9ff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todoIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#e6edff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  todoRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  todoText: {
    color: '#475569',
    lineHeight: 18,
    flex: 1,
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
  },
  errorText: {
    color: '#b91c1c',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
