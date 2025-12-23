import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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

  const handleCopyEmail = async () => {
    try {
      await Clipboard.setStringAsync(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Clipboard not available', error);
    }
  };

  const handleUploadChange = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
      multiple: false,
    });

    if (result.canceled) {
      setUploadMessage('');
      return;
    }

    const file = result.assets?.[0];
    if (file?.name) {
      setUploadMessage(`"${file.name}" wurde erfolgreich ausgewählt.`);
    }
  };

  const updateField = (field: 'firstName' | 'lastName' | 'feedback', value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    setUploadMessage((current) => current || 'Vielen Dank! Wir haben deine Nachricht erhalten.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
            <View style={styles.header}>
              <Text style={styles.kicker}>Kontakt</Text>
              <Text style={styles.title}>Wir freuen uns auf deine Nachricht</Text>
              <Text style={styles.subtitle}>
                Ob Lob, Ideen oder Verbesserungsvorschläge: Über das Formular erreichst du uns jederzeit. Für dringende Anliegen
                kannst du unsere Kontaktadresse direkt kopieren.
              </Text>
            </View>

            <View style={styles.emailCard}>
              <View style={styles.emailInfo}>
                <Text style={styles.emailLabel}>E-Mail</Text>
                <Text style={styles.emailValue}>{CONTACT_EMAIL}</Text>
                <Text style={styles.emailHint}>Klicke auf den Button, um die Adresse in die Zwischenablage zu kopieren.</Text>
              </View>
              <Pressable onPress={handleCopyEmail} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color="#fff" />
                <Text style={styles.copyButtonText}>{copied ? 'Kopiert!' : 'E-Mail kopieren'}</Text>
              </Pressable>
            </View>

            <View style={styles.formCard}>
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.label}>Vorname</Text>
                  <TextInput
                    value={formState.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    placeholder="Max"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Nachname</Text>
                  <TextInput
                    value={formState.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    placeholder="Mustermann"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Rezension / Verbesserungsvorschlag</Text>
                <TextInput
                  value={formState.feedback}
                  onChangeText={(text) => updateField('feedback', text)}
                  placeholder="Was läuft gut? Wo können wir noch besser werden?"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.uploadBlock}>
                <Text style={styles.label}>Dateien hochladen (optional)</Text>
                <Pressable style={styles.uploadButton} onPress={handleUploadChange}>
                  <Ionicons name="cloud-upload-outline" size={18} color={BRAND} />
                  <Text style={styles.uploadText}>Datei auswählen</Text>
                </Pressable>
                <Text style={styles.helperText}>Zum Beispiel Screenshots oder PDF-Dateien mit deinen Anmerkungen.</Text>
              </View>

              {uploadMessage ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#0f9f6e" />
                  <Text style={styles.successText}>{uploadMessage}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable onPress={handleSubmit} style={styles.submitButton}>
                  <Text style={styles.submitText}>Nachricht senden</Text>
                </Pressable>
              </View>
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 140,
  },
  shell: {
    gap: 14,
  },
  header: {
    backgroundColor: '#f7f9ff',
    borderRadius: 22,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 3,
  },
  kicker: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BRAND,
    lineHeight: 28,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  emailCard: {
    backgroundColor: '#f1f5ff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d5e0ff',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
    gap: 14,
  },
  emailInfo: {
    gap: 4,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emailValue: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND,
  },
  emailHint: {
    color: '#475569',
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
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe5ff',
    gap: 12,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7e3ff',
    backgroundColor: '#f8fbff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadBlock: {
    gap: 8,
  },
  uploadButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d5e0ff',
    backgroundColor: '#eef3ff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: BRAND,
    fontWeight: '800',
    fontSize: 13,
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#0f9f6e',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  actions: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: BRAND,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: BRAND,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
