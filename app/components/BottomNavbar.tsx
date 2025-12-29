import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStatus } from '../hooks/use-auth-status';

const BRAND = 'rgb(49,66,154)';

const items = [
  { key: 'home', label: 'Home', icon: 'home', routeName: 'home', href: '/(tabs)/home' },
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', routeName: 'dashboard/index', href: '/(tabs)/dashboard' },
  {
    key: 'messages',
    label: 'Nachrichten',
    icon: 'chatbubbles',
    routeName: 'messages/index',
    href: '/(tabs)/messages',
    aliases: ['/nachrichten'],
  },
  {
    key: 'settings',
    label: 'Einstellungen',
    icon: 'settings',
    routeName: 'settings/index',
    href: '/(tabs)/settings',
  },
];

export function BottomNavbar({ state, navigation }: Partial<BottomTabBarProps> = {}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, role, loading, refresh } = useAuthStatus();
  const [checkingProfile, setCheckingProfile] = useState(false);

  // ✅ Genau deine Zielseiten:
  const loginPath = '/login';
  const parentProfilePath = '/anmelden/eltern/profil';
  const caregiverProfilePath = '/anmelden/tagespflegeperson/profil';

  const bottomPadding = Math.max(insets.bottom, 10);
  const navHeight = 64 + bottomPadding;

  const routes = state?.routes ?? [];
  const activeIndex = state?.index ?? -1;
  const isStandalone = !state || !navigation;
  const activeRouteName = routes[activeIndex]?.name;
  const profileRouteName = 'profile/index';

  const normalizeRole = (candidate?: string | null) => {
    if (!candidate) return null;

    const normalized = candidate.trim().toLowerCase();

    if (['parent', 'parents', 'eltern', 'elternteil', 'elternprofil'].includes(normalized)) {
      return 'parent' as const;
    }

    if (
      [
        'caregiver',
        'tagespflegeperson',
        'tagesmutter',
        'tagesvater',
        'kindertagespflegeperson',
        'kindertagespflege',
        'childminder',
      ].includes(normalized)
    ) {
      return 'caregiver' as const;
    }

    return null;
  };

  const resolveUserRole = (candidate?: unknown) => {
    if (!candidate || typeof candidate !== 'object') return null;
    const maybeUser = candidate as Record<string, unknown>;

    return (
      normalizeRole(role) ||
      normalizeRole(maybeUser['role'] as string) ||
      normalizeRole(maybeUser['userType'] as string) ||
      normalizeRole(maybeUser['profileType'] as string)
    );
  };

  const handleProfilePress = async () => {
    if (loading || checkingProfile) return;

    setCheckingProfile(true);
    try {
      /**
       * ✅ KRITISCHER FIX:
       * refresh() NICHT als Rückgabewert benutzen.
       * Bei euch gibt refresh sehr wahrscheinlich void/undefined zurück.
       * Es soll nur den State aktualisieren – authUser bleibt user.
       */
      if (!user) {
        await refresh();
      }

      // Nach refresh nochmal auf den aktuellen Hook-State schauen
      const authUser = user;
      const currentRole = resolveUserRole(authUser);

      // 1) Nicht eingeloggt -> Login
      if (!authUser) {
        router.push(loginPath);
        return;
      }

      // 2) Rolle nicht erkannt -> Login (dein Default)
      if (!currentRole) {
        router.push(loginPath);
        return;
      }

      // 3) Rollenrouting
      if (currentRole === 'parent') {
        router.push(parentProfilePath);
        return;
      }

      if (currentRole === 'caregiver') {
        router.push(caregiverProfilePath);
        return;
      }

      // Default: Login
      router.push(loginPath);
    } finally {
      setCheckingProfile(false);
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.wrapper,
        isStandalone ? styles.wrapperStandalone : styles.wrapperEmbedded,
        { height: navHeight },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.bottomNav, { paddingBottom: bottomPadding, height: navHeight }]}>
        {items.map((item) => {
          const routeIndex = routes.findIndex((route) => route.name === item.routeName);
          const isFocused = activeIndex !== -1 && routeIndex === activeIndex;

          const handlePress = () => {
            if (navigation && routeIndex !== -1) {
              navigation.navigate(item.routeName as never);
              return;
            }
            router.push(item.href);
          };

          return (
            <Link key={item.key} href={item.href} asChild>
              <Pressable style={styles.navItem} onPress={handlePress}>
                {({ pressed }) => (
                  <>
                    <Ionicons
                      name={item.icon as never}
                      size={22}
                      color={isFocused ? BRAND : '#94A3B8'}
                      style={{ opacity: pressed ? 0.7 : 1 }}
                    />
                    <Text style={[styles.navLabel, !isFocused && styles.navLabelInactive]}>
                      {item.label}
                    </Text>
                  </>
                )}
              </Pressable>
            </Link>
          );
        })}

        <Pressable style={styles.navItem} onPress={handleProfilePress} disabled={loading || checkingProfile}>
          <Ionicons
            name="person-circle"
            size={24}
            color={activeRouteName === profileRouteName ? BRAND : '#94A3B8'}
            style={{ opacity: loading ? 0.6 : 1 }}
          />
          <Text style={[styles.navLabel, activeRouteName !== profileRouteName && styles.navLabelInactive]}>
            Profil
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  wrapperStandalone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  wrapperEmbedded: {
    width: '100%',
  },
  bottomNav: {
    borderRadius: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(191,211,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 8,
    gap: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 64,
    flex: 1,
  },
  navLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: BRAND,
  },
  navLabelInactive: {
    color: '#94A3B8',
  },
});
