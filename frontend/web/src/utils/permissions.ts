export type UserRole = 'EMPLOYEE' | 'LINE_MANAGER' | 'ADMIN';

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ResourcePermissions {
  tasks: Permission;
  projects: Permission;
  schedules: Permission;
  timeEntries: Permission;
}

const defaultPermission: Permission = {
  create: false,
  read: false,
  update: false,
  delete: false,
};

const employeePermissions: ResourcePermissions = {
  tasks: {
    create: false,
    read: true,
    update: true, // Can update assigned tasks
    delete: false,
  },
  projects: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
  schedules: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
  timeEntries: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
};

const lineManagerPermissions: ResourcePermissions = {
  tasks: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  projects: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  schedules: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  timeEntries: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
};

const adminPermissions: ResourcePermissions = {
  tasks: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  projects: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  schedules: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  timeEntries: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
};

export const getRolePermissions = (role: UserRole): ResourcePermissions => {
  switch (role) {
    case 'EMPLOYEE':
      return employeePermissions;
    case 'LINE_MANAGER':
      return lineManagerPermissions;
    case 'ADMIN':
      return adminPermissions;
    default:
      return {
        tasks: { ...defaultPermission },
        projects: { ...defaultPermission },
        schedules: { ...defaultPermission },
        timeEntries: { ...defaultPermission },
      };
  }
};

export const hasPermission = (
  role: UserRole,
  resource: keyof ResourcePermissions,
  action: keyof Permission
): boolean => {
  const permissions = getRolePermissions(role);
  return permissions[resource][action];
}; 