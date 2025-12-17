import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const onboardingSteps = [
  {
    title: 'Profil erstellen',
    description: 'Füge Foto, Öffnungszeiten und freie Plätze hinzu, damit Familien dich finden.',
    icon: 'person-add',
  },
  {
    title: 'Anfragen managen',
    description: 'Antworten, Kennenlerntermine und Dokumente direkt in der App koordinieren.',
    icon: 'chatbubbles',
  },
  {
    title: 'Betreuung starten',
    description: 'Status-Updates teilen und Verträge sicher abschließen.',
    icon: 'shield-checkmark',
  },
];

const resources = [
  {
    title: 'Checkliste für den Start',
    description: 'Alle Pflichtfelder und Nachweise, die du für dein Profil brauchst.',
    icon: 'list-circle',
  },
  {
    title: 'Best Practices für Chats',
    description: 'Vorlagen für erste Antworten und Terminabsprachen.',
    icon: 'sparkles',
  },
  {
    title: 'Rechtliches & Datenschutz',
    description: 'Immer auf dem aktuellen Stand mit Impressum und Datenschutz.',
    icon: 'document-text',
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Alles, was du für einen guten Start brauchst</Text>
          <Text style={styles.title}>Info-Center</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onboarding</Text>
          <Text style={styles.sectionDescription}>
            Schritt für Schritt von der Registrierung bis zur ersten Platzierung.
          </Text>
          <View style={styles.cardList}>
            {onboardingSteps.map((step) => (
              <View key={step.title} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name={step.icon as never} size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.cardTitle}>{step.title}</Text>
                  <Text style={styles.cardDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ressourcen</Text>
          <Text style={styles.sectionDescription}>Vorlagen, Hilfen und aktuelle Infos aus der Web-App.</Text>
          <View style={styles.cardList}>
            {resources.map((item) => (
              <View key={item.title} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name={item.icon as never} size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportRow}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset" size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.cardTitle}>Direkter Kontakt</Text>
              <Text style={styles.cardDescription}>
                Unsere Support-Tickets spiegeln die Web-Workflows – Antworten landen direkt im Postfach.
              </Text>
            </View>
          </View>
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
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 42,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
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
  sectionDescription: {
    color: '#475569',
    lineHeight: 18,
  },
  cardList: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#f6f9ff',
    borderRadius: 14,
    padding: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDescription: {
    color: '#475569',
    lineHeight: 18,
  },
  supportRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
