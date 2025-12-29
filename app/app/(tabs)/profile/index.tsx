import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

import { BottomNavbar } from '../../../components/BottomNavbar';
import { useAuthStatus } from '../../../hooks/use-auth-status';
import { fetchProfile, updateProfile } from '../../../services/profile';
import { pickMultipleFiles, pickSingleFile, PickedFile } from '../../../utils/file-picker';
import { assetUrl } from '../../../utils/url';

const BRAND = '#31429a';

function createChild(initial: Partial<Child> = {}): Child {
  return {
    name: initial.name ?? '',
    age: initial.age ?? '',
    gender: (initial.gender as Child['gender']) ?? '',
    notes: initial.notes ?? '',
  };
}

function createScheduleEntry(initial: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    startTime: initial.startTime ?? '',
    endTime: initial.endTime ?? '',
    activity: initial.activity ?? '',
  };
}

function generateTempId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type Child = { name: string; age: string; gender: '' | 'female' | 'male' | 'diverse'; notes: string };
type ScheduleEntry = { startTime: string; endTime: string; activity: string };

type RoomGalleryItem = {
  id: string;
  source: unknown;
  preview: string;
  fileData: string | null;
  fileName: string;
};

type ParentProfile = {
  id?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  username?: string;
  childrenAges?: string;
  notes?: string;
  profileImageUrl?: string;
  children?: Child[];
};

type CaregiverProfile = {
  id?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  username?: string;
  daycareName?: string;
  availableSpots?: number;
  hasAvailability?: boolean;
  childrenCount?: number;
  maxChildAge?: number | '';
  birthDate?: string | null;
  caregiverSince?: string | null;
  shortDescription?: string;
  bio?: string;
  mealPlan?: string;
  careTimes?: ScheduleEntry[];
  dailySchedule?: ScheduleEntry[];
  closedDays?: string[];
  roomImages?: unknown[];
  profileImageUrl?: string;
  logoImageUrl?: string;
  conceptUrl?: string;
};

type Profile = ParentProfile | CaregiverProfile | null;

function buildRoomGalleryItem(imageRef: unknown): RoomGalleryItem | null {
  if (!imageRef) return null;
  const preview = assetUrl(imageRef as never);
  const idSource =
    typeof imageRef === 'string'
      ? imageRef
      : (imageRef as Record<string, string>).key || (imageRef as Record<string, string>).url;
  return {
    id: idSource || generateTempId(),
    source: imageRef,
    preview,
    fileData: null,
    fileName: '',
  };
}

function useProfileData(user: { id?: string | number | null; role?: string | null }) {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id || !user?.role) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
<<<<<<< Updated upstream
        const data = await fetchProfile<Profile>(user);
        console.log('[Profile] fetched profile response', data);
        if (!cancelled) {
          setProfile(data);
        }
=======
        // IMPORTANT: apiRequest expects paths WITHOUT a leading "/"
        const endpoint = user.role === 'caregiver' ? `api/caregivers/${user.id}` : `api/parents/${user.id}`;
        const data = await apiRequest<Profile>(endpoint, { method: 'GET' });

        if (!cancelled) setProfile(data);
>>>>>>> Stashed changes
      } catch (requestError) {
        console.error('Failed to load profile', requestError);
        if (!cancelled) setError('Profil konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  return { profile, loading, error, setProfile } as const;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.textarea]}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

function FileUploadRow({
  label,
  fileName,
  onPick,
  onRemove,
  preview,
}: {
  label: string;
  fileName?: string;
  onPick: () => void;
  onRemove?: () => void;
  preview?: string;
}) {
  return (
    <View style={styles.uploadRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.hint}>{fileName || 'Keine Datei ausgewählt'}</Text>
        <View style={styles.uploadActions}>
          <Pressable style={styles.buttonGhost} onPress={onPick}>
            <Text style={styles.buttonGhostText}>Datei auswählen</Text>
          </Pressable>
          {onRemove ? (
            <Pressable style={styles.removeButton} onPress={onRemove}>
              <Text style={styles.removeButtonText}>Entfernen</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {preview ? <Image source={{ uri: preview }} style={styles.previewImage} /> : null}
    </View>
  );
}

function ChildrenEditor({ childrenList, onChange }: { childrenList: Child[]; onChange: (value: Child[]) => void }) {
  function updateChild(index: number, field: keyof Child, value: string) {
    const updated = childrenList.map((child, childIndex) =>
      childIndex === index ? { ...child, [field]: value } : child,
    );
    onChange(updated);
  }

  function addChild() {
    onChange([...childrenList, createChild()]);
  }

  function removeChild(index: number) {
    if (childrenList.length === 1) {
      onChange([createChild()]);
      return;
    }
    const updated = childrenList.filter((_, childIndex) => childIndex !== index);
    onChange(updated);
  }

  return (
    <View style={{ gap: 16 }}>
      {childrenList.map((child, index) => (
        <View key={index} style={styles.card}>
          <LabeledInput
            label="Name des Kindes"
            value={child.name}
            onChangeText={(text) => updateChild(index, 'name', text)}
          />
          <LabeledInput label="Alter" value={child.age} onChangeText={(text) => updateChild(index, 'age', text)} />
          <LabeledInput
            label="Geschlecht"
            value={child.gender}
            onChangeText={(text) => updateChild(index, 'gender', text as Child['gender'])}
            placeholder="weiblich/männlich/divers"
          />
          <LabeledInput
            label="Alltag & Besonderheiten"
            value={child.notes}
            onChangeText={(text) => updateChild(index, 'notes', text)}
            multiline
            placeholder="z. B. schläft nach dem Mittag gern"
          />
          <Pressable style={styles.removeButton} onPress={() => removeChild(index)}>
            <Text style={styles.removeButtonText}>Eintrag entfernen</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.buttonGhost} onPress={addChild}>
        <Text style={styles.buttonGhostText}>Weiteres Kind hinzufügen</Text>
      </Pressable>
    </View>
  );
}

function ScheduleEditor({
  entries,
  onChange,
  title,
}: {
  entries: ScheduleEntry[];
  onChange: (entries: ScheduleEntry[]) => void;
  title: string;
}) {
  function updateEntry(index: number, field: keyof ScheduleEntry, value: string) {
    const updated = entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [field]: value } : entry,
    );
    onChange(updated);
  }

  function addEntry() {
    onChange([...entries, createScheduleEntry()]);
  }

  function removeEntry(index: number) {
    if (entries.length === 1) return;
    onChange(entries.filter((_, entryIndex) => entryIndex !== index));
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.hint}>{title}</Text>
      {entries.map((entry, index) => (
        <View key={index} style={styles.card}>
          <LabeledInput label="Von" value={entry.startTime} onChangeText={(text) => updateEntry(index, 'startTime', text)} />
          <LabeledInput label="Bis" value={entry.endTime} onChangeText={(text) => updateEntry(index, 'endTime', text)} />
          <LabeledInput
            label="Aktivität"
            value={entry.activity}
            onChangeText={(text) => updateEntry(index, 'activity', text)}
            placeholder="z. B. Bringzeit"
          />
          {entries.length > 1 ? (
            <Pressable style={styles.removeButton} onPress={() => removeEntry(index)}>
              <Text style={styles.removeButtonText}>Eintrag entfernen</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable style={styles.buttonGhost} onPress={addEntry}>
        <Text style={styles.buttonGhostText}>Weiteren Eintrag hinzufügen</Text>
      </Pressable>
    </View>
  );
}

function ParentProfileEditor({
  profile,
  onSave,
  saving,
}: {
  profile: ParentProfile;
  onSave: (payload: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [formState, setFormState] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    postalCode: profile.postalCode || '',
    username: profile.username || '',
    childrenAges: profile.childrenAges || '',
    notes: profile.notes || '',
    newPassword: '',
  });
  const [children, setChildren] = useState<Child[]>(() =>
    profile.children?.length ? profile.children.map((child) => createChild(child)) : [createChild()],
  );
  const [imageState, setImageState] = useState<PickedFile | null>(null);
  const [preview, setPreview] = useState(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      postalCode: profile.postalCode || '',
      username: profile.username || '',
      childrenAges: profile.childrenAges || '',
      notes: profile.notes || '',
      newPassword: '',
    });
    setChildren(profile.children?.length ? profile.children.map((child) => createChild(child)) : [createChild()]);
    setPreview(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
    setImageState(null);
    setStatusMessage(null);
  }, [profile]);

  function updateField(field: keyof typeof formState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  const handlePickImage = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setImageState(file);
    setPreview(file.dataUrl);
  };

  const handleRemoveImage = () => {
    setImageState({ dataUrl: '', fileName: '', mimeType: null });
    setPreview('');
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone,
      address: formState.address,
      postalCode: formState.postalCode,
      username: formState.username,
      childrenAges: formState.childrenAges,
      notes: formState.notes,
      children,
      numberOfChildren: children.filter((child) => child.name.trim()).length,
    };

    if (formState.newPassword.trim()) {
      payload.password = formState.newPassword.trim();
    }

    if (imageState) {
      payload.profileImage = imageState.dataUrl || null;
      payload.profileImageName = imageState.fileName;
    }

    try {
      await onSave(payload);
      setStatusMessage('Profil erfolgreich aktualisiert.');
      setFormState((current) => ({ ...current, newPassword: '' }));
    } catch (error) {
      console.error('Failed to save parent profile', error);
      Alert.alert('Fehler', 'Aktualisierung fehlgeschlagen.');
    }
  };

  return (
    <View style={{ gap: 18 }}>
      <Section title="Deine Kontaktdaten">
        <View style={styles.gridTwoCols}>
          <LabeledInput label="Vorname" value={formState.firstName} onChangeText={(text) => updateField('firstName', text)} />
          <LabeledInput label="Nachname" value={formState.lastName} onChangeText={(text) => updateField('lastName', text)} />
          <LabeledInput label="E-Mail" value={formState.email} onChangeText={(text) => updateField('email', text)} keyboardType="email-address" />
          <LabeledInput label="Telefonnummer" value={formState.phone} onChangeText={(text) => updateField('phone', text)} />
          <LabeledInput label="Adresse" value={formState.address} onChangeText={(text) => updateField('address', text)} />
          <LabeledInput label="Postleitzahl" value={formState.postalCode} onChangeText={(text) => updateField('postalCode', text)} />
          <LabeledInput label="Benutzername" value={formState.username} onChangeText={(text) => updateField('username', text)} />
          <LabeledInput label="Neues Passwort (optional)" value={formState.newPassword} onChangeText={(text) => updateField('newPassword', text)} secureTextEntry />
        </View>
      </Section>

      <Section title="Profilbild">
        <FileUploadRow
          label="Profilfoto"
          fileName={imageState?.fileName || (preview ? 'Bestehendes Bild' : undefined)}
          onPick={handlePickImage}
          onRemove={preview ? handleRemoveImage : undefined}
          preview={preview || undefined}
        />
      </Section>

      <Section title="Kinder & Alltag">
        <ChildrenEditor childrenList={children} onChange={setChildren} />
      </Section>

      <Section title="Notizen für Tagespflegepersonen">
        <LabeledInput label="Wunschliste & Besonderheiten" value={formState.notes} onChangeText={(text) => updateField('notes', text)} multiline />
      </Section>

      <View style={{ gap: 10 }}>
        <Pressable style={[styles.buttonPrimary, saving && styles.buttonDisabled]} disabled={saving} onPress={handleSubmit}>
          <Text style={styles.buttonPrimaryText}>{saving ? 'Speichern…' : 'Profil speichern'}</Text>
        </Pressable>
        {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}
      </View>
    </View>
  );
}

function CaregiverProfileEditor({
  profile,
  onSave,
  saving,
}: {
  profile: CaregiverProfile;
  onSave: (payload: unknown) => Promise<void>;
  saving: boolean;
}) {
  const [formState, setFormState] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    postalCode: profile.postalCode || '',
    city: profile.city || '',
    username: profile.username || '',
    daycareName: profile.daycareName || '',
    availableSpots: profile.availableSpots?.toString() || '0',
    hasAvailability: profile.hasAvailability ?? true,
    childrenCount: profile.childrenCount?.toString() || '0',
    maxChildAge: profile.maxChildAge?.toString() || '',
    birthDate: profile.birthDate?.slice(0, 10) || '',
    caregiverSince: profile.caregiverSince?.slice(0, 7) || '',
    shortDescription: profile.shortDescription || '',
    bio: profile.bio || '',
    mealPlan: profile.mealPlan || '',
    newPassword: '',
  });

  const [careTimes, setCareTimes] = useState<ScheduleEntry[]>(() =>
    profile.careTimes?.length ? profile.careTimes.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()],
  );
  const [dailySchedule, setDailySchedule] = useState<ScheduleEntry[]>(() =>
    profile.dailySchedule?.length ? profile.dailySchedule.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()],
  );
  const [closedDays, setClosedDays] = useState<string[]>(() => (Array.isArray(profile.closedDays) ? [...profile.closedDays] : []));
  const [closedDayInput, setClosedDayInput] = useState('');
  const [roomGallery, setRoomGallery] = useState<RoomGalleryItem[]>(() =>
    (profile.roomImages ?? []).map((ref) => buildRoomGalleryItem(ref)).filter(Boolean) as RoomGalleryItem[],
  );

  const [imageState, setImageState] = useState<PickedFile | null>(null);
  const [logoState, setLogoState] = useState<PickedFile | null>(null);
  const [conceptState, setConceptState] = useState<PickedFile | null>(null);

  const [imagePreview, setImagePreview] = useState(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
  const [logoPreview, setLogoPreview] = useState(profile.logoImageUrl ? assetUrl(profile.logoImageUrl) : '');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      postalCode: profile.postalCode || '',
      city: profile.city || '',
      username: profile.username || '',
      daycareName: profile.daycareName || '',
      availableSpots: profile.availableSpots?.toString() || '0',
      hasAvailability: profile.hasAvailability ?? true,
      childrenCount: profile.childrenCount?.toString() || '0',
      maxChildAge: profile.maxChildAge?.toString() || '',
      birthDate: profile.birthDate?.slice(0, 10) || '',
      caregiverSince: profile.caregiverSince?.slice(0, 7) || '',
      shortDescription: profile.shortDescription || '',
      bio: profile.bio || '',
      mealPlan: profile.mealPlan || '',
      newPassword: '',
    });
    setCareTimes(profile.careTimes?.length ? profile.careTimes.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]);
    setDailySchedule(profile.dailySchedule?.length ? profile.dailySchedule.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]);
    setClosedDays(Array.isArray(profile.closedDays) ? [...profile.closedDays] : []);
    setClosedDayInput('');
    setRoomGallery((profile.roomImages ?? []).map((ref) => buildRoomGalleryItem(ref)).filter(Boolean) as RoomGalleryItem[]);
    setImagePreview(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
    setLogoPreview(profile.logoImageUrl ? assetUrl(profile.logoImageUrl) : '');
    setImageState(null);
    setLogoState(null);
    setConceptState(null);
    setStatusMessage(null);
  }, [profile]);

  function updateField(field: keyof typeof formState, value: string | boolean) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  const handlePickProfileImage = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setImageState(file);
    setImagePreview(file.dataUrl);
  };

  const handlePickLogo = async () => {
    const file = await pickSingleFile({ type: ['image/*'] });
    if (!file) return;
    setLogoState(file);
    setLogoPreview(file.dataUrl);
  };

  const handlePickConcept = async () => {
    const file = await pickSingleFile({ type: ['application/pdf'] });
    if (!file) return;
    setConceptState(file);
  };

  const handlePickRoomImages = async () => {
    const files = await pickMultipleFiles({ type: ['image/*'] });
    if (!files.length) return;
    const additions: RoomGalleryItem[] = files.map((file) => ({
      id: generateTempId(),
      source: null,
      preview: file.dataUrl,
      fileData: file.dataUrl,
      fileName: file.fileName,
    }));
    setRoomGallery((current) => [...current, ...additions]);
  };

  const handleRemoveRoomImage = (imageId: string) => {
    setRoomGallery((current) => current.filter((image) => image.id !== imageId));
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone,
      address: formState.address,
      postalCode: formState.postalCode,
      city: formState.city,
      username: formState.username,
      daycareName: formState.daycareName,
      availableSpots: Number(formState.availableSpots),
      hasAvailability: Boolean(formState.hasAvailability),
      childrenCount: Number(formState.childrenCount),
      maxChildAge: formState.maxChildAge ? Number(formState.maxChildAge) : null,
      birthDate: formState.birthDate || null,
      caregiverSince: formState.caregiverSince || null,
      shortDescription: formState.shortDescription,
      bio: formState.bio,
      mealPlan: formState.mealPlan,
      careTimes,
      dailySchedule,
      closedDays,
      roomImages: roomGallery
        .map((image) => (image.fileData ? { dataUrl: image.fileData, fileName: image.fileName } : image.source))
        .filter(Boolean),
    };

    if (formState.newPassword.trim()) payload.password = formState.newPassword.trim();

    if (imageState) {
      payload.profileImage = imageState.dataUrl || null;
      payload.profileImageName = imageState.fileName;
    }

    if (logoState) {
      payload.logoImage = logoState.dataUrl || null;
      payload.logoImageName = logoState.fileName;
    }

    if (conceptState) {
      payload.conceptFile = conceptState.dataUrl || null;
      payload.conceptFileName = conceptState.fileName;
    }

    try {
      await onSave(payload);
      setStatusMessage('Profil erfolgreich aktualisiert.');
      setFormState((current) => ({ ...current, newPassword: '' }));
      setConceptState(null);
    } catch (error) {
      console.error('Failed to save caregiver profile', error);
      Alert.alert('Fehler', 'Aktualisierung fehlgeschlagen.');
    }
  };

  return (
    <View style={{ gap: 18 }}>
      <Section title="Basisdaten deiner Kindertagespflege">
        <View style={styles.gridTwoCols}>
          <LabeledInput label="Vorname" value={formState.firstName} onChangeText={(text) => updateField('firstName', text)} />
          <LabeledInput label="Nachname" value={formState.lastName} onChangeText={(text) => updateField('lastName', text)} />
          <LabeledInput label="Geburtsdatum" value={formState.birthDate} onChangeText={(text) => updateField('birthDate', text)} placeholder="YYYY-MM-DD" />
          <LabeledInput label="Name der Kindertagespflege" value={formState.daycareName} onChangeText={(text) => updateField('daycareName', text)} />
          <LabeledInput label="Seit wann aktiv" value={formState.caregiverSince} onChangeText={(text) => updateField('caregiverSince', text)} placeholder="YYYY-MM" />
          <LabeledInput label="Maximales Alter der Kinder" value={formState.maxChildAge} onChangeText={(text) => updateField('maxChildAge', text)} keyboardType="numeric" />
          <LabeledInput label="Aktuell betreute Kinder" value={formState.childrenCount} onChangeText={(text) => updateField('childrenCount', text)} keyboardType="numeric" />
          <LabeledInput label="Freie Plätze" value={formState.availableSpots} onChangeText={(text) => updateField('availableSpots', text)} keyboardType="numeric" />
          <LabeledInput label="Plätze verfügbar? (ja/nein)" value={formState.hasAvailability ? 'ja' : 'nein'} onChangeText={(text) => updateField('hasAvailability', text.trim().toLowerCase() !== 'nein')} />
        </View>
      </Section>

      <Section title="Kontakt und Zugang">
        <View style={styles.gridTwoCols}>
          <LabeledInput label="E-Mail" value={formState.email} onChangeText={(text) => updateField('email', text)} keyboardType="email-address" />
          <LabeledInput label="Telefonnummer" value={formState.phone} onChangeText={(text) => updateField('phone', text)} />
          <LabeledInput label="Adresse" value={formState.address} onChangeText={(text) => updateField('address', text)} />
          <LabeledInput label="Postleitzahl" value={formState.postalCode} onChangeText={(text) => updateField('postalCode', text)} />
          <LabeledInput label="Ort" value={formState.city} onChangeText={(text) => updateField('city', text)} />
          <LabeledInput label="Benutzername" value={formState.username} onChangeText={(text) => updateField('username', text)} />
          <LabeledInput label="Neues Passwort (optional)" value={formState.newPassword} onChangeText={(text) => updateField('newPassword', text)} secureTextEntry />
        </View>
      </Section>

      <Section title="Betreuungszeiten">
        <ScheduleEditor entries={careTimes} onChange={setCareTimes} title="Bring- und Abholzeiten" />
      </Section>

      <Section title="Betreuungsfreie Tage">
        <Text style={styles.hint}>Hinterlege Wochentage oder Hinweise, an denen keine Betreuung stattfindet.</Text>
        <View style={styles.row}>
          <TextInput value={closedDayInput} onChangeText={setClosedDayInput} placeholder="z. B. Samstag" style={[styles.input, { flex: 1 }]} placeholderTextColor="#94a3b8" />
          <Pressable
            style={[styles.buttonGhost, { marginLeft: 8 }]}
            onPress={() => {
              const trimmed = closedDayInput.trim();
              if (!trimmed) return;
              if (closedDays.includes(trimmed)) return;
              setClosedDays((current) => [...current, trimmed]);
              setClosedDayInput('');
            }}
          >
            <Text style={styles.buttonGhostText}>Tag hinzufügen</Text>
          </Pressable>
        </View>
        {closedDays.length ? (
          <View style={styles.badgeList}>
            {closedDays.map((day) => (
              <View key={day} style={styles.badge}>
                <Text style={styles.badgeText}>{day}</Text>
                <Pressable onPress={() => setClosedDays((current) => current.filter((entry) => entry !== day))}>
                  <Text style={styles.removeButtonText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.hint}>Noch keine betreuungsfreien Tage hinterlegt.</Text>
        )}
      </Section>

      <Section title="Tagesablauf">
        <ScheduleEditor entries={dailySchedule} onChange={setDailySchedule} title="Beschreibe den Ablauf" />
      </Section>

      <Section title="Essensplan">
        <LabeledInput label="Mahlzeiten" value={formState.mealPlan} onChangeText={(text) => updateField('mealPlan', text)} multiline placeholder="Beschreibe Frühstück, Mittagessen und Snacks" />
      </Section>

      <Section title="Profil, Logo & Team">
        <FileUploadRow
          label="Profilbild"
          fileName={imageState?.fileName || (imagePreview ? 'Bestehendes Bild' : undefined)}
          onPick={handlePickProfileImage}
          onRemove={
            imagePreview
              ? () => {
                  setImagePreview('');
                  setImageState({ dataUrl: '', fileName: '', mimeType: null });
                }
              : undefined
          }
          preview={imagePreview || undefined}
        />
        <FileUploadRow
          label="Logo"
          fileName={logoState?.fileName || (logoPreview ? 'Bestehendes Logo' : undefined)}
          onPick={handlePickLogo}
          onRemove={
            logoPreview
              ? () => {
                  setLogoPreview('');
                  setLogoState({ dataUrl: '', fileName: '', mimeType: null });
                }
              : undefined
          }
          preview={logoPreview || undefined}
        />
        <FileUploadRow
          label="Konzeption (PDF)"
          fileName={conceptState?.fileName || (profile.conceptUrl ? 'Vorhandenes Dokument' : undefined)}
          onPick={handlePickConcept}
          onRemove={profile.conceptUrl ? () => setConceptState({ dataUrl: '', fileName: '', mimeType: null }) : undefined}
        />
      </Section>

      <Section title="Räumlichkeiten">
        <Text style={styles.hint}>Zeige Familien deine Räume. Bis zu drei Bilder gleichzeitig sichtbar.</Text>
        <Pressable style={styles.buttonGhost} onPress={handlePickRoomImages}>
          <Text style={styles.buttonGhostText}>Raumbilder hochladen</Text>
        </Pressable>
        {roomGallery.length ? (
          <View style={styles.galleryGrid}>
            {roomGallery.map((image) => (
              <View key={image.id} style={styles.galleryItem}>
                <Image source={{ uri: image.preview }} style={styles.galleryImage} />
                <Pressable style={styles.removeBadge} onPress={() => handleRemoveRoomImage(image.id)}>
                  <Text style={styles.removeButtonText}>Entfernen</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.hint}>Noch keine Bilder ausgewählt.</Text>
        )}
      </Section>

      <Section title="Über dich">
        <LabeledInput label="Kurzbeschreibung" value={formState.shortDescription} onChangeText={(text) => updateField('shortDescription', text)} />
        <LabeledInput label="Ausführliche Vorstellung" value={formState.bio} onChangeText={(text) => updateField('bio', text)} multiline />
      </Section>

      <View style={{ gap: 10 }}>
        <Pressable style={[styles.buttonPrimary, saving && styles.buttonDisabled]} disabled={saving} onPress={handleSubmit}>
          <Text style={styles.buttonPrimaryText}>{saving ? 'Speichern…' : 'Profil speichern'}</Text>
        </Pressable>
        {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, loading: authLoading, refresh } = useAuthStatus();
  const { profile, loading, error, setProfile } = useProfileData(user ?? {});
  const [saving, setSaving] = useState(false);

  const title = useMemo(() => {
    if (user?.role === 'caregiver') return 'Profil für Kindertagespflegepersonen bearbeiten';
    return 'Profil für Eltern bearbeiten';
  }, [user?.role]);

  const handleSave = async (payload: unknown) => {
    if (!user?.id) return;
    setSaving(true);
    try {
<<<<<<< Updated upstream
      const updated = await updateProfile<Profile>(user, payload);
=======
      // IMPORTANT: apiRequest expects paths WITHOUT a leading "/"
      const endpoint = user.role === 'caregiver' ? `api/caregivers/${user.id}` : `api/parents/${user.id}`;
      const updated = await apiRequest<Profile>(endpoint, { method: 'PATCH', body: JSON.stringify(payload) });
>>>>>>> Stashed changes
      setProfile(updated);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.hint}>Profil wird geladen…</Text>
        </View>
        <BottomNavbar />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.title}>Bitte melde dich an.</Text>
        </View>
        <BottomNavbar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Profil & Einstellungen</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.hint}>
              Aktualisiere dein Profil, um Familien und Tagespflegepersonen stets mit den neuesten Informationen zu versorgen.
            </Text>
          </View>

          {loading ? <Text style={styles.hint}>Profil wird geladen…</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!loading && profile ? (
            user.role === 'caregiver' ? (
              <CaregiverProfileEditor profile={profile as CaregiverProfile} onSave={handleSave} saving={saving} />
            ) : (
              <ParentProfileEditor profile={profile as ParentProfile} onSave={handleSave} saving={saving} />
            )
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 160,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  kicker: {
    color: BRAND,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#9bb9ff',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontWeight: '700',
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d5ddf4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fbff',
    color: '#0f172a',
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  gridTwoCols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#f6f9ff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e4ebff',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  buttonPrimary: {
    backgroundColor: BRAND,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  buttonGhost: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonGhostText: {
    color: BRAND,
    fontWeight: '800',
  },
  removeButton: {
    paddingVertical: 8,
  },
  removeButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 20,
  },
  badgeText: {
    color: BRAND,
    fontWeight: '700',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hint: {
    color: '#475569',
  },
  successText: {
    color: '#0f9d58',
    fontWeight: '700',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});










// import { useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { BottomNavbar } from '../../../components/BottomNavbar';
// import { useAuthStatus } from '../../../hooks/use-auth-status';
// import { apiRequest } from '../../../services/api-client';
// import { pickMultipleFiles, pickSingleFile, PickedFile } from '../../../utils/file-picker';
// import { assetUrl } from '../../../utils/url';

// const BRAND = '#31429a';

// function createChild(initial: Partial<Child> = {}): Child {
//   return {
//     name: initial.name ?? '',
//     age: initial.age ?? '',
//     gender: (initial.gender as Child['gender']) ?? '',
//     notes: initial.notes ?? '',
//   };
// }

// function createScheduleEntry(initial: Partial<ScheduleEntry> = {}): ScheduleEntry {
//   return {
//     startTime: initial.startTime ?? '',
//     endTime: initial.endTime ?? '',
//     activity: initial.activity ?? '',
//   };
// }

// function generateTempId() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// type Child = { name: string; age: string; gender: '' | 'female' | 'male' | 'diverse'; notes: string };
// type ScheduleEntry = { startTime: string; endTime: string; activity: string };

// type RoomGalleryItem = {
//   id: string;
//   source: unknown;
//   preview: string;
//   fileData: string | null;
//   fileName: string;
// };

// type ParentProfile = {
//   id?: string;
//   role?: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   postalCode?: string;
//   username?: string;
//   childrenAges?: string;
//   notes?: string;
//   profileImageUrl?: string;
//   children?: Child[];
// };

// type CaregiverProfile = {
//   id?: string;
//   role?: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   postalCode?: string;
//   city?: string;
//   username?: string;
//   daycareName?: string;
//   availableSpots?: number;
//   hasAvailability?: boolean;
//   childrenCount?: number;
//   maxChildAge?: number | '';
//   birthDate?: string | null;
//   caregiverSince?: string | null;
//   shortDescription?: string;
//   bio?: string;
//   mealPlan?: string;
//   careTimes?: ScheduleEntry[];
//   dailySchedule?: ScheduleEntry[];
//   closedDays?: string[];
//   roomImages?: unknown[];
//   profileImageUrl?: string;
//   logoImageUrl?: string;
//   conceptUrl?: string;
// };

// type Profile = ParentProfile | CaregiverProfile | null;

// function buildRoomGalleryItem(imageRef: unknown): RoomGalleryItem | null {
//   if (!imageRef) return null;
//   const preview = assetUrl(imageRef as never);
//   const idSource = typeof imageRef === 'string' ? imageRef : (imageRef as Record<string, string>).key || (imageRef as Record<string, string>).url;
//   return {
//     id: idSource || generateTempId(),
//     source: imageRef,
//     preview,
//     fileData: null,
//     fileName: '',
//   };
// }

// function useProfileData(user: { id?: string | number | null; role?: string | null }) {
//   const [profile, setProfile] = useState<Profile>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadProfile() {
//       if (!user?.id || !user?.role) {
//         setProfile(null);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);
//       try {
//         const endpoint = user.role === 'caregiver' ? `/api/caregivers/${user.id}` : `/api/parents/${user.id}`;
//         const data = await apiRequest<Profile>(endpoint, { method: 'GET' });
//         if (!cancelled) {
//           setProfile(data);
//         }
//       } catch (requestError) {
//         console.error('Failed to load profile', requestError);
//         if (!cancelled) setError('Profil konnte nicht geladen werden.');
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadProfile();

//     return () => {
//       cancelled = true;
//     };
//   }, [user?.id, user?.role]);

//   return { profile, loading, error, setProfile } as const;
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {children}
//     </View>
//   );
// }

// function LabeledInput({
//   label,
//   value,
//   onChangeText,
//   placeholder,
//   secureTextEntry,
//   multiline,
//   keyboardType,
// }: {
//   label: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   placeholder?: string;
//   secureTextEntry?: boolean;
//   multiline?: boolean;
//   keyboardType?: 'default' | 'email-address' | 'numeric';
// }) {
//   return (
//     <View style={styles.inputGroup}>
//       <Text style={styles.inputLabel}>{label}</Text>
//       <TextInput
//         value={value}
//         onChangeText={onChangeText}
//         placeholder={placeholder}
//         secureTextEntry={secureTextEntry}
//         multiline={multiline}
//         keyboardType={keyboardType}
//         style={[styles.input, multiline && styles.textarea]}
//         placeholderTextColor="#94a3b8"
//       />
//     </View>
//   );
// }

// function FileUploadRow({
//   label,
//   fileName,
//   onPick,
//   onRemove,
//   preview,
// }: {
//   label: string;
//   fileName?: string;
//   onPick: () => void;
//   onRemove?: () => void;
//   preview?: string;
// }) {
//   return (
//     <View style={styles.uploadRow}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.inputLabel}>{label}</Text>
//         <Text style={styles.hint}>{fileName || 'Keine Datei ausgewählt'}</Text>
//         <View style={styles.uploadActions}>
//           <Pressable style={styles.buttonGhost} onPress={onPick}>
//             <Text style={styles.buttonGhostText}>Datei auswählen</Text>
//           </Pressable>
//           {onRemove ? (
//             <Pressable style={styles.removeButton} onPress={onRemove}>
//               <Text style={styles.removeButtonText}>Entfernen</Text>
//             </Pressable>
//           ) : null}
//         </View>
//       </View>
//       {preview ? <Image source={{ uri: preview }} style={styles.previewImage} /> : null}
//     </View>
//   );
// }

// function ChildrenEditor({ childrenList, onChange }: { childrenList: Child[]; onChange: (value: Child[]) => void }) {
//   function updateChild(index: number, field: keyof Child, value: string) {
//     const updated = childrenList.map((child, childIndex) => (childIndex === index ? { ...child, [field]: value } : child));
//     onChange(updated);
//   }

//   function addChild() {
//     onChange([...childrenList, createChild()]);
//   }

//   function removeChild(index: number) {
//     if (childrenList.length === 1) {
//       onChange([createChild()]);
//       return;
//     }
//     const updated = childrenList.filter((_, childIndex) => childIndex !== index);
//     onChange(updated);
//   }

//   return (
//     <View style={{ gap: 16 }}>
//       {childrenList.map((child, index) => (
//         <View key={index} style={styles.card}> 
//           <LabeledInput label="Name des Kindes" value={child.name} onChangeText={(text) => updateChild(index, 'name', text)} />
//           <LabeledInput label="Alter" value={child.age} onChangeText={(text) => updateChild(index, 'age', text)} />
//           <LabeledInput
//             label="Geschlecht"
//             value={child.gender}
//             onChangeText={(text) => updateChild(index, 'gender', text as Child['gender'])}
//             placeholder="weiblich/männlich/divers"
//           />
//           <LabeledInput
//             label="Alltag & Besonderheiten"
//             value={child.notes}
//             onChangeText={(text) => updateChild(index, 'notes', text)}
//             multiline
//             placeholder="z. B. schläft nach dem Mittag gern"
//           />
//           <Pressable style={styles.removeButton} onPress={() => removeChild(index)}>
//             <Text style={styles.removeButtonText}>Eintrag entfernen</Text>
//           </Pressable>
//         </View>
//       ))}
//       <Pressable style={styles.buttonGhost} onPress={addChild}>
//         <Text style={styles.buttonGhostText}>Weiteres Kind hinzufügen</Text>
//       </Pressable>
//     </View>
//   );
// }

// function ScheduleEditor({
//   entries,
//   onChange,
//   title,
// }: {
//   entries: ScheduleEntry[];
//   onChange: (entries: ScheduleEntry[]) => void;
//   title: string;
// }) {
//   function updateEntry(index: number, field: keyof ScheduleEntry, value: string) {
//     const updated = entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [field]: value } : entry));
//     onChange(updated);
//   }

//   function addEntry() {
//     onChange([...entries, createScheduleEntry()]);
//   }

//   function removeEntry(index: number) {
//     if (entries.length === 1) return;
//     onChange(entries.filter((_, entryIndex) => entryIndex !== index));
//   }

//   return (
//     <View style={{ gap: 12 }}>
//       <Text style={styles.hint}>{title}</Text>
//       {entries.map((entry, index) => (
//         <View key={index} style={styles.card}> 
//           <LabeledInput label="Von" value={entry.startTime} onChangeText={(text) => updateEntry(index, 'startTime', text)} />
//           <LabeledInput label="Bis" value={entry.endTime} onChangeText={(text) => updateEntry(index, 'endTime', text)} />
//           <LabeledInput
//             label="Aktivität"
//             value={entry.activity}
//             onChangeText={(text) => updateEntry(index, 'activity', text)}
//             placeholder="z. B. Bringzeit"
//           />
//           {entries.length > 1 ? (
//             <Pressable style={styles.removeButton} onPress={() => removeEntry(index)}>
//               <Text style={styles.removeButtonText}>Eintrag entfernen</Text>
//             </Pressable>
//           ) : null}
//         </View>
//       ))}
//       <Pressable style={styles.buttonGhost} onPress={addEntry}>
//         <Text style={styles.buttonGhostText}>Weiteren Eintrag hinzufügen</Text>
//       </Pressable>
//     </View>
//   );
// }

// function ParentProfileEditor({ profile, onSave, saving }: { profile: ParentProfile; onSave: (payload: unknown) => Promise<void>; saving: boolean }) {
//   const [formState, setFormState] = useState({
//     firstName: profile.firstName || '',
//     lastName: profile.lastName || '',
//     email: profile.email || '',
//     phone: profile.phone || '',
//     address: profile.address || '',
//     postalCode: profile.postalCode || '',
//     username: profile.username || '',
//     childrenAges: profile.childrenAges || '',
//     notes: profile.notes || '',
//     newPassword: '',
//   });
//   const [children, setChildren] = useState<Child[]>(() => (profile.children?.length ? profile.children.map((child) => createChild(child)) : [createChild()]));
//   const [imageState, setImageState] = useState<PickedFile | null>(null);
//   const [preview, setPreview] = useState(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
//   const [statusMessage, setStatusMessage] = useState<string | null>(null);

//   useEffect(() => {
//     setFormState({
//       firstName: profile.firstName || '',
//       lastName: profile.lastName || '',
//       email: profile.email || '',
//       phone: profile.phone || '',
//       address: profile.address || '',
//       postalCode: profile.postalCode || '',
//       username: profile.username || '',
//       childrenAges: profile.childrenAges || '',
//       notes: profile.notes || '',
//       newPassword: '',
//     });
//     setChildren(profile.children?.length ? profile.children.map((child) => createChild(child)) : [createChild()]);
//     setPreview(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
//     setImageState(null);
//     setStatusMessage(null);
//   }, [profile]);

//   function updateField(field: keyof typeof formState, value: string) {
//     setFormState((current) => ({ ...current, [field]: value }));
//   }

//   const handlePickImage = async () => {
//     const file = await pickSingleFile({ type: ['image/*'] });
//     if (!file) return;
//     setImageState(file);
//     setPreview(file.dataUrl);
//   };

//   const handleRemoveImage = () => {
//     setImageState({ dataUrl: '', fileName: '', mimeType: null });
//     setPreview('');
//   };

//   const handleSubmit = async () => {
//     const payload: Record<string, unknown> = {
//       firstName: formState.firstName,
//       lastName: formState.lastName,
//       email: formState.email,
//       phone: formState.phone,
//       address: formState.address,
//       postalCode: formState.postalCode,
//       username: formState.username,
//       childrenAges: formState.childrenAges,
//       notes: formState.notes,
//       children,
//       numberOfChildren: children.filter((child) => child.name.trim()).length,
//     };

//     if (formState.newPassword.trim()) {
//       payload.password = formState.newPassword.trim();
//     }

//     if (imageState) {
//       payload.profileImage = imageState.dataUrl || null;
//       payload.profileImageName = imageState.fileName;
//     }

//     try {
//       await onSave(payload);
//       setStatusMessage('Profil erfolgreich aktualisiert.');
//       setFormState((current) => ({ ...current, newPassword: '' }));
//     } catch (error) {
//       console.error('Failed to save parent profile', error);
//       Alert.alert('Fehler', 'Aktualisierung fehlgeschlagen.');
//     }
//   };

//   return (
//     <View style={{ gap: 18 }}>
//       <Section title="Deine Kontaktdaten">
//         <View style={styles.gridTwoCols}>
//           <LabeledInput label="Vorname" value={formState.firstName} onChangeText={(text) => updateField('firstName', text)} />
//           <LabeledInput label="Nachname" value={formState.lastName} onChangeText={(text) => updateField('lastName', text)} />
//           <LabeledInput
//             label="E-Mail"
//             value={formState.email}
//             onChangeText={(text) => updateField('email', text)}
//             keyboardType="email-address"
//           />
//           <LabeledInput label="Telefonnummer" value={formState.phone} onChangeText={(text) => updateField('phone', text)} />
//           <LabeledInput label="Adresse" value={formState.address} onChangeText={(text) => updateField('address', text)} />
//           <LabeledInput label="Postleitzahl" value={formState.postalCode} onChangeText={(text) => updateField('postalCode', text)} />
//           <LabeledInput label="Benutzername" value={formState.username} onChangeText={(text) => updateField('username', text)} />
//           <LabeledInput
//             label="Neues Passwort (optional)"
//             value={formState.newPassword}
//             onChangeText={(text) => updateField('newPassword', text)}
//             secureTextEntry
//           />
//         </View>
//       </Section>

//       <Section title="Profilbild">
//         <FileUploadRow
//           label="Profilfoto"
//           fileName={imageState?.fileName || (preview ? 'Bestehendes Bild' : undefined)}
//           onPick={handlePickImage}
//           onRemove={preview ? handleRemoveImage : undefined}
//           preview={preview || undefined}
//         />
//       </Section>

//       <Section title="Kinder & Alltag">
//         <ChildrenEditor childrenList={children} onChange={setChildren} />
//       </Section>

//       <Section title="Notizen für Tagespflegepersonen">
//         <LabeledInput
//           label="Wunschliste & Besonderheiten"
//           value={formState.notes}
//           onChangeText={(text) => updateField('notes', text)}
//           multiline
//         />
//       </Section>

//       <View style={{ gap: 10 }}>
//         <Pressable style={[styles.buttonPrimary, saving && styles.buttonDisabled]} disabled={saving} onPress={handleSubmit}>
//           <Text style={styles.buttonPrimaryText}>{saving ? 'Speichern…' : 'Profil speichern'}</Text>
//         </Pressable>
//         {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}
//       </View>
//     </View>
//   );
// }

// function CaregiverProfileEditor({ profile, onSave, saving }: { profile: CaregiverProfile; onSave: (payload: unknown) => Promise<void>; saving: boolean }) {
//   const [formState, setFormState] = useState({
//     firstName: profile.firstName || '',
//     lastName: profile.lastName || '',
//     email: profile.email || '',
//     phone: profile.phone || '',
//     address: profile.address || '',
//     postalCode: profile.postalCode || '',
//     city: profile.city || '',
//     username: profile.username || '',
//     daycareName: profile.daycareName || '',
//     availableSpots: profile.availableSpots?.toString() || '0',
//     hasAvailability: profile.hasAvailability ?? true,
//     childrenCount: profile.childrenCount?.toString() || '0',
//     maxChildAge: profile.maxChildAge?.toString() || '',
//     birthDate: profile.birthDate?.slice(0, 10) || '',
//     caregiverSince: profile.caregiverSince?.slice(0, 7) || '',
//     shortDescription: profile.shortDescription || '',
//     bio: profile.bio || '',
//     mealPlan: profile.mealPlan || '',
//     newPassword: '',
//   });
//   const [careTimes, setCareTimes] = useState<ScheduleEntry[]>(() => (profile.careTimes?.length ? profile.careTimes.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]));
//   const [dailySchedule, setDailySchedule] = useState<ScheduleEntry[]>(() =>
//     profile.dailySchedule?.length ? profile.dailySchedule.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]
//   );
//   const [closedDays, setClosedDays] = useState<string[]>(() => (Array.isArray(profile.closedDays) ? [...profile.closedDays] : []));
//   const [closedDayInput, setClosedDayInput] = useState('');
//   const [roomGallery, setRoomGallery] = useState<RoomGalleryItem[]>(() =>
//     (profile.roomImages ?? []).map((ref) => buildRoomGalleryItem(ref)).filter(Boolean) as RoomGalleryItem[]
//   );
//   const [imageState, setImageState] = useState<PickedFile | null>(null);
//   const [logoState, setLogoState] = useState<PickedFile | null>(null);
//   const [conceptState, setConceptState] = useState<PickedFile | null>(null);
//   const [imagePreview, setImagePreview] = useState(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
//   const [logoPreview, setLogoPreview] = useState(profile.logoImageUrl ? assetUrl(profile.logoImageUrl) : '');
//   const [statusMessage, setStatusMessage] = useState<string | null>(null);

//   useEffect(() => {
//     setFormState({
//       firstName: profile.firstName || '',
//       lastName: profile.lastName || '',
//       email: profile.email || '',
//       phone: profile.phone || '',
//       address: profile.address || '',
//       postalCode: profile.postalCode || '',
//       city: profile.city || '',
//       username: profile.username || '',
//       daycareName: profile.daycareName || '',
//       availableSpots: profile.availableSpots?.toString() || '0',
//       hasAvailability: profile.hasAvailability ?? true,
//       childrenCount: profile.childrenCount?.toString() || '0',
//       maxChildAge: profile.maxChildAge?.toString() || '',
//       birthDate: profile.birthDate?.slice(0, 10) || '',
//       caregiverSince: profile.caregiverSince?.slice(0, 7) || '',
//       shortDescription: profile.shortDescription || '',
//       bio: profile.bio || '',
//       mealPlan: profile.mealPlan || '',
//       newPassword: '',
//     });
//     setCareTimes(profile.careTimes?.length ? profile.careTimes.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]);
//     setDailySchedule(
//       profile.dailySchedule?.length ? profile.dailySchedule.map((entry) => createScheduleEntry(entry)) : [createScheduleEntry()]
//     );
//     setClosedDays(Array.isArray(profile.closedDays) ? [...profile.closedDays] : []);
//     setClosedDayInput('');
//     setRoomGallery((profile.roomImages ?? []).map((ref) => buildRoomGalleryItem(ref)).filter(Boolean) as RoomGalleryItem[]);
//     setImagePreview(profile.profileImageUrl ? assetUrl(profile.profileImageUrl) : '');
//     setLogoPreview(profile.logoImageUrl ? assetUrl(profile.logoImageUrl) : '');
//     setImageState(null);
//     setLogoState(null);
//     setConceptState(null);
//     setStatusMessage(null);
//   }, [profile]);

//   function updateField(field: keyof typeof formState, value: string | boolean) {
//     setFormState((current) => ({ ...current, [field]: value }));
//   }

//   const handlePickProfileImage = async () => {
//     const file = await pickSingleFile({ type: ['image/*'] });
//     if (!file) return;
//     setImageState(file);
//     setImagePreview(file.dataUrl);
//   };

//   const handlePickLogo = async () => {
//     const file = await pickSingleFile({ type: ['image/*'] });
//     if (!file) return;
//     setLogoState(file);
//     setLogoPreview(file.dataUrl);
//   };

//   const handlePickConcept = async () => {
//     const file = await pickSingleFile({ type: ['application/pdf'] });
//     if (!file) return;
//     setConceptState(file);
//   };

//   const handlePickRoomImages = async () => {
//     const files = await pickMultipleFiles({ type: ['image/*'] });
//     if (!files.length) return;
//     const additions: RoomGalleryItem[] = files.map((file) => ({
//       id: generateTempId(),
//       source: null,
//       preview: file.dataUrl,
//       fileData: file.dataUrl,
//       fileName: file.fileName,
//     }));
//     setRoomGallery((current) => [...current, ...additions]);
//   };

//   const handleRemoveRoomImage = (imageId: string) => {
//     setRoomGallery((current) => current.filter((image) => image.id !== imageId));
//   };

//   const handleSubmit = async () => {
//     const payload: Record<string, unknown> = {
//       firstName: formState.firstName,
//       lastName: formState.lastName,
//       email: formState.email,
//       phone: formState.phone,
//       address: formState.address,
//       postalCode: formState.postalCode,
//       city: formState.city,
//       username: formState.username,
//       daycareName: formState.daycareName,
//       availableSpots: Number(formState.availableSpots),
//       hasAvailability: Boolean(formState.hasAvailability),
//       childrenCount: Number(formState.childrenCount),
//       maxChildAge: formState.maxChildAge ? Number(formState.maxChildAge) : null,
//       birthDate: formState.birthDate || null,
//       caregiverSince: formState.caregiverSince || null,
//       shortDescription: formState.shortDescription,
//       bio: formState.bio,
//       mealPlan: formState.mealPlan,
//       careTimes,
//       dailySchedule,
//       closedDays,
//       roomImages: roomGallery.map((image) => (image.fileData ? { dataUrl: image.fileData, fileName: image.fileName } : image.source)).filter(Boolean),
//     };

//     if (formState.newPassword.trim()) {
//       payload.password = formState.newPassword.trim();
//     }

//     if (imageState) {
//       payload.profileImage = imageState.dataUrl || null;
//       payload.profileImageName = imageState.fileName;
//     }

//     if (logoState) {
//       payload.logoImage = logoState.dataUrl || null;
//       payload.logoImageName = logoState.fileName;
//     }

//     if (conceptState) {
//       payload.conceptFile = conceptState.dataUrl || null;
//       payload.conceptFileName = conceptState.fileName;
//     }

//     try {
//       await onSave(payload);
//       setStatusMessage('Profil erfolgreich aktualisiert.');
//       setFormState((current) => ({ ...current, newPassword: '' }));
//       setConceptState(null);
//     } catch (error) {
//       console.error('Failed to save caregiver profile', error);
//       Alert.alert('Fehler', 'Aktualisierung fehlgeschlagen.');
//     }
//   };

//   return (
//     <View style={{ gap: 18 }}>
//       <Section title="Basisdaten deiner Kindertagespflege">
//         <View style={styles.gridTwoCols}>
//           <LabeledInput label="Vorname" value={formState.firstName} onChangeText={(text) => updateField('firstName', text)} />
//           <LabeledInput label="Nachname" value={formState.lastName} onChangeText={(text) => updateField('lastName', text)} />
//           <LabeledInput label="Geburtsdatum" value={formState.birthDate} onChangeText={(text) => updateField('birthDate', text)} placeholder="YYYY-MM-DD" />
//           <LabeledInput
//             label="Name der Kindertagespflege"
//             value={formState.daycareName}
//             onChangeText={(text) => updateField('daycareName', text)}
//           />
//           <LabeledInput
//             label="Seit wann aktiv"
//             value={formState.caregiverSince}
//             onChangeText={(text) => updateField('caregiverSince', text)}
//             placeholder="YYYY-MM"
//           />
//           <LabeledInput
//             label="Maximales Alter der Kinder"
//             value={formState.maxChildAge}
//             onChangeText={(text) => updateField('maxChildAge', text)}
//             keyboardType="numeric"
//           />
//           <LabeledInput
//             label="Aktuell betreute Kinder"
//             value={formState.childrenCount}
//             onChangeText={(text) => updateField('childrenCount', text)}
//             keyboardType="numeric"
//           />
//           <LabeledInput
//             label="Freie Plätze"
//             value={formState.availableSpots}
//             onChangeText={(text) => updateField('availableSpots', text)}
//             keyboardType="numeric"
//           />
//           <LabeledInput
//             label="Plätze verfügbar? (ja/nein)"
//             value={formState.hasAvailability ? 'ja' : 'nein'}
//             onChangeText={(text) => updateField('hasAvailability', text.trim().toLowerCase() !== 'nein')}
//           />
//         </View>
//       </Section>

//       <Section title="Kontakt und Zugang">
//         <View style={styles.gridTwoCols}>
//           <LabeledInput
//             label="E-Mail"
//             value={formState.email}
//             onChangeText={(text) => updateField('email', text)}
//             keyboardType="email-address"
//           />
//           <LabeledInput label="Telefonnummer" value={formState.phone} onChangeText={(text) => updateField('phone', text)} />
//           <LabeledInput label="Adresse" value={formState.address} onChangeText={(text) => updateField('address', text)} />
//           <LabeledInput label="Postleitzahl" value={formState.postalCode} onChangeText={(text) => updateField('postalCode', text)} />
//           <LabeledInput label="Ort" value={formState.city} onChangeText={(text) => updateField('city', text)} />
//           <LabeledInput label="Benutzername" value={formState.username} onChangeText={(text) => updateField('username', text)} />
//           <LabeledInput
//             label="Neues Passwort (optional)"
//             value={formState.newPassword}
//             onChangeText={(text) => updateField('newPassword', text)}
//             secureTextEntry
//           />
//         </View>
//       </Section>

//       <Section title="Betreuungszeiten">
//         <ScheduleEditor entries={careTimes} onChange={setCareTimes} title="Bring- und Abholzeiten" />
//       </Section>

//       <Section title="Betreuungsfreie Tage">
//         <Text style={styles.hint}>Hinterlege Wochentage oder Hinweise, an denen keine Betreuung stattfindet.</Text>
//         <View style={styles.row}>
//           <TextInput
//             value={closedDayInput}
//             onChangeText={setClosedDayInput}
//             placeholder="z. B. Samstag"
//             style={[styles.input, { flex: 1 }]}
//             placeholderTextColor="#94a3b8"
//           />
//           <Pressable
//             style={[styles.buttonGhost, { marginLeft: 8 }]}
//             onPress={() => {
//               const trimmed = closedDayInput.trim();
//               if (!trimmed) return;
//               if (closedDays.includes(trimmed)) return;
//               setClosedDays((current) => [...current, trimmed]);
//               setClosedDayInput('');
//             }}
//           >
//             <Text style={styles.buttonGhostText}>Tag hinzufügen</Text>
//           </Pressable>
//         </View>
//         {closedDays.length ? (
//           <View style={styles.badgeList}>
//             {closedDays.map((day) => (
//               <View key={day} style={styles.badge}>
//                 <Text style={styles.badgeText}>{day}</Text>
//                 <Pressable onPress={() => setClosedDays((current) => current.filter((entry) => entry !== day))}>
//                   <Text style={styles.removeButtonText}>×</Text>
//                 </Pressable>
//               </View>
//             ))}
//           </View>
//         ) : (
//           <Text style={styles.hint}>Noch keine betreuungsfreien Tage hinterlegt.</Text>
//         )}
//       </Section>

//       <Section title="Tagesablauf">
//         <ScheduleEditor entries={dailySchedule} onChange={setDailySchedule} title="Beschreibe den Ablauf" />
//       </Section>

//       <Section title="Essensplan">
//         <LabeledInput
//           label="Mahlzeiten"
//           value={formState.mealPlan}
//           onChangeText={(text) => updateField('mealPlan', text)}
//           multiline
//           placeholder="Beschreibe Frühstück, Mittagessen und Snacks"
//         />
//       </Section>

//       <Section title="Profil, Logo & Team">
//         <FileUploadRow
//           label="Profilbild"
//           fileName={imageState?.fileName || (imagePreview ? 'Bestehendes Bild' : undefined)}
//           onPick={handlePickProfileImage}
//           onRemove={imagePreview ? () => { setImagePreview(''); setImageState({ dataUrl: '', fileName: '', mimeType: null }); } : undefined}
//           preview={imagePreview || undefined}
//         />
//         <FileUploadRow
//           label="Logo"
//           fileName={logoState?.fileName || (logoPreview ? 'Bestehendes Logo' : undefined)}
//           onPick={handlePickLogo}
//           onRemove={logoPreview ? () => { setLogoPreview(''); setLogoState({ dataUrl: '', fileName: '', mimeType: null }); } : undefined}
//           preview={logoPreview || undefined}
//         />
//         <FileUploadRow
//           label="Konzeption (PDF)"
//           fileName={conceptState?.fileName || (profile.conceptUrl ? 'Vorhandenes Dokument' : undefined)}
//           onPick={handlePickConcept}
//           onRemove={profile.conceptUrl ? () => setConceptState({ dataUrl: '', fileName: '', mimeType: null }) : undefined}
//         />
//       </Section>

//       <Section title="Räumlichkeiten">
//         <Text style={styles.hint}>Zeige Familien deine Räume. Bis zu drei Bilder gleichzeitig sichtbar.</Text>
//         <Pressable style={styles.buttonGhost} onPress={handlePickRoomImages}>
//           <Text style={styles.buttonGhostText}>Raumbilder hochladen</Text>
//         </Pressable>
//         {roomGallery.length ? (
//           <View style={styles.galleryGrid}>
//             {roomGallery.map((image) => (
//               <View key={image.id} style={styles.galleryItem}>
//                 <Image source={{ uri: image.preview }} style={styles.galleryImage} />
//                 <Pressable style={styles.removeBadge} onPress={() => handleRemoveRoomImage(image.id)}>
//                   <Text style={styles.removeButtonText}>Entfernen</Text>
//                 </Pressable>
//               </View>
//             ))}
//           </View>
//         ) : (
//           <Text style={styles.hint}>Noch keine Bilder ausgewählt.</Text>
//         )}
//       </Section>

//       <Section title="Über dich">
//         <LabeledInput
//           label="Kurzbeschreibung"
//           value={formState.shortDescription}
//           onChangeText={(text) => updateField('shortDescription', text)}
//         />
//         <LabeledInput
//           label="Ausführliche Vorstellung"
//           value={formState.bio}
//           onChangeText={(text) => updateField('bio', text)}
//           multiline
//         />
//       </Section>

//       <View style={{ gap: 10 }}>
//         <Pressable style={[styles.buttonPrimary, saving && styles.buttonDisabled]} disabled={saving} onPress={handleSubmit}>
//           <Text style={styles.buttonPrimaryText}>{saving ? 'Speichern…' : 'Profil speichern'}</Text>
//         </Pressable>
//         {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}
//       </View>
//     </View>
//   );
// }

// export default function ProfileScreen() {
//   const { user, loading: authLoading, refresh } = useAuthStatus();
//   const { profile, loading, error, setProfile } = useProfileData(user ?? {});
//   const [saving, setSaving] = useState(false);

//   const title = useMemo(() => {
//     if (user?.role === 'caregiver') return 'Profil für Kindertagespflegepersonen bearbeiten';
//     return 'Profil für Eltern bearbeiten';
//   }, [user?.role]);

//   const handleSave = async (payload: unknown) => {
//     if (!user?.id) return;
//     setSaving(true);
//     try {
//       const endpoint = user.role === 'caregiver' ? `/api/caregivers/${user.id}` : `/api/parents/${user.id}`;
//       const updated = await apiRequest<Profile>(endpoint, { method: 'PATCH', body: JSON.stringify(payload) });
//       setProfile(updated);
//       await refresh();
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <SafeAreaView style={styles.safeArea}> 
//         <View style={styles.centered}> 
//           <ActivityIndicator size="large" color={BRAND} />
//           <Text style={styles.hint}>Profil wird geladen…</Text>
//         </View>
//         <BottomNavbar />
//       </SafeAreaView>
//     );
//   }

//   if (!user) {
//     return (
//       <SafeAreaView style={styles.safeArea}> 
//         <View style={styles.centered}> 
//           <Text style={styles.title}>Bitte melde dich an.</Text>
//         </View>
//         <BottomNavbar />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}> 
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//           <View style={styles.header}>
//             <Text style={styles.kicker}>Profil & Einstellungen</Text>
//             <Text style={styles.title}>{title}</Text>
//             <Text style={styles.hint}>Aktualisiere dein Profil, um Familien und Tagespflegepersonen stets mit den neuesten Informationen zu versorgen.</Text>
//           </View>

//           {loading ? <Text style={styles.hint}>Profil wird geladen…</Text> : null}
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}

//           {!loading && profile ? (
//             user.role === 'caregiver' ? (
//               <CaregiverProfileEditor profile={profile as CaregiverProfile} onSave={handleSave} saving={saving} />
//             ) : (
//               <ParentProfileEditor profile={profile as ParentProfile} onSave={handleSave} saving={saving} />
//             )
//           ) : null}
//         </ScrollView>
//       </KeyboardAvoidingView>
//       <BottomNavbar />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f7f9fc',
//   },
//   content: {
//     padding: 16,
//     gap: 18,
//     paddingBottom: 160,
//   },
//   header: {
//     gap: 6,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#0f172a',
//   },
//   kicker: {
//     color: BRAND,
//     fontWeight: '700',
//   },
//   section: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 14,
//     gap: 12,
//     shadowColor: '#9bb9ff',
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: 8 },
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#0f172a',
//   },
//   inputGroup: {
//     gap: 6,
//   },
//   inputLabel: {
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#d5ddf4',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#f8fbff',
//     color: '#0f172a',
//   },
//   textarea: {
//     minHeight: 96,
//     textAlignVertical: 'top',
//   },
//   gridTwoCols: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   card: {
//     backgroundColor: '#f6f9ff',
//     borderRadius: 12,
//     padding: 12,
//     gap: 10,
//     borderWidth: 1,
//     borderColor: '#e4ebff',
//   },
//   uploadRow: {
//     flexDirection: 'row',
//     gap: 12,
//     alignItems: 'center',
//   },
//   uploadActions: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 6,
//   },
//   previewImage: {
//     width: 72,
//     height: 72,
//     borderRadius: 12,
//     backgroundColor: '#eef2ff',
//   },
//   buttonPrimary: {
//     backgroundColor: BRAND,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonPrimaryText: {
//     color: '#ffffff',
//     fontWeight: '800',
//   },
//   buttonGhost: {
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: BRAND,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   buttonGhostText: {
//     color: BRAND,
//     fontWeight: '800',
//   },
//   removeButton: {
//     paddingVertical: 8,
//   },
//   removeButtonText: {
//     color: '#b91c1c',
//     fontWeight: '700',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   badgeList: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   badge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#eef2ff',
//     borderRadius: 20,
//   },
//   badgeText: {
//     color: BRAND,
//     fontWeight: '700',
//   },
//   galleryGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   galleryItem: {
//     width: '48%',
//     aspectRatio: 1,
//     borderRadius: 16,
//     overflow: 'hidden',
//     position: 'relative',
//     backgroundColor: '#f1f5f9',
//   },
//   galleryImage: {
//     width: '100%',
//     height: '100%',
//   },
//   removeBadge: {
//     position: 'absolute',
//     right: 8,
//     top: 8,
//     backgroundColor: 'rgba(255,255,255,0.86)',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//   },
//   hint: {
//     color: '#475569',
//   },
//   successText: {
//     color: '#0f9d58',
//     fontWeight: '700',
//   },
//   errorText: {
//     color: '#b91c1c',
//     fontWeight: '700',
//   },
//   centered: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 12,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
// });
