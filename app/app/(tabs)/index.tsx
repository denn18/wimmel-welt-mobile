import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { environment } from '@/config/environment';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Prüfe die Backend-Anbindung</ThemedText>
        <ThemedText>
          Aktuelle Umgebung: <ThemedText type="defaultSemiBold">{environment.name}</ThemedText>
        </ThemedText>
        <ThemedText>API-URL: {environment.apiUrl}</ThemedText>
        <ThemedText>OTLP-Endpoint: {environment.otlpEndpoint}</ThemedText>
        <ThemedText>Log-Endpoint: {environment.logEndpoint}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Backend-Requests nutzen</ThemedText>
        <ThemedText>
          Lege API-Calls über einen zentralen Client an (siehe <ThemedText type="defaultSemiBold">
            services/api-client.ts
          </ThemedText>). Diese Datei nutzt die oben konfigurierten URLs.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Nächste Schritte</ThemedText>
        <ThemedText>
          Hinterlege deine <ThemedText type="defaultSemiBold">.env</ThemedText> basierend auf
          <ThemedText type="defaultSemiBold"> .env.example</ThemedText>, um Staging/Prod-Targets zu setzen.
          Anschließend kannst du die ersten Screens mit echten Backend-Endpunkten füllen.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
