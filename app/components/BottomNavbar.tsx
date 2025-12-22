import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStatus } from '../hooks/use-auth-status';

const BRAND = 'rgb(49,66,154)';

const items = [
  { key: 'home', label: 'Home', icon: 'home', href: '/(tabs)/home' },
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', href: '/(tabs)/dashboard' },
  { key: 'messages', label: 'Nachrichten', icon: 'chatbubbles', href: '/(tabs)/messages' },
];

export function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { role, loading } = useAuthStatus();

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
              router.push('/(tabs)/profile');
            }
          },
        },
      ],
    );
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper}>
      <View style={styles.container}>
        {items.map((item) => (
          <Link key={item.key} href={item.href} asChild>
            <Pressable style={styles.item}>
              {({ pressed }) => (
                <>
                  <Ionicons
                    name={item.icon as never}
                    size={22}
                    color={isActive(item.href) ? BRAND : '#94A3B8'}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  />
                  <Text style={[styles.label, isActive(item.href) && styles.labelActive]}>{item.label}</Text>
                </>
              )}
            </Pressable>
          </Link>
        ))}

        <Pressable style={styles.item} onPress={handleProfilePress} disabled={loading}>
          <Ionicons name="person-circle" size={24} color={role ? BRAND : '#94A3B8'} style={{ opacity: loading ? 0.6 : 1 }} />
          <Text style={[styles.label, role && styles.labelActive]}>Profil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    shadowColor: '#1f2937',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  labelActive: {
    color: BRAND,
  },
});
