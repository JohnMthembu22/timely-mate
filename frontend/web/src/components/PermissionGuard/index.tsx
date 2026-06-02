import React from 'react';
import { Box, Typography, Alert, Container, Paper } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppSelector } from '../../store';
import { UserPermissions } from '../../types/auth';
import { TESTING_MODE_UNLOCK_ALL } from '../../config/testingMode';
import DashboardLayout from '../DashboardLayout';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: keyof UserPermissions;
  permissions?: (keyof UserPermissions)[];
  requireAll?: boolean; // If true, requires ALL permissions. If false, requires ANY permission
  fallback?: React.ReactNode;
  showMessage?: boolean;
  customMessage?: string;
  allowedRoles?: ('admin' | 'team_leader' | 'employee')[]; // Direct role-based access
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showMessage = true,
  customMessage,
  allowedRoles
}) => {
  const { hasPermission } = usePermissions();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (TESTING_MODE_UNLOCK_ALL) {
    return <>{children}</>;
  }

  // Check role-based access first if allowedRoles is provided
  if (allowedRoles && user?.role) {
    if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }
  }

  // Create permissions array
  const permissionsToCheck = permission ? [permission] : permissions;

  // Check permissions
  const hasAccess = (() => {
    if (permissionsToCheck.length === 0) return true;
    
    if (requireAll) {
      return permissionsToCheck.every(perm => hasPermission(perm));
    } else {
      return permissionsToCheck.some(perm => hasPermission(perm));
    }
  })();

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or access denied message
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  const content = (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Alert
          severity="warning"
          icon={<Lock />}
          sx={{
            '& .MuiAlert-message': {
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            },
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
            Access Restricted
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customMessage ||
              'You do not have permission to access this feature. Contact your administrator for access.'}
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );

  // If the user is signed in, keep app chrome consistent.
  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return <Box sx={{ minHeight: '100vh' }}>{content}</Box>;
};

export default PermissionGuard; 