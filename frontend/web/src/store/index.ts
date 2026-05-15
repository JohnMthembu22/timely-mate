import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import authService from '../services/auth';
import { getDefaultPermissions, UserRole, Department, UserPermissions } from '../types/auth';

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const serializedAuth = localStorage.getItem('auth');
    const serializedTheme = localStorage.getItem('theme');
    
    let auth = serializedAuth ? JSON.parse(serializedAuth) : undefined;
    const theme = serializedTheme ? JSON.parse(serializedTheme) : undefined;

    // Check if auth data has expired (1 day = 24 hours = 86400000 ms)
    if (auth && auth.savedAt) {
      const savedAt = new Date(auth.savedAt).getTime();
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day
      
      if (now - savedAt > oneDayInMs) {
        console.log('Auth data expired, clearing...');
        // Clear expired auth but keep registered users
        localStorage.removeItem('auth');
        localStorage.removeItem('timelymate_token');
        localStorage.removeItem('timelymate_user');
        auth = undefined;
      }
    }

    // If we have auth state but no user, try to load from authService
    if (auth && auth.token && !auth.user) {
      const user = authService.getCurrentUser();
      const token = authService.getToken();
      if (user && token) {
        auth = {
          ...auth,
          user,
          token,
        };
      }
    }

    // If no auth in localStorage, try to load from authService
    if (!auth) {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      if (token && user) {
        auth = {
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
          savedAt: new Date().toISOString(),
        };
      }
    }

    // Ensure user permissions are set if user exists
    if (auth && auth.user) {
      const userRole = (auth.user.role as UserRole) || 'employee';
      const userDepartment = (auth.user.department as Department) || 'other';
      const isAdmin = userRole === 'admin';
      const isManager = userRole === 'team_leader';
      const isExecutive = userDepartment === 'executive';
      
      // For admin, manager, and executive, always ensure ALL permissions are enabled
      if (isAdmin || isManager || isExecutive) {
        const fullPermissions: UserPermissions = {
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
        auth.user.permissions = fullPermissions;
      } else if (!auth.user.permissions || Object.keys(auth.user.permissions).length === 0) {
        // For other users, set default permissions if missing
        const defaultPermissions = getDefaultPermissions(userRole, userDepartment);
        auth.user.permissions = defaultPermissions;
      }
    }

    return {
      auth: auth ? {
        ...auth,
        isAuthenticated: !!auth.token && !!auth.user,
        loading: false,
        error: null,
        security: {
          mfa: {
            enabled: false,
            type: 'authenticator',
            verified: false,
            pending: false,
            error: null,
          },
          faceIdEnabled: false,
          faceAuthPending: false,
          faceAuthError: null,
          lastLogin: new Date().toISOString(),
        },
      } : undefined,
      theme: theme || { mode: 'light' }
    };
  } catch (err) {
    console.error('Error loading persisted state:', err);
    return undefined;
  }
};

// Create store with persisted state
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
  preloadedState: loadPersistedState(),
});

// Save state to localStorage when it changes
store.subscribe(() => {
  try {
    const state = store.getState();
    
    // Save auth state with timestamp for expiration tracking
    const authState = {
      user: state.auth.user,
      token: state.auth.token,
      savedAt: new Date().toISOString(), // Track when auth was saved
    };
    localStorage.setItem('auth', JSON.stringify(authState));
    
    // Also save to individual keys for compatibility
    if (state.auth.token) {
      localStorage.setItem('timelymate_token', state.auth.token);
    }
    if (state.auth.user) {
      localStorage.setItem('timelymate_user', JSON.stringify(state.auth.user));
    }
    
    // Save theme state
    localStorage.setItem('theme', JSON.stringify(state.theme));
  } catch (err) {
    console.error('Error saving state:', err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
