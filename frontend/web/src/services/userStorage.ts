import { UserRole, UserPermissions, getUserPermissions, Department } from '../types/auth';
import { CompanyProfile } from '../types/subscription';

export interface RegisteredUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  organizationName: string;
  role: UserRole;
  department: Department;
  permissions: UserPermissions;
  companyProfile?: CompanyProfile;
  selectedPlan?: string;
  registeredAt: string;
}

const USERS_KEY = 'timelymate_registered_users';

// Helper function to determine user role based on email or explicit assignment
const determineUserRole = (email: string, explicitRole?: UserRole): UserRole => {
  if (explicitRole) return explicitRole;
  
  // For the first user in an organization, make them admin
  const users = getAllUsers();
  if (users.length === 0) return 'admin';
  
  // Default role assignment
  if (email.includes('admin')) return 'admin';
  if (email.includes('leader') || email.includes('manager')) return 'team_leader';
  return 'employee';
};

export const userStorageService = {
  // Get all registered users
  getAllUsers(): RegisteredUser[] {
    const usersStr = localStorage.getItem(USERS_KEY);
    if (!usersStr) return [];
    try {
      return JSON.parse(usersStr);
    } catch (e) {
      console.error('Error parsing registered users:', e);
      return [];
    }
  },

  // Find user by email
  findUserByEmail(email: string): RegisteredUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Check if user exists
  userExists(email: string): boolean {
    return this.findUserByEmail(email) !== null;
  },

  // Register a new user
  registerUser(userData: {
    email: string;
    password: string;
    organizationName: string;
    role?: UserRole;
    department?: Department;
    companyProfile?: CompanyProfile;
    selectedPlan?: string;
  }): RegisteredUser {
    const users = this.getAllUsers();
    
    // Check if user already exists
    if (this.userExists(userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Determine role and department
    const role = determineUserRole(userData.email, userData.role);
    const department = userData.department || 'other';
    const permissions = getUserPermissions(role, department);

    // Create new user
    const newUser: RegisteredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase(),
      password: userData.password, // In production, this should be hashed
      organizationName: userData.organizationName,
      role,
      department,
      permissions,
      companyProfile: userData.companyProfile,
      selectedPlan: userData.selectedPlan,
      registeredAt: new Date().toISOString(),
    };

    // Add to users array and save
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return newUser;
  },

  // Validate user credentials
  validateCredentials(email: string, password: string): RegisteredUser | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    
    // In production, you would compare hashed passwords
    if (user.password === password) {
      return user;
    }
    
    return null;
  },

  // Update user data
  updateUser(userId: string, updates: Partial<RegisteredUser>): RegisteredUser | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return null;
    
    // Merge updates
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return users[userIndex];
  },

  // Delete user (for demo purposes)
  deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    return true;
  },

  // Clear all users (for demo purposes)
  clearAllUsers(): void {
    localStorage.removeItem(USERS_KEY);
  },

  // Get users count for organization
  getOrganizationUserCount(organizationName: string): number {
    const users = this.getAllUsers();
    return users.filter(user => 
      user.organizationName.toLowerCase() === organizationName.toLowerCase()
    ).length;
  }
};

// Export helper function
export const getAllUsers = () => userStorageService.getAllUsers();

export default userStorageService; 