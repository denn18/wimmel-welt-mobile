import type React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '../../services/api-client';
import { assetUrl, FileReference } from '../../utils/url';
import { BottomNavbar } from '../../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';

function formatAvailableSpotsLabel(spots?: number) {
  const value = typeof spots === 'number' ? spots : 0;
  if (value === 1) return '1 freier Platz';
  return `${value} freie Plätze`;
}

type ScheduleEntry = {
  startTime?: string;
  endTime?: string;
  activity?: string;
};

type Caregiver = {
  id: string;
  daycareName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  caregiverSince?: string;
  yearsOfExperience?: number;
  address?: string;
  postalCode?: string;
  city?: string;
  hasAvailability?: boolean;
  availableSpots?: number;
  childrenCount?: number;
  maxChildAge?: number;
  closedDays?: string[];
  careTimes?: ScheduleEntry[];
  dailySchedule?: ScheduleEntry[];
  mealPlan?: string;
  bio?: string;
  shortDescription?: string;
  roomImages?: FileReference[];
  profileImageUrl?: FileReference;
  logoImageUrl?: FileReference;
  conceptUrl?: FileReference;
  phone?: string;
  email?: string;
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function ScheduleList({ entries, emptyLabel }: { entries?: ScheduleEntry[]; emptyLabel: string }) {
  if (!entries?.length) {
    return <Text style={styles.muted}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.scheduleList}>
      {entries.map((entry, index) => (
        <View key={`${entry.startTime}-${entry.endTime}-${entry.activity}-${index}`} style={styles.scheduleItem}>
          <View style={styles.scheduleTime}>
            <Text style={styles.scheduleTimeText}>{entry.startTime || '—'}</Text>
            <Text style={styles.scheduleTimeText}>– {entry.endTime || '—'}</Text>
          </View>
          <Text style={styles.scheduleActivity}>{entry.activity || 'Keine Aktivität angegeben'}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CaregiverDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caregiverId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const formattedAddress = useMemo(() => {
    if (!caregiver) return '';
    const parts = [
      caregiver.address,
      [caregiver.postalCode, caregiver.city].filter(Boolean).join(' '),
    ].filter(Boolean);
    return parts.join(', ');
  }, [caregiver]);

  const caregiverLabel = useMemo(() => {
    if (!caregiver) return '';
    const fullName = [caregiver.firstName, caregiver.lastName].filter(Boolean).join(' ');
    return caregiver.daycareName || caregiver.name || fullName;
  }, [caregiver]);

  const availabilityStyles = caregiver?.hasAvailability
    ? styles.availabilityPositive
    : styles.availabilityNegative;

  const experienceYears = useMemo(() => {
    if (!caregiver?.caregiverSince && typeof caregiver?.yearsOfExperience !== 'number') return null;
    if (typeof caregiver?.yearsOfExperience === 'number') return caregiver.yearsOfExperience;

    const date = caregiver?.caregiverSince ? new Date(caregiver.caregiverSince) : null;
    if (!date || Number.isNaN(date.valueOf())) return null;

    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    const anniversaryPassed =
      now.getMonth() > date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
    if (!anniversaryPassed) years -= 1;
    return years >= 0 ? years : null;
  }, [caregiver]);

  const sinceYear = useMemo(() => {
    if (!caregiver?.caregiverSince) return null;
    const date = new Date(caregiver.caregiverSince);
    if (Number.isNaN(date.valueOf())) return null;
    return date.getFullYear();
  }, [caregiver]);

  const roomImages = useMemo(
    () => (caregiver?.roomImages ?? []).map((imageUrl) => assetUrl(imageUrl)).filter(Boolean),
    [caregiver]
  );

  const visibleRoomImages = useMemo(() => {
    if (!roomImages.length) return [] as string[];
    const count = Math.min(3, roomImages.length);
    const images: string[] = [];
    for (let offset = 0; offset < count; offset += 1) {
      images.push(roomImages[(roomIndex + offset) % roomImages.length]);
    }
    return images;
  }, [roomImages, roomIndex]);

  const hasMultipleRooms = roomImages.length > 1;

  useEffect(() => {
    let ignore = false;
    if (!caregiverId) return undefined;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<Caregiver>(`api/caregivers/${caregiverId}`);
        if (!ignore) {
          setCaregiver(data);
          setRoomIndex(0);
          setLightboxImage(null);
        }
      } catch (e) {
        console.error('Failed to load caregiver', e);
        if (!ignore) {
          setError('Die Kindertagespflege konnte nicht geladen werden.');
          setCaregiver(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [caregiverId]);

  const handleStartConversation = useCallback(() => {
    if (!caregiver?.id) return;
    router.push(`/nachrichten/${caregiver.id}`);
  }, [caregiver?.id, router]);

  const handleOpenConcept = useCallback(() => {
    if (!caregiver?.conceptUrl) return;
    const url = assetUrl(caregiver.conceptUrl);
    if (!url) return;
    void Linking.openURL(url);
  }, [caregiver?.conceptUrl]);

  const handleRoomPrev = useCallback(() => {
    if (!roomImages.length) return;
    setRoomIndex((current) => (current - 1 + roomImages.length) % roomImages.length);
  }, [roomImages.length]);

  const handleRoomNext = useCallback(() => {
    if (!roomImages.length) return;
    setRoomIndex((current) => (current + 1) % roomImages.length);
  }, [roomImages.length]);

  const profileImageUrl = caregiver?.profileImageUrl ? assetUrl(caregiver.profileImageUrl) : '';
  const logoUrl = caregiver?.logoImageUrl ? assetUrl(caregiver.logoImageUrl) : '';
  const conceptUrl = caregiver?.conceptUrl ? assetUrl(caregiver.conceptUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={BRAND} />
          <Text style={styles.backText}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Tagespflege kennenlernen</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND} size="large" />
          <Text style={styles.muted}>Profil wird geladen …</Text>
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#f97316" />
          <Text style={styles.errorTitle}>Ups!</Text>
          <Text style={styles.muted}>{error}</Text>
          <Pressable style={styles.secondaryAction} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={BRAND} />
            <Text style={styles.secondaryActionText}>Zurück</Text>
          </Pressable>
        </View>
      ) : !caregiver ? null : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.caregiverName}>{caregiverLabel}</Text>
                {formattedAddress ? <Text style={styles.muted}>{formattedAddress}</Text> : null}
                <View style={styles.chipRow}>
                  <View style={[styles.chip, availabilityStyles]}>
                    <Text style={styles.chipText}>
                      {caregiver.hasAvailability ? 'Plätze verfügbar' : 'Derzeit ausgebucht'}
                    </Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{formatAvailableSpotsLabel(caregiver.availableSpots)}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{`${caregiver.childrenCount ?? 0} Kinder in Betreuung`}</Text>
                  </View>
                  {caregiver.maxChildAge ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>bis {caregiver.maxChildAge} Jahre</Text>
                    </View>
                  ) : null}
                  {experienceYears !== null ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{experienceYears} Jahre Erfahrung</Text>
                    </View>
                  ) : sinceYear ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Seit {sinceYear} aktiv</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.actionsRow}>
                  {conceptUrl ? (
                    <Pressable style={styles.secondaryAction} onPress={handleOpenConcept}>
                      <Ionicons name="document-text" size={16} color={BRAND} />
                      <Text style={styles.secondaryActionText}>Konzeption (PDF)</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.primaryAction} onPress={handleStartConversation}>
                    <Ionicons name="chatbubbles" size={16} color="#fff" />
                    <Text style={styles.primaryActionText}>Nachricht schreiben</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.avatarStack}>
                {logoUrl ? (
                  <Pressable style={styles.logoWrapper} onPress={() => setLightboxImage(logoUrl)}>
                    <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="contain" />
                  </Pressable>
                ) : null}
                {profileImageUrl ? (
                  <Pressable style={styles.profileWrapper} onPress={() => setLightboxImage(profileImageUrl)}>
                    <Image source={{ uri: profileImageUrl }} style={styles.profileImage} contentFit="cover" />
                  </Pressable>
                ) : (
                  <View style={[styles.profileWrapper, styles.placeholder]}>
                    <Text style={styles.muted}>Kein Bild</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Section title="Kurzbeschreibung">
            <Text style={styles.bodyText}>
              {caregiver.shortDescription || 'Diese Tagespflege hat noch keine Kurzbeschreibung hinterlegt.'}
            </Text>
          </Section>

          <Section title="Über uns">
            <Text style={styles.bodyText}>
              {caregiver.bio || 'Hier erfährst du demnächst mehr über die Kindertagespflege.'}
            </Text>
          </Section>

          <Section title="Betreuungszeiten" description="Alle Zeitfenster inklusive der zugehörigen Aktivitäten.">
            <ScheduleList
              entries={caregiver.careTimes}
              emptyLabel="Es wurden noch keine Betreuungszeiten hinterlegt."
            />
          </Section>

          <Section title="Betreuungsfreie Tage" description="An diesen Tagen findet regulär keine Betreuung statt.">
            {caregiver.closedDays?.length ? (
              <View style={styles.chipRowWrap}>
                {caregiver.closedDays.map((day, index) => (
                  <View key={`${day}-${index}`} style={styles.chip}>
                    <Text style={styles.chipText}>{day}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.muted}>Es wurden keine betreuungsfreien Tage angegeben.</Text>
            )}
          </Section>

          <Section title="Tagesablauf" description="So gestaltet sich der Tag für die Kinder.">
            <ScheduleList entries={caregiver.dailySchedule} emptyLabel="Es liegt noch kein Tagesablauf vor." />
          </Section>

          <Section title="Essensplan">
            <Text style={styles.bodyText}>
              {caregiver.mealPlan ||
                'Die Kindertagespflege hat noch keine Informationen zum Essensplan ergänzt.'}
            </Text>
          </Section>

          <Section title="Räumlichkeiten" description="Ein Blick in die Betreuungsräume.">
            {visibleRoomImages.length ? (
              <View style={{ gap: 12 }}>
                {hasMultipleRooms ? (
                  <View style={styles.roomControls}>
                    <Pressable style={styles.secondaryAction} onPress={handleRoomPrev}>
                      <Ionicons name="chevron-back" size={16} color={BRAND} />
                      <Text style={styles.secondaryActionText}>Zurück</Text>
                    </Pressable>
                    <Text style={styles.muted}>Bild {roomIndex + 1} von {roomImages.length}</Text>
                    <Pressable style={styles.secondaryAction} onPress={handleRoomNext}>
                      <Text style={styles.secondaryActionText}>Weiter</Text>
                      <Ionicons name="chevron-forward" size={16} color={BRAND} />
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.roomGrid}>
                  {visibleRoomImages.map((imageUrl, index) => {
                    const imagePosition = roomImages.length
                      ? (roomIndex + index) % roomImages.length
                      : index;
                    const roomAlt = `Räumlichkeit ${imagePosition + 1} von ${caregiverLabel}`;
                    return (
                      <Pressable
                        key={`${imageUrl}-${index}`}
                        style={styles.roomImageWrapper}
                        onPress={() => setLightboxImage(imageUrl)}
                      >
                        <Image source={{ uri: imageUrl }} style={styles.roomImage} contentFit="cover" />
                        <Text style={styles.roomImageHint}>{roomAlt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={styles.muted}>Es wurden noch keine Bilder der Räumlichkeiten hochgeladen.</Text>
            )}
          </Section>

          <Section title="Kontakt">
            <View style={styles.contactList}>
              {caregiver.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${caregiver.phone}`)} style={styles.contactRow}>
                  <Ionicons name="call" size={16} color={BRAND} />
                  <Text style={styles.bodyText}>{caregiver.phone}</Text>
                </Pressable>
              ) : null}
              {caregiver.email ? (
                <Pressable onPress={() => Linking.openURL(`mailto:${caregiver.email}`)} style={styles.contactRow}>
                  <Ionicons name="mail" size={16} color={BRAND} />
                  <Text style={styles.bodyText}>{caregiver.email}</Text>
                </Pressable>
              ) : null}
              {formattedAddress ? (
                <View style={styles.contactRow}>
                  <Ionicons name="location" size={16} color={BRAND} />
                  <Text style={styles.bodyText}>{formattedAddress}</Text>
                </View>
              ) : null}
            </View>
          </Section>
        </ScrollView>
      )}

      <BottomNavbar />

      <Modal visible={Boolean(lightboxImage)} transparent animationType="fade" onRequestClose={() => setLightboxImage(null)}>
        <View style={styles.lightboxBackdrop}>
          <Pressable style={styles.lightboxClose} onPress={() => setLightboxImage(null)}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          {lightboxImage ? (
            <Image source={{ uri: lightboxImage }} style={styles.lightboxImage} contentFit="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: BRAND,
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 160,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  caregiverName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  chipText: {
    color: BRAND,
    fontWeight: '700',
    fontSize: 12,
  },
  availabilityPositive: {
    backgroundColor: '#ecfdf3',
  },
  availabilityNegative: {
    backgroundColor: '#fff7ed',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: BRAND,
    borderRadius: 12,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  secondaryActionText: {
    color: BRAND,
    fontWeight: '700',
    fontSize: 14,
  },
  avatarStack: {
    width: 116,
    alignItems: 'flex-end',
    gap: 10,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  profileWrapper: {
    width: 110,
    height: 110,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#eef2ff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#f1f5f9',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionDescription: {
    color: '#64748b',
    fontSize: 13,
  },
  bodyText: {
    color: '#0f172a',
    lineHeight: 21,
  },
  muted: {
    color: '#64748b',
    fontSize: 13,
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleTimeText: {
    fontWeight: '700',
    color: BRAND,
    fontSize: 12,
  },
  scheduleActivity: {
    color: '#0f172a',
    fontWeight: '600',
  },
  roomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  roomImageWrapper: {
    flex: 1,
    minWidth: 160,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomImageHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  contactList: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#c2410c',
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
  lightboxClose: {
    position: 'absolute',
    top: 40,
    right: 24,
    padding: 10,
  },
});
