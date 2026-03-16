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
          <Stack.Screen name="pages/Profilwarnung" options={{ headerShown: false, title: 'Profilwarnung' }} />
          <Stack.Screen name="pages/ParentSignUpPage" options={{ headerShown: false, title: 'Parent Signup' }} />
          <Stack.Screen name="pages/CaregiverSignupPage" options={{ headerShown: false, title: 'Caregiver Signup' }} />
          <Stack.Screen
            name="pages/kindertagespflegedetail"
            options={{ headerShown: false, title: 'Kindertagespflegeprofil' }}
          />
          <Stack.Screen name="pages/nachrichtendetail" options={{ headerShown: false, title: 'Nachrichten' }} />
          <Stack.Screen name="pages/ProfilePage" options={{ headerShown: false, title: 'Profil' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
