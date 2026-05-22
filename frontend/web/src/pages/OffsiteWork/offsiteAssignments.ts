import type { BriefedByRef } from '../../utils/jobLineManager';
import { briefedByFromUser, resolveLineManagerRecipient } from '../../utils/jobLineManager';
import type { ReviewUserRef } from '../../utils/managerReview';
import type { Employee } from '../../contexts/EmployeeContext';

const STORAGE_KEY = 'offsiteWorkAssignments';

export type OffsiteAssignmentStatus = 'assigned' | 'in_progress' | 'pending_review' | 'completed';

export interface OffsiteFieldAssignment {
  id: string;
  title: string;
  description?: string;
  siteId?: string;
  siteName?: string;
  assigneeIds: string[];
  assigneeNames: string[];
  assigneeEmails: string[];
  briefedBy: BriefedByRef;
  status: OffsiteAssignmentStatus;
  createdAt: string;
  dueDate?: string;
}

export function loadOffsiteAssignments(): OffsiteFieldAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOffsiteAssignments(list: OffsiteFieldAssignment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
}

export function createOffsiteAssignment(input: {
  title: string;
  description?: string;
  siteId?: string;
  siteName?: string;
  assigneeIds: string[];
  employees: Employee[];
  briefedByUser?: ReviewUserRef | null;
  dueDate?: string;
}): OffsiteFieldAssignment {
  const assignees = input.assigneeIds
    .map((id) => input.employees.find((e) => e.id === id))
    .filter((e): e is Employee => Boolean(e));

  const assignment: OffsiteFieldAssignment = {
    id: `offsite-assign-${Date.now()}`,
    title: input.title.trim(),
    description: input.description?.trim(),
    siteId: input.siteId,
    siteName: input.siteName,
    assigneeIds: assignees.map((e) => e.id),
    assigneeNames: assignees.map((e) => e.name),
    assigneeEmails: assignees.map((e) => e.email).filter((e): e is string => Boolean(e)),
    briefedBy: briefedByFromUser(input.briefedByUser),
    status: 'assigned',
    createdAt: new Date().toISOString(),
    dueDate: input.dueDate,
  };

  const existing = loadOffsiteAssignments();
  saveOffsiteAssignments([assignment, ...existing]);
  return assignment;
}

export function findAssignmentForFieldWork(input: {
  siteId?: string;
  submitterEmail?: string;
  submitterId?: string;
}): OffsiteFieldAssignment | undefined {
  const list = loadOffsiteAssignments().filter((a) => a.status !== 'completed');
  if (input.siteId) {
    const bySite = list.find((a) => a.siteId === input.siteId);
    if (bySite) return bySite;
  }
  if (input.submitterEmail) {
    const email = input.submitterEmail.toLowerCase();
    return list.find((a) => a.assigneeEmails.some((e) => e.toLowerCase() === email));
  }
  if (input.submitterId) {
    return list.find((a) => a.assigneeIds.includes(input.submitterId));
  }
  return undefined;
}

export function resolveBriefedByForFieldSubmission(
  employees: Employee[],
  user?: ReviewUserRef | null,
  siteId?: string
): BriefedByRef | undefined {
  const submitterEmail = user?.email;
  const submitterId = user?.id != null ? String(user.id) : undefined;
  const assignment = findAssignmentForFieldWork({ siteId, submitterEmail, submitterId });
  if (assignment?.briefedBy) return assignment.briefedBy;
  return undefined;
}

export function getBriefedByRecipientId(
  briefedBy: BriefedByRef | undefined,
  employees: Employee[]
): string | null {
  return resolveLineManagerRecipient(briefedBy, employees);
}
