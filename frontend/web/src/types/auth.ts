export type UserRole = 'admin' | 'team_leader' | 'employee';

export type Department =
  | 'executive'
  | 'hr'
  | 'finance'
  | 'marketing'
  | 'sales'
  | 'engineering'
  | 'design'
  | 'operations'
  | 'customer_success'
  | 'legal'
  | 'it'
  | 'other';

export interface UserPermissions {
  canAccessDashboard: boolean;
  canAccessCalendar: boolean;
  canAccessMeetings: boolean;
  canCreateMeetings: boolean;
  canAccessMessages: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canViewAllTasks: boolean;
  canManageTeam: boolean;
  canAccessReports: boolean;
  canModifySettings: boolean;
  canManageUsers: boolean;
  canAccessHR: boolean;
  canAccessFinance: boolean;
  canAccessProjects: boolean;
  canCreateProjects: boolean;
  canAccessTimeTracking: boolean;
  canAccessFieldOps: boolean;
  canAccessIncidentReports: boolean;
  canAccessExpenses: boolean;
  canAccessProcurement: boolean;
  canAccessLearning: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  department: Department;
  permissions: UserPermissions;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/** Managers and admins — full product access */
export const MANAGER_PERMISSIONS: UserPermissions = {
  canAccessDashboard: true,
  canAccessCalendar: true,
  canAccessMeetings: true,
  canCreateMeetings: true,
  canAccessMessages: true,
  canCreateTasks: true,
  canEditTasks: true,
  canDeleteTasks: true,
  canAssignTasks: true,
  canViewAllTasks: true,
  canManageTeam: true,
  canAccessReports: true,
  canModifySettings: true,
  canManageUsers: true,
  canAccessHR: true,
  canAccessFinance: true,
  canAccessProjects: true,
  canCreateProjects: true,
  canAccessTimeTracking: true,
  canAccessFieldOps: true,
  canAccessIncidentReports: true,
  canAccessExpenses: true,
  canAccessProcurement: true,
  canAccessLearning: true,
};

type PermissionOptions = {
  isFieldWorker?: boolean;
};

export const isManagerRole = (role: UserRole, department: Department): boolean =>
  role === 'admin' || role === 'team_leader' || department === 'executive';

/** Default permissions for standard employees (limited nav + no create/assign on projects/jobs) */
export const getEmployeePermissions = (options: PermissionOptions = {}): UserPermissions => ({
  canAccessDashboard: true,
  canAccessCalendar: true,
  canAccessMeetings: true,
  canCreateMeetings: true,
  canAccessMessages: true,
  canAccessTimeTracking: true,
  canAccessProjects: true,
  canCreateProjects: false,
  canCreateTasks: false,
  canEditTasks: false,
  canDeleteTasks: false,
  canAssignTasks: false,
  canViewAllTasks: false,
  canManageTeam: false,
  canAccessReports: false,
  canModifySettings: false,
  canManageUsers: false,
  canAccessHR: false,
  canAccessFinance: false,
  canAccessExpenses: false,
  canAccessProcurement: false,
  canAccessLearning: true,
  canAccessFieldOps: Boolean(options.isFieldWorker),
  canAccessIncidentReports: Boolean(options.isFieldWorker),
});

export const getDefaultPermissions = (
  role: UserRole,
  department: Department,
  options: PermissionOptions = {}
): UserPermissions => {
  if (isManagerRole(role, department)) {
    return { ...MANAGER_PERMISSIONS };
  }
  return getEmployeePermissions(options);
};

/** @deprecated Department boosts apply only to managers; employees use strict employee permissions */
export const getDepartmentPermissions = (_department: Department): Partial<UserPermissions> => ({});

export const getUserPermissions = (
  role: UserRole,
  department: Department,
  options: PermissionOptions = {}
): UserPermissions => getDefaultPermissions(role, department, options);
