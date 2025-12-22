import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleSelectionPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <Text style={styles.title}>Wimmel Welt</Text>
            <Text style={styles.subtitle}>
              Wähle deine Rolle aus, um ein persönliches Profil zu erstellen und passende Angebote zu entdecken.
            </Text>
          </View>

          <View style={styles.cardGrid}>
            <Link href="/anmelden/eltern" asChild>
              <Pressable style={styles.roleCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.roleTag}>Für Eltern</Text>
                  <Text style={styles.roleTitle}>Betreuungsplätze suchen</Text>
                </View>
                <Text style={styles.roleDescription}>
                  Teile uns mit, wie viele Kinder du betreut haben möchtest, welche Betreuungszeiten wichtig sind und
                  welche Postleitzahl dein Zuhause hat.
                </Text>
                <Text style={styles.roleAction}>Elternprofil anlegen →</Text>
              </Pressable>
            </Link>

            <Link href="/anmelden/tagespflegeperson" asChild>
              <Pressable style={styles.roleCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.roleTag}>Für Kindertagespflegepersonen</Text>
                  <Text style={styles.roleTitle}>Betreuungsplätze anbieten</Text>
                </View>
                <Text style={styles.roleDescription}>
                  Beschreibe deine Kindertagespflege, verfügbare Plätze, dein pädagogisches Konzept und wo man dich
                  findet.
                </Text>
                <Text style={styles.roleAction}>Kindertagespflegeprofil anlegen →</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf2ff',
  },
  content: {
    flexGrow: 1,
    padding: 18,
  },
  shell: {
    gap: 22,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 18,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 4,
  },
  header: {
    gap: 6,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#32429a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    lineHeight: 20,
    fontSize: 14,
  },
  cardGrid: {
    gap: 14,
  },
  roleCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d7e3ff',
    backgroundColor: '#f6f9ff',
    padding: 16,
    gap: 10,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  cardHeader: {
    gap: 4,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4963d6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#213087',
  },
  roleDescription: {
    color: '#475569',
    lineHeight: 18,
    fontSize: 13,
  },
  roleAction: {
    color: '#3353c5',
    fontWeight: '700',
    fontSize: 13,
  },
});
