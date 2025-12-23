import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = 'rgb(49,66,154)';

const sections = [
  {
    title: 'Diensteanbieter',
    content: ['Wimmel Welt Muster GmbH', 'Musterstraße 12', '12345 Beispielstadt'],
  },
  {
    title: 'Kontakt',
    content: ['Telefon: +49 (0) 123 456789', 'E-Mail: wimmel-welt@info.de', 'Web: www.wimmel-welt.de'],
  },
  {
    title: 'Vertretungsberechtigt',
    content: ['Max Beispiel (Geschäftsführung)'],
  },
  {
    title: 'Registereintrag',
    content: ['Handelsregister: Amtsgericht Beispielstadt', 'Registernummer: HRB 012345'],
  },
  {
    title: 'Umsatzsteuer-ID',
    content: ['USt-IdNr.: DE123456789'],
  },
  {
    title: 'Verantwortlich für den Inhalt',
    content: ['Verantwortlich gemäß § 18 Abs. 2 MStV: Max Beispiel, Musterstraße 12, 12345 Beispielstadt.'],
  },
  {
    title: 'Haftungshinweise',
    content: [
      'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich. Sollten dir rechtswidrige Inhalte auffallen, freuen wir uns über einen Hinweis.',
    ],
  },
  {
    title: 'Streitbeilegung',
    content: ['Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'],
  },
];

export default function ImprintPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={BRAND} />
          </Pressable>
          <Text style={styles.topBarTitle}>Impressum</Text>
          <View style={styles.placeholderIcon}>
            <Ionicons name="ellipsis-horizontal" size={20} color={BRAND} />
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Impressum</Text>
          </View>
          <Text style={styles.pageTitle}>Angaben gemäß § 5 TMG</Text>
          <Text style={styles.leadText}>
            Dieses Impressum dient als Platzhalter und wird bei Bedarf durch die finalen Unternehmensdaten ersetzt.
          </Text>
        </View>

        <View style={styles.sectionStack}>
          {sections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionBody}>
                {section.content.map((line) => (
                  <Text key={line} style={styles.bodyText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Profil speichern</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Weitere Angaben anzeigen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf1ff',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8e0ef',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND,
    letterSpacing: 0.2,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: '#f7f9ff',
    borderRadius: 22,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(49,66,154,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(49,66,154,0.2)',
  },
  badgeText: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND,
    lineHeight: 28,
  },
  leadText: {
    color: '#475569',
    lineHeight: 20,
    fontSize: 14,
  },
  sectionStack: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND,
    lineHeight: 20,
  },
  sectionBody: {
    gap: 4,
  },
  bodyText: {
    color: '#0f172a',
    lineHeight: 19,
    fontSize: 14,
  },
  actions: {
    marginTop: 6,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#eef3ff',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8e0ef',
  },
  secondaryButtonText: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 14,
  },
});
