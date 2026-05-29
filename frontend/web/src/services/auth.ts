import axios from 'axios';
import { UserRole, UserPermissions, Department, getUserPermissions, MANAGER_PERMISSIONS, isManagerRole } from '../types/auth';
import userStorageService from './userStorage';
import { CompanyProfile } from '../types/subscription';
import sessionPersistence from './sessionPersistence';
import authServiceSupabase, { EmailConfirmationRequiredError } from './authSupabase';
import { isSupabaseAuthEnabled } from '../utils/authConfig';

const allowLocalAuthFallback = import.meta.env.VITE_AUTH_LOCAL_FALLBACK === 'true';

const SUPABASE_REQUIRED_MESSAGE =
  'Sign-in requires Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/web/.env, then restart the dev server.';

axios.defaults.headers.common['Content-Type'] = 'application/json';

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

export { EmailConfirmationRequiredError };

const TOKEN_KEY = 'timelymate_token';
const USER_KEY = 'timelymate_user';

const authService = {
  isSupabaseMode(): boolean {
    return isSupabaseAuthEnabled();
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isSupabaseAuthEnabled()) {
      return authServiceSupabase.login(credentials);
    }
    if (!allowLocalAuthFallback) {
      throw new Error(SUPABASE_REQUIRED_MESSAGE);
    }

    const user = userStorageService.validateCredentials(credentials.email, credentials.password);
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials or create an account.');
    }

    const token = `auth-token-${user.id}-${Date.now()}`;
    const userRole = user.role;
    const userDepartment = user.department;
    const userPermissions = isManagerRole(userRole, userDepartment)
      ? { ...MANAGER_PERMISSIONS }
      : getUserPermissions(userRole, userDepartment);

    const authResponse: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationName: user.organizationName,
        role: userRole,
        department: userDepartment,
        permissions: userPermissions,
        companyProfile: user.companyProfile,
        selectedPlan: user.selectedPlan,
      },
    };

    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    sessionPersistence.saveSessionData();
    return authResponse;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    if (isSupabaseAuthEnabled()) {
      return authServiceSupabase.signup(data);
    }
    if (!allowLocalAuthFallback) {
      throw new Error(SUPABASE_REQUIRED_MESSAGE);
    }

    if (userStorageService.userExists(data.email)) {
      throw new Error('An account with this email already exists. Please use a different email or login instead.');
    }

    const registeredUser = userStorageService.registerUser({
      email: data.email,
      password: data.password,
      organizationName: data.organizationName,
      role: data.role,
      department: data.department,
      companyProfile: data.companyProfile,
      selectedPlan: data.selectedPlan,
    });

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
        selectedPlan: registeredUser.selectedPlan,
      },
    };

    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    sessionPersistence.saveSessionData();
    return authResponse;
  },

  async logout() {
    if (isSupabaseAuthEnabled()) {
      await authServiceSupabase.logout();
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('auth');
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as AuthResponse['user'];
    } catch {
      return null;
    }
  },

  async getCurrentUser() {
    if (isSupabaseAuthEnabled()) {
      return authServiceSupabase.getCurrentUser();
    }
    return this.getStoredUser();
  },

  async getToken() {
    if (isSupabaseAuthEnabled()) {
      return authServiceSupabase.getToken();
    }
    return localStorage.getItem(TOKEN_KEY);
  },

  async isAuthenticated() {
    if (isSupabaseAuthEnabled()) {
      return authServiceSupabase.isAuthenticated();
    }
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /** Only valid in local dev fallback — not used when Supabase is configured. */
  checkEmailExists(email: string) {
    if (isSupabaseAuthEnabled()) return true;
    return userStorageService.userExists(email);
  },

  getAllRegisteredUsers() {
    return userStorageService.getAllUsers();
  },

  clearAllUsers() {
    userStorageService.clearAllUsers();
    this.logout();
  },
};

export default authService;
