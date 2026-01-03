import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { StartupDebugOverlay } from '../components/StartupDebugOverlay';
import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log('[LAYOUT] RootLayout mounted'); // [LOG]
  }, []);

  return (
    <AuthProvider>
      {/* <StartupDebugOverlay> erstmal rausnehmen */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />
            <Stack.Screen name="datenschutz" options={{ headerShown: false, title: 'Datenschutz' }} />
            <Stack.Screen name="impressum" options={{ headerShown: false, title: 'Impressum' }} />
            <Stack.Screen name="kontakt" options={{ headerShown: false, title: 'Kontakt' }} />
            <Stack.Screen name="anmelden/index" options={{ headerShown: false, title: 'Registrieren' }} />
            <Stack.Screen name="anmelden/eltern" options={{ headerShown: false, title: 'Elternprofil' }} />
            <Stack.Screen name="anmelden/eltern/profil" options={{ headerShown: false, title: 'Elternprofil' }} />
            <Stack.Screen
              name="anmelden/tagespflegeperson"
              options={{ headerShown: false, title: 'Kindertagespflegeperson' }}
            />
            <Stack.Screen
              name="anmelden/tagespflegeperson/profil"
              options={{ headerShown: false, title: 'Kindertagespflegeperson' }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      {/* </StartupDebugOverlay> */}
    </AuthProvider>
  );
}
