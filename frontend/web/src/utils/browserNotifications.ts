export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/** Only prompts when permission is still `default`. Never re-prompts after deny/block. */
export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  const current = getBrowserNotificationPermission();
  if (current !== 'default') {
    return current;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return getBrowserNotificationPermission();
  }
}

export function canShowBrowserNotifications(): boolean {
  return getBrowserNotificationPermission() === 'granted';
}

export function showBrowserNotification(title: string, body: string): void {
  if (!canShowBrowserNotifications()) return;
  new Notification(title, { body });
}
