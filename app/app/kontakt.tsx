import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';
const CONTACT_EMAIL = 'wimmel-welt@info.de';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [formState, setFormState] = useState({ firstName: '', lastName: '', feedback: '' });

  async function handleCopyEmail() {
    try {
      const webClipboard =
        typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText
          ? (navigator as any).clipboard
          : null;

      if (webClipboard?.writeText) {
        await webClipboard.writeText(CONTACT_EMAIL);
      } else {
        await Share.share({ message: CONTACT_EMAIL });
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Clipboard not available', error);
      Alert.alert('Hinweis', 'Deine Zwischenablage konnte nicht erreicht werden.');
    }
  }

  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: false });
      if (result.canceled) {
        setUploadMessage('');
        return;
      }

      const file = result.assets?.[0];
      if (file) {
        setUploadMessage(`"${file.name}" wurde erfolgreich ausgewählt.`);
      }
    } catch (error) {
      console.warn('Document picking failed', error);
      Alert.alert('Upload fehlgeschlagen', 'Bitte versuche es später erneut.');
    }
  }

  function updateField(field: 'firstName' | 'lastName' | 'feedback', value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    setUploadMessage((current) => current || 'Vielen Dank! Wir haben deine Nachricht erhalten.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Ionicons name="chatbox-ellipses" size={20} color={BRAND} />
            <Text style={styles.topBarTitle}>Kontakt</Text>
            <View style={styles.placeholderIcon}>
              <Ionicons name="ellipsis-horizontal" size={20} color={BRAND} />
            </View>
          </View>

          <View style={styles.headerCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Kontakt</Text>
            </View>
            <Text style={styles.pageTitle}>Wir freuen uns auf deine Nachricht</Text>
            <Text style={styles.leadText}>
              Ob Lob, Ideen oder Verbesserungsvorschläge: Über das Formular erreichst du uns jederzeit. Für dringende Anliegen
              kannst du unsere Kontaktadresse direkt kopieren.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>E-Mail</Text>
              <Text style={styles.email}>{CONTACT_EMAIL}</Text>
              <Text style={styles.helperText}>Klicke auf den Button, um die Adresse in die Zwischenablage zu kopieren.</Text>
            </View>
            <Pressable style={styles.copyButton} onPress={handleCopyEmail}>
              <Ionicons name={copied ? 'checkmark-circle' : 'copy'} size={18} color="#fff" />
              <Text style={styles.copyButtonText}>{copied ? 'Kopiert!' : 'E-Mail kopieren'}</Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Vorname</Text>
                <TextInput
                  value={formState.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  placeholder="Max"
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nachname</Text>
                <TextInput
                  value={formState.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  placeholder="Mustermann"
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Rezension / Verbesserungsvorschlag</Text>
              <TextInput
                value={formState.feedback}
                onChangeText={(text) => updateField('feedback', text)}
                placeholder="Was läuft gut? Wo können wir noch besser werden?"
                style={[styles.input, styles.textArea]}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Dateien hochladen (optional)</Text>
              <Pressable style={styles.uploadButton} onPress={handleUpload}>
                <Ionicons name="cloud-upload" size={18} color={BRAND} />
                <Text style={styles.uploadButtonText}>Datei auswählen</Text>
              </Pressable>
              <Text style={styles.helperText}>Zum Beispiel Screenshots oder PDF-Dateien mit deinen Anmerkungen.</Text>
            </View>

            {uploadMessage ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color="#047857" />
                <Text style={styles.successText}>{uploadMessage}</Text>
              </View>
            ) : null}

            <View style={styles.submitRow}>
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Nachricht senden</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        <BottomNavbar />
      </KeyboardAvoidingView>
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
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4963d6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND,
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
  },
  copyButton: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: BRAND,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldGroup: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8e0ef',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 120,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#eef3ff',
    borderWidth: 1,
    borderColor: '#d8e0ef',
  },
  uploadButtonText: {
    color: BRAND,
    fontWeight: '800',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf3',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    color: '#166534',
    fontSize: 13,
  },
  submitRow: {
    alignItems: 'flex-end',
  },
  submitButton: {
    backgroundColor: BRAND,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: BRAND,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
