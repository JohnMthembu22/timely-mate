import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Alert,
  Menu,
  MenuItem,
  Container,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { TaskDialog } from '../components/TaskDialog';
import { usePermissions } from '../hooks/usePermissions';
import { useAppSelector } from '../store';
import { useEmployees } from '../contexts/EmployeeContext';
import PermissionGuard from '../components/PermissionGuard';
import { useNotifications } from '../contexts/NotificationContext';
import { notifyTaskSubmittedToBriefedBy } from '../utils/taskReview';
import { getOfficeAssignableEmployees } from '../utils/offsiteWorkers';
import { getAuthUserLabel } from '../utils/managerReview';
import type { AiTaskSuggestion, Task, TaskFiltersState, TaskFormValues, TaskGroupMode, TaskPriority, TaskStatus } from './Tasks/types';
import { filterTasks, groupTasks } from './Tasks/taskUtils';
import { TaskFiltersBar } from './Tasks/components/TaskFiltersBar';
import { TaskAiSuggestions } from './Tasks/components/TaskAiSuggestions';
import { TaskCard } from './Tasks/components/TaskCard';
import { useArrayPersistence } from '../hooks/usePersistence';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function resolveAssigneeName(email: string, employees: { email?: string; name: string }[]): string {
  const match = employees.find((e) => e.email === email);
  if (match) return match.name;
  const local = email.split('@')[0]?.replace(/[._]/g, ' ') ?? 'User';
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const Tasks: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [groupMode, setGroupMode] = useState<TaskGroupMode>('status');
  const [aiSuggestions, setAiSuggestions] = useState<AiTaskSuggestion[]>([]);
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    statuses: [],
    priorities: [],
    assignee: '',
    dueFilter: 'all',
    myTasksOnly: false,
  });

  const { user } = useAppSelector((state) => state.auth);
  const { employees } = useEmployees();
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const {
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canViewAllTasks,
    isEmployee,
  } = usePermissions();

  const [tasks, setTasks] = useArrayPersistence<Task>('timelymate_tasks', []);

  const assigneeOptions = useMemo(() => {
    const fromTasks = tasks.map((t) => ({ email: t.assignee, name: t.assigneeName }));
    const fromEmp = getOfficeAssignableEmployees(employees)
      .filter((e) => e.email)
      .map((e) => ({ email: e.email!, name: e.name }));
    const map = new Map<string, string>();
    [...fromTasks, ...fromEmp].forEach((a) => map.set(a.email, a.name));
    return [...map.entries()].map(([email, name]) => ({ email, name }));
  }, [tasks, employees]);

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

  const formToTask = (form: TaskFormValues, existing?: Task): Task => ({
    id: existing?.id ?? Math.random().toString(36).slice(2, 11),
    title: form.title,
    description: form.description,
    status: form.status,
    assignee: form.assignee,
    createdBy: existing?.createdBy ?? user?.email ?? 'unknown',
    priority: form.priority,
    dueDate: form.dueDate || daysFromNow(7),
    assigneeName: resolveAssigneeName(form.assignee, employees),
    project: form.project?.trim() || 'General',
  });

  const handleCreateTask = (form: TaskFormValues) => {
    setTasks((prev) => [...prev, formToTask(form)]);
    handleCloseDialog();
  };

  const handleUpdateTask = (form: TaskFormValues) => {
    if (!editingTask) return;
    const updated = formToTask(form, editingTask);
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
    handleCloseDialog();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
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

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleSubmitForReview = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'PENDING_REVIEW' } : t))
    );
    const submitterLabel = getAuthUserLabel(user ?? undefined);
    notifyTaskSubmittedToBriefedBy({
      briefedByEmail: task.createdBy,
      taskTitle: task.title,
      submitterLabel,
      submitterEmail: user?.email,
      actionUrl: '/tasks',
      employees,
      addNotificationForRecipient,
      addNotification,
    });
  };

  const handleUpdatePriority = (taskId: string, priority: TaskPriority) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, priority } : t)));
  };

  const handleApplyAiSuggestion = (s: AiTaskSuggestion) => {
    const form: TaskFormValues = {
      title: s.title,
      description: s.reason,
      status: 'TODO',
      assignee: user?.email ?? 'employee@timelymate.com',
      priority: s.suggestedPriority,
      dueDate: daysFromNow(s.suggestedDueDays),
      project: 'AI Suggested',
    };
    setTasks((prev) => [...prev, formToTask(form)]);
    setAiSuggestions((prev) => prev.filter((x) => x.id !== s.id));
  };

  const isAssignedToUser = (task: Task) => user?.email === task.assignee;

  const canModifyTask = (task: Task) =>
    isAssignedToUser(task) || task.createdBy === user?.email || canEditTasks();

  const visibleTasks = useMemo(() => {
    const base = canViewAllTasks() ? tasks : tasks.filter((t) => isAssignedToUser(t));
    return filterTasks(base, filters, user?.email);
  }, [tasks, filters, user?.email, canViewAllTasks]);

  const grouped = useMemo(() => groupTasks(visibleTasks, groupMode), [visibleTasks, groupMode]);

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={3}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage work with filters, smart grouping, and AI suggestions
            </Typography>
          </Box>
          <PermissionGuard permission="canCreateTasks" showMessage={false}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              fullWidth
              sx={{ maxWidth: { xs: '100%', sm: 'auto' }, textTransform: 'none', fontWeight: 600, borderRadius: '3px' }}
            >
              Create Task
            </Button>
          </PermissionGuard>
        </Box>

        {isEmployee() && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: '3px' }}>
            As an employee, you can only view and update tasks assigned to you. Contact your team leader to create new
            tasks or modify existing ones.
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} lg={8}>
            <Stack gap={2}>
              <TaskFiltersBar
                filters={filters}
                groupMode={groupMode}
                assigneeOptions={assigneeOptions}
                resultCount={visibleTasks.length}
                onFiltersChange={setFilters}
                onGroupModeChange={setGroupMode}
              />

              {visibleTasks.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: '3px' }}>
                  No tasks match your filters. Try adjusting search or filters, or create a new task.
                </Alert>
              ) : (
                grouped.map((group) => (
                  <Box key={group.key}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        mb: 1.5,
                      }}
                    >
                      {group.label} ({group.tasks.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {group.tasks.map((task) => (
                        <Grid item xs={12} sm={6} key={task.id}>
                          <TaskCard
                            task={task}
                            canModify={canModifyTask(task)}
                            canEdit={canEditTasks()}
                            isAssignedToUser={isAssignedToUser(task)}
                            onOpenMenu={(e) => handleOpenMenu(e, task)}
                            onEdit={() => handleEditTask(task)}
                            onDelete={() => handleDeleteTask(task.id)}
                            onStart={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                            onComplete={() => handleSubmitForReview(task)}
                            onQuickStatus={(status) => handleUpdateStatus(task.id, status)}
                            onQuickPriority={(priority) => handleUpdatePriority(task.id, priority)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
              <TaskAiSuggestions
                suggestions={aiSuggestions}
                onApply={handleApplyAiSuggestion}
                onDismiss={(id) => setAiSuggestions((prev) => prev.filter((s) => s.id !== id))}
              />
            </Box>
          </Grid>
        </Grid>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {selectedTask && canEditTasks() && (
            <MenuItem onClick={() => handleEditTask(selectedTask)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Task
            </MenuItem>
          )}
          {selectedTask && canDeleteTasks() && (
            <MenuItem onClick={() => handleDeleteTask(selectedTask.id)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete Task
            </MenuItem>
          )}
          {selectedTask && isAssignedToUser(selectedTask) && !canEditTasks() && (
            <MenuItem onClick={handleCloseMenu} disabled>
              <Typography variant="body2" color="text.secondary">
                Limited access — contact admin for modifications
              </Typography>
            </MenuItem>
          )}
        </Menu>

        <TaskDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          initialTask={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  status: editingTask.status,
                  assignee: editingTask.assignee,
                  priority: editingTask.priority,
                  dueDate: editingTask.dueDate,
                  project: editingTask.project,
                }
              : undefined
          }
        />
      </Container>
    </DashboardLayout>
  );
};
