import type { Employee } from '../contexts/EmployeeContext';
import {
  getAuthUserLabel,
  getManagerDisplayName,
  toManagerSlug,
  type ReviewUserRef,
} from './managerReview';
import { recipientIdFromEmail } from './taskReview';

/** Person who briefed / assigned the job — receives completion and review notifications */
export interface BriefedByRef {
  email?: string;
  id?: string;
  name?: string;
}

export function briefedByFromUser(user?: ReviewUserRef | null): BriefedByRef {
  if (!user) return {};
  return {
    email: user.email,
    id: user.id !== undefined && user.id !== null ? String(user.id) : undefined,
    name: getAuthUserLabel(user),
  };
}

/** Stable notification recipient for whoever briefed the job */
export function resolveLineManagerRecipient(
  briefedBy: BriefedByRef | undefined | null,
  employees: Employee[] = []
): string | null {
  if (!briefedBy) return null;

  if (briefedBy.email?.trim()) {
    return recipientIdFromEmail(briefedBy.email.trim());
  }

  if (briefedBy.id) {
    const emp = employees.find((e) => e.id === briefedBy.id);
    if (emp?.email) return recipientIdFromEmail(emp.email);
    return briefedBy.id;
  }

  if (briefedBy.name?.trim()) {
    const slug = toManagerSlug(briefedBy.name);
    return slug || null;
  }

  return null;
}

export function resolveLineManagerDisplayName(
  briefedBy: BriefedByRef | undefined | null,
  employees: Employee[] = []
): string {
  if (!briefedBy) return 'Line manager';
  if (briefedBy.name?.trim()) return briefedBy.name.trim();
  if (briefedBy.email) {
    const emp = employees.find((e) => e.email?.toLowerCase() === briefedBy.email?.toLowerCase());
    if (emp) return emp.name;
    const local = briefedBy.email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Manager';
    return local.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (briefedBy.id) {
    return getManagerDisplayName(briefedBy.id, employees);
  }
  return 'Line manager';
}

/** Skip self-notification when submitter is the same person who briefed the job */
export function shouldNotifyBriefedBy(
  briefedBy: BriefedByRef | undefined | null,
  submitterEmail?: string | null
): boolean {
  if (!briefedBy) return false;
  if (!submitterEmail) return true;
  const briefedEmail = briefedBy.email?.trim().toLowerCase();
  if (briefedEmail && briefedEmail === submitterEmail.trim().toLowerCase()) return false;
  return true;
}

export interface NotifyBriefedByInput {
  briefedBy: BriefedByRef | undefined | null;
  submitterEmail?: string | null;
  employees?: Employee[];
  notification: { title: string; message: string; type?: string; actionUrl?: string; priority?: string };
  addNotificationForRecipient: (recipientId: string, notification: unknown) => void;
  addNotification: (notification: unknown) => void;
}

/** Route completion / review to whoever briefed the job; fallback to current user inbox */
export function notifyJobSubmittedToBriefedBy(input: NotifyBriefedByInput): {
  recipientId: string | null;
  managerName: string;
} {
  const { briefedBy, submitterEmail, employees = [], notification, addNotificationForRecipient, addNotification } =
    input;

  const managerName = resolveLineManagerDisplayName(briefedBy, employees);
  const recipientId = resolveLineManagerRecipient(briefedBy, employees);

  if (recipientId && shouldNotifyBriefedBy(briefedBy, submitterEmail)) {
    addNotificationForRecipient(recipientId, notification);
    return { recipientId, managerName };
  }

  addNotification(notification);
  return { recipientId: null, managerName };
}
