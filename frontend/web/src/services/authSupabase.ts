import { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  UserRole,
  UserPermissions,
  Department,
  getUserPermissions,
  isManagerRole,
  MANAGER_PERMISSIONS,
} from '../types/auth';
import { CompanyProfile } from '../types/subscription';
import {
  getAuthCallbackUrl,
  getPasswordResetRedirectUrl,
  isSupabaseAuthEnabled,
} from '../utils/authConfig';
import { persistAuthSnapshot } from '../utils/authSession';

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

export class EmailConfirmationRequiredError extends Error {
  readonly email: string;

  constructor(email: string) {
    super(
      'Account created. Check your inbox for a confirmation email from Timely Mate before signing in.'
    );
    this.name = 'EmailConfirmationRequiredError';
    this.email = email;
  }
}

type ProfileRow = {
  id: string;
  email: string;
  organization_name?: string | null;
  role?: string | null;
  department?: string | null;
  permissions?: UserPermissions | null;
  company_profile?: CompanyProfile | null;
  selected_plan?: string | null;
};

const DEPARTMENT_VALUES: Department[] = [
  'executive',
  'hr',
  'finance',
  'marketing',
  'sales',
  'engineering',
  'design',
  'operations',
  'customer_success',
  'legal',
  'it',
  'other',
];

export function normalizeDepartment(value: string | null | undefined): Department {
  const raw = (value || 'other').toLowerCase().trim();
  if (raw === 'general') return 'other';
  return DEPARTMENT_VALUES.includes(raw as Department) ? (raw as Department) : 'other';
}

function resolvePermissions(
  userRole: UserRole,
  userDepartment: Department,
  _storedPermissions?: UserPermissions | null
): UserPermissions {
  if (isManagerRole(userRole, userDepartment)) {
    return { ...MANAGER_PERMISSIONS };
  }
  return getUserPermissions(userRole, userDepartment);
}

export async function buildAuthResponseFromSession(session: Session): Promise<AuthResponse> {
  await ensureProfileFromSession(session);

  const userId = session.user.id;
  const fallbackEmail = session.user.email ?? '';

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  const userProfile: ProfileRow = profile ?? {
    id: userId,
    email: fallbackEmail,
    organization_name: (session.user.user_metadata?.organization_name as string) ?? '',
    role: (session.user.user_metadata?.role as string) ?? 'employee',
    department: (session.user.user_metadata?.department as string) ?? 'general',
    permissions: {},
  };

  const userRole = (userProfile.role as UserRole) || 'employee';
  const userDepartment = normalizeDepartment(userProfile.department);

  return {
    token: session.access_token,
    user: {
      id: userId,
      email: userProfile.email || fallbackEmail,
      organizationName: userProfile.organization_name || '',
      role: userRole,
      department: userDepartment,
      permissions: resolvePermissions(userRole, userDepartment, userProfile.permissions),
      companyProfile: userProfile.company_profile ?? undefined,
      selectedPlan: userProfile.selected_plan ?? undefined,
    },
  };
}

/** Map Supabase Auth API errors (often HTTP 400) to clear user-facing messages. */
export function mapSupabaseAuthError(error: AuthError): string {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox (and spam) for a message from Timely Mate, then try again.';
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Invalid email or password. If you registered before Supabase was enabled, create a new account via Register.';
  }
  if (code === 'user_banned' || msg.includes('banned')) {
    return 'This account has been disabled. Contact your administrator.';
  }
  if (code === 'too_many_requests' || msg.includes('rate limit')) {
    return 'Too many sign-in attempts. Please wait a few minutes and try again.';
  }
  if (msg.includes('email') && msg.includes('invalid')) {
    return 'Please enter a valid email address.';
  }

  return error.message || 'Sign-in failed. Please check your email and password.';
}

/** Ensure profiles row exists for OAuth users (Google does not send org metadata). */
export async function ensureProfileFromSession(session: Session): Promise<void> {
  const userId = session.user.id;
  const email = session.user.email ?? '';
  const meta = session.user.user_metadata ?? {};
  const fullName = (meta.full_name as string) || (meta.name as string) || '';
  const emailDomain = email.includes('@') ? email.split('@')[1] : '';
  const fallbackOrg =
    (meta.organization_name as string) ||
    fullName ||
    (emailDomain ? emailDomain.split('.')[0] : '') ||
    'My Organization';

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, organization_name')
    .eq('id', userId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email,
        organization_name: fallbackOrg,
        role: 'employee',
        department: 'other',
        permissions: {},
      },
      { onConflict: 'id' }
    );
    if (error) console.warn('Profile create for OAuth user failed:', error.message);
    return;
  }

  if (!existing.organization_name) {
    const { error } = await supabase
      .from('profiles')
      .update({ email, organization_name: fallbackOrg })
      .eq('id', userId);
    if (error) console.warn('Profile update for OAuth user failed:', error.message);
  }
}

async function upsertProfile(userId: string, data: SignupData): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: data.email,
      organization_name: data.organizationName,
      role: data.role || 'employee',
      department: normalizeDepartment(data.department),
      permissions: {},
      company_profile: data.companyProfile ?? null,
      selected_plan: data.selectedPlan ?? null,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message || 'Failed to save your profile');
  }
}

const authServiceSupabase = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!isSupabaseAuthEnabled()) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    if (error) {
      throw new Error(mapSupabaseAuthError(error));
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed. Please try again.');
    }

    const response = await buildAuthResponseFromSession(data.session);
    persistAuthSnapshot(response);
    return response;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    if (!isSupabaseAuthEnabled()) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const email = data.email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: {
          organization_name: data.organizationName,
          role: data.role || 'employee',
          department: normalizeDepartment(data.department),
          company_profile: data.companyProfile ?? null,
          selected_plan: data.selectedPlan ?? null,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw new Error(authError.message || 'Account creation failed');
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // Email confirmation required — profile is created by DB trigger from user metadata
    if (!authData.session) {
      throw new EmailConfirmationRequiredError(email);
    }

    await upsertProfile(authData.user.id, { ...data, email });
    const response = await buildAuthResponseFromSession(authData.session);
    persistAuthSnapshot(response);
    return response;
  },

  async signInWithGoogle(): Promise<void> {
    if (!isSupabaseAuthEnabled()) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw new Error(mapSupabaseAuthError(error));
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (!isSupabaseAuthEnabled()) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getPasswordResetRedirectUrl(),
    });

    if (error) {
      throw new Error(mapSupabaseAuthError(error));
    }
  },

  async updatePassword(newPassword: string): Promise<void> {
    if (!isSupabaseAuthEnabled()) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(mapSupabaseAuthError(error));
    }
  },

  async logout(): Promise<void> {
    if (!isSupabaseAuthEnabled()) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
  },

  async getCurrentUser() {
    if (!isSupabaseAuthEnabled()) return null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const response = await buildAuthResponseFromSession(session);
    return response.user;
  },

  async getToken(): Promise<string | null> {
    if (!isSupabaseAuthEnabled()) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  },

  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseAuthEnabled()) return false;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseAuthEnabled()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  buildAuthResponseFromSession,
};

export default authServiceSupabase;
