import type { Employee } from '../contexts/EmployeeContext';

export interface ManagerOption {
  id: string;
  name: string;
  role: string;
}

export type ReviewUserRef = {
  id?: number | string;
  fullName?: string;
  name?: string;
  email?: string;
};

/** Stable id for routing review assignments and notifications */
export const toManagerSlug = (nameOrId?: string | null): string => {
  if (nameOrId == null || typeof nameOrId !== 'string') return '';
  const value = nameOrId.trim();
  if (!value) return '';

  if (!value.includes(' ') && /^[a-z0-9-]+$/i.test(value)) {
    return value.toLowerCase();
  }
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/** Display label for auth users (may not have fullName) */
export const getAuthUserLabel = (user?: ReviewUserRef | null): string => {
  if (!user) return 'Team member';
  const fromName = user.fullName?.trim() || user.name?.trim();
  if (fromName) return fromName;
  if (user.email) {
    const local = user.email.split('@')[0]?.trim();
    if (local) {
      return local
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return user.email;
  }
  return 'Team member';
};

export const getManagerRecipientId = (user?: ReviewUserRef | null): string => {
  if (!user) return '';

  const slug = toManagerSlug(getAuthUserLabel(user));
  if (slug && slug !== 'team-member') return slug;

  if (user.id !== undefined && user.id !== null && String(user.id).length > 0) {
    return String(user.id);
  }

  if (user.email) {
    const emailSlug = toManagerSlug(user.email.split('@')[0]);
    if (emailSlug) return emailSlug;
    return user.email.toLowerCase();
  }

  return '';
};

export const FALLBACK_MANAGERS: ManagerOption[] = [
  { id: 'sarah-johnson', name: 'Sarah Johnson', role: 'Line Manager' },
  { id: 'mike-chen', name: 'Mike Chen', role: 'Traffic Manager' },
  { id: 'emma-wilson', name: 'Emma Wilson', role: 'Line Manager' },
  { id: 'david-brown', name: 'David Brown', role: 'Traffic Manager' },
  { id: 'lisa-garcia', name: 'Lisa Garcia', role: 'Line Manager' },
];

export const buildManagerOptions = (employees: Employee[]): ManagerOption[] => {
  const fromEmployees = employees
    .filter(
      (e) =>
        e.status === 'active' &&
        (/manager|lead|director|head/i.test(e.position) || e.level === 'lead')
    )
    .map((e) => ({
      id: e.id || toManagerSlug(e.name),
      name: e.name,
      role: e.position,
    }));

  if (fromEmployees.length > 0) {
    const seen = new Set<string>();
    return fromEmployees.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  return FALLBACK_MANAGERS;
};

export const getManagerDisplayName = (
  managerId: string | undefined,
  employees: Employee[],
  managers: ManagerOption[] = FALLBACK_MANAGERS
): string => {
  if (!managerId) return 'Unassigned';
  const emp = employees.find((e) => e.id === managerId || toManagerSlug(e.name) === managerId);
  if (emp) return emp.name;
  const mgr = managers.find((m) => m.id === managerId);
  if (mgr) return mgr.name;
  return managerId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const managerMatchesUser = (
  assignedManager: string | undefined,
  user: ReviewUserRef | null,
  employees: Employee[] = []
): boolean => {
  if (!assignedManager || !user) return false;

  const userSlug = getManagerRecipientId(user);
  if (userSlug && (assignedManager === userSlug || assignedManager === String(user.id))) {
    return true;
  }

  const normalizedAssigned = assignedManager.toLowerCase();
  const displayName = getAuthUserLabel(user).toLowerCase();
  if (displayName !== 'team member' && displayName === normalizedAssigned) return true;
  if (user.email?.toLowerCase() === normalizedAssigned) return true;

  const employeeMatch = employees.find(
    (e) =>
      e.id === assignedManager ||
      toManagerSlug(e.name) === assignedManager ||
      e.name.toLowerCase() === normalizedAssigned
  );
  if (employeeMatch && employeeMatch.name.toLowerCase() === displayName) {
    return true;
  }

  return false;
};
