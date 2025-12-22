import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../../components/BottomNavbar';

const profileFields = [
  { label: 'Name', value: 'Mara Bergmann' },
  { label: 'E-Mail', value: 'mara.bergmann@example.com' },
  { label: 'Telefon', value: '+49 151 123 456' },
  { label: 'Standort', value: 'Hamburg, Winterhude' },
  { label: 'Betreuungsplätze', value: '2 freie Plätze ab Mai' },
];

const quickActions = [
  { icon: 'document-text', title: 'Dokumente hochladen', description: 'Impfnachweise, Konzepte, Verträge' },
  { icon: 'notifications', title: 'Benachrichtigungen', description: 'Push- und E-Mail-Alerts konfigurieren' },
  { icon: 'shield-checkmark', title: 'Sicherheit', description: '2FA, Sitzungslaufzeiten & Gerätezugriffe' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Profil & Einstellungen</Text>
            <Text style={styles.title}>Dein Profil</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>MB</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stammdaten</Text>
          <View style={styles.fieldList}>
            {profileFields.map((field) => (
              <View key={field.label} style={styles.fieldRow}>
                <View style={styles.fieldLabelRow}>
                  <Ionicons name="ellipse" size={8} color="#94a3b8" />
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                </View>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schnelle Aktionen</Text>
          <View style={styles.actionList}>
            {quickActions.map((action) => (
              <View key={action.title} style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as never} size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomNavbar />
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
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#e8f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontWeight: '800',
    color: '#1d4ed8',
    fontSize: 16,
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
  fieldList: {
    gap: 12,
  },
  fieldRow: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: '#475569',
    fontWeight: '700',
  },
  fieldValue: {
    color: '#0f172a',
    fontSize: 15,
  },
  actionList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#f6f9ff',
    borderRadius: 14,
    padding: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  actionDescription: {
    color: '#475569',
    lineHeight: 18,
  },
});
