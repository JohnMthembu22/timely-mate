import type { NotificationItem } from '../contexts/NotificationContext';

const TYPE_ROUTES: Partial<Record<NotificationItem['type'], string>> = {
  message: '/messages',
  task: '/projects',
  calendar: '/calendar',
  timesheet: '/time-tracking',
  procurement: '/procurement',
  hr: '/hr',
  employee: '/team',
  job: '/time-tracking?tab=jobs-to-review',
  meeting: '/meetings',
  freelancer: '/freelancers',
  leave: '/hr',
  team: '/team',
  project: '/projects',
};

/** Resolve client-side route for a notification (no full page reload). */
export function getNotificationRoute(
  notification: Pick<NotificationItem, 'type' | 'actionUrl'>
): string | null {
  if (notification.actionUrl?.startsWith('/')) {
    return notification.actionUrl;
  }
  return TYPE_ROUTES[notification.type] ?? null;
}
