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
import { pickMultipleFiles, pickSingleFile, type PickedFile } from '../../../utils/file-picker';
import { BottomNavbar } from '../../../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';
const WEEKDAY_SUGGESTIONS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

type ScheduleEntry = { startTime: string; endTime: string; activity: string };

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  daycareName: string;
  availableSpots: string;
  hasAvailability: boolean;
  childrenCount: string;
  birthDate: string;
  caregiverSince: string;
  maxChildAge: string;
  bio: string;
  shortDescription: string;
  mealPlan: string;
  careTimes: ScheduleEntry[];
  dailySchedule: ScheduleEntry[];
  closedDays: string[];
  username: string;
  password: string;
};

type StatusMessage = { type: 'success' | 'error'; message: string } | null;

function createScheduleEntry(defaults?: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    startTime: '',
    endTime: '',
    activity: '',
    ...defaults,
  };
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  daycareName: '',
  availableSpots: '0',
  hasAvailability: true,
  childrenCount: '0',
  birthDate: '',
  caregiverSince: '',
  maxChildAge: '',
  bio: '',
  shortDescription: '',
  mealPlan: '',
  careTimes: [createScheduleEntry({ startTime: '07:30', endTime: '09:00', activity: 'Bringzeit' })],
  dailySchedule: [createScheduleEntry()],
  closedDays: [],
  username: '',
  password: '',
};

function calculateAgeFromDateString(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasHadBirthday =
    now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasHadBirthday) age -= 1;
  return age >= 0 ? age : null;
}

function calculateYearsSince(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const anniversaryReached =
    now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!anniversaryReached) years -= 1;
  return years >= 0 ? years : null;
}

export default function TagespflegepersonProfilScreen() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [profileImage, setProfileImage] = useState<PickedFile | null>(null);
  const [logoImage, setLogoImage] = useState<PickedFile | null>(null);
  const [conceptFile, setConceptFile] = useState<PickedFile | null>(null);
  const [roomGallery, setRoomGallery] = useState<PickedFile[]>([]);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closedDayInput, setClosedDayInput] = useState('');

  const computedAge = useMemo(() => calculateAgeFromDateString(formState.birthDate), [formState.birthDate]);
  const experienceYears = useMemo(() => calculateYearsSince(formState.caregiverSince), [formState.caregiverSince]);

  function updateField(field: keyof FormState, value: string | boolean) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function updateScheduleEntry(listName: 'careTimes' | 'dailySchedule', index: number, field: keyof ScheduleEntry, value: string) {
    setFormState((current) => ({
      ...current,
      [listName]: current[listName].map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  }

  function addScheduleEntry(listName: 'careTimes' | 'dailySchedule', defaults?: Partial<ScheduleEntry>) {
    setFormState((current) => ({ ...current, [listName]: [...current[listName], createScheduleEntry(defaults)] }));
  }

  function removeScheduleEntry(listName: 'careTimes' | 'dailySchedule', index: number) {
    setFormState((current) => {
      if (current[listName].length <= 1) return current;
      return { ...current, [listName]: current[listName].filter((_, entryIndex) => entryIndex !== index) };
    });
  }

  function handleAddClosedDay(value = closedDayInput) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormState((current) => {
      if (current.closedDays.includes(trimmed)) return current;
      return { ...current, closedDays: [...current.closedDays, trimmed] };
    });
    setClosedDayInput('');
  }

  function handleRemoveClosedDay(day: string) {
    setFormState((current) => ({
      ...current,
      closedDays: current.closedDays.filter((entry) => entry !== day),
    }));
  }

  const handlePickProfileImage = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setProfileImage(file);
  };

  const handlePickLogo = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setLogoImage(file);
  };

  const handlePickConcept = async () => {
    const file = await pickSingleFile({ type: ['application/pdf'] });
    if (!file) return;
    setConceptFile(file);
  };

  const handlePickRoomImages = async () => {
    const files = await pickMultipleFiles({ type: ['image/*'] });
    if (!files.length) return;
    setRoomGallery((current) => [...current, ...files]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        ...formState,
        availableSpots: Number(formState.availableSpots) || 0,
        hasAvailability: Boolean(formState.hasAvailability),
        childrenCount: Number(formState.childrenCount) || 0,
        age: computedAge ?? null,
        maxChildAge: formState.maxChildAge ? Number(formState.maxChildAge) : null,
        profileImage: profileImage?.dataUrl ?? null,
        profileImageName: profileImage?.fileName ?? '',
        logoImage: logoImage?.dataUrl ?? null,
        logoImageName: logoImage?.fileName ?? '',
        conceptFile: conceptFile?.dataUrl ?? null,
        conceptFileName: conceptFile?.fileName ?? '',
        careTimes: formState.careTimes,
        dailySchedule: formState.dailySchedule,
        mealPlan: formState.mealPlan,
        roomImages: roomGallery.map((image) => ({ dataUrl: image.dataUrl, fileName: image.fileName })),
        closedDays: formState.closedDays,
        role: 'caregiver' as const,
      };

      await apiRequest('api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const identifier = formState.username || formState.email;

      setStatus({
        type: 'success',
        message: 'Profil erstellt! Wir leiten dich gleich weiter.',
      });

      try {
        await apiRequest('api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password: formState.password }),
        });
        setStatus({
          type: 'success',
          message: 'Profil erstellt! Du wirst jetzt zum Dashboard weitergeleitet.',
        });
        setTimeout(() => router.replace('/(tabs)/dashboard'), 1200);
      } catch (authError) {
        console.warn('Automatischer Login nach Registrierung nicht möglich', authError);
        setStatus({
          type: 'success',
          message: 'Profil gespeichert! Bitte melde dich jetzt mit deinen Zugangsdaten an.',
        });
      }

      setFormState(initialState);
      setProfileImage(null);
      setLogoImage(null);
      setConceptFile(null);
      setRoomGallery([]);
      setClosedDayInput('');
    } catch (error) {
      console.error('Registrierung der Tagespflegeperson fehlgeschlagen', error);
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
            <Text style={styles.kicker}>Profil für Kindertagespflegepersonen</Text>
            <Text style={styles.title}>Erzähl Familien, welche Betreuung du anbietest.</Text>
            <Text style={styles.subtitle}>
              Kopiere deine Angaben aus der Webansicht: verfügbare Plätze, Konzept, Betreuungszeiten und Bilder.
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
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Basisdaten deiner Kindertagespflege</Text>
                <Text style={styles.sectionHint}>Pflichtfelder sind mit * gekennzeichnet.</Text>
              </View>
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
                label="Geburtsdatum"
                required
                value={formState.birthDate}
                onChangeText={(value) => updateField('birthDate', value)}
                placeholder="YYYY-MM-DD"
              />
              <View style={styles.inputGroup}> 
                <Text style={styles.label}>Aktuelles Alter</Text>
                <Text style={styles.sectionHint}>{computedAge !== null ? `${computedAge} Jahre` : 'Wird automatisch berechnet.'}</Text>
              </View>
            </View>

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Name deiner Kindertagespflege"
                required
                value={formState.daycareName}
                onChangeText={(value) => updateField('daycareName', value)}
              />
              <LabeledInput
                label="Seit wann aktiv"
                value={formState.caregiverSince}
                placeholder="YYYY-MM"
                onChangeText={(value) => updateField('caregiverSince', value)}
                helperText={experienceYears !== null ? `${experienceYears} Jahre Erfahrung` : 'Optional: sichtbar im Profil.'}
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

            <View style={styles.gridTwoCols}>
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
                label="Adresse"
                required
                value={formState.address}
                onChangeText={(value) => updateField('address', value)}
              />
              <LabeledInput
                label="Postleitzahl"
                required
                value={formState.postalCode}
                onChangeText={(value) => updateField('postalCode', value)}
              />
            </View>

            <LabeledInput
              label="Ort"
              required
              value={formState.city}
              onChangeText={(value) => updateField('city', value)}
            />

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Aktuell betreute Kinder"
                required
                keyboardType="number-pad"
                value={formState.childrenCount}
                onChangeText={(value) => updateField('childrenCount', value)}
              />
              <LabeledInput
                label="Freie Plätze"
                required
                keyboardType="number-pad"
                value={formState.availableSpots}
                onChangeText={(value) => updateField('availableSpots', value)}
              />
            </View>

            <View style={styles.gridTwoCols}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verfügbarkeit</Text>
                <View style={styles.chipRow}>
                  {[{ label: 'Es gibt freie Plätze', value: true }, { label: 'Aktuell keine freien Plätze', value: false }].map((option) => (
                    <Pressable
                      key={String(option.value)}
                      onPress={() => updateField('hasAvailability', option.value)}
                      style={[styles.chip, formState.hasAvailability === option.value && styles.chipActive]}
                    >
                      <Text style={[styles.chipLabel, formState.hasAvailability === option.value && styles.chipLabelActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <LabeledInput
                label="Max. Alter der Kinder"
                keyboardType="number-pad"
                placeholder="z. B. 6"
                value={formState.maxChildAge}
                onChangeText={(value) => updateField('maxChildAge', value)}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Profilbild, Logo & Unterlagen</Text>
                <Text style={styles.sectionHint}>
                  Wähle Dateien von deinem Gerät, damit sie im Backend gespeichert werden.
                </Text>
              </View>
            </View>

            <UploadRow
              title="Profilbild"
              hint={profileImage?.fileName ? `Ausgewählt: ${profileImage.fileName}` : 'Optional'}
              onPress={handlePickProfileImage}
              buttonLabel="Profilbild hochladen"
            />
            <UploadRow
              title="Logo"
              hint={logoImage?.fileName ? `Ausgewählt: ${logoImage.fileName}` : 'Optional'}
              onPress={handlePickLogo}
              buttonLabel="Logo hochladen"
            />
            <UploadRow
              title="Konzeption (PDF)"
              hint={conceptFile?.fileName ? `Ausgewählt: ${conceptFile.fileName}` : 'Optional, hilft Familien bei der Entscheidung.'}
              onPress={handlePickConcept}
              buttonLabel="PDF hochladen"
            />
            <UploadRow
              title="Räumlichkeiten"
              hint={roomGallery.length ? `${roomGallery.length} Bild(er) ausgewählt` : 'Füge bis zu mehreren Bildern hinzu.'}
              onPress={handlePickRoomImages}
              buttonLabel="Raumbilder hochladen"
            />
          </View>

          <View style={styles.card}>
            <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Betreuungsfreie Tage</Text>
                <Text style={styles.sectionHint}>Lege fest, an welchen Tagen regulär keine Betreuung stattfindet.</Text>
              </View>
            </View>

            <View style={styles.gridTwoCols}>
              <LabeledInput
                label="Neuer Tag"
                placeholder="z. B. Samstag"
                value={closedDayInput}
                onChangeText={setClosedDayInput}
              />
              <Pressable onPress={() => handleAddClosedDay()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Tag hinzufügen</Text>
              </Pressable>
            </View>
            <View style={styles.chipRow}>
              {WEEKDAY_SUGGESTIONS.map((day) => (
                <Pressable key={day} onPress={() => handleAddClosedDay(day)} style={styles.chip}>
                  <Text style={styles.chipLabel}>{day}</Text>
                </Pressable>
              ))}
            </View>
            {formState.closedDays.length ? (
              <View style={styles.chipRowWrap}>
                {formState.closedDays.map((day) => (
                  <Pressable key={day} style={styles.chip} onPress={() => handleRemoveClosedDay(day)}>
                    <Text style={styles.chipLabel}>{day} (Entfernen)</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.sectionHint}>Noch keine betreuungsfreien Tage hinterlegt.</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Betreuungszeiten</Text>
                <Text style={styles.sectionHint}>Trage an welchen Tagen Familien ihre Kinder bringen können.</Text>
              </View>
              <Pressable onPress={() => addScheduleEntry('careTimes')} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Weiteren Zeitplan hinzufügen</Text>
              </Pressable>
            </View>
            <View style={{ gap: 12 }}>
              {formState.careTimes.map((entry, index) => (
                <ScheduleRow
                  key={`care-${index}`}
                  entry={entry}
                  onChange={(field, value) => updateScheduleEntry('careTimes', index, field, value)}
                  onRemove={() => removeScheduleEntry('careTimes', index)}
                  canRemove={formState.careTimes.length > 1}
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Tagesablauf</Text>
                <Text style={styles.sectionHint}>Beschreibe, wie der Tag strukturiert ist.</Text>
              </View>
              <Pressable onPress={() => addScheduleEntry('dailySchedule')} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Weiteren Abschnitt hinzufügen</Text>
              </Pressable>
            </View>
            <View style={{ gap: 12 }}>
              {formState.dailySchedule.map((entry, index) => (
                <ScheduleRow
                  key={`daily-${index}`}
                  entry={entry}
                  onChange={(field, value) => updateScheduleEntry('dailySchedule', index, field, value)}
                  onRemove={() => removeScheduleEntry('dailySchedule', index)}
                  canRemove={formState.dailySchedule.length > 1}
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Kurzbeschreibung</Text>
                <Text style={styles.sectionHint}>Fasse dein Angebot kompakt zusammen.</Text>
              </View>
            </View>
            <LabeledInput
              label="Kurzbeschreibung"
              placeholder="Was macht deine Tagespflege besonders?"
              value={formState.shortDescription}
              onChangeText={(value) => updateField('shortDescription', value)}
            />
            <LabeledInput
              label="Über dich"
              placeholder="Erzähle etwas über deine Erfahrung, Schwerpunkte und Tagesabläufe."
              multiline
              numberOfLines={4}
              value={formState.bio}
              onChangeText={(value) => updateField('bio', value)}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Koch- & Essensplan</Text>
                <Text style={styles.sectionHint}>Beschreibe, welche Mahlzeiten du anbietest.</Text>
              </View>
            </View>
            <LabeledInput
              label="Essensplan"
              placeholder="Beschreibe, welche Mahlzeiten du anbietest."
              multiline
              numberOfLines={3}
              value={formState.mealPlan}
              onChangeText={(value) => updateField('mealPlan', value)}
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
            <Text style={styles.primaryButtonText}>{submitting ? 'Wird gespeichert …' : 'Account erstellen'}</Text>
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
  helperText,
  multiline,
  numberOfLines,
  ...props
}: {
  label: string;
  required?: boolean;
  helperText?: string;
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
      {helperText ? <Text style={styles.sectionHint}>{helperText}</Text> : null}
    </View>
  );
}

function UploadRow({ title, hint, onPress, buttonLabel }: { title: string; hint: string; onPress: () => void; buttonLabel: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{title}</Text>
      <Pressable onPress={onPress} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function ScheduleRow({
  entry,
  onChange,
  canRemove,
  onRemove,
}: {
  entry: ScheduleEntry;
  onChange: (field: keyof ScheduleEntry, value: string) => void;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={styles.scheduleRow}>
      <LabeledInput
        label="Von"
        value={entry.startTime}
        onChangeText={(value) => onChange('startTime', value)}
        placeholder="08:00"
      />
      <LabeledInput
        label="Bis"
        value={entry.endTime}
        onChangeText={(value) => onChange('endTime', value)}
        placeholder="12:00"
      />
      <LabeledInput
        label="Aktivität"
        value={entry.activity}
        onChangeText={(value) => onChange('activity', value)}
        placeholder="z. B. Bringzeit"
      />
      {canRemove ? (
        <Pressable onPress={onRemove} style={styles.removeLinkWrapper}>
          <Text style={styles.removeLink}>Eintrag entfernen</Text>
        </Pressable>
      ) : null}
    </View>
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
    gap: 16,
    paddingBottom: 180,
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
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionHeaderRow: {
    alignItems: 'center',
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
    lineHeight: 16,
  },
  sectionHeaderContent: {
    flex: 1,
    gap: 4,
    minWidth: '60%',
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRowWrap: {
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
    backgroundColor: '#f8fafc',
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
  scheduleRow: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  removeLinkWrapper: {
    alignItems: 'flex-end',
  },
  removeLink: {
    color: '#e11d48',
    fontWeight: '700',
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
