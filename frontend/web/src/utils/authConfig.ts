/** App URL used for Supabase email redirects (confirm, reset). */
export const getAppUrl = (): string => {
  const fromVite = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
  if (fromVite) return fromVite;
  if (typeof window !== 'undefined') {
    const fromRuntime = window.ENV?.VITE_APP_URL?.replace(/\/$/, '');
    if (fromRuntime) return fromRuntime;
    return window.location.origin;
  }
  return 'https://www.timelymate.co.za';
};

export const getAuthCallbackUrl = (): string => `${getAppUrl()}/auth/callback`;

/** Where Supabase sends users after they click “reset password” in email. */
export const getPasswordResetRedirectUrl = (): string => `${getAppUrl()}/auth/reset-password`;

export const AUTH_EMAIL_FROM = 'Timely Mate <noreply@timelymate.co.za>';

export { isSupabaseAuthEnabled, getSupabaseUrl, getSupabaseAnonKey } from './supabaseEnv';
