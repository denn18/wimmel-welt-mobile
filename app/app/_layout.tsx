import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { useColorScheme } from '../hooks/use-color-scheme';

const APP_BACKGROUND = '#f5f7fb';

export const unstable_settings = {
  anchor: 'pages',
  initialRouteName: 'pages/home',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider
        value={{
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
          colors: {
            ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
            background: APP_BACKGROUND,
          },
        }}
      >
        <Stack screenOptions={{ contentStyle: { backgroundColor: APP_BACKGROUND } }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="pages" options={{ headerShown: false }} />
          <Stack.Screen name="pages/login" options={{ headerShown: false, title: 'Login' }} />
          <Stack.Screen name="pages/datenschutz" options={{ headerShown: false, title: 'Datenschutz' }} />
          <Stack.Screen name="pages/impressum" options={{ headerShown: false, title: 'Impressum' }} />
          <Stack.Screen name="pages/kontakt" options={{ headerShown: false, title: 'Kontakt' }} />
          <Stack.Screen name="pages/auswahl" options={{ headerShown: false, title: 'Registrieren' }} />
          <Stack.Screen name="pages/eltern" options={{ headerShown: false, title: 'Eltern' }} />
          <Stack.Screen name="pages/elternprofil" options={{ headerShown: false, title: 'Elternprofil' }} />
          <Stack.Screen name="pages/tagespflegeperson" options={{ headerShown: false, title: 'Tagespflegeperson' }} />
          <Stack.Screen name="pages/tagespflegeprofil" options={{ headerShown: false, title: 'Tagespflegeprofil' }} />
          <Stack.Screen
            name="pages/kindertagespflegedetail"
            options={{ headerShown: false, title: 'Kindertagespflegeprofil' }}
          />
          <Stack.Screen name="pages/nachrichtendetail" options={{ headerShown: false, title: 'Nachrichten' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
