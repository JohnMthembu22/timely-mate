/**
 * Run before Supabase client loads so recovery tokens in the URL hash are not
 * consumed/cleared before React Router can route to /auth/reset-password.
 */
export function bootstrapAuthHashRedirect(): void {
  if (typeof window === 'undefined') return;

  const rawHash = window.location.hash;
  if (!rawHash || rawHash === '#') return;

  const params = new URLSearchParams(rawHash.startsWith('#') ? rawHash.slice(1) : rawHash);
  const hasAuthPayload =
    params.has('access_token') ||
    params.has('error') ||
    params.has('error_description') ||
    params.has('code');

  if (!hasAuthPayload) return;

  const type = params.get('type');
  const isRecovery = type === 'recovery';
  const isError = params.has('error') || params.has('error_description');

  let targetPath: string;
  if (isRecovery) {
    targetPath = '/auth/reset-password';
  } else if (isError && (params.get('error_code') === 'otp_expired' || params.get('error') === 'access_denied')) {
    targetPath = '/auth/reset-password';
  } else {
    targetPath = '/auth/callback';
  }

  const { pathname } = window.location;
  if (!pathname.startsWith(targetPath)) {
    window.location.replace(`${targetPath}${rawHash}`);
  }
}

// Side-effect import: redirect synchronously on first load
bootstrapAuthHashRedirect();
