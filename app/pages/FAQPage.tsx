import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = 'rgb(49,66,154)';
const BG = '#EAF2FF';
const darkbluefont = '#353e73';

type FaqQuestion = {
  q: string;
  a: string;
};

type FaqSection = {
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  questions: FaqQuestion[];
};

const faqData: FaqSection[] = [
  {
    category: 'Allgemeines',
    icon: 'help-circle-outline',
    questions: [
      {
        q: 'Was ist eine Kindertagespflege?',
        a: 'Kindertagespflege ist eine familiennahe Form der Kinderbetreuung. Kinder werden meist in kleinen Gruppen von einer qualifizierten Tagesmutter oder einem Tagesvater betreut – häufig im eigenen Haushalt der Betreuungsperson.',
      },
      {
        q: 'Ab welchem Alter können Kinder in die Kindertagespflege?',
        a: 'In der Regel können Kinder bereits ab dem ersten Lebensjahr betreut werden. Viele Angebote richten sich speziell an Kinder unter drei Jahren.',
      },
      {
        q: 'Wie viele Kinder betreut eine Tagesmutter gleichzeitig?',
        a: 'Eine Kindertagespflegeperson darf in Deutschland normalerweise bis zu fünf Kinder gleichzeitig betreuen.',
      },
      {
        q: 'Was kostet ein Platz in der Kindertagespflege?',
        a: 'Die Kosten hängen von der jeweiligen Stadt oder dem Jugendamt ab. In vielen Städten werden die Beiträge ähnlich wie bei Kitas vom Jugendamt festgelegt oder bezuschusst.',
      },
      {
        q: 'Wie finde ich einen freien Betreuungsplatz?',
        a: 'Über Plattformen wie Wimmel Welt können Eltern gezielt nach freien Betreuungsplätzen suchen und direkt Kontakt zu Kindertagespflegepersonen aufnehmen.',
      },
      {
        q: 'Ist Kindertagespflege genauso sicher wie eine Kita?',
        a: 'Ja. Kindertagespflegepersonen benötigen eine Pflegeerlaubnis vom Jugendamt, müssen Qualifizierungen nachweisen und regelmäßig Fortbildungen besuchen.',
      },
      {
        q: 'Wie läuft die Eingewöhnung ab?',
        a: 'Die Eingewöhnung erfolgt meist nach dem Berliner Modell. Dabei begleiten Eltern ihr Kind in den ersten Tagen, bis es sich an die neue Umgebung gewöhnt hat.',
      },
      {
        q: 'Welche Vorteile hat Kindertagespflege gegenüber einer Kita?',
        a: 'Die Betreuung bietet kleinere Gruppen, individuellere Förderung, eine familiäre Atmosphäre und häufig flexiblere Betreuungszeiten.',
      },
      {
        q: 'Was passiert, wenn die Tagesmutter krank ist?',
        a: 'Viele Kommunen organisieren Vertretungsmodelle, sodass Kinder im Krankheitsfall weiterhin betreut werden können.',
      },
    ],
  },
  {
    category: 'Für Familien',
    icon: 'people-outline',
    questions: [
      {
        q: 'Wie viel kostet es mich, die Plattform Wimmel Welt zu benutzen?',
        a: 'Die Plattform ist für Eltern komplett kostenlos – ohne Kaufoption oder versteckte Gebühren.',
      },
      {
        q: 'Wie teuer ist die Betreuung meines Kindes bei einer Kindertagespflegeperson?',
        a: 'Die Kosten sind je nach Kommune und Einkommen unterschiedlich. Bei höherem Einkommen teilen sich Eltern und Kommune die Kosten, bei niedrigerem Einkommen kann die Kommune die Finanzierung vollständig übernehmen.',
      },
      {
        q: 'Warum sollte ich mein Kind bei einer Tagesmutter oder einem Tagesvater betreuen lassen?',
        a: 'Im Vergleich zum Kindergarten sind die Gruppen meist kleiner. Dadurch können Kinder individueller begleitet und gefördert werden.',
      },
    ],
  },
  {
    category: 'Für Kindertagespflegepersonen',
    icon: 'people-circle-outline',
    questions: [
      {
        q: 'Was ist die "Wimmel Welt" ?',
        a: 'Wimmel Welt ist eine digitale Plattform, auf der Kindertagespflegepersonen ihre freien Betreuungsplätze sichtbar machen können, damit Eltern schneller eine passende Betreuung finden.',
      },
      {
        q: 'Für wen ist die Plattform gedacht?',
        a: 'Die Plattform richtet sich an Kindertagespflegepersonen, Eltern auf der Suche nach Betreuung und kleine Betreuungseinrichtungen.',
      },
      {
        q: 'Wie kann ich mich auf Wimmel Welt registrieren?',
        a: 'Sie können sich einfach über unsere Website registrieren und ein Profil für Ihre Kindertagespflege erstellen.',
      },
      {
        q: 'Welche Informationen kann ich in meinem Profil angeben?',
        a: 'Zum Beispiel Betreuungszeiten, Anzahl freier Plätze, Alter der Kinder, Bilder Ihrer Räumlichkeiten und Ihr pädagogisches Konzept.',
      },
      {
        q: 'Kostet die Nutzung der Plattform etwas?',
        a: 'Aktuell ist die Nutzung kostenlos',
      },
      {
        q: 'Wie können Eltern mich kontaktieren?',
        a: 'Eltern können direkt über die Plattform eine Betreuungsanfrage senden.',
      },
      {
        q: 'Kann ich mein Profil jederzeit ändern?',
        a: 'Ja. Sie können freie Plätze, Betreuungszeiten und Informationen jederzeit aktualisieren.',
      },
      {
        q: 'In welchen Städten ist Wimmel Welt verfügbar?',
        a: 'Wimmel Welt wird aktuell ausgebaut und ist bereits in Gütersloh aktiv. Weitere Städte sind geplant',
      },
      {
        q: 'Muss ich eine Pflegeerlaubnis haben, um mich anzumelden?',
        a: 'Ja. Nur qualifizierte Kindertagespflegepersonen mit gültiger Pflegeerlaubnis dürfen Betreuungsangebote einstellen.',
      },
      {
        q: 'Wie hilft mir Wimmel Welt dabei, neue Familien zu finden?',
        a: 'Die Plattform macht Ihre freien Plätze online sichtbar, sodass Eltern gezielt suchen und Sie direkt ohne Umwege kontaktieren können.',
      },
    ],
  },
  {
    category: 'Sicherheit & Datenschutz',
    icon: 'shield-checkmark-outline',
    questions: [
      {
        q: 'Wie werden meine Daten geschützt?',
        a: 'Wir achten auf einen verantwortungsvollen Umgang mit personenbezogenen Daten und orientieren uns an den geltenden Datenschutzstandards. Details finden Sie in unserer Datenschutzerklärung.',
      },
      {
        q: 'Wer darf auf Profile und Betreuungsinformationen zugreifen?',
        a: 'Informationen sind für die Nutzung der Plattform vorgesehen, damit Eltern und Tagespflegepersonen zueinander finden. Sensible Daten werden nicht öffentlich dargestellt.',
      },
      {
        q: 'Wo finde ich weitere rechtliche Informationen?',
        a: 'Alle Details finden Sie auf unseren Seiten zu Datenschutz und Impressum.',
      },
    ],
  },
];

export default function FAQPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(faqData[0].category);
  const activeSection = useMemo(
    () => faqData.find((section) => section.category === activeCategory) ?? faqData[0],
    [activeCategory],
  );
  const [openQuestion, setOpenQuestion] = useState(activeSection.questions[0]?.q ?? '');

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    const section = faqData.find((entry) => entry.category === category);
    setOpenQuestion(section?.questions[0]?.q ?? '');
  }

  function handleQuestionToggle(question: string) {
    setOpenQuestion((current) => (current === question ? '' : question));
  }

  return (
   // <SafeAreaView style={styles.safeArea}>
   <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={BRAND} />
          </Pressable>
          <Text style={styles.topBarTitle}>FAQ</Text>
          <View style={styles.placeholderIcon}>
            <Ionicons name="ellipsis-horizontal" size={20} color={BRAND} />
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Häufige Fragen</Text>
          </View>
          <Text style={styles.pageTitle}>Antworten rund um Wimmel Welt</Text>
          <Text style={styles.leadText}>
            Hier finden Familien und Tagespflegepersonen die wichtigsten Informationen zur Plattform, Betreuung und
            Sicherheit.
          </Text>
        </View>

        <View style={styles.categoryWrap}>
          {faqData.map((section) => {
            const isActive = section.category === activeCategory;
            return (
              <Pressable
                key={section.category}
                onPress={() => handleCategoryChange(section.category)}
                style={[styles.categoryButton, isActive ? styles.categoryButtonActive : null]}
              >
                <Ionicons name={section.icon} size={14} color={isActive ? '#fff' : '#334155'} />
                <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : null]}>{section.category}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.questionsWrap}>
          {activeSection.questions.map((entry) => {
            const isOpen = openQuestion === entry.q;
            return (
              <View key={entry.q} style={styles.questionCard}>
                <Pressable style={styles.questionButton} onPress={() => handleQuestionToggle(entry.q)}>
                  <Text style={styles.questionText}>{entry.q}</Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={BRAND} />
                </Pressable>
                {isOpen ? <Text style={styles.answerText}>{entry.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerLabel}>Noch Fragen?</Text>
          <Text style={styles.footerTitle}>Wir helfen gerne persönlich weiter.</Text>
          <View style={styles.footerActions}>
            <Link href="/ContactPage" asChild>
              <Pressable style={styles.primaryAction}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={BRAND} />
                <Text style={styles.primaryActionText}>Kontakt</Text>
              </Pressable>
            </Link>
            <Link href="/dashboard" asChild>
              <Pressable style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Kindertagespflege finden</Text>
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
    backgroundColor: BG,
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 24,
    fontWeight: '800',
    color: BRAND,
    lineHeight: 30,
  },
  leadText: {
    color: '#475569',
    lineHeight: 20,
    fontSize: 14,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    borderColor: BRAND,
    backgroundColor: BRAND,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  categoryTextActive: {
    color: '#fff',
  },
  questionsWrap: {
    gap: 10,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    overflow: 'hidden',
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  questionText: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '700',
  },
  answerText: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#475569',
    lineHeight: 20,
    fontSize: 13,
  },
  footerCard: {
    backgroundColor: BRAND,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  footerLabel: {
    color: '#dbe5ff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
    fontWeight: '700',
  },
  footerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  footerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryAction: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: BRAND,
    fontWeight: '700',
  },
  secondaryAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  secondaryActionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
