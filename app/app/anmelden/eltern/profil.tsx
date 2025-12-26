import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

import { apiRequest } from '../../../services/api-client';
import { pickSingleFile } from '../../../utils/file-picker';
import { BottomNavbar } from '../../../components/BottomNavbar';

type Child = { name: string; age: string; gender: '' | 'female' | 'male' | 'diverse'; notes: string };

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  username: string;
  password: string;
  notes: string;
};

type StatusMessage = { type: 'success' | 'error'; message: string } | null;

type RegisterResponse = { role?: string; message?: string };

function createChild(): Child {
  return { name: '', age: '', gender: '', notes: '' };
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  username: '',
  password: '',
  notes: '',
};

export default function ElternProfilScreen() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [children, setChildren] = useState<Child[]>([createChild()]);
  const [profileImage, setProfileImage] = useState<{ dataUrl: string | null; fileName: string }>({
    dataUrl: null,
    fileName: '',
  });
  const [status, setStatus] = useState<StatusMessage>(null);
  const [submitting, setSubmitting] = useState(false);

  const enteredChildrenCount = useMemo(
    () => children.filter((child) => child.name.trim()).length,
    [children],
  );

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function updateChild(index: number, field: keyof Child, value: string) {
    setChildren((current) =>
      current.map((child, childIndex) => (childIndex === index ? { ...child, [field]: value } : child)),
    );
  }

  function addChild() {
    setChildren((current) => [...current, createChild()]);
  }

  function removeChild(index: number) {
    setChildren((current) => {
      if (current.length === 1) return [createChild()];
      return current.filter((_, childIndex) => childIndex !== index);
    });
  }

  const handlePickProfileImage = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setProfileImage({ dataUrl: file.dataUrl, fileName: file.fileName });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setStatus(null);

    try {
      const cleanedChildren = children.map((child) => ({
        name: child.name.trim(),
        age: child.age.trim(),
        gender: child.gender || '',
        notes: child.notes.trim(),
      }));

      const payload = {
        ...formState,
        children: cleanedChildren,
        profileImage: profileImage.dataUrl,
        profileImageName: profileImage.fileName,
        childrenAges: cleanedChildren.map((child) => child.age).filter(Boolean).join(', '),
        numberOfChildren: cleanedChildren.filter((child) => child.name).length,
        role: 'parent' as const,
      };

      await apiRequest<RegisterResponse>('api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const identifier = formState.username || formState.email;

      setStatus({
        type: 'success',
        message: 'Registrierung erfolgreich! Wir melden uns mit passenden Tagespflegepersonen.',
      });

      try {
        await apiRequest('api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password: formState.password }),
        });
        setStatus({
          type: 'success',
          message: 'Registrierung erfolgreich! Du wirst jetzt zum Dashboard weitergeleitet.',
        });
        setTimeout(() => router.replace('/(tabs)/dashboard'), 1200);
      } catch (authError) {
        console.warn('Automatischer Login nach Registrierung nicht möglich', authError);
        setStatus({
          type: 'success',
          message: 'Registrierung erfolgreich! Bitte melde dich jetzt mit deinen Zugangsdaten an.',
        });
      }

      setFormState(initialState);
      setChildren([createChild()]);
      setProfileImage({ dataUrl: null, fileName: '' });
    } catch (error) {
      console.error('Elternregistrierung fehlgeschlagen', error);
      const fallbackMessage = 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.';
      const message = error instanceof Error && error.message ? error.message : fallbackMessage;
      setStatus({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Profil für Eltern</Text>
            <Text style={styles.title}>Teile uns mit, wie wir dich erreichen können.</Text>
            <Text style={styles.subtitle}>
              Nach deiner Registrierung wird automatisch ein Zugang für dich erstellt und du kannst dich mit deinen
              Zugangsdaten anmelden.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Besser am Laptop bearbeiten</Text>
            <Text style={styles.infoText}>
              Wir empfehlen die Profilerstellung auf einem Laptop oder Computer durchzuführen.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kontaktdaten</Text>
              <Text style={styles.sectionHint}>Pflichtfelder sind mit * gekennzeichnet.</Text>
            </View>

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Vorname"
                required
                value={formState.firstName}
                onChangeText={(value) => updateField('firstName', value)}
              />
              <LabeledInput
                label="Nachname"
                required
                value={formState.lastName}
                onChangeText={(value) => updateField('lastName', value)}
              />
              <LabeledInput
                label="E-Mail"
                required
                keyboardType="email-address"
                autoCapitalize="none"
                value={formState.email}
                onChangeText={(value) => updateField('email', value)}
              />
              <LabeledInput
                label="Telefonnummer"
                required
                keyboardType="phone-pad"
                value={formState.phone}
                onChangeText={(value) => updateField('phone', value)}
              />
            </View>

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Adresse (optional)"
                value={formState.address}
                onChangeText={(value) => updateField('address', value)}
              />
              <LabeledInput
                label="Postleitzahl"
                required
                keyboardType="number-pad"
                value={formState.postalCode}
                onChangeText={(value) => updateField('postalCode', value)}
              />
            </View>

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Benutzername"
                required
                value={formState.username}
                onChangeText={(value) => updateField('username', value)}
              />
              <LabeledInput
                label="Passwort"
                required
                secureTextEntry
                value={formState.password}
                onChangeText={(value) => updateField('password', value)}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Kinder & Alltag</Text>
                <Text style={styles.sectionHint}>Trage jedes Kind ein und beschreibe kurz den Alltag.</Text>
              </View>
              <Text style={styles.counter}>{enteredChildrenCount} Kinder eingetragen</Text>
            </View>

            <View style={{ gap: 12 }}>
              {children.map((child, index) => (
                <View key={`${index}-${child.name}`} style={styles.childCard}>
                  <View style={styles.gridTwoCols}>
                    <LabeledInput
                      label="Name"
                      placeholder="z. B. Emma"
                      value={child.name}
                      onChangeText={(value) => updateChild(index, 'name', value)}
                    />
                    <LabeledInput
                      label="Alter"
                      placeholder="z. B. 3 Jahre"
                      value={child.age}
                      onChangeText={(value) => updateChild(index, 'age', value)}
                    />
                  </View>

                  <View style={styles.genderRow}>
                    <Text style={styles.genderLabel}>Geschlecht</Text>
                    <View style={styles.genderChips}>
                      {[
                        { value: '', label: 'Bitte auswählen' },
                        { value: 'female', label: 'Weiblich' },
                        { value: 'male', label: 'Männlich' },
                        { value: 'diverse', label: 'Divers' },
                      ].map((option) => (
                        <Pressable
                          key={option.value || 'none'}
                          onPress={() => updateChild(index, 'gender', option.value as Child['gender'])}
                          style={[styles.chip, child.gender === option.value && styles.chipActive]}
                        >
                          <Text style={[styles.chipLabel, child.gender === option.value && styles.chipLabelActive]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <LabeledInput
                    label="Alltag & Besonderheiten"
                    placeholder="z. B. schläft nach dem Mittag gern"
                    value={child.notes}
                    onChangeText={(value) => updateChild(index, 'notes', value)}
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.childFooter}>
                    <Pressable onPress={() => removeChild(index)}>
                      <Text style={styles.removeLink}>Eintrag entfernen</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              <Pressable onPress={addChild} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Weiteres Kind hinzufügen</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Foto von dir (optional)</Text>
              <Text style={styles.sectionHint}>Du kannst später auch über die Webansicht ein Foto ergänzen.</Text>
            </View>
            <Pressable onPress={handlePickProfileImage} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Foto auswählen</Text>
            </Pressable>
            <Text style={styles.sectionHint}>
              {profileImage.fileName
                ? `Ausgewählt: ${profileImage.fileName}`
                : 'Wähle ein Bild von deinem iPhone oder Gerät aus.'}
            </Text>
            <LabeledInput
              label="Bild-Notiz"
              placeholder="Optionaler Hinweis oder Dateiname"
              value={profileImage.fileName}
              onChangeText={(value) => setProfileImage((current) => ({ ...current, fileName: value }))}
            />
          </View>

          <View style={styles.card}>
            <LabeledInput
              label="Wünsche & Notizen"
              placeholder="Gibt es Besonderheiten oder Wünsche, die wir berücksichtigen sollten?"
              value={formState.notes}
              onChangeText={(value) => updateField('notes', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {status ? (
            <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
              <Text style={status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError}>
                {status.message}
              </Text>
            </View>
          ) : null}

          <Pressable onPress={handleSubmit} disabled={submitting} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Wird gesendet …' : 'Account erstellen'}</Text>
          </Pressable>

          <View style={{ height: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

function LabeledInput({
  label,
  required,
  multiline,
  numberOfLines,
  ...props
}: {
  label: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'email-address' | 'phone-pad' | 'number-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: '#ef4444' }}> *</Text> : null}
      </Text>
      <TextInput
        {...props}
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

const BRAND = 'rgb(49,66,154)';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf2ff',
  },
  content: {
    flexGrow: 1,
    padding: 18,
    gap: 16,
    paddingBottom: 160,
  },
  header: {
    gap: 6,
  },
  kicker: {
    color: BRAND,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    gap: 4,
  },
  infoTitle: {
    color: BRAND,
    fontWeight: '800',
  },
  infoText: {
    color: '#475569',
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND,
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
    flexShrink: 1,
  },
  gridTwoCols: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: '48%',
    gap: 6,
  },
  label: {
    color: '#475569',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  childCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  genderRow: {
    gap: 6,
  },
  genderLabel: {
    color: '#475569',
    fontWeight: '700',
  },
  genderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: 'rgba(51,83,197,0.12)',
    borderColor: '#3353c5',
  },
  chipLabel: {
    color: '#475569',
    fontWeight: '700',
  },
  chipLabelActive: {
    color: '#1d4ed8',
  },
  childFooter: {
    alignItems: 'flex-end',
  },
  removeLink: {
    color: '#e11d48',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  secondaryButtonText: {
    color: '#3353c5',
    fontWeight: '700',
  },
  uploadButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(51,83,197,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  uploadButtonText: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  counter: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  statusBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  statusSuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf3',
  },
  statusError: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  statusTextSuccess: {
    color: '#166534',
    fontWeight: '700',
  },
  statusTextError: {
    color: '#be123c',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
