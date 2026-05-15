import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService, { LoginCredentials, SignupData } from '../../services/auth';
import { getDefaultPermissions, UserRole, Department } from '../../types/auth';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
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
        // Ensure user has permissions - always use default permissions based on role
        const user = action.payload.user;
        if (user) {
          const userRole = (user.role as UserRole) || 'employee';
          const userDepartment = (user.department as Department) || 'other';
          const defaultPermissions = getDefaultPermissions(userRole, userDepartment);
          
          // For admin, manager, and executive users, always ensure ALL permissions are set
          // For other users, merge stored permissions with defaults
          const isAdmin = userRole === 'admin';
          const isManager = userRole === 'team_leader';
          const isExecutive = userDepartment === 'executive';
          
          if (isAdmin || isManager || isExecutive) {
            // Admin, Manager, and Executive always get ALL permissions
            user.permissions = {
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
          } else {
            // Merge stored permissions with defaults, but prefer defaults if stored is empty
            if (!user.permissions || Object.keys(user.permissions).length === 0) {
              user.permissions = defaultPermissions;
            } else {
              // Merge to ensure all permission keys exist
              user.permissions = { ...defaultPermissions, ...user.permissions };
            }
          }
        }
        state.user = user;
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
        // Ensure user has permissions - always use default permissions based on role
        const user = action.payload.user;
        if (user) {
          const userRole = (user.role as UserRole) || 'employee';
          const userDepartment = (user.department as Department) || 'other';
          const defaultPermissions = getDefaultPermissions(userRole, userDepartment);
          
          // For admin, manager, and executive users, always ensure ALL permissions are set
          // For other users, merge stored permissions with defaults
          const isAdmin = userRole === 'admin';
          const isManager = userRole === 'team_leader';
          const isExecutive = userDepartment === 'executive';
          
          if (isAdmin || isManager || isExecutive) {
            // Admin, Manager, and Executive always get ALL permissions
            user.permissions = {
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
          } else {
            // Merge stored permissions with defaults, but prefer defaults if stored is empty
            if (!user.permissions || Object.keys(user.permissions).length === 0) {
              user.permissions = defaultPermissions;
            } else {
              // Merge to ensure all permission keys exist
              user.permissions = { ...defaultPermissions, ...user.permissions };
            }
          }
        }
        state.user = user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
