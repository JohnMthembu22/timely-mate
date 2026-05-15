import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { User, setCredentials } from '../store/slices/authSlice';

interface AuthHook {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): AuthHook => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Try to load auth state from localStorage on mount
    const loadAuthFromStorage = () => {
      try {
        const serializedAuth = localStorage.getItem('auth');
        if (serializedAuth) {
          const { user, token } = JSON.parse(serializedAuth);
          if (user && token) {
            dispatch(setCredentials({ user, token }));
          }
        }
      } catch (err) {
        console.error('Error loading auth from storage:', err);
      }
    };

    if (!auth.isAuthenticated) {
      loadAuthFromStorage();
    }
  }, [dispatch, auth.isAuthenticated]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
  };
};
