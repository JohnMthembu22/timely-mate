import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { hydrateAuth } from '../store/slices/authSlice';
import authServiceSupabase from '../services/authSupabase';
import { clearSession, setSession } from '../store/slices/authSlice';
import { isSupabaseAuthEnabled } from '../utils/authConfig';
import { clearAuthStorage, persistAuthSnapshot } from '../utils/authSession';

/** Hydrates Redux auth from Supabase session or localStorage on app mount. */
const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isSupabaseAuthEnabled()) return;

    const { data } = authServiceSupabase.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAuthStorage();
        dispatch(clearSession());
        return;
      }
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        try {
          const response = await authServiceSupabase.buildAuthResponseFromSession(session);
          persistAuthSnapshot(response);
          dispatch(setSession({ user: response.user, token: response.token }));
        } catch (err) {
          console.error('Auth state sync failed:', err);
        }
      }
    });

    return () => {
      data.subscription?.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthBootstrap;
