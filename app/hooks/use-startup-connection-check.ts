import { useCallback, useEffect, useState } from 'react';

import { checkMongoConnection, checkServerConnection, ConnectionCheckResult } from '../services/connections';

type ConnectionState = {
  status: 'pending' | 'ok' | 'error';
  message: string;
  durationMs?: number;
};

type ConnectionStatuses = {
  server: ConnectionState;
  database: ConnectionState;
};

const initialState: ConnectionStatuses = {
  server: { status: 'pending', message: 'Verbindung zum Server wird geprüft…' },
  database: { status: 'pending', message: 'Warte auf Server-Status…' },
};

function toState(result: ConnectionCheckResult): ConnectionState {
  return {
    status: result.status === 'ok' ? 'ok' : 'error',
    message: result.message,
    durationMs: result.durationMs,
  };
}

export function useStartupConnectionCheck() {
  const [statuses, setStatuses] = useState<ConnectionStatuses>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runChecks = useCallback(async () => {
    setIsReady(false);
    setStatuses(initialState);
    setIsRunning(true);

    const serverResult = await checkServerConnection();
    setStatuses((prev) => ({ ...prev, server: toState(serverResult) }));

    if (serverResult.status !== 'ok') {
      setIsRunning(false);
      return;
    }

    const mongoResult = await checkMongoConnection();
    setStatuses((prev) => ({ ...prev, database: toState(mongoResult) }));

    setIsReady(serverResult.status === 'ok' && mongoResult.status === 'ok');
    setIsRunning(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return {
    statuses,
    isReady,
    isRunning,
    retry: runChecks,
  };
}
