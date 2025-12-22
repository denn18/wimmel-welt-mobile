import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../components/BottomNavbar';

const threads = [
  {
    name: 'Familie Schröder',
    preview: 'Können wir morgen um 10 Uhr telefonieren?',
    time: 'vor 5 Min',
    unread: 2,
    status: 'Anfrage',
  },
  {
    name: 'Kita Sonnenschein',
    preview: 'Danke für die Unterlagen, wir melden uns!',
    time: 'vor 18 Min',
    unread: 0,
    status: 'Bestätigt',
  },
  {
    name: 'Familie Wagner',
    preview: 'Wir freuen uns auf das Kennenlernen.',
    time: 'vor 1 Std',
    unread: 1,
    status: 'Termin',
  },
];

export default function MessagesScreen() {
  const groupedThreads = useMemo(
    () => ({
      neu: threads.filter((thread) => thread.unread > 0),
      alle: threads,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Alle Chats auf einen Blick</Text>
            <Text style={styles.title}>Nachrichten</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="notifications" size={16} color="#2563eb" />
            <Text style={styles.badgeText}>Benachrichtigungen an</Text>
          </View>
        </View>

        <MessageSection title="Neu" threads={groupedThreads.neu} />
        <MessageSection title="Alle" threads={groupedThreads.alle} />
      </ScrollView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

type Thread = (typeof threads)[number];

type MessageSectionProps = {
  title: string;
  threads: Thread[];
};

function MessageSection({ title, threads }: MessageSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.threadList}>
        {threads.map((thread) => (
          <View key={thread.name} style={styles.threadCard}>
            <View style={styles.threadIcon}>
              <Ionicons name="chatbubbles" size={18} color="#2563eb" />
            </View>
            <View style={styles.threadContent}>
              <View style={styles.threadHeader}>
                <Text style={styles.threadName}>{thread.name}</Text>
                <Text style={styles.threadTime}>{thread.time}</Text>
              </View>
              <Text style={styles.threadPreview}>{thread.preview}</Text>
              <View style={styles.threadMeta}>
                <View style={styles.threadStatus}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                  <Text style={styles.threadStatusText}>{thread.status}</Text>
                </View>
                {thread.unread ? (
                  <View style={styles.unreadPill}>
                    <Text style={styles.unreadText}>{thread.unread}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ))}
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
    color: '#0f172a',
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
    color: '#2563eb',
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  threadList: {
    gap: 12,
  },
  threadCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  threadIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadContent: {
    flex: 1,
    gap: 6,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threadStatus: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  threadStatusText: {
    color: '#22c55e',
    fontWeight: '700',
  },
  unreadPill: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
});
