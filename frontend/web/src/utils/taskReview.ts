import { createNotification } from '../contexts/NotificationContext';
import type { Employee } from '../contexts/EmployeeContext';
import {
  notifyJobSubmittedToBriefedBy,
  type BriefedByRef,
} from './jobLineManager';
import { toManagerSlug } from './managerReview';

export type ReviewableTaskStatus = 'todo' | 'in_progress' | 'completed' | 'pending_review';

/** Notification recipient key — matches email-based routing used elsewhere */
export function recipientIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const slug = toManagerSlug(normalized.split('@')[0]);
  return slug || normalized;
}

export interface TaskReviewNotificationInput {
  taskTitle: string;
  submitterLabel: string;
  assignerEmail: string;
  actionUrl?: string;
}

export function buildTaskReviewNotification(input: TaskReviewNotificationInput) {
  return {
    ...createNotification.task(
      'Task submitted for your review',
      `${input.submitterLabel} marked "${input.taskTitle}" complete and sent it to you for review.`
    ),
    ...(input.actionUrl ? { actionUrl: input.actionUrl } : {}),
    priority: 'high' as const,
  };
}

/** Notify whoever briefed the job (createdBy / assignedBy email) — used app-wide on completion */
export function notifyTaskSubmittedToBriefedBy(input: {
  briefedByEmail?: string;
  briefedByName?: string;
  taskTitle: string;
  submitterLabel: string;
  submitterEmail?: string | null;
  actionUrl?: string;
  employees?: Employee[];
  addNotificationForRecipient: (recipientId: string, notification: ReturnType<typeof buildTaskReviewNotification>) => void;
  addNotification: (notification: ReturnType<typeof buildTaskReviewNotification>) => void;
}): { managerName: string } {
  const briefedBy: BriefedByRef = {
    email: input.briefedByEmail,
    name: input.briefedByName,
  };
  const notification = buildTaskReviewNotification({
    taskTitle: input.taskTitle,
    submitterLabel: input.submitterLabel,
    assignerEmail: input.briefedByEmail ?? '',
    actionUrl: input.actionUrl,
  });

  const { managerName } = notifyJobSubmittedToBriefedBy({
    briefedBy,
    submitterEmail: input.submitterEmail,
    employees: input.employees,
    notification,
    addNotificationForRecipient: input.addNotificationForRecipient,
    addNotification: input.addNotification,
  });

  return { managerName };
}
