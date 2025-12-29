import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavbar } from '../../../components/BottomNavbar';
import { useAuthStatus } from '../../../hooks/use-auth-status';
import { apiRequest } from '../../../services/api-client';

const BRAND = '#31429a';

type ProfileResponse = Record<string, unknown> | null;

export default function ProfileScreen() {
  const { user, loading: authLoading } = useAuthStatus();
  const [profile, setProfile] = useState<ProfileResponse>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    if (!user?.id || !user?.role) return null;
    return user.role === 'caregiver' ? `api/caregivers/${user.id}` : `api/parents/${user.id}`;
  }, [user?.id, user?.role]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      console.log('[PROFILE] auth state', user); // [LOG]

      if (!user?.id || !user?.role || !endpoint) {
        console.log('[PROFILE] missing auth info, skipping fetch'); // [LOG]
        setProfile(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('[PROFILE] fetching endpoint', endpoint); // [LOG]
        const data = await apiRequest<ProfileResponse>(endpoint, { method: 'GET' });
        console.log('[PROFILE] profile loaded', data); // [LOG]
        if (!cancelled) {
          setProfile(data);
        }
      } catch (requestError) {
        console.error('[PROFILE] failed to load profile', requestError); // [LOG]
        if (!cancelled) {
          setError('Profil konnte nicht geladen werden.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [endpoint, user]);

  const debugUser = JSON.stringify(user ?? {}, null, 2);
  const debugProfile = JSON.stringify(profile ?? {}, null, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profil</Text>

        {authLoading || loading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={BRAND} />
            <Text style={styles.statusText}>Profil wird geladen …</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <Text style={styles.label}>Aktueller User (Context)</Text>
          <View style={styles.debugBox}>
            <Text selectable style={styles.codeText}>
              {debugUser}
            </Text>
          </View>

          <Text style={[styles.label, styles.spacingTop]}>Geladenes Profil</Text>
          <View style={styles.debugBox}>
            <Text selectable style={styles.codeText}>
              {debugProfile}
            </Text>
          </View>

          {endpoint ? <Text style={styles.endpointText}>Endpoint: {endpoint}</Text> : null}
        </View>
      </ScrollView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 20,
    paddingBottom: 140,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BRAND,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    color: '#475569',
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#c6d6ff',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND,
  },
  label: {
    fontWeight: '700',
    color: '#0f172a',
  },
  spacingTop: {
    marginTop: 10,
  },
  debugBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    color: '#e2e8f0',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  endpointText: {
    color: '#475569',
    fontStyle: 'italic',
  },
});
