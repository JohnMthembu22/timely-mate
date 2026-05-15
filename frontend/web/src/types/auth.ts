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
  canAccessTimeTracking: boolean;
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

// Helper function to get default permissions based on role and department
export const getDefaultPermissions = (role: UserRole, department: Department): UserPermissions => {
  const basePermissions = {
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
    canAccessProjects: false,
    canAccessTimeTracking: true, // Everyone can track their own time
    canAccessExpenses: false,
    canAccessProcurement: false,
    canAccessLearning: true, // Everyone can access learning
  };

  // Role-based permissions
  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
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
        canAccessExpenses: true,
        canAccessProcurement: true,
      };
    case 'team_leader':
      // Managers/Team Leaders get comprehensive access (almost admin-level)
      return {
        ...basePermissions,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true, // Managers can delete tasks
        canAssignTasks: true,
        canViewAllTasks: true,
        canManageTeam: true,
        canAccessReports: true,
        canModifySettings: true, // Managers can modify settings
        canManageUsers: true, // Managers can manage users
        canAccessHR: true, // Managers can access HR
        canAccessFinance: true, // Managers can access finance
        canAccessProjects: true,
        canAccessExpenses: true,
        canAccessProcurement: true, // Managers can access procurement
      };
    case 'employee':
      return {
        ...basePermissions,
        canCreateTasks: false,
        canEditTasks: false, // Employees can only edit their own assigned tasks
        canDeleteTasks: false,
        canAssignTasks: false,
        canViewAllTasks: false, // Employees can only see their own tasks
        canManageTeam: false,
        canAccessReports: false,
        canModifySettings: false,
        canManageUsers: false,
        canAccessProjects: false, // Employees can only see projects they're assigned to
        canAccessExpenses: false, // Employees can only see their own expenses
      };
    default:
      return basePermissions;
  }
};

// Helper function to get department-specific permissions
export const getDepartmentPermissions = (department: Department): Partial<UserPermissions> => {
  switch (department) {
    case 'executive':
      // Executives get FULL comprehensive access (admin-level)
      return {
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
        canViewAllTasks: true,
        canManageTeam: true,
        canAccessHR: true,
        canAccessFinance: true,
        canAccessReports: true,
        canModifySettings: true,
        canManageUsers: true,
        canAccessProjects: true,
        canAccessExpenses: true,
        canAccessProcurement: true,
      };
    case 'hr':
      return {
        canAccessHR: true,
        canAccessReports: true,
        canManageUsers: true,
        canAccessProjects: true, // HR needs to see projects for resource planning
      };
    case 'finance':
      return {
        canAccessFinance: true,
        canAccessExpenses: true,
        canAccessReports: true,
        canAccessProjects: true, // Finance needs to see projects for budgeting
      };
    case 'engineering':
    case 'design':
      return {
        canAccessProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
        canViewAllTasks: true, // Engineers/Designers can see all tasks in their projects
      };
    case 'operations':
      return {
        canAccessProcurement: true,
        canAccessExpenses: true,
        canAccessProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
      };
    case 'marketing':
    case 'sales':
      return {
        canAccessProjects: true,
        canAccessExpenses: true,
        canCreateTasks: true,
        canEditTasks: true,
      };
    case 'it':
      return {
        canModifySettings: true,
        canAccessProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
      };
    case 'legal':
      return {
        canAccessReports: true,
        canAccessProjects: true,
      };
    case 'customer_success':
      return {
        canAccessProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
      };
    default:
      return {};
  }
};

// Combined function to get permissions based on both role and department
export const getUserPermissions = (role: UserRole, department: Department): UserPermissions => {
  const rolePermissions = getDefaultPermissions(role, department);
  const departmentPermissions = getDepartmentPermissions(department);
  
  // For executives, admins, and managers, ensure they get FULL comprehensive access
  const isExecutive = department === 'executive';
  const isAdmin = role === 'admin';
  const isManager = role === 'team_leader';
  
  // Merge role and department permissions, with department permissions taking precedence
  let mergedPermissions = {
    ...rolePermissions,
    ...departmentPermissions,
  };
  
  // If user is executive, admin, or manager, ensure ALL permissions are enabled
  if (isExecutive || isAdmin || isManager) {
    mergedPermissions = {
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
  }
  
  return mergedPermissions;
};
