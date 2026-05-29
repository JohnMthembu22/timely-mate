import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import { readStoredAuth } from '../utils/authSession';

const loadPersistedTheme = () => {
  try {
    const serializedTheme = localStorage.getItem('theme');
    return serializedTheme ? { theme: JSON.parse(serializedTheme) } : { theme: { mode: 'light' as const } };
  } catch {
    return { theme: { mode: 'light' as const } };
  }
};

/** Auth preloadedState is built in authSlice initialState from readStoredAuth(). */
const loadPreloadedState = () => {
  const themeSlice = loadPersistedTheme();
  const stored = readStoredAuth();
  if (!stored) return themeSlice;

  try {
    const serializedAuth = localStorage.getItem('auth');
    if (serializedAuth) {
      const auth = JSON.parse(serializedAuth) as { savedAt?: string };
      if (auth.savedAt) {
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (Date.now() - new Date(auth.savedAt).getTime() > oneDayMs) {
          localStorage.removeItem('auth');
          localStorage.removeItem('timelymate_token');
          localStorage.removeItem('timelymate_user');
          return themeSlice;
        }
      }
    }
  } catch {
    /* ignore */
  }

  return themeSlice;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
  preloadedState: loadPreloadedState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    const authState = {
      user: state.auth.user,
      token: state.auth.token,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('auth', JSON.stringify(authState));

    if (state.auth.token) {
      localStorage.setItem('timelymate_token', state.auth.token);
    } else {
      localStorage.removeItem('timelymate_token');
    }
    if (state.auth.user) {
      localStorage.setItem('timelymate_user', JSON.stringify(state.auth.user));
    } else {
      localStorage.removeItem('timelymate_user');
    }

    localStorage.setItem('theme', JSON.stringify(state.theme));
  } catch (err) {
    console.error('Error saving state:', err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
