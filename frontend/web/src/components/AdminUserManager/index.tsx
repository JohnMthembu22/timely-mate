import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import authService from '../../services/auth';
import { RegisteredUser } from '../../services/userStorage';
import { UserRole } from '../../types/auth';

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = () => {
    const registeredUsers = authService.getAllRegisteredUsers();
    setUsers(registeredUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUserId) {
      // Note: We'd need to add a delete method to userStorageService
      // For now, we'll just show a message
      setMessage('User deletion would be implemented in userStorageService');
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleClearAllUsers = () => {
    setClearAllDialogOpen(true);
  };

  const confirmClearAllUsers = () => {
    authService.clearAllUsers();
    loadUsers();
    setMessage('All users have been cleared. You have been logged out.');
    setClearAllDialogOpen(false);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'team_leader':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Registered Users ({users.length})
          </Typography>
          <Box>
            <Tooltip title="Refresh user list">
              <IconButton onClick={loadUsers} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAllUsers}
              size="small"
              sx={{ ml: 1 }}
            >
              Clear All Users
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message}
          </Alert>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" py={4}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No registered users yet. Sign up to create the first account.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organizationName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.replace('_', ' ')} 
                        size="small"
                        color={getRoleColor(user.role)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.registeredAt)}</TableCell>
                    <TableCell>
                      {user.selectedPlan ? (
                        <Chip label={user.selectedPlan} size="small" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No plan
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete user">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete User Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteUser} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Users Dialog */}
        <Dialog open={clearAllDialogOpen} onClose={() => setClearAllDialogOpen(false)}>
          <DialogTitle>Clear All Users</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete ALL registered users? This will also log you out.
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearAllDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmClearAllUsers} color="error">
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUserManager; 