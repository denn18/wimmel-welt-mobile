import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStatus } from '../hooks/use-auth-status';

const BRAND = 'rgb(49,66,154)';

const items = [
  { key: 'home', label: 'Home', icon: 'home', routeName: 'HomePage', href: '/HomePage' },
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', routeName: 'dashboard', href: '/dashboard' },
  {
    key: 'messages',
    label: 'Chat',
    icon: 'chatbubbles',
    routeName: 'MessegeOverviewPage',
    href: '/MessegeOverviewPage',
    aliases: ['/MessengerPage'],
  },
  {
    key: 'group',
    label: 'Gruppe',
    icon: 'people',
    routeName: 'betreuungsgruppechat',
    href: '/betreuungsgruppechat',
  },
];

export function BottomNavbar({ state, navigation }: Partial<BottomTabBarProps> = {}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refresh } = useAuthStatus();
  const [checkingProfile, setCheckingProfile] = useState(false);

  const loginPath = '/LoginPage';
  const profileTabRouteName = 'ProfilePage';
  const profileTabHref = '/ProfilePage';

  const bottomPadding = Math.max(insets.bottom, 10);
  const navHeight = 64 + bottomPadding;

  const routes = state?.routes ?? [];
  const activeIndex = state?.index ?? -1;
  const isStandalone = !state || !navigation;
  const activeRouteName = routes[activeIndex]?.name;

  const isItemFocused = (item: (typeof items)[number]) => {
    if (activeIndex !== -1) {
      const routeIndex = routes.findIndex((route) => route.name === item.routeName);
      return routeIndex === activeIndex;
    }

    if (pathname === item.href) return true;
    return item.aliases?.includes(pathname) ?? false;
  };

  const handleProfilePress = async () => {
    if (loading || checkingProfile) return;

    setCheckingProfile(true);
    try {
      const authUser = user ?? (await refresh());

      if (!authUser) {
        router.push(loginPath);
        return;
      }

      const routeIndex = routes.findIndex((r) => r.name === profileTabRouteName);

      if (navigation && routeIndex !== -1) {
        navigation.navigate(profileTabRouteName as never);
        return;
      }

      router.push(profileTabHref);
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
          const isFocused = isItemFocused(item);

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
                    <Text
                      numberOfLines={2}
                      style={[styles.navLabel, !isFocused && styles.navLabelInactive]}
                    >
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
            color={activeRouteName === profileTabRouteName || pathname === profileTabHref ? BRAND : '#94A3B8'}
            style={{ opacity: loading ? 0.6 : 1 }}
          />
          <Text
            numberOfLines={2}
            style={[
              styles.navLabel,
              activeRouteName !== profileTabRouteName && pathname !== profileTabHref && styles.navLabelInactive,
            ]}
          >
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
    justifyContent: 'space-between',
    shadowColor: '#9BB9FF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 4,
    gap: 2,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND,
    textAlign: 'center',
    lineHeight: 14,
    flexShrink: 1,
  },
  navLabelInactive: {
    color: '#94A3B8',
  },
});