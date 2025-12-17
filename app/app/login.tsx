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

import { apiRequest } from '@/services/api-client';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiRequest('api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.subtitle}>Willkommen zurück</Text>
            <Text style={styles.title}>Wimmel Welt Login</Text>
            <Text style={styles.helper}>Melde dich an, um deine Anfragen und Profile zu verwalten.</Text>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Ionicons name="mail" size={16} color="#64748b" />
              <TextInput
                placeholder="E-Mail"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={16} color="#64748b" />
              <TextInput
                placeholder="Passwort"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>
            <View style={styles.helperRow}>
              <Link href="/(tabs)/profile" style={styles.linkText}>
                Passwort vergessen?
              </Link>
              <Link href="/(tabs)/messages" style={styles.linkText}>
                Support kontaktieren
              </Link>
            </View>
          </View>

          {message ? (
            <View style={styles.messageBox}>
              <Ionicons name="information-circle" size={18} color="#0f172a" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleLogin} disabled={loading} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{loading ? 'Wird geprüft …' : 'Anmelden'}</Text>
          </Pressable>

          <View style={styles.footerLinks}>
            <Text style={styles.footerText}>Neu hier?</Text>
            <Link href="/(tabs)/home" style={styles.linkText}>
              Jetzt registrieren
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  content: {
    padding: 18,
    gap: 18,
    paddingBottom: 42,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontWeight: '700',
  },
  helper: {
    color: '#475569',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#b8ccf5',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#0f172a',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#e2f3ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  messageText: {
    color: '#0f172a',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#475569',
  },
});
