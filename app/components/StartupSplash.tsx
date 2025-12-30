import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

const BRAND = 'rgb(49,66,154)';

export function StartupSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <Image source={require('../assets/images/splash-icon.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Wimmel Welt</Text>
      <Text style={styles.subtitle}>Wir bereiten deine App vor …</Text>
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND,
    padding: 24,
    gap: 10,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: { width: 96, height: 96 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  subtitle: { color: '#e0e7ff', fontWeight: '700', textAlign: 'center' },
});
