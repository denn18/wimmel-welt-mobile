import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = 'rgb(49,66,154)';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Einstellungen</Text>
        <Text style={styles.subheading}>
          Hier findest du demnächst alle Optionen, um dein Wimmel Welt Erlebnis anzupassen.
        </Text>

        <View style={styles.card}>
          <Ionicons name="settings" size={28} color={BRAND} />
          <Text style={styles.cardTitle}>Demnächst verfügbar</Text>
          <Text style={styles.cardCopy}>
            Wir arbeiten daran, dir hier Benachrichtigungen, Profil- und Sicherheitsoptionen bereitzustellen.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.primaryButtonText}>Zurück zur Übersicht</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF2FF',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: BRAND,
  },
  subheading: {
    color: '#475569',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: '#9bb9ff',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardCopy: {
    color: '#475569',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
