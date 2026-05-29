import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  alpha,
} from '@mui/material';
import {
  FolderPlus,
  ListTodo,
  Calendar,
  Users,
  Palette,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Building2,
  Sparkles,
} from 'lucide-react';
import type { Employee } from '../../../contexts/EmployeeContext';
import {
  popupFormLabelSx,
  popupMutedButtonSx,
  popupNestedPanelSx,
  popupPrimaryButtonSx,
} from '../../../theme/popupSurfaces';
import { lightSurfaceFormSx } from '../../../theme/formFieldStyles';

export type CreateWorkspaceMode = 'project' | 'task';

export interface NewProjectForm {
  name: string;
  description: string;
  color: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  department: string;
  selectedMembers?: string[];
}

export interface StarterTaskDraft {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NewTaskForm {
  id: string;
  title: string;
  description: string;
  assignee: { name: string; avatar: string; role: string } | null;
  status: 'todo' | 'in_progress' | 'completed' | 'pending_review';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isProjectTask: boolean;
  projectId?: string;
  createdAt: string;
  progress: number;
}

export interface ProjectOption {
  id: string;
  name: string;
  color: string;
  team: { name: string; avatar: string; role: string }[];
}

const COLOR_PRESETS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#0f172a'];

const projectRoles = [
  'Project Manager',
  'Developer',
  'Designer',
  'QA Engineer',
  'Business Analyst',
  'DevOps Engineer',
  'Product Owner',
  'Scrum Master',
];

function SectionHeader({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint?: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Icon size={18} color="#4f46e5" />
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
      </Stack>
      {hint && (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5, ml: 3.5, lineHeight: 1.45 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export interface CreateWorkspaceDialogProps {
  open: boolean;
  mode: CreateWorkspaceMode;
  onModeChange: (mode: CreateWorkspaceMode) => void;
  onClose: () => void;
  /** Seeds the form when the dialog opens */
  initialProject: NewProjectForm;
  initialStarterTasks: StarterTaskDraft[];
  initialTask: NewTaskForm;
  employees: Employee[];
  projects: ProjectOption[];
  onSubmitProject: (project: NewProjectForm, starterTasks: StarterTaskDraft[]) => void;
  onSubmitTask: (task: NewTaskForm) => void;
}

function CreateWorkspaceDialogComponent({
  open,
  mode,
  onModeChange,
  onClose,
  initialProject,
  initialStarterTasks,
  initialTask,
  employees,
  projects,
  onSubmitProject,
  onSubmitTask,
}: CreateWorkspaceDialogProps) {
  const [teamExpanded, setTeamExpanded] = useState(false);
  const [draftProject, setDraftProject] = useState(initialProject);
  const [draftStarterTasks, setDraftStarterTasks] = useState(initialStarterTasks);
  const [draftTask, setDraftTask] = useState(initialTask);

  useEffect(() => {
    if (open) {
      setDraftProject(initialProject);
      setDraftStarterTasks(initialStarterTasks);
      setDraftTask(initialTask);
    }
  }, [open, initialProject, initialStarterTasks, initialTask]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectField = <K extends keyof NewProjectForm>(key: K, value: NewProjectForm[K]) => {
    setDraftProject((prev) => ({ ...prev, [key]: value }));
  };

  const handleMemberToggle = (employeeId: string) => {
    setDraftProject((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers?.includes(employeeId)
        ? prev.selectedMembers.filter((id) => id !== employeeId)
        : [...(prev.selectedMembers || []), employeeId],
    }));
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskField = <K extends keyof NewTaskForm>(key: K, value: NewTaskForm[K]) => {
    setDraftTask((prev) => ({ ...prev, [key]: value }));
  };

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    if (!draftProject.department) return employees;
    return employees.filter((e) => e.department === draftProject.department);
  }, [employees, draftProject.department]);

  const selectedProject = projects.find((p) => p.id === draftTask.projectId);
  const assigneeOptions = selectedProject?.team ?? [];

  const canSubmitProject = Boolean(draftProject.name.trim() && draftProject.description.trim());
  const canSubmitTask = Boolean(draftTask.title.trim() && (draftTask.projectId || projects.length === 0));

  const addStarterTask = () => {
    setDraftStarterTasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        title: '',
        dueDate: draftProject.endDate || new Date().toISOString().split('T')[0],
        priority: 'medium',
      },
    ]);
  };

  const updateStarter = (id: string, patch: Partial<StarterTaskDraft>) => {
    setDraftStarterTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeStarter = (id: string) => {
    setDraftStarterTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid #e8edf4',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.16)',
          overflow: 'hidden',
          maxHeight: '92vh',
        },
      }}
    >
      <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2.5,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #0ea5e9 100%)',
            color: '#fff',
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#fff',
                }}
              >
                {mode === 'project' ? <FolderPlus size={22} /> : <ListTodo size={22} />}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                  Create workspace
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.92)', mt: 0.35, maxWidth: 420 }}>
                  Set up a new project pipeline or add a task to an existing project — everything in one place.
                </Typography>
              </Box>
            </Stack>
            <Chip
              size="small"
              icon={<Sparkles size={12} color="#1e3a8a" />}
              label="Guided setup"
              sx={{
                fontWeight: 800,
                fontSize: '0.6875rem',
                bgcolor: '#fff',
                color: '#1e3a8a',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
                '& .MuiChip-icon': { color: '#2563eb' },
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 2.5, md: 3 }, py: 1.75, bgcolor: '#f1f5f9' }}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              p: 0.5,
              borderRadius: 2,
              bgcolor: '#e2e8f0',
              border: '1px solid #cbd5e1',
            }}
          >
            {(
              [
                { id: 'project' as const, label: 'New project', icon: FolderPlus },
                { id: 'task' as const, label: 'New task', icon: ListTodo },
              ] as const
            ).map((tab) => {
              const active = mode === tab.id;
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  fullWidth
                  onClick={() => onModeChange(tab.id)}
                  startIcon={<Icon size={16} color={active ? '#1e3a8a' : '#64748b'} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    py: 1.1,
                    borderRadius: 1.5,
                    color: active ? '#0f172a' : '#64748b',
                    bgcolor: active ? '#fff' : 'transparent',
                    boxShadow: active ? '0 2px 8px rgba(15,23,42,0.1)' : 'none',
                    border: active ? '1px solid #cbd5e1' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: active ? '#fff' : 'rgba(255,255,255,0.5)',
                      color: active ? '#0f172a' : '#334155',
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Box>

      <DialogContent
        sx={{
          px: { xs: 2.5, md: 3 },
          py: 3,
          bgcolor: '#fff',
          ...lightSurfaceFormSx,
        }}
      >
        {mode === 'project' ? (
          <Stack spacing={3.5}>
            <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
              Projects appear in your command center grid. Add optional starter tasks now — you can always add more
              later from the project workspace.
            </Alert>

            <Box sx={popupNestedPanelSx}>
              <SectionHeader icon={Palette} title="Project basics" hint="Name and describe what this workspace delivers." />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={popupFormLabelSx}>Project name *</Typography>
                  <TextField
                    name="name"
                    value={draftProject.name}
                    onChange={handleProjectChange}
                    fullWidth
                    required
                    placeholder="e.g. Platform Development Q2"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={popupFormLabelSx}>Description *</Typography>
                  <TextField
                    name="description"
                    value={draftProject.description}
                    onChange={handleProjectChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Goals, scope, and success criteria for this project…"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={popupFormLabelSx}>Department / owner lane</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={draftProject.department}
                      displayEmpty
                      onChange={(e) => handleProjectField('department', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Select department</em>
                      </MenuItem>
                      {departments.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={popupFormLabelSx}>Brand color</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1 }}>
                    {COLOR_PRESETS.map((c) => (
                      <Box
                        key={c}
                        onClick={() => handleProjectField('color', c)}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          bgcolor: c,
                          cursor: 'pointer',
                          border: draftProject.color === c ? '3px solid #4f46e5' : '2px solid #fff',
                          boxShadow: '0 2px 6px rgba(15,23,42,0.12)',
                          transition: 'transform 120ms ease',
                          '&:hover': { transform: 'scale(1.08)' },
                        }}
                      />
                    ))}
                  </Stack>
                  <TextField
                    name="color"
                    type="color"
                    value={draftProject.color}
                    onChange={handleProjectChange}
                    fullWidth
                    size="small"
                    sx={{ '& input': { height: 36, cursor: 'pointer' } }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={popupNestedPanelSx}>
              <SectionHeader icon={Calendar} title="Timeline" hint="When does work start and when must it be delivered?" />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start date"
                    name="startDate"
                    type="date"
                    value={draftProject.startDate}
                    onChange={handleProjectChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Target end date"
                    name="endDate"
                    type="date"
                    value={draftProject.endDate}
                    onChange={handleProjectChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Workday start"
                    name="startTime"
                    type="time"
                    value={draftProject.startTime}
                    onChange={handleProjectChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Workday end"
                    name="endTime"
                    type="time"
                    value={draftProject.endTime}
                    onChange={handleProjectChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={popupNestedPanelSx}>
              <SectionHeader
                icon={Users}
                title="Team"
                hint="Pick who owns delivery. Filter by department or expand advanced role matching."
              />
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {(draftProject.selectedMembers ?? []).map((id) => {
                  const emp = employees.find((e) => e.id === id);
                  if (!emp) return null;
                  return (
                    <Chip
                      key={id}
                      avatar={<Avatar src={emp.avatar} sx={{ width: 24, height: 24 }}>{emp.name[0]}</Avatar>}
                      label={emp.name}
                      onDelete={() => handleMemberToggle(id)}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  );
                })}
                {(draftProject.selectedMembers?.length ?? 0) === 0 && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    No members selected — defaults will be generated from roles.
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto', pr: 0.5 }}>
                {filteredEmployees.map((employee) => {
                  const selected = draftProject.selectedMembers?.includes(employee.id);
                  return (
                    <Box
                      key={employee.id}
                      onClick={() => handleMemberToggle(employee.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selected ? '#6366f1' : '#e8edf4',
                        bgcolor: selected ? alpha('#6366f1', 0.06) : '#fff',
                        transition: 'all 150ms ease',
                        '&:hover': { borderColor: '#a5b4fc', bgcolor: '#f8fafc' },
                      }}
                    >
                      <Avatar src={employee.avatar} sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {employee.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                          {employee.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {employee.position} · {employee.department}
                        </Typography>
                      </Box>
                      {selected && <CheckCircle2 size={18} color="#4f46e5" />}
                    </Box>
                  );
                })}
              </Stack>

              <Accordion
                expanded={teamExpanded}
                onChange={() => setTeamExpanded((p) => !p)}
                disableGutters
                elevation={0}
                sx={{ mt: 2, bgcolor: 'transparent', '&::before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 0, minHeight: 40 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    Advanced: match by role
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <Grid container spacing={1.5}>
                    {projectRoles.slice(0, 4).map((role) => {
                      const matching = employees.filter(
                        (emp) =>
                          emp.position.toLowerCase().includes(role.toLowerCase()) ||
                          role.toLowerCase().includes(emp.position.toLowerCase())
                      );
                      return (
                        <Grid item xs={12} sm={6} key={role}>
                          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', mb: 0.75 }}>
                            {role}
                          </Typography>
                          {matching.slice(0, 2).map((emp) => (
                            <Chip
                              key={emp.id}
                              size="small"
                              label={emp.name}
                              onClick={() => handleMemberToggle(emp.id)}
                              variant={draftProject.selectedMembers?.includes(emp.id) ? 'filled' : 'outlined'}
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6875rem' }}
                            />
                          ))}
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={popupNestedPanelSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <SectionHeader
                  icon={ListTodo}
                  title="Starter tasks"
                  hint="Optional work items created with the project (editable later)."
                />
                <Button
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={addStarterTask}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Add task
                </Button>
              </Stack>
              {draftStarterTasks.length === 0 ? (
                <Box
                  sx={{
                    py: 3,
                    textAlign: 'center',
                    border: '1px dashed #e2e8f0',
                    borderRadius: 2,
                    bgcolor: '#fafbfc',
                  }}
                >
                  <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    No starter tasks yet. Add tasks to kick off execution immediately.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {draftStarterTasks.map((task, index) => (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid #e8edf4',
                        bgcolor: '#fff',
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8' }}>
                          Task {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => removeStarter(task.id)} aria-label="Remove task">
                          <Trash2 size={14} />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Task title"
                            value={task.title}
                            onChange={(e) => updateStarter(task.id, { title: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            size="small"
                            fullWidth
                            type="date"
                            label="Due"
                            value={task.dueDate}
                            onChange={(e) => updateStarter(task.id, { dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select
                              label="Priority"
                              value={task.priority}
                              onChange={(e) =>
                                updateStarter(task.id, { priority: e.target.value as StarterTaskDraft['priority'] })
                              }
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Tasks belong to a project workspace. Select where this work lives, then define ownership and timing.
            </Alert>

            <Box sx={popupNestedPanelSx}>
              <SectionHeader icon={Building2} title="Link to project" />
              <FormControl fullWidth size="small" required>
                <InputLabel>Project workspace</InputLabel>
                <Select
                  label="Project workspace"
                  value={draftTask.projectId ?? ''}
                  onChange={(e) => {
                    const projectId = e.target.value;
                    handleTaskField('projectId', projectId);
                    handleTaskField('isProjectTask', Boolean(projectId));
                  }}
                >
                  {projects.length === 0 ? (
                    <MenuItem value="" disabled>
                      Create a project first
                    </MenuItem>
                  ) : (
                    projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color }} />
                          <span>{p.name}</span>
                        </Stack>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>

            <Box sx={popupNestedPanelSx}>
              <SectionHeader icon={ListTodo} title="Task details" />
              <Stack spacing={2}>
                <TextField
                  label="Task title *"
                  name="title"
                  value={draftTask.title}
                  onChange={handleTaskChange}
                  fullWidth
                  size="small"
                  placeholder="What needs to be done?"
                />
                <TextField
                  label="Description"
                  name="description"
                  value={draftTask.description}
                  onChange={handleTaskChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="Acceptance criteria, links, or notes…"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Due date"
                      name="dueDate"
                      type="date"
                      value={draftTask.dueDate}
                      onChange={handleTaskChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={draftTask.priority}
                        label="Priority"
                        onChange={(e) => handleTaskField('priority', e.target.value as NewTaskForm['priority'])}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {assigneeOptions.length > 0 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Assignee</InputLabel>
                        <Select
                          value={draftTask.assignee ? JSON.stringify(draftTask.assignee) : ''}
                          label="Assignee"
                          onChange={(e) => {
                            const value = e.target.value;
                            handleTaskField('assignee', value ? JSON.parse(value) : null);
                          }}
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {assigneeOptions.map((member) => (
                            <MenuItem key={member.name} value={JSON.stringify(member)}>
                              {member.name} ({member.role})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: { xs: 2.5, md: 3 },
          py: 2,
          bgcolor: '#fafbfc',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
          {mode === 'project'
            ? `${draftStarterTasks.filter((t) => t.title.trim()).length} starter task(s) will be created`
            : draftTask.projectId
              ? `Task will be added to ${selectedProject?.name ?? 'project'}`
              : 'Select a project to continue'}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose} variant="outlined" sx={popupMutedButtonSx}>
            Cancel
          </Button>
          {mode === 'project' ? (
            <Button
              variant="contained"
              onClick={() => onSubmitProject(draftProject, draftStarterTasks)}
              disabled={!canSubmitProject}
              sx={popupPrimaryButtonSx}
            >
              Create project
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => onSubmitTask(draftTask)}
              disabled={!canSubmitTask || (projects.length > 0 && !draftTask.projectId)}
              sx={popupPrimaryButtonSx}
            >
              Create task
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export const CreateWorkspaceDialog = React.memo(CreateWorkspaceDialogComponent);
