import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { LoginCredentials, SignupData, AuthResponse, EmailConfirmationRequiredError } from '../../services/auth';
import authServiceSupabase from '../../services/authSupabase';
import { isSupabaseAuthEnabled } from '../../utils/authConfig';
import { getUserPermissions, UserRole, Department, UserPermissions, MANAGER_PERMISSIONS, isManagerRole } from '../../types/auth';
import { clearAuthStorage, readStoredAuth } from '../../utils/authSession';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

function mergeUserPermissions(user: AuthResponse['user']): AuthResponse['user'] {
  const userRole = (user.role as UserRole) || 'employee';
  const userDepartment = (user.department as Department) || 'other';
  if (isManagerRole(userRole, userDepartment)) {
    return { ...user, permissions: { ...MANAGER_PERMISSIONS } };
  }
  return { ...user, permissions: getUserPermissions(userRole, userDepartment) };
}

const stored = readStoredAuth();

const initialState: AuthState = {
  user: stored ? mergeUserPermissions(stored.user) : null,
  token: stored?.token ?? null,
  isAuthenticated: !!stored,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupData, { rejectWithValue }) => {
    try {
      return await authService.signup(data);
    } catch (error: unknown) {
      if (error instanceof EmailConfirmationRequiredError) {
        return rejectWithValue({
          code: 'EMAIL_CONFIRMATION',
          email: error.email,
          message: error.message,
        });
      }
      const message = error instanceof Error ? error.message : 'Signup failed';
      return rejectWithValue({ code: 'ERROR', message });
    }
  }
);

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      if (!isSupabaseAuthEnabled()) {
        dispatch(restoreFromStorage());
        return null;
      }

      const authenticated = await authServiceSupabase.isAuthenticated();
      if (!authenticated) {
        clearAuthStorage();
        return null;
      }

      const token = await authServiceSupabase.getToken();
      const user = await authServiceSupabase.getCurrentUser();
      if (!token || !user) return null;

      return { token, user } as AuthResponse;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Session restore failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    clearAuthStorage();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    restoreFromStorage: (state) => {
      const session = readStoredAuth();
      if (!session) return;
      state.token = session.token;
      state.user = mergeUserPermissions(session.user);
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setSession: (
      state,
      action: PayloadAction<{ user: AuthResponse['user']; token: string }>
    ) => {
      state.token = action.payload.token;
      state.user = mergeUserPermissions(action.payload.user);
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearSession: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = mergeUserPermissions(action.payload.user);
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = mergeUserPermissions(action.payload.user);
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { code?: string; message?: string } | string | undefined;
        if (typeof payload === 'string') {
          state.error = payload;
        } else if (payload?.code === 'EMAIL_CONFIRMATION') {
          state.error = null;
        } else {
          state.error = payload?.message ?? 'Signup failed';
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        if (!action.payload) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          return;
        }
        state.loading = false;
        state.isAuthenticated = true;
        state.user = mergeUserPermissions(action.payload.user);
        state.token = action.payload.token;
      });
  },
});

export const { clearError, restoreFromStorage, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
