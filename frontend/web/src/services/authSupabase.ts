import { supabase } from '../lib/supabase';
import { UserRole, UserPermissions, Department, getDefaultPermissions } from '../types/auth';
import { CompanyProfile } from '../types/subscription';

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

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== '' && key !== '');
};

const authServiceSupabase = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password');
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed. Please try again.');
      }

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "not found" - we'll create profile if it doesn't exist
        console.warn('Profile not found, will create one:', profileError);
      }

      // If profile doesn't exist, create a default one
      const userProfile = profile || {
        id: data.user.id,
        email: data.user.email || credentials.email,
        organization_name: '',
        role: 'employee' as UserRole,
        department: 'general' as Department,
        permissions: {},
      };

      // Get default permissions based on role
      const userRole = (userProfile.role as UserRole) || 'employee';
      const userDepartment = (userProfile.department as Department) || 'general';
      const defaultPermissions = getDefaultPermissions(userRole, userDepartment);
      const isAdmin = userRole === 'admin';
      const isManager = userRole === 'team_leader';
      const isExecutive = userDepartment === 'executive';
      
      // For admin, manager, and executive users, always use ALL permissions
      // For other users, merge stored permissions with defaults
      let finalPermissions: UserPermissions;
      if (isAdmin || isManager || isExecutive) {
        // Admin, Manager, and Executive always get ALL permissions
        finalPermissions = {
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
        const storedPermissions = (userProfile.permissions as UserPermissions) || {};
        if (Object.keys(storedPermissions).length > 0) {
          finalPermissions = { ...defaultPermissions, ...storedPermissions };
        } else {
          finalPermissions = defaultPermissions;
        }
      }

      const authResponse: AuthResponse = {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: userProfile.email,
          organizationName: userProfile.organization_name || '',
          role: userRole,
          department: userDepartment,
          permissions: finalPermissions,
          companyProfile: userProfile.company_profile as CompanyProfile | undefined,
          selectedPlan: userProfile.selected_plan,
        },
      };

      return authResponse;
    } catch (error: any) {
      console.error('Supabase login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please use a different email or login instead.');
      }

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message || 'Account creation failed');
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          organization_name: data.organizationName,
          role: data.role || 'employee',
          department: data.department || 'general',
          permissions: {},
          company_profile: data.companyProfile,
          selected_plan: data.selectedPlan,
        });

      if (profileError) {
        // If profile creation fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
        throw new Error(profileError.message || 'Failed to create user profile');
      }

      // If email confirmation is required, user needs to confirm email
      if (!authData.session) {
        throw new Error('Please check your email to confirm your account before signing in.');
      }

      // Sign in after successful signup
      return this.login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error('Supabase signup error:', error);
      throw new Error(error.message || 'Account creation failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return null;
      }

      return {
        id: user.id,
        email: profile.email,
        organizationName: profile.organization_name || '',
        role: profile.role || 'employee',
        department: profile.department || 'general',
        permissions: profile.permissions || {},
        companyProfile: profile.company_profile,
        selectedPlan: profile.selected_plan,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: null }, unsubscribe: () => {} };
    }

    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

export default authServiceSupabase;

