import { useAppSelector } from '../store';
import { UserPermissions, getDefaultPermissions, UserRole, Department } from '../types/auth';

interface UsePermissionsReturn {
  permissions: UserPermissions | null;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canCreateTasks: () => boolean;
  canEditTasks: () => boolean;
  canDeleteTasks: () => boolean;
  canAssignTasks: () => boolean;
  canViewAllTasks: () => boolean;
  canManageTeam: () => boolean;
  canAccessReports: () => boolean;
  canModifySettings: () => boolean;
  canManageUsers: () => boolean;
  canAccessHR: () => boolean;
  canAccessFinance: () => boolean;
  canAccessProjects: () => boolean;
  canAccessTimeTracking: () => boolean;
  canAccessExpenses: () => boolean;
  canAccessProcurement: () => boolean;
  canAccessLearning: () => boolean;
  isAdmin: () => boolean;
  isTeamLeader: () => boolean;
  isEmployee: () => boolean;
  isHR: () => boolean;
  isFinance: () => boolean;
  isEngineering: () => boolean;
  isOperations: () => boolean;
  isExecutive: () => boolean;
  userRole: string | null;
  userDepartment: string | null;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAppSelector((state) => state.auth);

  // If user is not loaded, return default permissions to prevent navigation from disappearing
  if (!user) {
    const defaultPermissions = getDefaultPermissions('employee', 'other');
    return {
      permissions: defaultPermissions,
      hasPermission: () => true, // Return true during loading to show navigation
      canCreateTasks: () => false,
      canEditTasks: () => false,
      canDeleteTasks: () => false,
      canAssignTasks: () => false,
      canViewAllTasks: () => false,
      canManageTeam: () => false,
      canAccessReports: () => false,
      canModifySettings: () => false,
      canManageUsers: () => false,
      canAccessHR: () => false,
      canAccessFinance: () => false,
      canAccessProjects: () => false,
      canAccessTimeTracking: () => true, // Always allow time tracking
      canAccessExpenses: () => false,
      canAccessProcurement: () => false,
      canAccessLearning: () => true, // Always allow learning
      isAdmin: () => false,
      isTeamLeader: () => false,
      isEmployee: () => true,
      isHR: () => false,
      isFinance: () => false,
      isEngineering: () => false,
      isOperations: () => false,
      isExecutive: () => false,
      userRole: null,
      userDepartment: null,
    };
  }

  const userRole = (user.role as UserRole) || 'employee';
  const userDepartment = (user.department as Department) || 'other';
  
  // Get default permissions based on role and department
  const defaultPermissions = getDefaultPermissions(userRole, userDepartment);
  
  // For admin, manager, and executive users, always grant all permissions regardless of stored permissions
  // This ensures they always have full access even if permissions weren't properly saved
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'team_leader';
  const isExecutive = userDepartment === 'executive';
  
  let permissions: UserPermissions;
  if (isAdmin || isManager || isExecutive) {
    // Admin, Manager, and Executive always get all permissions
    permissions = defaultPermissions;
    // Ensure ALL permissions are true for comprehensive access
    permissions = {
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
      canAccessTimeTracking: true,
      canAccessExpenses: true,
      canAccessProcurement: true,
      canAccessLearning: true,
    };
  } else {
    // For non-admin users, use stored permissions or default to role-based permissions
    const userPermissions = user.permissions;
    // Check if userPermissions is valid (not empty object and has actual permission values)
    const hasValidPermissions = userPermissions && 
      Object.keys(userPermissions).length > 0 && 
      Object.values(userPermissions).some(v => v === true);
    
    if (hasValidPermissions) {
      // Merge stored permissions with defaults to ensure all permissions are present
      permissions = { ...defaultPermissions, ...userPermissions };
    } else {
      // Use default permissions if stored permissions are invalid or missing
      permissions = defaultPermissions;
    }
  }

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    // Admin, Manager (team_leader), and Executive (department) always have all permissions
    const isAdmin = userRole === 'admin';
    const isManager = userRole === 'team_leader';
    const isExecutive = userDepartment === 'executive';
    
    if (isAdmin || isManager || isExecutive) {
      return true;
    }
    // Check if permission exists and is true
    return permissions && permissions[permission] === true;
  };

  return {
    permissions,
    hasPermission,
    
    // Convenience methods for common permission checks
    canCreateTasks: () => hasPermission('canCreateTasks'),
    canEditTasks: () => hasPermission('canEditTasks'),
    canDeleteTasks: () => hasPermission('canDeleteTasks'),
    canAssignTasks: () => hasPermission('canAssignTasks'),
    canViewAllTasks: () => hasPermission('canViewAllTasks'),
    canManageTeam: () => hasPermission('canManageTeam'),
    canAccessReports: () => hasPermission('canAccessReports'),
    canModifySettings: () => hasPermission('canModifySettings'),
    canManageUsers: () => hasPermission('canManageUsers'),
    canAccessHR: () => hasPermission('canAccessHR'),
    canAccessFinance: () => hasPermission('canAccessFinance'),
    canAccessProjects: () => hasPermission('canAccessProjects'),
    canAccessTimeTracking: () => hasPermission('canAccessTimeTracking'),
    canAccessExpenses: () => hasPermission('canAccessExpenses'),
    canAccessProcurement: () => hasPermission('canAccessProcurement'),
    canAccessLearning: () => hasPermission('canAccessLearning'),
    
    // Role checks
    isAdmin: () => userRole === 'admin',
    isTeamLeader: () => userRole === 'team_leader',
    isEmployee: () => userRole === 'employee',
    
    // Department checks
    isHR: () => userDepartment === 'hr',
    isFinance: () => userDepartment === 'finance',
    isEngineering: () => userDepartment === 'engineering',
    isOperations: () => userDepartment === 'operations',
    isExecutive: () => userDepartment === 'executive',
    
    userRole,
    userDepartment,
  };
};

export default usePermissions; 