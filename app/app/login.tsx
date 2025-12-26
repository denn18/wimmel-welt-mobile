import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '../services/api-client';
import { BottomNavbar } from '../components/BottomNavbar';

const BRAND = 'rgb(49,66,154)';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setMessage('Bitte Benutzername/E-Mail und Passwort eingeben.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiRequest('api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      setMessage('Login erfolgreich. Du wirst weitergeleitet …');
      setTimeout(() => router.replace('/(tabs)/dashboard'), 600);
    } catch (err) {
      console.error('Login failed', err);
      setMessage('Login nicht möglich. Bitte Zugangsdaten prüfen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrapper}>
            <Text style={styles.logo}>Wimmel Welt</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Willkommen zurück</Text>
              <Text style={styles.subtitle}>Melde dich mit deiner E-Mail-Adresse oder deinem Benutzernamen an.</Text>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Benutzername oder E-Mail</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person" size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Dein Nutzername oder E-Mail"
                  placeholderTextColor="#cbd5e1"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Passwort eingeben"
                  placeholderTextColor="#cbd5e1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            {message ? (
              <View style={styles.messageBox}>
                <Ionicons name="information-circle" size={18} color={BRAND} />
                <Text style={styles.messageText}>{message}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleLogin} disabled={loading} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{loading ? 'Wird geprüft …' : 'Einloggen'}</Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.helperText}>Neu bei Wimmel Welt?</Text>
              <Link href="/anmelden" style={styles.highlightText}>
                Jetzt kostenlos registrieren!
              </Link>
            </View>
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerNote}>© 2025 Wimmel Welt. Alle Rechte vorbehalten.</Text>
            <View style={styles.footerRow}>
              <Link href="/datenschutz" style={styles.footerLink}>
                Datenschutz
              </Link>
              <Text style={styles.footerDivider}>·</Text>
              <Link href="/impressum" style={styles.footerLink}>
                Impressum
              </Link>
              <Text style={styles.footerDivider}>·</Text>
              <Link href="/kontakt" style={styles.footerLink}>
                Kontakt
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 18,
    paddingBottom: 170,
    alignItems: 'center',
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: BRAND,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    gap: 16,
    shadowColor: '#c6d6ff',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e6edff',
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: BRAND,
  },
  subtitle: {
    color: '#475569',
    lineHeight: 20,
  },
  inputBlock: {
    gap: 8,
  },
  label: {
    color: '#475569',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d8e0ef',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fdfefe',
  },
  input: {
    flex: 1,
    color: '#0f172a',
  },
  messageBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#e8f0ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd9ff',
    alignItems: 'center',
  },
  messageText: {
    color: '#0f172a',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    color: '#475569',
  },
  highlightText: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  footerLinks: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  footerNote: {
    color: '#475569',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  footerLink: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 12,
  },
  footerDivider: {
    color: '#94a3b8',
  },
});
