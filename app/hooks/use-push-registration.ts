import { useEffect, useRef } from 'react';

import type { AuthUser } from '../types/auth';
import { registerDeviceForPush, unregisterDeviceForPush } from '../services/push-notifications';

export function usePushRegistration(user: AuthUser | null) {
  const registeredTokenRef = useRef<string | null>(null);
  const registeredUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ? String(user.id) : null;

    if (!currentUserId) {
      void unregisterDeviceForPush(registeredUserIdRef.current, registeredTokenRef.current);
      registeredTokenRef.current = null;
      registeredUserIdRef.current = null;
      return;
    }

    let active = true;

    void (async () => {
      try {
        const token = await registerDeviceForPush({
          userId: currentUserId,
          role: typeof user?.role === 'string' ? user.role : null,
        });

        if (!active) return;

        registeredUserIdRef.current = currentUserId;
        registeredTokenRef.current = token;
      } catch {
        if (!active) return;
        registeredUserIdRef.current = currentUserId;
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);
}

