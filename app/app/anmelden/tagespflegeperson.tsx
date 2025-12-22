import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../components/BottomNavbar';

export default function TagespflegepersonHinweisScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Kindertagespflegeprofil</Text>
        <Text style={styles.subtitle}>
          Wir empfehlen die Profilerstellung auf einem Laptop oder Computer durchzuführen.
        </Text>
        <Link href="/anmelden/tagespflegeperson/profil" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Trotzdem fortfahren</Text>
          </Pressable>
        </Link>
        <Link href="/anmelden" style={styles.link}>
          Zurück zur Rollenwahl
        </Link>
      </View>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf2ff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
    paddingBottom: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#213087',
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3353c5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#3353c5',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  link: {
    color: '#3353c5',
    fontWeight: '700',
  },
});
