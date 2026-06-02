import { useMemo } from 'react';
import { useAppSelector } from '../store';
import {
  UserPermissions,
  getUserPermissions,
  isManagerRole,
  MANAGER_PERMISSIONS,
  UserRole,
  Department,
} from '../types/auth';
import { useFieldWorkerAccess } from './useFieldWorkerAccess';
import { TESTING_MODE_UNLOCK_ALL } from '../config/testingMode';

interface UsePermissionsReturn {
  permissions: UserPermissions | null;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canAccessDashboard: () => boolean;
  canAccessCalendar: () => boolean;
  canAccessMeetings: () => boolean;
  canCreateMeetings: () => boolean;
  canAccessMessages: () => boolean;
  canCreateTasks: () => boolean;
  canEditTasks: () => boolean;
  canDeleteTasks: () => boolean;
  canAssignTasks: () => boolean;
  canViewAllTasks: () => boolean;
  canManageTeam: () => boolean;
  canAccessReports: () => boolean;
  canModifySettings: () => boolean;
  canManageUsers: () => boolean;
  canManageBilling: () => boolean;
  canAccessHR: () => boolean;
  canAccessFinance: () => boolean;
  canAccessProjects: () => boolean;
  canCreateProjects: () => boolean;
  canAccessTimeTracking: () => boolean;
  canAccessFieldOps: () => boolean;
  canAccessIncidentReports: () => boolean;
  canAccessExpenses: () => boolean;
  canAccessProcurement: () => boolean;
  canAccessLearning: () => boolean;
  isAdmin: () => boolean;
  isTeamLeader: () => boolean;
  isEmployee: () => boolean;
  isManager: () => boolean;
  isHR: () => boolean;
  isFinance: () => boolean;
  isEngineering: () => boolean;
  isOperations: () => boolean;
  isExecutive: () => boolean;
  isFieldWorker: () => boolean;
  userRole: string | null;
  userDepartment: string | null;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAppSelector((state) => state.auth);
  const isFieldWorker = useFieldWorkerAccess();

  const userRole = ((user?.role as UserRole) || 'employee') as UserRole;
  const userDepartment = ((user?.department as Department) || 'other') as Department;
  const manager = isManagerRole(userRole, userDepartment);

  const permissions = useMemo(() => {
    if (!user) return getUserPermissions('employee', 'other');
    if (manager) return { ...MANAGER_PERMISSIONS };
    return getUserPermissions(userRole, userDepartment, { isFieldWorker });
  }, [user, userRole, userDepartment, manager, isFieldWorker]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (TESTING_MODE_UNLOCK_ALL) return true;
    if (manager) return true;
    return permissions[permission] === true;
  };

  return {
    permissions,
    hasPermission,
    canAccessDashboard: () => hasPermission('canAccessDashboard'),
    canAccessCalendar: () => hasPermission('canAccessCalendar'),
    canAccessMeetings: () => hasPermission('canAccessMeetings'),
    canCreateMeetings: () => hasPermission('canCreateMeetings'),
    canAccessMessages: () => hasPermission('canAccessMessages'),
    canCreateTasks: () => hasPermission('canCreateTasks'),
    canEditTasks: () => hasPermission('canEditTasks'),
    canDeleteTasks: () => hasPermission('canDeleteTasks'),
    canAssignTasks: () => hasPermission('canAssignTasks'),
    canViewAllTasks: () => hasPermission('canViewAllTasks'),
    canManageTeam: () => hasPermission('canManageTeam'),
    canAccessReports: () => hasPermission('canAccessReports'),
    canModifySettings: () => hasPermission('canModifySettings'),
    canManageUsers: () => hasPermission('canManageUsers'),
    canManageBilling: () => manager,
    canAccessHR: () => hasPermission('canAccessHR'),
    canAccessFinance: () => hasPermission('canAccessFinance'),
    canAccessProjects: () => hasPermission('canAccessProjects'),
    canCreateProjects: () => hasPermission('canCreateProjects'),
    canAccessTimeTracking: () => hasPermission('canAccessTimeTracking'),
    canAccessFieldOps: () => hasPermission('canAccessFieldOps'),
    canAccessIncidentReports: () => hasPermission('canAccessIncidentReports'),
    canAccessExpenses: () => hasPermission('canAccessExpenses'),
    canAccessProcurement: () => hasPermission('canAccessProcurement'),
    canAccessLearning: () => hasPermission('canAccessLearning'),
    isAdmin: () => userRole === 'admin',
    isTeamLeader: () => userRole === 'team_leader',
    isEmployee: () => userRole === 'employee',
    isManager: () => manager,
    isHR: () => userDepartment === 'hr',
    isFinance: () => userDepartment === 'finance',
    isEngineering: () => userDepartment === 'engineering',
    isOperations: () => userDepartment === 'operations',
    isExecutive: () => userDepartment === 'executive',
    isFieldWorker: () => isFieldWorker,
    userRole,
    userDepartment,
  };
};

export default usePermissions;
