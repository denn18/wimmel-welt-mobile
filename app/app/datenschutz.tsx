import { Ionicons } from '@expo/vector-icons';
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
    title: '1. Verantwortlicher und Geltungsbereich',
    bullets: [
      'Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:',
      'Wimmel Welt [Rechtsform, z.B. e.K. / UG (haftungsbeschränkt) / GmbH]',
      '[Straße, Hausnummer]',
      '[PLZ, Ort]',
      'Telefon: [Telefonnummer]',
      'E-Mail: [zentrale Kontaktadresse]',
      'Sofern ein Datenschutzbeauftragter bestellt ist:',
      'Datenschutzbeauftragter: [Name oder externer Dienstleister]',
      'Anschrift: [Anschrift]',
      'E-Mail: [DSB-E-Mail-Adresse]',
      'Diese Datenschutzerklärung gilt für die Nutzung der Online-Plattform „Wimmel Welt“ unter den Domains [z.B. wimmelwelt.de] einschließlich der API-Endpunkte https://api.wimmelwelt.de (Produktivsystem) und https://api-staging.wimmelwelt.de (Staging-Umgebung) sowie aller zugehörigen Weboberflächen und Funktionen (Registrierung, Login, Profile, Suche, Chat, Medien-Uploads, Rechnungsbereitstellung).',
    ],
  },
  {
    title: '2. Zwecke der Verarbeitung, Datenarten und Rechtsgrundlagen',
    intro: 'Die folgenden Informationen gelten je nach Nutzerrolle und Funktion der Plattform:',
    bullets: [
      '2.1 Nutzung der Plattform durch Eltern',
      'Stammdaten: Vorname, Nachname, E-Mail-Adresse, Telefonnummer, Wohnanschrift, Postleitzahl, Benutzername, Passwort (bcrypt-Hash).',
      'Familiendaten: Angaben zu Kindern (Name, Alter bzw. Geburtsjahr, ggf. Geschlecht, Betreuungsbedarf, interne Notizen, soweit für die Vermittlung notwendig).',
      'Profildaten: optionales Profilbild und freiwillige Zusatzangaben (z.B. besondere Betreuungswünsche).',
      'Zweck der Verarbeitung ist die Einrichtung, Verwaltung und Nutzung des Elternkontos sowie die Anbahnung und Durchführung von Betreuungsverhältnissen mit Kindertagespflegepersonen über die Plattform. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. Durchführung vorvertraglicher Maßnahmen).',
      'Soweit Eltern freiwillig weitergehende Angaben machen (z.B. besondere Bedürfnisse, Allergien), erfolgt die Verarbeitung zusätzlich auf Grundlage ihrer Einwilligung (Art. 6 Abs. 1 lit. a, ggf. Art. 9 Abs. 2 lit. a DSGVO).',
      '2.2 Nutzung der Plattform durch Kindertagespflegepersonen',
      'Stammdaten: Vorname, Nachname, E-Mail-Adresse, Telefonnummer, Anschrift, Postleitzahl, Stadt, Benutzername, Passwort (bcrypt-Hash).',
      'Angebots- und Profildaten: Name der Kindertagespflege/Kita, Qualifikationen, Berufserfahrung, Altersgruppen, Anzahl und Verfügbarkeit von Betreuungsplätzen, Öffnungszeiten, Standortinformationen, Beschreibung/Bio, pädagogisches Konzept, Speiseplan.',
      'Medien und Dokumente: Profilbild, Logo, Fotos von Räumen/Innen- und Außenbereichen, ggf. von betreuenden Personen, hochgeladene Konzeptdokumente (z.B. PDFs, Office-Dateien).',
      'Zweck der Verarbeitung ist die Darstellung des Betreuungsangebots, die Teilnahme an der Vermittlungsplattform und die Kontaktanbahnung mit Eltern. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Nutzungsvertrag) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem effizienten Vermittlungs- und Informationsangebot).',
      '2.3 Suche, Filterung und Matching',
      'Suchparameter (z.B. Postleitzahl, Altersgruppe, Betreuungsumfang, gewünschte Betreuungszeiten).',
      'Matchingdaten (Zuordnungen zwischen Eltern und Kindertagespflegepersonen, Match-Status, Zeitstempel).',
      'Zweck ist die bedarfsgerechte Vermittlung zwischen Eltern und Kindertagespflegepersonen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.',
      '2.4 Chat-Funktion und Kommunikation',
      'Chatdaten: Textnachrichten, Konversations-ID, Sender- und Empfänger-ID, Zeitstempel.',
      'Metadaten: Informationen zur Übermittlung (z.B. Nachrichtenstatus).',
      'Chatnachrichten werden in der Datenbank (Collection messages) gespeichert, um laufende Unterhaltungen bereitzustellen und in der Nutzeroberfläche anzuzeigen. Zweck ist die einfache, dokumentierte und nachvollziehbare Kommunikation. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.',
      'Wenn Nutzer im Chat freiwillig Angaben machen, die besondere Kategorien personenbezogener Daten betreffen (z.B. Gesundheitsdaten, Allergien, Entwicklungsbesonderheiten des Kindes), geschieht dies freiwillig und in Kenntnis, dass diese Informationen der jeweiligen Gegenseite zugänglich werden. Rechtsgrundlage ist insoweit Art. 9 Abs. 2 lit. a DSGVO.',
      '2.5 Medien-Uploads, insbesondere Kinderfotos',
      'Kindertagespflegepersonen können Medien (Bilder, Dokumente) hochladen, die etwa im Profil oder im Chat verwendet werden (Profilbilder, Logos, Fotos der Räume, Chat-Anhänge).',
      'Soweit es sich dabei um Fotos oder Videos von Kindern handelt, ist die vorherige ausdrückliche Einwilligung der personensorgeberechtigten Eltern erforderlich. Ohne eine wirksame Einwilligung dürfen keine identifizierbaren Kinderbilder hochgeladen oder im Chat versendet werden.',
      'Die Einwilligung der Eltern basiert auf Art. 6 Abs. 1 lit. a DSGVO i.V.m. Art. 8 DSGVO. Sie kann jederzeit mit Wirkung für die Zukunft widerrufen werden. Nach Widerruf werden betroffene Medien – soweit technisch möglich und rechtlich zulässig – gelöscht.',
      '2.6 Rechnungen und Vertragsdokumente',
      'Sofern bestimmte Leistungen kostenpflichtig sind, können Rechnungsdokumente über die Plattform bereitgestellt werden. Verarbeitet werden Identitätsdaten der Rechnungsadresse sowie Vertrags- und Abrechnungsdaten (Leistungsart, Zeitraum, Rechnungsnummer, Beträge).',
      'Zweck ist die Abrechnung und Dokumentation. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO sowie Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflichten).',
      '2.7 Technische Zugriffsdaten und Logs',
      'Beim Aufruf der Plattform und der API werden automatisiert technische Daten verarbeitet (IP-Adresse, Datum/Uhrzeit, URL, HTTP-Statuscode, Datenmenge, Browser/OS, ggf. Referrer).',
      'Diese Daten werden in Protokolldateien (Logs) gespeichert, um Stabilität und Sicherheit zu gewährleisten, Fehler zu analysieren und Angriffe abzuwehren. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.',
    ],
  },
  {
    title: '3. Hosting, externe Dienstleister und Datenübermittlung',
    bullets: [
      '3.1 Cloud-Hosting und Storage (AWS S3)',
      'Für die Speicherung von Dateien verwendet die Plattform den Cloud-Dienst „Amazon Web Services (AWS) S3“. AWS ist ein Angebot der Amazon Web Services EMEA SARL, 38 avenue John F. Kennedy, L-1855 Luxemburg, sowie weiterer verbundener Gesellschaften.',
      'Die S3-Buckets (wimmelwelt-staging und wimmelwelt-prod) befinden sich primär in der Region eu-central-1 (Frankfurt); optional besteht eine Konfiguration für eu-north-1.',
      'In S3 werden u.a. Profilbilder, Logos, Profilmedien, Fotos, Chat-Anhänge (Bilder, PDFs, Office-Dokumente) sowie ggf. Rechnungs-PDFs gespeichert.',
      'Die Verarbeitung erfolgt auf Grundlage eines Auftragsverarbeitungsvertrags nach Art. 28 DSGVO. Etwaige Drittlandübermittlungen werden durch geeignete Garantien (Art. 44 ff. DSGVO, z.B. Standardvertragsklauseln) abgesichert.',
      '3.2 Datenbankdienst MongoDB Atlas',
      'Die Plattform nutzt „MongoDB Atlas“ als Datenbankdienst (Anbieter: MongoDB Inc. bzw. europäische Tochtergesellschaft). Die Daten werden in einer Region mit angemessenem Datenschutzniveau gespeichert (z.B. innerhalb der EU); dies wird im Auftragsverarbeitungsvertrag festgelegt.',
      'In MongoDB Atlas werden u.a. Elternkonten (parents), Profile von Kindertagespflegepersonen (caregivers), Chatnachrichten (messages) und Matches (matches) gespeichert.',
      'Rechtsgrundlage für die Einschaltung als Auftragsverarbeiter ist Art. 28 DSGVO. Etwaige Drittlandübermittlungen erfolgen nur unter Einhaltung der Art. 44 ff. DSGVO.',
      '3.3 E-Mail-Dienst (SMTP)',
      'Für den Versand von E-Mails (z.B. Benachrichtigungen über neue Chatnachrichten) nutzen wir einen konfigurierbaren SMTP-Server (eigener Mailserver oder externer Anbieter).',
      'Verarbeitet werden E-Mail-Adresse, Name/Benutzername sowie ggf. gekürzte Previews von Chatnachrichten.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO sowie Art. 6 Abs. 1 lit. f DSGVO. Bei externen Dienstleistern erfolgt dies auf Basis eines Auftragsverarbeitungsvertrags gemäß Art. 28 DSGVO.',
      '3.4 Monitoring, Logs und Alarmierung',
      'Zur Überwachung und Fehleranalyse setzen wir u.a. OTLP-Collector (z.B. https://otel.wimmelwelt.de), zentralen Log-Dienst (z.B. https://logs.wimmelwelt.de), Grafana und PagerDuty ein.',
      'Dabei können technische Metriken und Logs verarbeitet werden, die im Einzelfall auch indirekte Personenbezüge enthalten (z.B. IP-Adressen, Nutzer-IDs in Fehlermeldungen). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.',
      'Mit externen Monitoring-Anbietern werden Auftragsverarbeitungsverträge geschlossen; dies umfasst erforderlichenfalls Datenübermittlungen nach Art. 44 ff. DSGVO.',
    ],
  },
  {
    title: '4. Authentifizierung, Cookies und Speicherdauer',
    bullets: [
      '4.1 Authentifizierung und Sitzungsverwaltung',
      'Für die Authentifizierung wird eine eigene Nutzerverwaltung auf Basis von MongoDB eingesetzt. Benutzername/E-Mail und Passwort werden verarbeitet. Passwörter werden ausschließlich als bcrypt-Hash gespeichert und sind im Klartext nicht einsehbar.',
      'Zur Aufrechterhaltung der Sitzung wird ein HTTP-only Cookie mit dem Namen ww_auth verwendet. Dieses enthält in verschlüsselter oder codierter Form die Nutzer-ID und die Rolleninformation und dient dazu, dich während deines Besuchs als eingeloggten Nutzer zu erkennen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.',
      '4.2 Cookies und ähnliche Technologien',
      'Wir setzen technisch notwendige Cookies ein, um Login, Sitzungsverwaltung und Sicherheitsfunktionen zu ermöglichen. Rechtsgrundlage ist § 25 Abs. 2 TTDSG i.V.m. Art. 6 Abs. 1 lit. b und lit. f DSGVO.',
      'Tracking- oder Marketing-Cookies und clientseitige Analyse- oder Profiling-Tools (z.B. Google Analytics, Facebook Pixel) werden derzeit nicht eingesetzt.',
      '4.3 Speicherdauer und Löschung',
      'Nutzerkonten: Speicherung für die Dauer der aktiven Nutzung. Auf Löschantrag wird das Konto gelöscht, soweit keine Aufbewahrungspflichten entgegenstehen; andernfalls werden Daten gesperrt und nach Fristablauf gelöscht.',
      'Chatnachrichten und Anhänge: Speicherung für die Dauer der aktiven Nutzung und Kommunikation; vorgesehen ist eine Löschung/Anonymisierung nach einem definierten Zeitraum (z.B. 6 bis 24 Monate nach Ende der aktiven Nutzung oder Abschluss der Kommunikation).',
      'Kinderfotos und vergleichbare Medien: Verarbeitung nur solange eine wirksame Einwilligung besteht und der Zweck fortbesteht. Nach Widerruf oder Wegfall des Zwecks werden Medien grundsätzlich gelöscht, soweit keine Pflichten entgegenstehen.',
      'Rechnungs- und Abrechnungsdaten: Aufbewahrung bis zu 10 Jahre gemäß handels- und steuerrechtlichen Vorgaben.',
      'Server-Logfiles: Speicherung in der Regel maximal 30 Tage und anschließende Löschung/Anonymisierung, sofern keine längere Speicherung erforderlich ist (z.B. Beweissicherung).',
      'Konkrete Fristen können in einer internen Löschrichtlinie weiter präzisiert und in aktualisierten Fassungen dieser Datenschutzerklärung bekannt gemacht werden.',
    ],
  },
  {
    title: '5. Rechte der betroffenen Personen, Pflichtangaben und Datensicherheit',
    bullets: [
      '5.1 Rechte der betroffenen Personen',
      'Recht auf Auskunft (Art. 15 DSGVO).',
      'Recht auf Berichtigung (Art. 16 DSGVO).',
      'Recht auf Löschung („Recht auf Vergessenwerden“, Art. 17 DSGVO).',
      'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO).',
      'Recht auf Datenübertragbarkeit (Art. 20 DSGVO).',
      'Recht auf Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. e oder f DSGVO (Art. 21 DSGVO).',
      'Recht auf Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO).',
      'Zur Ausübung deiner Rechte kannst du jederzeit Kontakt mit uns über die oben genannten Kontaktdaten aufnehmen.',
      '5.2 Pflicht zur Bereitstellung personenbezogener Daten',
      'Bestimmte Angaben (z.B. E-Mail-Adresse, Passwort, grundlegende Profil- und Kontaktdaten) sind für Registrierung und Nutzung erforderlich. Ohne diese Daten kann kein Nutzerkonto erstellt und die Plattform nicht genutzt werden.',
      'Weitere Angaben (z.B. Kinderfotos, optionale Profilinfos) sind freiwillig. Eine Nichtbereitstellung kann einzelne Features einschränken, führt jedoch nicht zum Ausschluss von den Kernfunktionen.',
      '5.3 Beschwerderecht bei einer Aufsichtsbehörde',
      'Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig ist insbesondere die Behörde deines gewöhnlichen Aufenthaltsortes, deines Arbeitsplatzes oder des Ortes des mutmaßlichen Verstoßes.',
      'Für den Sitz von Wimmel Welt in [Bundesland, z.B. Berlin] ist in der Regel die [Name und Anschrift der Landesdatenschutzbehörde] zuständig.',
      '5.4 Datensicherheit',
      'Wir treffen geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau sicherzustellen: TLS-Verschlüsselung, sichere Konfiguration der Dienste, Passwort-Hashing (bcrypt), rollenbasierte Zugriffskonzepte, Protokollierung/Monitoring und regelmäßige Überprüfung.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark" size={20} color={BRAND} />
          <Text style={styles.topBarTitle}>Datenschutz</Text>
          <View style={styles.placeholderIcon}>
            <Ionicons name="ellipsis-horizontal" size={20} color={BRAND} />
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Datenschutz</Text>
          </View>
          <Text style={styles.pageTitle}>Datenschutzerklärung</Text>
          <Text style={styles.leadText}>
            Der Schutz deiner personenbezogenen Daten hat für uns einen hohen Stellenwert. Nachfolgend informieren wir dich umfassend
            über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf der Plattform „Wimmel Welt“ gemäß
            Datenschutz-Grundverordnung (DSGVO).
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
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
