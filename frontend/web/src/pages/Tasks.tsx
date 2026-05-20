import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TaskDialog } from '../components/TaskDialog';
import { usePermissions } from '../hooks/usePermissions';
import { useAppSelector } from '../store';
import PermissionGuard from '../components/PermissionGuard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assignee: string;
  createdBy: string;
}

export const Tasks: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { user } = useAppSelector((state) => state.auth);
  const { 
    canCreateTasks, 
    canEditTasks, 
    canDeleteTasks, 
    canViewAllTasks,
    isEmployee 
  } = usePermissions();

  // Mock tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Project Report',
      description: 'Write and submit the quarterly project report',
      status: 'TODO',
      assignee: 'employee@timelymate.com',
      createdBy: 'admin@timelymate.com',
    },
    {
      id: '2',
      title: 'Client Meeting',
      description: 'Prepare and attend client meeting',
      status: 'IN_PROGRESS',
      assignee: 'leader@timelymate.com',
      createdBy: 'admin@timelymate.com',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review pull requests from team members',
      status: 'TODO',
      assignee: 'employee@timelymate.com',
      createdBy: 'leader@timelymate.com',
    },
  ]);

  const handleOpenDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleCreateTask = (newTask: Omit<Task, 'id' | 'createdBy'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: user?.email || 'unknown',
    };
    setTasks([...tasks, task]);
    handleCloseDialog();
  };

  const handleUpdateTask = (updatedTask: Omit<Task, 'id' | 'createdBy'>) => {
    if (!editingTask) return;
    
    const updated: Task = {
      ...editingTask,
      ...updatedTask,
    };
    
    setTasks(tasks.map(task => task.id === editingTask.id ? updated : task));
    handleCloseDialog();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleUpdateStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TODO':
        return 'default';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  const isAssignedToUser = (task: Task) => {
    return user?.email === task.assignee;
  };

  const canModifyTask = (task: Task) => {
    // Task creator or assigned user can modify status
    // Only users with edit permission can modify task details
    return isAssignedToUser(task) || task.createdBy === user?.email || canEditTasks();
  };

  // Filter tasks based on permissions
  const visibleTasks = canViewAllTasks() 
    ? tasks 
    : tasks.filter(task => isAssignedToUser(task));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <PermissionGuard permission="canCreateTasks" showMessage={false}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Task
          </Button>
        </PermissionGuard>
      </Box>

      {/* Show role information for employees */}
      {isEmployee() && (
        <Alert severity="info" sx={{ mb: 3 }}>
          As an employee, you can only view and update tasks assigned to you. 
          Contact your team leader to create new tasks or modify existing ones.
        </Alert>
      )}

      <Grid container spacing={3}>
        {visibleTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" component="h2" gutterBottom sx={{ flex: 1 }}>
                    {task.title}
                  </Typography>
                  <PermissionGuard 
                    permissions={['canEditTasks', 'canDeleteTasks']} 
                    showMessage={false}
                    fallback={
                      isAssignedToUser(task) ? (
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, task)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      ) : null
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, task)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </PermissionGuard>
                </Box>
                
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  sx={{ mb: 2 }}
                >
                  {task.description}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={getStatusColor(task.status)}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Assignee: {task.assignee}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="textSecondary">
                  Created by: {task.createdBy}
                </Typography>
              </CardContent>
              
              <CardActions>
                {isAssignedToUser(task) && (
                  <>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                      disabled={task.status === 'IN_PROGRESS'}
                    >
                      Start
                    </Button>
                    <Button 
                      size="small" 
                      color="success"
                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                      disabled={task.status === 'COMPLETED'}
                    >
                      Complete
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Task actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedTask && canEditTasks() && (
          <MenuItem onClick={() => handleEditTask(selectedTask)}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Task
          </MenuItem>
        )}
        {selectedTask && canDeleteTasks() && (
          <MenuItem 
            onClick={() => handleDeleteTask(selectedTask.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Task
          </MenuItem>
        )}
        {selectedTask && isAssignedToUser(selectedTask) && !canEditTasks() && (
          <MenuItem onClick={handleCloseMenu} disabled>
            <Typography variant="body2" color="textSecondary">
              Limited access - Contact admin for modifications
            </Typography>
          </MenuItem>
        )}
      </Menu>

      <TaskDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialTask={editingTask || undefined}
      />
    </Container>
  );
}; 