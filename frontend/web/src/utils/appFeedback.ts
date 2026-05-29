import type { NotificationItem } from '../contexts/NotificationContext';

type NotifyFn = (
  notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>
) => void;

/** User-visible message when a feature needs backend/API wiring. */
export function notifyIntegrationRequired(
  notify: NotifyFn,
  feature: string,
  detail?: string
): void {
  notify({
    type: 'system',
    title: `${feature} — integration required`,
    description:
      detail ??
      'This action is saved locally where supported. Connect your API or enable Supabase to sync with the server.',
    priority: 'medium',
  });
}

export function notifyActionSuccess(notify: NotifyFn, title: string, description?: string): void {
  notify({
    type: 'system',
    title,
    description: description ?? '',
    priority: 'low',
  });
}

export function notifyActionError(notify: NotifyFn, title: string, description?: string): void {
  notify({
    type: 'system',
    title,
    description: description ?? 'Something went wrong. Please try again.',
    priority: 'high',
  });
}
