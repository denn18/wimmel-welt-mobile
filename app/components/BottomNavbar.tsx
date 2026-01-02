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
  const { user, loading, refresh } = useAuthStatus();
  const [checkingProfile, setCheckingProfile] = useState(false);

  const loginPath = '/login';

  // ✅ Profil muss in den Tab gehen (damit app/(tabs)/profile/index.tsx fokusiert wird)
  const profileTabRouteName = 'profile/index';
  const profileTabHref = '/(tabs)/profile';

  const bottomPadding = Math.max(insets.bottom, 10);

  const routes = state?.routes ?? [];
  const activeIndex = state?.index ?? -1;
  const isStandalone = !state || !navigation;
  const activeRouteName = routes[activeIndex]?.name;

  const handleProfilePress = async () => {
    if (loading || checkingProfile) return;

    setCheckingProfile(true);
    try {
      console.log('[NAV] profile pressed', { hasUser: Boolean(user), loading }); // [LOG]

      // ✅ wichtig: refresh liefert User zurück (siehe use-auth-status.ts)
      const authUser = user ?? (await refresh());

      if (!authUser) {
        console.log('[NAV] no user -> go login'); // [LOG]
        router.push(loginPath);
        return;
      }

      // ✅ Tab-route öffnen (damit useFocusEffect im Profil feuert)
      const routeIndex = routes.findIndex((r) => r.name === profileTabRouteName);

      if (navigation && routeIndex !== -1) {
        console.log('[NAV] navigate tab route', profileTabRouteName); // [LOG]
        navigation.navigate(profileTabRouteName as never);
        return;
      }

      // Fallback wenn navbar standalone gerendert wird
      console.log('[NAV] router.push fallback', profileTabHref); // [LOG]
      router.push(profileTabHref);
    } finally {
      setCheckingProfile(false);
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.wrapper, isStandalone ? styles.wrapperStandalone : styles.wrapperEmbedded]}
      pointerEvents="box-none"
    >
      <View style={[styles.bottomNav, { paddingBottom: bottomPadding }]}>
        {items.map((item) => {
          const routeIndex = routes.findIndex((route) => route.name === item.routeName);
          const isFocused = activeIndex !== -1 && routeIndex === activeIndex;

          const handlePress = () => {
            console.log('[NAV] tab press', item.href); // [LOG]
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
                    <Text style={[styles.navLabel, !isFocused && styles.navLabelInactive]}>{item.label}</Text>
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
            color={activeRouteName === profileTabRouteName ? BRAND : '#94A3B8'}
            style={{ opacity: loading ? 0.6 : 1 }}
          />
          <Text style={[styles.navLabel, activeRouteName !== profileTabRouteName && styles.navLabelInactive]}>
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
    paddingVertical: 12,
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

