import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';

type Section = {
  title: string;
  content?: string;
  bullets?: string[];
  intro?: string;
};

const sections: Section[] = [
  {
    title: '1. Verantwortliche Stelle & Datenschutzkontakt',
    content:
      'Verantwortlich für die Datenverarbeitung ist die Wimmel Welt Plattform. Für Datenschutzanfragen erreichst du uns per E-Mail unter wimmel-welt@info.de.',
  },
  {
    title: '2. Welche Daten wir verarbeiten',
    bullets: [
      'Stammdaten wie Name, Kontaktdaten, Adressen sowie Profilangaben von Eltern und Kindertagespflegepersonen.',
      'Anmelde- und Nutzungsdaten (z. B. Logins, Nachrichtenverläufe, hochgeladene Dokumente oder Bilder).',
      'Technische Daten wie IP-Adresse, Browserinformationen sowie Protokolle zu Sicherheit und Stabilität.',
    ],
  },
  {
    title: '3. Zwecke und Rechtsgrundlagen',
    intro: 'Wir verarbeiten Daten für folgende Zwecke auf Basis von Art. 6 Abs. 1 DSGVO:',
    bullets: [
      'Bereitstellung unserer Plattform, Vermittlung von Betreuungsplätzen und Kommunikation zwischen Nutzenden.',
      'Erfüllung vertraglicher Pflichten und Durchführung vorvertraglicher Maßnahmen.',
      'Wahrung berechtigter Interessen wie IT-Sicherheit, Missbrauchserkennung und Optimierung der Angebote.',
      'Einwilligungen, z. B. für optionale Uploads, Newsletter oder die Veröffentlichung von Profilbildern.',
    ],
  },
  {
    title: '4. Speicherdauer',
    content:
      'Wir speichern personenbezogene Daten nur solange, wie es für die oben genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Nach Wegfall der Zwecke oder Ablauf der Fristen werden Daten gelöscht oder anonymisiert.',
  },
  {
    title: '5. Weitergabe an Dritte & Auftragsverarbeitung',
    content:
      'Eine Weitergabe erfolgt nur, wenn sie zur Vertragserfüllung nötig ist, du eingewilligt hast oder eine rechtliche Pflicht besteht. Dienstleister erhalten Daten ausschließlich auf Basis von Auftragsverarbeitungsverträgen gemäß Art. 28 DSGVO und werden sorgfältig ausgewählt.',
  },
  {
    title: '6. Deine Rechte',
    bullets: [
      'Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung (Art. 15–18 DSGVO).',
      'Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen (Art. 21 DSGVO).',
      'Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft.',
      'Beschwerderecht bei einer Datenschutzaufsichtsbehörde.',
    ],
  },
  {
    title: '7. Sicherheit, Hosting & Protokollierung',
    content:
      'Wir schützen Daten durch aktuelle technische und organisatorische Maßnahmen, verschlüsselte Verbindungen und rollenbasierte Zugriffskonzepte. Server-Logs nutzen wir zur Störungsbehebung und Sicherheit und löschen sie regelmäßig.',
  },
  {
    title: '8. Cookies & Analysen',
    bullets: [
      'Funktionale Cookies sind notwendig, um Anmeldungen und Einstellungen bereitzustellen.',
      'Optionale Statistik- oder Komfort-Cookies setzen wir nur nach vorheriger Einwilligung.',
      'Du kannst diese jederzeit in den Browser-Einstellungen löschen.',
    ],
  },
  {
    title: '9. Besondere Hinweise für Kinder & Jugendliche',
    content:
      'Unsere Plattform richtet sich an Erziehungsberechtigte und Betreuungspersonen. Minderjährige dürfen ohne Zustimmung der Sorgeberechtigten keine eigenen Accounts anlegen oder Daten übermitteln.',
  },
  {
    title: '10. Änderungen dieser Hinweise',
    content:
      'Wir passen die Datenschutzhinweise an, wenn neue gesetzliche Anforderungen, technische Entwicklungen oder Angebote dies erfordern. Die jeweils aktuelle Fassung findest du jederzeit auf dieser Seite.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Datenschutz</Text>
          </View>
          <Text style={styles.pageTitle}>Hinweise zum Schutz deiner Daten</Text>
          <Text style={styles.leadText}>
            Wir behandeln personenbezogene Daten verantwortungsvoll, transparent und entsprechend der Vorgaben der
            Datenschutz-Grundverordnung (DSGVO) sowie des Bundesdatenschutzgesetzes (BDSG).
          </Text>
        </View>

        <View style={styles.sectionStack}>
          {sections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.content ? <Text style={styles.bodyText}>{section.content}</Text> : null}
              {section.intro ? <Text style={[styles.bodyText, styles.sectionSpacing]}>{section.intro}</Text> : null}
              {section.bullets ? (
                <View style={styles.bulletList}>
                  {section.bullets.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bodyText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNavbar />
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
    paddingBottom: 120,
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
  bodyText: {
    color: '#0f172a',
    lineHeight: 19,
    fontSize: 14,
    flex: 1,
  },
  sectionSpacing: {
    marginTop: 4,
  },
  bulletList: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 19,
  },
});
