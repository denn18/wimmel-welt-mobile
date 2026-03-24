import { Platform } from 'react-native';

import { apiRequest } from './api-client';

type PushRegistrationPayload = {
  userId: string;
  role?: string | null;
  expoPushToken: string;
  platform: string;
};

type RegisterPushArgs = {
  userId?: string | number | null;
  role?: string | null;
};

let configured = false;

type ExpoNotificationsModule = {
  AndroidImportance?: { MAX: number };
  setNotificationHandler?: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner?: boolean;
      shouldShowList?: boolean;
    }>;
  }) => void;
  setNotificationChannelAsync?: (channelId: string, channel: { name: string; importance: number; vibrationPattern?: number[] }) => Promise<void>;
  getPermissionsAsync?: () => Promise<{ status?: string }>;
  requestPermissionsAsync?: () => Promise<{ status?: string }>;
  getExpoPushTokenAsync?: (options?: { projectId?: string }) => Promise<{ data: string }>;
};

function loadExpoNotificationsModule(): ExpoNotificationsModule | null {
  try {
    return require('expo-notifications') as ExpoNotificationsModule;
  } catch {
    return null;
  }
}

function getProjectId() {
  try {
    const Constants = require('expo-constants').default as {
      easConfig?: { projectId?: string };
      expoConfig?: { extra?: { eas?: { projectId?: string } } };
    };

    return Constants?.easConfig?.projectId ?? Constants?.expoConfig?.extra?.eas?.projectId ?? undefined;
  } catch {
    return undefined;
  }
}

function configureNotificationBehavior(notifications: ExpoNotificationsModule) {
  if (configured) return;
  configured = true;

  notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function sendPushRegistration(payload: PushRegistrationPayload) {
  await apiRequest('api/push-tokens', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function deletePushRegistration(userId: string, expoPushToken: string) {
  await apiRequest(`api/push-tokens/${encodeURIComponent(userId)}?token=${encodeURIComponent(expoPushToken)}`, {
    method: 'DELETE',
  });
}

export async function registerDeviceForPush({ userId, role }: RegisterPushArgs) {
  if (!userId || Platform.OS === 'web') return null;

  const notifications = loadExpoNotificationsModule();
  if (!notifications) {
    return null;
  }

  configureNotificationBehavior(notifications);

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync?.('default', {
      name: 'default',
      importance: notifications.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const permission = await notifications.getPermissionsAsync?.();
  const permissionStatus = permission?.status ?? 'undetermined';

  let finalStatus = permissionStatus;
  if (permissionStatus !== 'granted') {
    const requested = await notifications.requestPermissionsAsync?.();
    finalStatus = requested?.status ?? permissionStatus;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getProjectId();
  const pushTokenResult = await notifications.getExpoPushTokenAsync?.(projectId ? { projectId } : undefined);
  const expoPushToken = pushTokenResult?.data;

  if (!expoPushToken) {
    return null;
  }

  await sendPushRegistration({
    userId: String(userId),
    role,
    expoPushToken,
    platform: Platform.OS,
  });

  return expoPushToken;
}

export async function unregisterDeviceForPush(userId?: string | number | null, expoPushToken?: string | null) {
  if (!userId || !expoPushToken) return;

  try {
    await deletePushRegistration(String(userId), expoPushToken);
  } catch {
    // noop: fehlende Registrierung soll den Logout nicht blockieren
  }
}

