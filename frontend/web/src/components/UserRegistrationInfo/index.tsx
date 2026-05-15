import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import {
  PersonAdd,
  AdminPanelSettings,
  Group,
  Person,
  Info,
} from '@mui/icons-material';
import authService from '../../services/auth';

const UserRegistrationInfo: React.FC = () => {
  const registeredUsers = authService.getAllRegisteredUsers();
  const userCount = registeredUsers.length;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Info color="primary" />
        <Typography variant="h6" component="h2">
          Registration System Information
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>New Authentication System:</strong> Demo login has been removed. 
          Only registered users can now login. You must sign up to create an account.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom>
        Current Registration Status
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Registered Users: <strong>{userCount}</strong>
        </Typography>
        
        {userCount === 0 ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No users are currently registered. Sign up to create the first admin account.
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {registeredUsers.map((user) => (
              <Chip
                key={user.id}
                label={`${user.email} (${user.role})`}
                size="small"
                color={user.role === 'admin' ? 'error' : user.role === 'team_leader' ? 'warning' : 'default'}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        How Registration Works
      </Typography>
      
      <List dense>
        <ListItem>
          <ListItemIcon>
            <PersonAdd />
          </ListItemIcon>
          <ListItemText
            primary="First User Becomes Admin"
            secondary="The first person to register for an organization automatically becomes an admin"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <AdminPanelSettings />
          </ListItemIcon>
          <ListItemText
            primary="Email-Based Role Assignment"
            secondary="Emails with 'admin' become admins, 'leader' or 'manager' become team leaders, others are employees"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Group />
          </ListItemIcon>
          <ListItemText
            primary="Role-Based Permissions"
            secondary="Admins can manage all features, team leaders can manage tasks and teams, employees can only view assigned tasks"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText
            primary="User Management"
            secondary="Admins can view and manage all registered users through the Settings page"
          />
        </ListItem>
      </List>

      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Test the System:</strong> Create accounts with emails like admin@test.com, 
          leader@test.com, or employee@test.com to see different role permissions.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default UserRegistrationInfo; 