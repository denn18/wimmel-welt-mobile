import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ElternRegistrierungScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Elternprofil</Text>
        <Text style={styles.subtitle}>Die Registrierung für Eltern folgt in einem kommenden Schritt.</Text>
        <Link href="/anmelden" style={styles.link}>
          Zurück zur Rollenwahl
        </Link>
      </View>
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
    gap: 12,
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
  link: {
    color: '#3353c5',
    fontWeight: '700',
  },
});
