// app/(tabs)/dashboard/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '../../../services/api-client';
import { assetUrl, FileReference } from '../../../utils/url';
// OPTIONAL (wenn du es hast): für "Nachricht" wie im Web
// import { useAuth } from '../../../context/AuthContext';

const BRAND = 'rgb(49,66,154)';

type LocationSuggestion = {
  postalCode?: string;
  city?: string;
  daycareName?: string;
};

type Caregiver = {
  id: string;
  daycareName?: string;
  name?: string;

  firstName?: string;
  lastName?: string;
  birthDate?: string;
  age?: number;

  caregiverSince?: string;
  yearsOfExperience?: number;

  postalCode?: string;
  city?: string;

  logoImageUrl?: FileReference;
  profileImageUrl?: FileReference;

  availableSpots?: number;
  hasAvailability?: boolean;

  childrenCount?: number;
  maxChildAge?: number;
};

type Filters = { postalCode: string; city: string; search: string };

function calculateAge(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasBirthdayPassed) age -= 1;

  return age >= 0 ? age : null;
}

function calculateYearsSince(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const hasAnniversaryPassed =
    now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasAnniversaryPassed) years -= 1;

  return years >= 0 ? years : null;
}

function formatAvailableSpotsLabel(spots?: number) {
  const value = typeof spots === 'number' ? spots : 0;
  if (value === 1) return '1 freier Platz';
  return `${value} freie Plätze`;
}

function buildQuery(path: string, params?: Record<string, string | number | undefined>) {
  const pairs = Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== '' && v !== null);
  if (!pairs.length) return path;
  const qs = pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${path}?${qs}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  // OPTIONAL:
  // const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({ postalCode: '', city: '', search: '' });

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<TextInput | null>(null);

  const activeLocation = useMemo(() => {
    if (filters.postalCode || filters.city) return [filters.postalCode, filters.city].filter(Boolean).join(' ');
    if (filters.search) return filters.search;
    return '';
  }, [filters]);

  const fetchCaregivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.postalCode) params.postalCode = filters.postalCode;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;

      const url = buildQuery('api/caregivers', params);
      const data = await apiRequest<Caregiver[]>(url);
      setCaregivers(data ?? []);
    } catch (e) {
      console.error('Failed to load caregivers', e);
      setError('Daten konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      void fetchCaregivers();
    }, [fetchCaregivers])
  );

  // Suggestions (PLZ/Ort) – Logik wie im Web
  const loadSuggestions = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const url = buildQuery('api/caregivers/locations', { q: trimmed });
      const data = await apiRequest<LocationSuggestion[]>(url);
      setSuggestions(data ?? []);
    } catch (e) {
      console.error('Failed to load caregiver locations', e);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: LocationSuggestion) => {
    const label = [suggestion.postalCode, suggestion.city].filter(Boolean).join(' ');
    setSearchTerm(label);
    setFilters({ postalCode: suggestion.postalCode ?? '', city: suggestion.city ?? '', search: '' });
    setSuggestionsOpen(false);
    Keyboard.dismiss();
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setFilters({ postalCode: '', city: '', search: '' });
      setSuggestionsOpen(false);
      Keyboard.dismiss();
      return;
    }

    const parts = trimmed.split(/\s+/);
    const first = parts[0];
    if (/^\d{5}$/.test(first)) {
      const cityName = parts.slice(1).join(' ').trim();
      setFilters({ postalCode: first, city: cityName, search: '' });
    } else {
      setFilters({ postalCode: '', city: '', search: trimmed });
    }

    setSuggestionsOpen(false);
    Keyboard.dismiss();
  }, [searchTerm]);

  const handleOpenMessenger = useCallback(
    (caregiver: Caregiver) => {
      // wie im Web: wenn nicht eingeloggt -> login
      // if (!user) {
      //   router.push('/login');
      //   return;
      // }
      router.push(`/nachrichten/${caregiver.id}`);
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Overlay zum Schließen der Suggestions */}
      {suggestionsOpen ? (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setSuggestionsOpen(false);
            Keyboard.dismiss();
          }}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCaregivers} tintColor={BRAND} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Title (zentriert wie Screenshot) */}
        <View style={styles.topHeader}>
          <Text style={styles.topTitle}>Wimmel Welt</Text>
        </View>

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>Familienzentrum</Text>
          <Text style={styles.pageSubtitle}>
            Finde Tagespflegepersonen in deiner Nähe, vergleiche Profile und starte persönliche Gespräche.
          </Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.label}>Ort oder Postleitzahl suchen</Text>

          <View style={styles.inputWrap}>
            <TextInput
              ref={(r) => {
                inputRef.current = r;
              }}
              value={searchTerm}
              onChangeText={(t) => {
                setSearchTerm(t);
                setSuggestionsOpen(true);
                void loadSuggestions(t);
              }}
              onFocus={() => {
                setSuggestionsOpen(true);
                void loadSuggestions(searchTerm);
              }}
              placeholder="aktuell nur 33332, Gütersloh :)"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
          </View>

          {/* Suggestions Dropdown */}
          {suggestionsOpen && (loadingSuggestions || suggestions.length > 0) ? (
            <View style={styles.suggestionBox}>
              {loadingSuggestions ? (
                <View style={styles.suggestionLoading}>
                  <ActivityIndicator />
                  <Text style={styles.suggestionLoadingText}>Orte werden geladen…</Text>
                </View>
              ) : (
                <View style={styles.suggestionList}>
                  {suggestions.map((s, idx) => {
                    const label = [s.postalCode, s.city].filter(Boolean).join(' ');
                    return (
                      <Pressable
                        key={`${s.postalCode ?? 'x'}-${s.city ?? 'y'}-${idx}`}
                        onPress={() => handleSuggestionSelect(s)}
                        style={styles.suggestionRow}
                      >
                        <Text style={styles.suggestionPrimary}>{label || s.daycareName || ''}</Text>
                        {s.daycareName ? (
                          <Text style={styles.suggestionSecondary}>Empfohlen: {s.daycareName}</Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.searchFooter}>
            <Pressable style={styles.searchBtn} onPress={handleSearchSubmit}>
              <Text style={styles.searchBtnText}>Suche aktualisieren</Text>
            </Pressable>

            <View style={styles.searchMeta}>
              <View style={styles.profilePill}>
                <Text style={styles.profilePillText}>{caregivers.length} Profile</Text>
              </View>
              {activeLocation ? <Text style={styles.activeFilter}>Aktueller Filter: {activeLocation}</Text> : null}
            </View>
          </View>
        </View>

        {/* Result Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Gefundene Kindertagespflegepersonen</Text>
          <Text style={styles.resultsSubtitle}>
            Scroll durch die Kacheln, vergleiche Angebote und öffne Details.
          </Text>
        </View>

        {/* Caregiver Cards */}
        <View style={styles.list}>
          {caregivers.map((caregiver) => {
            const logoUrl = caregiver.logoImageUrl ? assetUrl(caregiver.logoImageUrl) : '';
            const profileImageUrl = caregiver.profileImageUrl ? assetUrl(caregiver.profileImageUrl) : '';

            const locationLabel = [caregiver.postalCode, caregiver.city].filter(Boolean).join(' ');

            const caregiverFullName = [caregiver.firstName, caregiver.lastName].filter(Boolean).join(' ').trim();
            const caregiverAge = caregiver.age ?? calculateAge(caregiver.birthDate) ?? null;

            const yearsOfExperience =
              caregiver.yearsOfExperience ?? calculateYearsSince(caregiver.caregiverSince) ?? null;

            const experienceText =
              yearsOfExperience !== null
                ? yearsOfExperience === 0
                  ? 'Seit diesem Jahr Tagespflegeperson'
                  : `Seit ${yearsOfExperience} ${yearsOfExperience === 1 ? 'Jahr' : 'Jahren'} Tagespflegeperson`
                : null;

            const personParts: string[] = [];
            if (caregiverFullName) personParts.push(`Tagespflegeperson: ${caregiverFullName}`);
            else if (caregiver.name) personParts.push(`Tagespflegeperson: ${caregiver.name}`);
            if (caregiverAge !== null) personParts.push(`${caregiverAge} ${caregiverAge === 1 ? 'Jahr' : 'Jahre'} alt`);
            if (experienceText) personParts.push(experienceText);

            const personInfo = personParts.join(' · ');

            return (
              <View key={caregiver.id} style={styles.card}>
                {/* Left column (Logo + Profilbild) */}
                <View style={styles.leftCol}>
                  <View style={styles.logoBox}>
                    {logoUrl ? (
                      <Image source={{ uri: logoUrl }} style={styles.logoImg} contentFit="contain" />
                    ) : (
                      <Text style={styles.placeholderSmall}>Logo folgt</Text>
                    )}
                  </View>

                  <View style={styles.avatarBox}>
                    {profileImageUrl ? (
                      <Image source={{ uri: profileImageUrl }} style={styles.avatarImg} contentFit="cover" />
                    ) : (
                      <Text style={styles.placeholderSmall}>Kein Bild</Text>
                    )}
                  </View>
                </View>

                {/* Right content */}
                <View style={styles.rightCol}>
                  <Text style={styles.cardTitle}>{caregiver.daycareName || caregiver.name || '—'}</Text>

                  {personInfo ? <Text style={styles.cardInfo}>{personInfo}</Text> : null}

                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{locationLabel || 'Ort folgt'}</Text>
                    </View>

                    <View style={[styles.chip, styles.chipGreen]}>
                      <Text style={[styles.chipText, styles.chipGreenText]}>
                        {formatAvailableSpotsLabel(caregiver.availableSpots)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{`${caregiver.childrenCount ?? 0} Kinder in Betreuung`}</Text>
                    </View>
                    {caregiver.maxChildAge ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>bis {caregiver.maxChildAge} Jahre</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.btnRow}>
                    <Pressable
                      style={styles.primaryAction}
                      onPress={() => router.push(`/kindertagespflege/${caregiver.id}`)}
                    >
                      <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                      <Text style={styles.primaryActionText}>Kennenlernen</Text>
                    </Pressable>

                    <Pressable style={styles.secondaryAction} onPress={() => handleOpenMessenger(caregiver)}>
                      <Ionicons name="mail" size={16} color={BRAND} />
                      <Text style={styles.secondaryActionText}>Nachricht</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {!loading && !caregivers.length ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Keine Tagespflegepersonen gefunden. Probiere eine andere Postleitzahl oder bitte eine Tagespflegeperson,
                ein Profil anzulegen.
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={18} color="#b91c1c" style={{ marginTop: 2 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer (Copyright wie Screenshot) */}
        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Wimmel Welt. Alle Rechte vorbehalten.</Text>

          <View style={styles.footerLinks}>
            <Pressable onPress={() => router.push('/datenschutz')}>
              <Text style={styles.footerLink}>Datenschutz</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Pressable onPress={() => router.push('/impressum')}>
              <Text style={styles.footerLink}>Impressum</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Pressable onPress={() => router.push('/kontakt')}>
              <Text style={styles.footerLink}>Kontakt</Text>
            </Pressable>
          </View>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF3FF' },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 140,
    gap: 14,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },

  topHeader: { alignItems: 'center', paddingTop: 2, paddingBottom: 4 },
  topTitle: { fontSize: 28, fontWeight: '900', color: BRAND, letterSpacing: 0.2 },

  headerBlock: { gap: 6 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: BRAND },
  pageSubtitle: { fontSize: 14, color: '#475569', lineHeight: 20 },

  searchCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 24,
    padding: 16,
    gap: 10,
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 4,
    zIndex: 10, // damit suggestions über anderen Elementen liegen
  },

  label: { fontSize: 14, fontWeight: '800', color: '#0F172A' },

  inputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFD3FF',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { fontSize: 16, color: '#0F172A' },

  suggestionBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E6FF',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  suggestionLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  suggestionLoadingText: { color: '#64748B', fontWeight: '600' },
  suggestionList: { maxHeight: 220 },
  suggestionRow: { paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EFF5FF' },
  suggestionPrimary: { color: BRAND, fontWeight: '800' },
  suggestionSecondary: { marginTop: 2, color: '#64748B', fontSize: 12 },

  searchFooter: { marginTop: 4, gap: 10 },
  searchBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#2F5FE8',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#2F5FE8',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 2,
  },
  searchBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  searchMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  profilePill: { backgroundColor: '#EAF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  profilePillText: { color: BRAND, fontWeight: '900', fontSize: 12 },
  activeFilter: { color: '#64748B', fontSize: 12, flex: 1, textAlign: 'right' },

  resultsHeader: { gap: 2, marginTop: 4 },
  resultsTitle: { fontSize: 18, fontWeight: '900', color: BRAND },
  resultsSubtitle: { fontSize: 12.5, color: '#64748B' },

  list: { gap: 12 },

  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#D9E6FF',
    shadowColor: '#A7C2FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },

  leftCol: { width: 76, gap: 10, alignItems: 'center' },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E6FF',
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%' },

  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E6FF',
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },

  placeholderSmall: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textAlign: 'center' },

  rightCol: { flex: 1, gap: 8 },

  cardTitle: { fontSize: 18, fontWeight: '900', color: BRAND },
  cardInfo: { color: '#475569', lineHeight: 18 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: '#334155', fontWeight: '700', fontSize: 12 },

  chipGreen: { backgroundColor: '#EAF7EE' },
  chipGreenText: { color: '#1F6B3A' },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 2, flexWrap: 'wrap' },

  primaryAction: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: '#2F5FE8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  primaryActionText: { color: '#fff', fontWeight: '900', fontSize: 12.5 },

  secondaryAction: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFD3FF',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  secondaryActionText: { color: BRAND, fontWeight: '900', fontSize: 12.5 },

  emptyBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E6FF',
    backgroundColor: 'rgba(255,255,255,0.82)',
    padding: 14,
  },
  emptyText: { color: '#64748B', lineHeight: 18 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: '#B91C1C', flex: 1, fontSize: 13, lineHeight: 18 },

  footer: {
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  footerText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerLink: { color: '#334155', fontWeight: '700' },
  footerDot: { color: '#94A3B8', fontWeight: '900' },
});
