import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { BottomNavbar } from '../components/BottomNavbar';
import { AuthProvider } from '../context/AuthContext';
import { useAuthStatus } from '../hooks/use-auth-status';
import { useColorScheme } from '../hooks/use-color-scheme';
import { usePushRegistration } from '../hooks/use-push-registration';

const APP_BACKGROUND = '#f5f7fb';

export const unstable_settings = {
  initialRouteName: 'HomePage',
};

function PushRegistrationBridge() {
  const { user } = useAuthStatus();
  usePushRegistration(user);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PushRegistrationBridge />
      <ThemeProvider
        value={{
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
          colors: {
            ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors,
            background: APP_BACKGROUND,
          },
        }}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Stack screenOptions={{ contentStyle: { backgroundColor: APP_BACKGROUND } }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="HomePage" options={{ headerShown: false, title: 'Home' }} />
              <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Dashboard' }} />
              <Stack.Screen name="MessegeOverviewPage" options={{ headerShown: false, title: 'Nachrichten' }} />
              <Stack.Screen name="betreuungsgruppechat" options={{ headerShown: false, title: 'Gruppe' }} />
              <Stack.Screen name="LoginPage" options={{ headerShown: false, title: 'Login' }} />
              <Stack.Screen name="PrivacyPolicyPage" options={{ headerShown: false, title: 'Datenschutz' }} />
              <Stack.Screen name="ImprintPage" options={{ headerShown: false, title: 'Impressum' }} />
              <Stack.Screen name="ContactPage" options={{ headerShown: false, title: 'Kontakt' }} />
              <Stack.Screen name="FAQPage" options={{ headerShown: false, title: 'FAQ' }} />
              <Stack.Screen name="RoleSelectionPage" options={{ headerShown: false, title: 'Registrieren' }} />
              <Stack.Screen name="ParentSignUpPage" options={{ headerShown: false, title: 'Parent Signup' }} />
              <Stack.Screen
                name="CaregiverSignupPage"
                options={{ headerShown: false, title: 'Caregiver Signup' }}
              />
              <Stack.Screen
                name="kindertagespflegedetail"
                options={{ headerShown: false, title: 'Kindertagespflegeprofil' }}
              />
              <Stack.Screen name="MessengerPage" options={{ headerShown: false, title: 'Nachrichten' }} />
              <Stack.Screen name="ProfilePage" options={{ headerShown: false, title: 'Profil' }} />
            </Stack>
          </View>
          <BottomNavbar />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  content: {
    flex: 1,
  },
});
