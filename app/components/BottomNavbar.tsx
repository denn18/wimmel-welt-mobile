import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const { role, loading } = useAuthStatus();

  const bottomPadding = Math.max(insets.bottom, 10);
  const navHeight = 64 + bottomPadding;

  const routes = state?.routes ?? [];
  const activeIndex = state?.index ?? -1;
  const isStandalone = !state || !navigation;
  const activeRouteName = routes[activeIndex]?.name;
  const profileRouteName = 'profile/index';

  const handleProfilePress = () => {
    if (loading) return;

    if (!role) {
      router.push('/login');
      return;
    }

    Alert.alert(
      'Profilerstellung am Laptop empfohlen',
      'Wir empfehlen die Profilerstellung auf einem Laptop oder Computer durchzuführen.',
      [
        {
          text: 'Weiter',
          onPress: () => {
            if (role === 'parent') {
              router.push('/anmelden/eltern/profil');
            } else if (role === 'caregiver' || role === 'tagespflegeperson') {
              router.push('/anmelden/tagespflegeperson/profil');
            } else {
              navigation.navigate(profileRouteName as never);
            }
          },
        },
      ],
    );
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

        <Pressable style={styles.navItem} onPress={handleProfilePress} disabled={loading}>
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
