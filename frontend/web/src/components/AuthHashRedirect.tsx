import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseAuthEnabled } from '../utils/authConfig';

/**
 * Supabase puts tokens in the URL hash (#access_token=...&type=recovery).
 * Email links often land on Site URL (/) — forward hash to the correct auth route.
 */
const AuthHashRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseAuthEnabled()) return;

    const rawHash = window.location.hash;
    if (!rawHash || rawHash === '#') return;

    const params = new URLSearchParams(rawHash.startsWith('#') ? rawHash.slice(1) : rawHash);
    const type = params.get('type');
    const hasAuthPayload =
      params.has('access_token') ||
      params.has('error') ||
      params.has('error_description') ||
      params.has('code');

    if (!hasAuthPayload) return;

    if (type === 'recovery') {
      if (!location.pathname.startsWith('/auth/reset-password')) {
        navigate(`/auth/reset-password${rawHash}`, { replace: true });
      }
      return;
    }

    if (params.has('error') || params.has('error_description')) {
      const errorCode = params.get('error_code') ?? '';
      const target =
        errorCode === 'otp_expired' || params.get('error') === 'access_denied'
          ? '/auth/reset-password'
          : '/auth/callback';
      if (!location.pathname.startsWith(target)) {
        navigate(`${target}${rawHash}`, { replace: true });
      }
      return;
    }

    if (!location.pathname.startsWith('/auth/callback')) {
      navigate(`/auth/callback${rawHash}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default AuthHashRedirect;
