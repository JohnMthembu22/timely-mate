import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import sessionPersistence from '../services/sessionPersistence';
import type { AuthResponse } from '../services/auth';
import { isSupabaseAuthEnabled } from './authConfig';

const AUTH_SNAPSHOT_KEY = 'auth';
const LEGACY_USERS_KEY = 'timelymate_registered_users';

/** Synchronous read of persisted credentials (localStorage mode). */
export function readStoredAuth(): Pick<AuthResponse, 'token' | 'user'> | null {
  if (isSupabaseAuthEnabled()) {
    return null;
  }
  try {
    const token = localStorage.getItem('timelymate_token');
    const userRaw = localStorage.getItem('timelymate_user');
    if (!token || !userRaw) return null;
    const user = JSON.parse(userRaw) as AuthResponse['user'];
    if (!user?.id || !user?.email) return null;
    return { token, user };
  } catch {
    return null;
  }
}

/** Remove legacy browser-only user registry (Supabase stores accounts in Auth). */
export function clearLegacyLocalUserRegistry(): void {
  try {
    localStorage.removeItem(LEGACY_USERS_KEY);
  } catch {
    /* ignore */
  }
}

/** Mirror Supabase session into app keys used by Redux preload and API interceptors. */
export function persistAuthSnapshot(response: AuthResponse): void {
  try {
    localStorage.setItem('timelymate_token', response.token);
    localStorage.setItem('timelymate_user', JSON.stringify(response.user));
    localStorage.setItem(
      AUTH_SNAPSHOT_KEY,
      JSON.stringify({
        user: response.user,
        token: response.token,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore */
  }
}

/** Remove all auth-related keys without wiping unrelated preferences. */
export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(AUTH_SNAPSHOT_KEY);
    localStorage.removeItem('timelymate_token');
    localStorage.removeItem('timelymate_user');
    sessionPersistence.clearSessionData();
    if (isSupabaseAuthEnabled()) {
      clearLegacyLocalUserRegistry();
    }
  } catch {
    /* ignore */
  }
}

/** Redux logout + storage cleanup + safe redirect. */
export async function performAppLogout(
  dispatch: AppDispatch,
  navigate: NavigateFunction
): Promise<void> {
  try {
    await dispatch(logout()).unwrap();
  } catch {
    /* still clear local state */
  }
  clearAuthStorage();
  navigate('/login', { replace: true });
}
