import { createNotification } from '../../contexts/NotificationContext';
import type { Employee } from '../../contexts/EmployeeContext';
import {
  getAuthUserLabel,
  getManagerDisplayName,
  getManagerRecipientId,
  type ManagerOption,
  type ReviewUserRef,
  buildManagerOptions,
  FALLBACK_MANAGERS,
  toManagerSlug,
} from '../../utils/managerReview';
import {
  notifyJobSubmittedToBriefedBy,
  resolveLineManagerDisplayName,
  resolveLineManagerRecipient,
  type BriefedByRef,
} from '../../utils/jobLineManager';
import {
  resolveBriefedByForFieldSubmission,
} from './offsiteAssignments';
import type { MobileToolSubmitPayload, MobileWorkforceTool } from './mobileWorkforceTypes';

const STORAGE_KEY = 'offsiteWorkSubmissions';

export type FieldSubmissionStatus = 'pending_review' | 'approved' | 'rejected';

export interface FieldOpsSubmission {
  id: string;
  tool: MobileWorkforceTool;
  summary: string;
  siteId?: string;
  siteName?: string;
  fieldLocationLabel?: string;
  submittedByUserId: string;
  submittedByName: string;
  submittedAt: string;
  assignedManagerId: string;
  assignedManagerName: string;
  briefedByEmail?: string;
  status: FieldSubmissionStatus;
  hasPhoto?: boolean;
  hasSignature?: boolean;
}

export const FIELD_TOOL_LABELS: Record<MobileWorkforceTool, string> = {
  photo: 'Photo capture',
  gps: 'GPS check-in',
  logistics: 'Proof of delivery',
  inspection: 'Field inspection',
  escalate: 'Field escalation',
};

function findEmployeeForUser(employees: Employee[], user?: ReviewUserRef | null): Employee | undefined {
  if (!user) return undefined;
  const label = getAuthUserLabel(user).toLowerCase();
  const email = user.email?.toLowerCase();
  return employees.find(
    (e) =>
      e.id === String(user.id) ||
      e.email?.toLowerCase() === email ||
      e.name.toLowerCase() === label ||
      toManagerSlug(e.name) === getManagerRecipientId(user)
  );
}

/** Line manager = whoever briefed the job; fallback to dept supervisor for legacy flows */
export function resolveFieldOpsLineManager(
  employees: Employee[],
  user?: ReviewUserRef | null,
  siteId?: string
): ManagerOption {
  const briefedBy = resolveBriefedByForFieldSubmission(employees, user, siteId);
  const recipientId = resolveLineManagerRecipient(briefedBy, employees);
  if (recipientId && briefedBy) {
    return {
      id: recipientId,
      name: resolveLineManagerDisplayName(briefedBy, employees),
      role: 'Line manager (briefed job)',
    };
  }

  const managers = buildManagerOptions(employees);
  const submitter = findEmployeeForUser(employees, user);
  if (submitter?.department) {
    const deptSupervisor = managers.find((m) => {
      const emp = employees.find((e) => e.id === m.id || toManagerSlug(e.name) === m.id);
      return (
        emp &&
        emp.department === submitter.department &&
        emp.id !== submitter.id &&
        (/manager|supervisor|lead|director|head/i.test(emp.position) || emp.level === 'lead')
      );
    });
    if (deptSupervisor) return deptSupervisor;
  }

  const lineManager = managers.find((m) => /line manager|supervisor/i.test(m.role));
  if (lineManager) return lineManager;

  return managers[0] ?? FALLBACK_MANAGERS[0];
}

/** @deprecated Use resolveFieldOpsLineManager */
export const resolveFieldOpsSupervisor = resolveFieldOpsLineManager;

export function loadFieldSubmissions(): FieldOpsSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFieldSubmission(record: FieldOpsSubmission): void {
  const existing = loadFieldSubmissions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 100)));
}

export function buildFieldOpsManagerNotification(input: {
  tool: MobileWorkforceTool;
  submitterLabel: string;
  summary: string;
  siteLabel?: string;
}) {
  const toolLabel = FIELD_TOOL_LABELS[input.tool];
  const locationPart = input.siteLabel ? ` · ${input.siteLabel}` : '';
  const priority = input.tool === 'escalate' ? ('urgent' as const) : ('high' as const);

  return {
    ...createNotification.system(
      'Field work awaiting your review',
      `${input.submitterLabel} submitted ${toolLabel}${locationPart}. ${input.summary}`,
      priority
    ),
    actionUrl: '/offsite-work',
    priority,
  };
}

export function buildFieldOpsSubmitterNotification(input: {
  tool: MobileWorkforceTool;
  managerName: string;
  summary: string;
}) {
  const toolLabel = FIELD_TOOL_LABELS[input.tool];
  return createNotification.system(
    'Submitted for line manager review',
    `Your ${toolLabel} was sent to ${input.managerName} (who briefed this job) for review. ${input.summary}`,
    'medium'
  );
}

export function submitFieldWorkForReview(
  payload: MobileToolSubmitPayload,
  employees: Employee[],
  user?: ReviewUserRef | null
): { submission: FieldOpsSubmission; supervisor: ManagerOption; briefedBy?: BriefedByRef } {
  const briefedBy = resolveBriefedByForFieldSubmission(employees, user, payload.siteId);
  const supervisor = resolveFieldOpsLineManager(employees, user, payload.siteId);

  const submitterName = payload.capturedByName ?? getAuthUserLabel(user);
  const submitterId = payload.capturedByUserId ?? getManagerRecipientId(user) ?? 'unknown';
  const siteLabel = payload.siteName ?? payload.fieldLocationLabel;

  const submission: FieldOpsSubmission = {
    id: `field-${payload.tool}-${Date.now()}`,
    tool: payload.tool,
    summary: payload.summary,
    siteId: payload.siteId,
    siteName: payload.siteName,
    fieldLocationLabel: payload.fieldLocationLabel,
    submittedByUserId: submitterId,
    submittedByName: submitterName,
    submittedAt: new Date().toISOString(),
    assignedManagerId: supervisor.id,
    assignedManagerName: getManagerDisplayName(supervisor.id, employees, buildManagerOptions(employees)),
    briefedByEmail: briefedBy?.email,
    status: 'pending_review',
    hasPhoto: Boolean(payload.photoDataUrl),
    hasSignature: Boolean(payload.signatureDataUrl),
  };

  saveFieldSubmission(submission);
  return { submission, supervisor, briefedBy };
}

export function notifyFieldWorkSubmitted(input: {
  payload: MobileToolSubmitPayload;
  employees: Employee[];
  user?: ReviewUserRef | null;
  addNotificationForRecipient: (id: string, n: ReturnType<typeof buildFieldOpsManagerNotification>) => void;
  addNotification: (n: ReturnType<typeof buildFieldOpsSubmitterNotification>) => void;
}): { supervisor: ManagerOption; submitterLabel: string } {
  const { supervisor, briefedBy } = submitFieldWorkForReview(
    input.payload,
    input.employees,
    input.user
  );
  const submitterLabel = input.payload.capturedByName ?? getAuthUserLabel(input.user);
  const siteLabel = input.payload.siteName ?? input.payload.fieldLocationLabel;
  const managerNotification = buildFieldOpsManagerNotification({
    tool: input.payload.tool,
    submitterLabel,
    summary: input.payload.summary,
    siteLabel,
  });

  notifyJobSubmittedToBriefedBy({
    briefedBy: briefedBy ?? { email: undefined, id: supervisor.id, name: supervisor.name },
    submitterEmail: input.user?.email,
    employees: input.employees,
    notification: managerNotification,
    addNotificationForRecipient: input.addNotificationForRecipient,
    addNotification: input.addNotification,
  });

  const submitterNotification = buildFieldOpsSubmitterNotification({
    tool: input.payload.tool,
    managerName: supervisor.name,
    summary: input.payload.summary,
  });

  const submitterRecipient = getManagerRecipientId(input.user ?? undefined);
  if (submitterRecipient) {
    input.addNotificationForRecipient(
      submitterRecipient,
      submitterNotification as ReturnType<typeof buildFieldOpsManagerNotification>
    );
  } else {
    input.addNotification(submitterNotification);
  }

  return { supervisor, submitterLabel };
}
