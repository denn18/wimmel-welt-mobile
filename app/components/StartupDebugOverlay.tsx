import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';

import { useStartupConnectionCheck } from '../hooks/use-startup-connection-check';

const stateColors: Record<'pending' | 'ok' | 'error', string> = {
  pending: '#fbbf24',
  ok: '#22c55e',
  error: '#ef4444',
};

type StatusRowProps = {
  label: string;
  status: 'pending' | 'ok' | 'error';
  message: string;
};

function StatusRow({ label, status, message }: StatusRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <MaterialIcons
          name={status === 'ok' ? 'check-circle' : status === 'error' ? 'error' : 'hourglass-bottom'}
          size={20}
          color={stateColors[status]}
        />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowMessage, { color: stateColors[status] }]}>{message}</Text>
    </View>
  );
}

export function StartupDebugOverlay({ children }: { children: React.ReactNode }) {
  const { statuses, isReady, isRunning, retry } = useStartupConnectionCheck();

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>Verbindungs-Check</Text>
        <Text style={styles.subtitle}>
          Starte Verbindung zum Server und zur MongoDB. Dieser Bildschirm verschwindet, sobald beide erfolgreich sind.
        </Text>

        <View style={styles.rows}>
          <StatusRow
            label="Server"
            status={statuses.server.status}
            message={`${statuses.server.message}${
              statuses.server.durationMs ? ` (${statuses.server.durationMs}ms)` : ''
            }`}
          />
          <StatusRow
            label="MongoDB"
            status={statuses.database.status}
            message={`${statuses.database.message}${
              statuses.database.durationMs ? ` (${statuses.database.durationMs}ms)` : ''
            }`}
          />
        </View>

        {isRunning ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#22c55e" />
            <Text style={styles.loadingText}>Prüfung läuft…</Text>
          </View>
        ) : statuses.server.status === 'error' || statuses.database.status === 'error' ? (
          <Pressable style={styles.retryButton} onPress={retry}>
            <MaterialIcons name="refresh" size={18} color="#0f172a" />
            <Text style={styles.retryText}>Erneut versuchen</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0b1224',
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 18,
  },
  rows: {
    gap: 12,
  },
  row: {
    paddingVertical: 4,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 16,
  },
  rowMessage: {
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#cbd5e1',
  },
  retryButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
