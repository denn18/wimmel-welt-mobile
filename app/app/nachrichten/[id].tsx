import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = 'rgb(49,66,154)';

export default function MessageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const threadId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={BRAND} />
          <Text style={styles.backText}>Zurück</Text>
        </Pressable>
        <View style={styles.threadMeta}>
          <Ionicons name="chatbubbles" size={18} color={BRAND} />
          <Text style={styles.threadTitle}>Nachricht: {threadId ?? 'Unbekannt'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.placeholder}>Hier erscheinen die Nachrichten mit der ausgewählten Tagespflegeperson.</Text>
        <Text style={styles.small}>Thread-ID: {threadId ?? '—'}</Text>
      </View>

      <View style={styles.composer}>
        <TextInput style={styles.input} placeholder="Nachricht eingeben…" placeholderTextColor="#94A3B8" />
        <Pressable style={styles.sendBtn}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.sendText}>Senden</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: BRAND,
    fontWeight: '600',
    fontSize: 14,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND,
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 22,
  },
  small: {
    color: '#64748b',
    fontSize: 13,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    color: '#0f172a',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
