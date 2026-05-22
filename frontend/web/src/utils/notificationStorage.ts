import type { NotificationItem } from '../contexts/NotificationContext';

export const MAX_STORED_NOTIFICATIONS = 100;

export type StoredNotification = Omit<NotificationItem, 'icon'>;

export function sanitizeNotifications(items: NotificationItem[]): StoredNotification[] {
  return items.slice(0, MAX_STORED_NOTIFICATIONS).map(
    ({ icon: _icon, ...rest }) => rest
  );
}

export function normalizeLoadedNotifications(raw: unknown): NotificationItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((n): n is NotificationItem => n && typeof n === 'object' && typeof n.id === 'number')
    .slice(0, MAX_STORED_NOTIFICATIONS)
    .map((n, index) => ({
      ...n,
      createdAt: typeof n.createdAt === 'number' ? n.createdAt : n.id * 1000 + index,
    }));
}

export function compareNotifications(
  a: Pick<NotificationItem, 'createdAt' | 'id'>,
  b: Pick<NotificationItem, 'createdAt' | 'id'>,
  order: 'newest' | 'oldest'
): number {
  const diff = (a.createdAt ?? a.id) - (b.createdAt ?? b.id);
  return order === 'newest' ? -diff : diff;
}
