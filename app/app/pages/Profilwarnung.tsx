import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../components/BottomNavbar';

type ProfilRolle = 'eltern' | 'tagespflegeperson';

const ROLLEN_KONFIG: Record<ProfilRolle, { title: string; href: '/pages/elternprofil' | '/pages/tagespflegeprofil' }> = {
  eltern: {
    title: 'Elternprofil',
    href: '/pages/elternprofil',
  },
  tagespflegeperson: {
    title: 'Kindertagespflegeprofil',
    href: '/pages/tagespflegeprofil',
  },
};

export default function ProfilwarnungScreen() {
  const { rolle } = useLocalSearchParams<{ rolle?: string }>();

  const ausgewaehlteRolle: ProfilRolle = rolle === 'tagespflegeperson' ? 'tagespflegeperson' : 'eltern';
  const konfig = ROLLEN_KONFIG[ausgewaehlteRolle];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{konfig.title}</Text>
        <Text style={styles.subtitle}>
          Wir empfehlen die Profilerstellung auf einem Laptop oder Computer durchzuführen.
        </Text>
        <Link href={konfig.href} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Trotzdem fortfahren</Text>
          </Pressable>
        </Link>
        <Link href="/pages/auswahl" style={styles.link}>
          Zurück zur Rollenwahl
        </Link>
      </View>
  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
    paddingBottom: 120,
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
