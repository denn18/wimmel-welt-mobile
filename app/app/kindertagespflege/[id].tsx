import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = 'rgb(49,66,154)';

export default function CaregiverDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caregiverId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={BRAND} />
          <Text style={styles.backText}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Tagespflege kennenlernen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="home" size={18} color={BRAND} />
            <Text style={styles.cardTitle}>Profil</Text>
          </View>
          <Text style={styles.muted}>Profil-ID: {caregiverId ?? '—'}</Text>
          <Text style={styles.text}>
            Hier kannst du die Informationen der ausgewählten Kindertagespflegeperson anzeigen. Ergänze bei Bedarf
            weitere Felder wie Öffnungszeiten, Referenzen oder freie Plätze.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="chatbubble-ellipses" size={18} color={BRAND} />
            <Text style={styles.cardTitle}>Kontakt aufnehmen</Text>
          </View>
          <Text style={styles.text}>
            Über diesen Bereich kannst du später eine Anfrage starten oder direkt in den Messenger wechseln.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="chatbubbles" size={16} color="#fff" />
            <Text style={styles.primaryText}>Messenger öffnen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0f172a',
  },
  text: {
    color: '#0f172a',
    lineHeight: 21,
  },
  muted: {
    color: '#64748b',
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: BRAND,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
