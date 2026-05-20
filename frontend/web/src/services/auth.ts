import axios from 'axios';
import { UserRole, UserPermissions, Department, getDefaultPermissions } from '../types/auth';
import userStorageService, { RegisteredUser } from './userStorage';
import { CompanyProfile } from '../types/subscription';
import sessionPersistence from './sessionPersistence';
import authServiceSupabase from './authSupabase';

// API URL - commented out until we connect to a real backend
// const API_URL = 'http://localhost:8002/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== '' && key !== '' && url.includes('supabase.co'));
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  organizationName: string;
  role?: UserRole;
  department?: Department;
  companyProfile?: CompanyProfile;
  selectedPlan?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    organizationName: string;
    role: UserRole;
    department: Department;
    permissions: UserPermissions;
    companyProfile?: CompanyProfile;
    selectedPlan?: string;
  };
}

const TOKEN_KEY = 'timelymate_token';
const USER_KEY = 'timelymate_user';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured()) {
      try {
        return await authServiceSupabase.login(credentials);
      } catch (error: any) {
        // If Supabase login fails, fall back to localStorage auth
        console.warn('Supabase login failed, falling back to localStorage:', error.message);
      }
    }

    // Fallback to localStorage-based auth
    try {
      // Validate credentials against registered users
      const user = userStorageService.validateCredentials(credentials.email, credentials.password);
      
      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials or create an account.');
      }

      // Generate auth token
      const token = `auth-token-${user.id}-${Date.now()}`;
      
      // Ensure permissions are set - always use full permissions for admin, manager, executive
      const defaultPermissions = getDefaultPermissions(user.role, user.department);
      const isAdmin = user.role === 'admin';
      const isManager = user.role === 'team_leader';
      const isExecutive = user.department === 'executive';
      
      let userPermissions: UserPermissions;
      
      if (isAdmin || isManager || isExecutive) {
        // Admin, Manager, and Executive always get ALL permissions
        userPermissions = {
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
        // For non-admin users, use stored permissions if valid, otherwise use defaults
        if (user.permissions && Object.keys(user.permissions).length > 0) {
          // Merge stored permissions with defaults to ensure all keys exist
          userPermissions = { ...defaultPermissions, ...user.permissions };
        } else {
          userPermissions = defaultPermissions;
        }
      }
      
      const authResponse: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          organizationName: user.organizationName,
          role: user.role,
          department: user.department,
          permissions: userPermissions,
          companyProfile: user.companyProfile,
          selectedPlan: user.selectedPlan
        }
      };
      
      // Store auth data in localStorage
      localStorage.setItem(TOKEN_KEY, authResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      
      // Save session data for persistence
      sessionPersistence.saveSessionData();
      
      return authResponse;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured()) {
      try {
        return await authServiceSupabase.signup(data);
      } catch (error: any) {
        // If Supabase signup fails, fall back to localStorage auth
        console.warn('Supabase signup failed, falling back to localStorage:', error.message);
      }
    }

    // Fallback to localStorage-based auth
    try {
      // Check if user already exists
      if (userStorageService.userExists(data.email)) {
        throw new Error('An account with this email already exists. Please use a different email or login instead.');
      }

      // Register the new user
      const registeredUser = userStorageService.registerUser({
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
        role: data.role,
        department: data.department,
        companyProfile: data.companyProfile,
        selectedPlan: data.selectedPlan
      });

      // Generate auth token
      const token = `auth-token-${registeredUser.id}-${Date.now()}`;
      
      const authResponse: AuthResponse = {
        token,
        user: {
          id: registeredUser.id,
          email: registeredUser.email,
          organizationName: registeredUser.organizationName,
          role: registeredUser.role,
          department: registeredUser.department,
          permissions: registeredUser.permissions,
          companyProfile: registeredUser.companyProfile,
          selectedPlan: registeredUser.selectedPlan
        }
      };
      
      // Store auth data in localStorage
      localStorage.setItem(TOKEN_KEY, authResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      
      // Save session data for persistence
      sessionPersistence.saveSessionData();
      
      return authResponse;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Account creation failed. Please try again.');
    }
  },

  async logout() {
    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await authServiceSupabase.logout();
      } catch (error) {
        console.error('Supabase logout error:', error);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async getCurrentUser() {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const user = await authServiceSupabase.getCurrentUser();
        if (user) return user;
      } catch (error) {
        console.warn('Supabase getCurrentUser failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  async getToken() {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const token = await authServiceSupabase.getToken();
        if (token) return token;
      } catch (error) {
        console.warn('Supabase getToken failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return localStorage.getItem(TOKEN_KEY);
  },

  async isAuthenticated() {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        return await authServiceSupabase.isAuthenticated();
      } catch (error) {
        console.warn('Supabase isAuthenticated failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // New utility methods for user management
  getAllRegisteredUsers() {
    return userStorageService.getAllUsers();
  },

  checkEmailExists(email: string) {
    return userStorageService.userExists(email);
  },

  // Method to clear demo data if needed
  clearAllUsers() {
    userStorageService.clearAllUsers();
    this.logout(); // Also logout current user
  }
};

export default authService;
