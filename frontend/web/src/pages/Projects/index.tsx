import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { notifyTaskSubmittedToBriefedBy } from '../../utils/taskReview';
import { getAuthUserLabel } from '../../utils/managerReview';
import { FieldScannerCapture } from '../OffsiteWork/FieldScannerCapture';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  AvatarGroup,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Divider,
  CardActions,
  InputAdornment,
} from '@mui/material';
import {
  QrCodeScanner,
  ViewInAr,
  Timer,
  VideoCall,
  DragIndicator,
  Edit,
  Add,
  MoreVert,
  ContentCopy,
  Download,
  Archive,
  Delete,
  PersonAdd,
  Comment as CommentIcon,
  Send,
  Close,
  FolderOpen,
  Videocam as VideocamIcon,
  CheckCircle,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import ProjectsConsole, {
  type ProjectViewMode,
  type ProjectHubRow,
  type ProjectMilestone,
  type ProjectPriority,
  type CommandQuickActionId,
} from '../../components/ProjectsConsole';
import { buildOperationalMilestones } from '../../components/ProjectsConsole/buildOperationalMilestones';
import { buildProjectInsights } from '../../components/ProjectsConsole/projectConsoleData';
import {
  buildAssignmentQueue,
  buildSmartAssignmentInsights,
  buildTeamAvailability,
  type AssignmentQueueItem,
} from '../../components/ProjectsConsole/projectAssignmentHub';
import { buildOperationsFeed } from '../../components/ProjectsConsole/projectActivityFeed';
import { buildProjectHubRow } from '../../components/ProjectsConsole/projectHubMetrics';
import {
  CreateWorkspaceDialog,
  type CreateWorkspaceMode,
  type StarterTaskDraft,
} from './components/CreateWorkspaceDialog';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useArrayPersistence } from '../../hooks/usePersistence';
import { generateProjectsFromEmployees } from '../../utils/projectSeed';
import { format, parseISO, differenceInDays } from 'date-fns';
// @ts-ignore
import { saveAs } from 'file-saver';

interface TeamMember {
  name: string;
  avatar: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember | null;
  status: 'todo' | 'in_progress' | 'completed' | 'pending_review';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isProjectTask: boolean;
  projectId?: string;
  createdBy?: string;
  createdAt: string;
  progress: number;
}

interface ProjectNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  avatar: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  color: string;
  team: TeamMember[];
  tasks: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  projectTasks: Task[];
  notes: ProjectNote[];
  createdAt?: string; // Optional creation timestamp
}

interface NewProject {
  name: string;
  description: string;
  color: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  department: string;
  teamRoles: {
    [key: string]: number; // role: number of members
  };
  selectedMembers?: string[]; // array of employee IDs
}

const projectRoles = [
  'Project Manager',
  'Developer',
  'Designer',
  'QA Engineer',
  'Business Analyst',
  'DevOps Engineer',
  'Product Owner',
  'Scrum Master'
];

const getTeamInitials = (team: TeamMember[]) =>
  team.slice(0, 4).map((m) =>
    m.name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  );

const getProjectPriority = (progress: number, endDate: string): ProjectPriority => {
  try {
    const due = parseISO(endDate.includes('T') ? endDate : `${endDate}T12:00:00`);
    const daysLeft = differenceInDays(due, new Date());
    if (daysLeft < 7 && progress < 50) return 'High';
  } catch {
    /* use progress only */
  }
  if (progress < 35) return 'High';
  if (progress >= 70) return 'Low';
  return 'Medium';
};

const initialNewProject: NewProject = {
  name: '',
  description: '',
  color: '#3b82f6',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '17:00',
  department: '',
  teamRoles: {
    'Project Manager': 1,
    'Developer': 2,
    'Designer': 1,
    'QA Engineer': 1,
    'Business Analyst': 1,
    'DevOps Engineer': 1,
    'Product Owner': 1,
    'Scrum Master': 1,
  },
  selectedMembers: [],
};

const Projects: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { user } = useAppSelector((state) => state.auth);
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const [arDialogOpen, setArDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createWorkspaceMode, setCreateWorkspaceMode] = useState<CreateWorkspaceMode>('project');
  const [starterTasks, setStarterTasks] = useState<StarterTaskDraft[]>([]);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>(initialNewProject);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useArrayPersistence<Project>('timelymate_projects', []);
  const [projectsSeeded, setProjectsSeeded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectForMenu, setSelectedProjectForMenu] = useState<Project | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    description: '',
    attendees: [] as string[],
    newAttendee: '', // For the new attendee input
  });
  const [tasksViewOpen, setTasksViewOpen] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    title: '',
    description: '',
    assignee: null,
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    isProjectTask: false,
    createdAt: new Date().toISOString(),
    progress: 0,
  });
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Add state for invoice creation dialog
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  // @ts-ignore - Used via setter function
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState({
    client: '',
    dueDate: '',
    description: '',
    lineItems: [{ description: '', amount: '' }],
  });
  const [selectedProjectForNotes, setSelectedProjectForNotes] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid');

  // Seed starter projects once when roster exists and nothing is saved yet
  useEffect(() => {
    if (projectsSeeded || employees.length === 0 || projects.length > 0) return;
    setProjects(generateProjectsFromEmployees(employees) as Project[]);
    setProjectsSeeded(true);
  }, [employees, projects.length, projectsSeeded, setProjects]);

  const handleScanProject = () => {
    setIsScanning(true);
  };

  const handleProjectTagScan = (data: string) => {
    const match = projects.find(
      (p) =>
        p.id === data ||
        p.name.toLowerCase() === data.toLowerCase() ||
        data.toLowerCase().includes(p.id.toLowerCase())
    );
    if (match) {
      setSelectedProject(match);
      addNotification(
        createNotification.system('Project tag verified', `Opened workspace: ${match.name}`, 'medium')
      );
    } else {
      addNotification(
        createNotification.system('Tag scanned', `Code: ${data.slice(0, 80)}`, 'medium')
      );
    }
    setIsScanning(false);
  };

  const handleArPreview = (project: Project) => {
    setSelectedProject(project);
    setArDialogOpen(true);
  };

  const handleNewProjectOpen = () => {
    setCreateWorkspaceMode('project');
    setNewProject(initialNewProject);
    setStarterTasks([]);
    setCreateWorkspaceOpen(true);
  };

  const handleCreateWorkspaceClose = () => {
    setCreateWorkspaceOpen(false);
    setStarterTasks([]);
  };

  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewProjectField = <K extends keyof NewProject>(key: K, value: NewProject[K]) => {
    setNewProject((prev) => ({ ...prev, [key]: value }));
  };

  const handleMemberSelection = (employeeId: string) => {
    setNewProject(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers?.includes(employeeId)
        ? prev.selectedMembers.filter(id => id !== employeeId)
        : [...(prev.selectedMembers || []), employeeId],
    }));
  };

  const handleNewProjectSubmit = () => {
    const newId = `project-${Date.now()}`;
    
    // Create team members based on selected members
    const team: TeamMember[] = [];
    
    // If specific members are selected, use them first
    if (newProject.selectedMembers && newProject.selectedMembers.length > 0) {
      newProject.selectedMembers.forEach(employeeId => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
          // Find the best matching role for this employee
          const bestRole = projectRoles.find(role => 
            employee.position.toLowerCase().includes(role.toLowerCase()) ||
            role.toLowerCase().includes(employee.position.toLowerCase())
          ) || 'Team Member';
          
          team.push({
            name: employee.name,
            avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
            role: bestRole,
          });
        }
      });
    }
    
    // If no members were selected, create default team based on roles
    if (team.length === 0) {
      projectRoles.forEach(role => {
      // Find employees that match this role
      const matchingEmployees = employees.filter(emp => 
        emp.position.toLowerCase().includes(role.toLowerCase()) ||
        role.toLowerCase().includes(emp.position.toLowerCase())
      );
      
        if (matchingEmployees.length > 0) {
          // Use the first matching employee
          const employee = matchingEmployees[0];
          team.push({
            name: employee.name,
            avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
            role: role,
          });
        } else {
          // Create placeholder member
          team.push({
            name: `${role} 1`,
            avatar: role.charAt(0),
            role: role,
          });
      }
    });
    }

    const validStarters = starterTasks.filter((t) => t.title.trim());
    const starterProjectTasks: Task[] = validStarters.map((t) => ({
      id: `task-${Date.now()}-${t.id}`,
      title: t.title.trim(),
      description: '',
      assignee: null,
      status: 'todo',
      dueDate: t.dueDate,
      priority: t.priority,
      isProjectTask: true,
      projectId: newId,
      createdBy: user?.email ?? 'admin@timelymate.com',
      createdAt: new Date().toISOString(),
      progress: 0,
    }));

    const projectToAdd: Project = {
      id: newId,
      name: newProject.name,
      description: newProject.description,
      progress: 0,
      color: newProject.color,
      team,
      tasks: starterProjectTasks.length,
      completedTasks: 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      startTime: newProject.startTime,
      endTime: newProject.endTime,
      projectTasks: starterProjectTasks,
      notes: [],
      createdAt: new Date().toISOString(),
    } as Project;

    setProjects((prev) => [projectToAdd, ...prev]);
    setCreateWorkspaceOpen(false);
    setNewProject(initialNewProject);
    setStarterTasks([]);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject({...project});
    setEditProjectDialogOpen(true);
  };

  const handleEditProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProject) return;
    const { name, value } = e.target;
    setEditingProject(prev => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleEditRoleCountChange = (role: string, count: number) => {
    if (!editingProject) return;
    
    // Get existing team members with this role
    const existingMembers = editingProject.team.filter(member => member.role === role);
    let newTeam = editingProject.team.filter(member => member.role !== role);
    
    // Add or remove team members as needed
    if (count > existingMembers.length) {
      // Add new members
      for (let i = existingMembers.length; i < count; i++) {
        newTeam.push({
          name: `${role} ${i + 1}`,
          avatar: role.charAt(0),
          role: role,
        });
      }
    } else {
      // Keep only the first 'count' members of this role
      newTeam = [...newTeam, ...existingMembers.slice(0, count)];
    }

    setEditingProject(prev => ({
      ...prev!,
      team: newTeam,
    }));
  };

  const handleEditProjectSubmit = () => {
    if (!editingProject) return;
    
    setProjects(prev => 
      prev.map(p => p.id === editingProject.id ? editingProject : p)
    );
    setEditProjectDialogOpen(false);
    setEditingProject(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectForMenu(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectForMenu(null);
  };

  const handleDeleteProject = () => {
    if (!selectedProjectForMenu) return;
    setProjects(prev => prev.filter(p => p.id !== selectedProjectForMenu.id));
    handleMenuClose();
  };

  const handleDuplicateProject = () => {
    if (!selectedProjectForMenu) return;
    const newProject = {
      ...selectedProjectForMenu,
      id: (projects.length + 1).toString(),
      name: `${selectedProjectForMenu.name} (Copy)`,
    };
    setProjects(prev => [...prev, newProject]);
    handleMenuClose();
  };

  const handleArchiveProject = () => {
    if (!selectedProjectForMenu) return;
    // Add archive logic here
    handleMenuClose();
  };

  const handleExportProject = () => {
    if (!selectedProjectForMenu) return;
    const projectData = JSON.stringify(selectedProjectForMenu, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProjectForMenu.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const handleScheduleMeeting = (project: Project) => {
    setSelectedProject(project);
    setNewMeeting(prev => ({
      ...prev,
      title: `${project.name} Team Meeting`,
      attendees: project.team.map(member => member.name),
    }));
    setMeetingDialogOpen(true);
  };

  const handleMeetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateMeeting = () => {
    // Here you would typically integrate with a calendar API
    // For now, we'll just show a success message
    alert(`Meeting "${newMeeting.title}" scheduled for ${newMeeting.date} at ${newMeeting.time}`);
    setMeetingDialogOpen(false);
    setNewMeeting({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      description: '',
      attendees: [],
      newAttendee: '',
    });
  };

  const handleTaskClick = (project: Project) => {
    setSelectedProject(project);
    setTasksViewOpen(true);
  };

  const resetNewTaskForm = (project?: Project) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    description: '',
    assignee: null,
    status: 'todo' as const,
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as const,
    isProjectTask: !!project,
    projectId: project?.id,
    createdAt: new Date().toISOString(),
    progress: 0,
  });

  const handleNewTask = (project?: Project) => {
    setSelectedProject(project || null);
    setCreateWorkspaceMode('task');
    setNewTask(resetNewTaskForm(project));
    setCreateWorkspaceOpen(true);
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaskField = <K extends keyof Task>(key: K, value: Task[K]) => {
    setNewTask((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaskSubmit = () => {
    const targetProjectId = newTask.projectId;
    if (!targetProjectId) return;

    const taskToAdd: Task = {
      ...newTask,
      isProjectTask: true,
      projectId: targetProjectId,
      createdBy: user?.email ?? 'admin@timelymate.com',
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetProjectId) {
          return {
            ...p,
            projectTasks: [...p.projectTasks, taskToAdd],
            tasks: p.tasks + 1,
          };
        }
        return p;
      })
    );

    const target = projects.find((p) => p.id === targetProjectId);
    if (target) setSelectedProject(target);

    setCreateWorkspaceOpen(false);
    setNewTask(resetNewTaskForm());
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (selectedProject) {
      setProjects(prev => prev.map(p => {
        if (p.id === selectedProject.id) {
          const updatedTasks = p.projectTasks.map(t => {
            if (t.id === taskId) {
              return { ...t, status: newStatus };
            }
            return t;
          });
          return {
            ...p,
            projectTasks: updatedTasks,
            completedTasks: updatedTasks.filter(t => t.status === 'completed').length,
          };
        }
        return p;
      }));
    }
  };

  const handleSubmitTaskForReview = (task: Task) => {
    handleTaskStatusChange(task.id, 'pending_review');
    const submitterLabel = getAuthUserLabel(user ?? undefined);
    notifyTaskSubmittedToBriefedBy({
      briefedByEmail: task.createdBy ?? user?.email ?? 'admin@timelymate.com',
      taskTitle: task.title,
      submitterLabel,
      submitterEmail: user?.email,
      actionUrl: '/projects',
      employees,
      addNotificationForRecipient,
      addNotification,
    });
  };

  const handleAssigneeClick = (task: Task) => {
    setTaskToAssign(task);
    setAssignmentDialogOpen(true);
  };

  const handleAssignTask = (member: TeamMember | null) => {
    if (!selectedProject || !taskToAssign) return;

    setProjects(prev => prev.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          projectTasks: p.projectTasks.map(t => {
            if (t.id === taskToAssign.id) {
              return { ...t, assignee: member };
            }
            return t;
          }),
        };
      }
      return p;
    }));
    setAssignmentDialogOpen(false);
    setTaskToAssign(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskDialogOpen(true);
  };

  const handleEditTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingTask) return;
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleEditTaskSubmit = () => {
    if (!selectedProject || !editingTask) return;

    setProjects(prev => prev.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          projectTasks: p.projectTasks.map(t => 
            t.id === editingTask.id ? editingTask : t
          ),
          completedTasks: p.projectTasks.filter(t => 
            t.id === editingTask.id ? editingTask.status === 'completed' : t.status === 'completed'
          ).length,
        };
      }
      return p;
    }));
    setEditTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleOpenNotes = (project: Project) => {
    setSelectedProjectForNotes(project);
    setNotesDialogOpen(true);
  };

  const handleAddNote = () => {
    if (!selectedProjectForNotes || !newNote.trim()) return;

    const note: ProjectNote = {
      id: Math.random().toString(36).substr(2, 9),
      content: newNote.trim(),
      author: 'Current User', // In a real app, this would be the logged-in user
      timestamp: new Date().toISOString(),
      avatar: 'U',
    };

    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectForNotes.id) {
        return {
          ...p,
          notes: [...p.notes, note],
        };
      }
      return p;
    }));

    setNewNote('');
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsOpen(true);
  };

  const handleProjectClickById = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) handleProjectClick(project);
  };

  useEffect(() => {
    const state = location.state as {
      openProjectId?: string;
      openProjectName?: string;
      openCreateProject?: boolean;
    } | null;
    if (!state) return;

    if (state.openCreateProject) {
      setCreateWorkspaceMode('project');
      setNewProject(initialNewProject);
      setStarterTasks([]);
      setCreateWorkspaceOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (!state.openProjectId && !state.openProjectName) return;
    if (projects.length === 0) return;

    let project =
      state.openProjectId != null
        ? projects.find((p) => p.id === state.openProjectId)
        : undefined;

    if (!project && state.openProjectName) {
      const nameLower = state.openProjectName.toLowerCase();
      project = projects.find(
        (p) =>
          p.name.toLowerCase() === nameLower ||
          nameLower.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(nameLower)
      );
    }

    if (project) {
      setSelectedProject(project);
      setProjectDetailsOpen(true);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, projects, location.pathname, navigate]);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      }),
    [projects]
  );

  const projectHubRows: ProjectHubRow[] = useMemo(
    () =>
      sortedProjects.map((p) => {
        const dueLabel = (() => {
          try {
            return format(parseISO(p.endDate.includes('T') ? p.endDate : `${p.endDate}T12:00:00`), 'd MMM');
          } catch {
            return p.endDate;
          }
        })();
        return buildProjectHubRow(
          {
            id: p.id,
            name: p.name,
            description: p.description,
            progress: p.progress,
            color: p.color,
            tasks: p.tasks,
            completedTasks: p.completedTasks,
            endDate: p.endDate,
            team: p.team,
            projectTasks: p.projectTasks,
          },
          getProjectPriority(p.progress, p.endDate),
          dueLabel
        );
      }),
    [sortedProjects]
  );

  const projectInsights = useMemo(() => buildProjectInsights(projects), [projects]);

  const hubById = useMemo(
    () => new Map(projectHubRows.map((r) => [r.id, r])),
    [projectHubRows]
  );

  const hubProjects = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        endDate: p.endDate,
        progress: p.progress,
        team: p.team,
        projectTasks: p.projectTasks,
        notes: p.notes,
      })),
    [projects]
  );

  const assignmentInsights = useMemo(
    () => buildSmartAssignmentInsights(hubProjects, employees),
    [hubProjects, employees]
  );

  const assignmentQueue = useMemo(() => buildAssignmentQueue(hubProjects), [hubProjects]);

  const teamLanes = useMemo(
    () => buildTeamAvailability(employees, hubProjects),
    [employees, hubProjects]
  );

  const operationsFeed = useMemo(() => buildOperationsFeed(hubProjects), [hubProjects]);

  const consoleDepartments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees]
  );

  const consoleProjectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.name })),
    [projects]
  );

  const handleQuickAssign = (item: AssignmentQueueItem, employeeId: string) => {
    if (!item.taskId || item.projectId === 'demo') {
      return;
    }

    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    const assignee: TeamMember = {
      name: employee.name,
      avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
      role: employee.position,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== item.projectId) return p;
        const updatedTasks = p.projectTasks.map((t) =>
          t.id === item.taskId ? { ...t, assignee, status: t.status === 'todo' ? 'in_progress' : t.status } : t
        );
        return { ...p, projectTasks: updatedTasks };
      })
    );
  };

  const projectMilestones: ProjectMilestone[] = useMemo(
    () =>
      buildOperationalMilestones(
        [...projects]
          .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
          .slice(0, 8)
          .map((p) => ({
            id: p.id,
            name: p.name,
            endDate: p.endDate,
            progress: p.progress,
            color: p.color,
            team: p.team,
            projectTasks: p.projectTasks,
          })),
        hubById
      ),
    [projects, hubById]
  );

  const handleCommandAction = (action: CommandQuickActionId) => {
    switch (action) {
      case 'generate-report':
        navigate('/reports');
        break;
      case 'assign-resources':
        addNotification('Open the assignment hub above to drag tasks onto team lanes.', 'info');
        break;
      case 'launch-meeting':
        setMeetingDialogOpen(true);
        break;
      case 'open-timeline':
        navigate('/calendar');
        break;
      case 'export-dashboard': {
        const rows = [
          ['Project', 'Progress', 'Health', 'Department', 'Risk', 'Due'],
          ...projectHubRows.map((r) => [
            r.name,
            `${r.progress}%`,
            `${r.healthScore}%`,
            r.department,
            r.aiRiskLabel,
            r.dueLabel,
          ]),
        ];
        const csv = rows.map((row) => row.join(',')).join('\n');
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `projects-dashboard-${Date.now()}.csv`);
        addNotification('Dashboard exported as CSV.', 'success');
        break;
      }
      case 'notify-team':
        addNotification('Team notification queued for all active project leads.', 'success');
        break;
      default:
        break;
    }
  };

  const handleMilestoneNotify = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    addNotification(
      project
        ? `Reminder sent to ${project.team[0]?.name ?? 'project lead'} for ${project.name}.`
        : 'Team notification sent.',
      'success'
    );
  };

  // Invoice handling functions
  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (idx: number, field: string, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const handleAddLineItem = () => {
    setInvoiceData(prev => ({ ...prev, lineItems: [...prev.lineItems, { description: '', amount: '' }] }));
  };

  const handleRemoveLineItem = (idx: number) => {
    setInvoiceData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));
  };

  const handleSaveInvoice = () => {
    setInvoices(prev => [...prev, { ...invoiceData, id: Date.now(), projectId: selectedProject?.id }]);
    setOpenInvoiceDialog(false);
    setInvoiceData({ client: '', dueDate: '', description: '', lineItems: [{ description: '', amount: '' }] });
  };

  const handleDownloadInvoiceCSV = () => {
    const headers = ['Description', 'Amount'];
    const rows = invoiceData.lineItems.map(item => [item.description, item.amount]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `invoice_${invoiceData.client}_${invoiceData.dueDate}.csv`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Page header */}
        <Box
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            py: { xs: 2.5, sm: 3, md: 3.5 },
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h3"
              sx={{
                mb: 1,
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Project Management
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', opacity: 0.92, fontSize: { xs: '0.9375rem', md: '1.0625rem' }, fontWeight: 500 }}>
              Manage projects with advanced tracking and collaboration tools
            </Typography>
          </Container>
        </Box>

        <ProjectsConsole
          projects={projectHubRows}
          milestones={projectMilestones}
          insights={projectInsights}
          assignmentInsights={assignmentInsights}
          assignmentQueue={assignmentQueue}
          teamLanes={teamLanes}
          operationsFeed={operationsFeed}
          departments={consoleDepartments}
          projectOptions={consoleProjectOptions}
          employeeCount={employees.length}
          isLoading={!projectsSeeded && employees.length > 0 && projects.length === 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewProject={handleNewProjectOpen}
          onProjectClick={handleProjectClickById}
          onProjectTasks={(projectId) => {
            const project = projects.find((p) => p.id === projectId);
            if (project) handleTaskClick(project);
          }}
          onProjectMenu={(e, projectId) => {
            const project = projects.find((p) => p.id === projectId);
            if (project) handleMenuClick(e, project);
          }}
          onQuickAssign={handleQuickAssign}
          onCommandAction={handleCommandAction}
          onNotifyTeam={handleMilestoneNotify}
        />

        {/* AR Preview Dialog */}
        <Dialog
          open={arDialogOpen}
          onClose={() => setArDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>AR Project Preview</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ py: 2 }}>
              <Typography variant="h6">
                {selectedProject?.name}
              </Typography>
              <Box sx={{ 
                height: 300, 
                bgcolor: 'background.default',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'divider',
              }}>
                <Stack spacing={2} alignItems="center">
                  <ViewInAr sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography>
                    Point your camera at the workspace to view project details in AR
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArDialogOpen(false)}>Close</Button>
            <Button variant="contained" onClick={() => setArDialogOpen(false)}>
              Start AR Preview
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Scanner Dialog */}
        <Dialog open={isScanning} onClose={() => setIsScanning(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Scan project tag</DialogTitle>
          <DialogContent>
            <FieldScannerCapture
              active={isScanning}
              mode="qr"
              userName={getAuthUserLabel(user ?? undefined)}
              accentColor="#6366f1"
              onScan={(result) => handleProjectTagScan(result.data)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsScanning(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <CreateWorkspaceDialog
          open={createWorkspaceOpen}
          mode={createWorkspaceMode}
          onModeChange={setCreateWorkspaceMode}
          onClose={handleCreateWorkspaceClose}
          newProject={newProject}
          onProjectChange={handleNewProjectChange}
          onProjectField={handleNewProjectField}
          onMemberToggle={handleMemberSelection}
          starterTasks={starterTasks}
          onStarterTasksChange={setStarterTasks}
          newTask={newTask}
          onTaskChange={handleTaskChange}
          onTaskField={handleTaskField}
          employees={employees}
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            team: p.team,
          }))}
          onSubmitProject={handleNewProjectSubmit}
          onSubmitTask={handleTaskSubmit}
        />

        {/* Edit Project Dialog */}
        <Dialog 
          open={editProjectDialogOpen} 
          onClose={() => setEditProjectDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            {editingProject && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Project Name"
                  name="name"
                  value={editingProject.name}
                  onChange={handleEditProjectChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={editingProject.description}
                  onChange={handleEditProjectChange}
                  multiline
                  rows={3}
                  fullWidth
                  required
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Project Color"
                      name="color"
                      type="color"
                      value={editingProject.color}
                      onChange={handleEditProjectChange}
                      fullWidth
                      sx={{
                        '& input': {
                          height: 40,
                          padding: 1,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Date and Time Settings */}
                <Typography variant="h6" sx={{ mt: 2 }}>Project Schedule</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={editingProject.startDate}
                      onChange={handleEditProjectChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={editingProject.endDate}
                      onChange={handleEditProjectChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Time"
                      name="startTime"
                      type="time"
                      value={editingProject.startTime}
                      onChange={handleEditProjectChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Time"
                      name="endTime"
                      type="time"
                      value={editingProject.endTime}
                      onChange={handleEditProjectChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                {/* Team Roles */}
                <Typography variant="h6">Team Composition</Typography>
                <Grid container spacing={2}>
                  {projectRoles.map((role) => {
                    const membersInRole = editingProject.team.filter(m => m.role === role).length;
                    return (
                      <Grid item xs={12} sm={6} key={role}>
                        <FormControl fullWidth>
                          <InputLabel id={`edit-role-${role}-label`}>{role}</InputLabel>
                          <Select
                            labelId={`edit-role-${role}-label`}
                            label={role}
                            value={membersInRole}
                            onChange={(e) => handleEditRoleCountChange(role, Number(e.target.value))}
                          >
                            {[0, 1, 2, 3, 4, 5].map((count) => (
                              <MenuItem key={count} value={count}>
                                {count} {count === 1 ? 'member' : 'members'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Current Team Members */}
                <Typography variant="h6">Current Team</Typography>
                <Grid container spacing={1}>
                  {editingProject.team.map((member, index) => (
                    <Grid item key={index}>
                      <Chip
                        avatar={<Avatar sx={{ bgcolor: editingProject.color }}>{member.avatar}</Avatar>}
                        label={`${member.name} (${member.role})`}
                        sx={{ bgcolor: editingProject.color + '20', color: editingProject.color }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Project Stats */}
                <Typography variant="h6">Project Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Total Tasks"
                      name="tasks"
                      type="number"
                      value={editingProject.tasks}
                      onChange={handleEditProjectChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Completed Tasks"
                      name="completedTasks"
                      type="number"
                      value={editingProject.completedTasks}
                      onChange={handleEditProjectChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography>Progress:</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={editingProject.progress}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: editingProject.color + '20',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: editingProject.color,
                          },
                        }}
                      />
                      <Typography>{editingProject.progress}%</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProjectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleEditProjectSubmit}
              disabled={!editingProject?.name || !editingProject?.description}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Project Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItemComponent onClick={handleDuplicateProject}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate Project</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={handleExportProject}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Project</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={handleArchiveProject}>
            <ListItemIcon>
              <Archive fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive Project</ListItemText>
          </MenuItemComponent>
          <Divider />
          <MenuItemComponent onClick={handleDeleteProject} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Project</ListItemText>
          </MenuItemComponent>
        </Menu>

        {/* Schedule Meeting Dialog */}
        <Dialog 
          open={meetingDialogOpen} 
          onClose={() => setMeetingDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Schedule Team Meeting</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Meeting Title"
                name="title"
                value={newMeeting.title}
                onChange={handleMeetingChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={newMeeting.description}
                onChange={handleMeetingChange}
                multiline
                rows={3}
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={handleMeetingChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Time"
                    name="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={handleMeetingChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    value={newMeeting.duration}
                    onChange={handleMeetingChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 15, max: 180, step: 15 }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Attendees Section */}
              <Typography variant="h6">Attendees</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Add Attendee"
                      value={newMeeting.newAttendee}
                      onChange={(e) => setNewMeeting(prev => ({
                        ...prev,
                        newAttendee: e.target.value
                      }))}
                      placeholder="Enter email or name"
                      fullWidth
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMeeting.newAttendee.trim()) {
                          e.preventDefault();
                          setNewMeeting(prev => ({
                            ...prev,
                            attendees: [...prev.attendees, prev.newAttendee.trim()],
                            newAttendee: ''
                          }));
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (newMeeting.newAttendee.trim()) {
                          setNewMeeting(prev => ({
                            ...prev,
                            attendees: [...prev.attendees, prev.newAttendee.trim()],
                            newAttendee: ''
                          }));
                        }
                      }}
                      disabled={!newMeeting.newAttendee.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Project Team Members
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedProject?.team.map((member, index) => (
                      <Chip
                        key={index}
                        label={`${member.name} (${member.role})`}
                        color={newMeeting.attendees.includes(member.name) ? "primary" : "default"}
                        onClick={() => {
                          setNewMeeting(prev => ({
                            ...prev,
                            attendees: prev.attendees.includes(member.name)
                              ? prev.attendees.filter(a => a !== member.name)
                              : [...prev.attendees, member.name]
                          }));
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Additional Attendees
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {newMeeting.attendees
                      .filter(attendee => !selectedProject?.team.some(member => member.name === attendee))
                      .map((attendee, index) => (
                        <Chip
                          key={index}
                          label={attendee}
                          onDelete={() => {
                            setNewMeeting(prev => ({
                              ...prev,
                              attendees: prev.attendees.filter(a => a !== attendee)
                            }));
                          }}
                          color="primary"
                        />
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMeetingDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateMeeting}
              disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
            >
              Schedule Meeting
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tasks View Dialog */}
        <Dialog
          open={tasksViewOpen}
          onClose={() => setTasksViewOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${selectedProject?.color || '#2196f3'} 0%, ${selectedProject?.color || '#2196f3'}CC 100%)`,
            color: 'white',
            borderRadius: '16px 16px 0 0',
            p: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '16px 16px 0 0',
              pointerEvents: 'none'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <Add sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {selectedProject ? `${selectedProject.name} Tasks` : 'All Tasks'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    opacity: 0.95, 
                    fontWeight: 500,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    Manage and track project tasks
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleNewTask(selectedProject || undefined)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                New Task
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4, background: 'transparent' }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Task Status Columns */}
              {(['todo', 'in_progress', 'pending_review', 'completed'] as const).map((status) => (
                <Grid item xs={12} sm={6} md={3} key={status}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    minHeight: '400px'
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      fontWeight: 'bold',
                      color: status === 'completed' ? 'success.main' :
                             status === 'pending_review' ? 'info.main' :
                             status === 'in_progress' ? 'warning.main' :
                             'text.primary'
                    }}>
                      {status === 'todo' ? 'To Do' :
                       status === 'in_progress' ? 'In Progress' :
                       status === 'pending_review' ? 'Pending review' :
                       'Completed'}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {selectedProject?.projectTasks.filter(t => t.status === status).length} tasks
                      </Typography>
                    </Typography>
                    <Stack spacing={2}>
                      {selectedProject?.projectTasks
                        .filter(task => task.status === status)
                        .map(task => (
                          <Card key={task.id} sx={{
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ 
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  '&:hover': { color: selectedProject?.color }
                                }} onClick={() => handleEditTask(task)}>
                                  {task.title}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditTask(task)}
                                  sx={{ 
                                    color: selectedProject?.color,
                                    '&:hover': { bgcolor: `${selectedProject?.color}15` }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {task.description}
                              </Typography>
                              {task.status === 'in_progress' && (
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Progress: {task.progress}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={task.progress}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: `${selectedProject?.color}20`,
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: selectedProject?.color,
                                        borderRadius: 4,
                                      },
                                    }}
                                  />
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Chip
                                  size="small"
                                  label={task.priority}
                                  sx={{
                                    bgcolor: task.priority === 'high' ? 'error.light' :
                                           task.priority === 'medium' ? 'warning.light' : 'success.light',
                                    color: task.priority === 'high' ? 'error.dark' :
                                           task.priority === 'medium' ? 'warning.dark' : 'success.dark',
                                    fontWeight: 600,
                                    borderRadius: 2
                                  }}
                                />
                                {task.assignee && (
                                  <Chip
                                    avatar={<Avatar sx={{ bgcolor: selectedProject?.color }}>{task.assignee.avatar}</Avatar>}
                                    label={`${task.assignee.name}`}
                                    onClick={() => handleAssigneeClick(task)}
                                    clickable
                                    sx={{ 
                                      '&:hover': { bgcolor: `${selectedProject?.color}15` },
                                      borderRadius: 2
                                    }}
                                  />
                                )}
                                {!task.assignee && (
                                  <Chip
                                    icon={<PersonAdd />}
                                    label="Assign"
                                    onClick={() => handleAssigneeClick(task)}
                                    clickable
                                    variant="outlined"
                                    sx={{ 
                                      '&:hover': { bgcolor: `${selectedProject?.color}15` },
                                      borderRadius: 2
                                    }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                <FormControl size="small" sx={{ flex: 1 }}>
                                <Select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])}
                                    sx={{
                                      borderRadius: 2,
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255,255,255,0.5)',
                                      }
                                    }}
                                >
                                  <MenuItem value="todo">To Do</MenuItem>
                                  <MenuItem value="in_progress">In Progress</MenuItem>
                                  <MenuItem value="pending_review">Pending review</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                              </FormControl>
                                {(task.status === 'todo' || task.status === 'in_progress') && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleSubmitTaskForReview(task)}
                                    sx={{
                                      borderRadius: 2,
                                      px: 2,
                                      py: 0.5,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: `linear-gradient(135deg, ${selectedProject?.color} 0%, ${selectedProject?.color}CC 100%)`,
                                      '&:hover': {
                                        background: `linear-gradient(135deg, ${selectedProject?.color}CC 0%, ${selectedProject?.color} 100%)`,
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      },
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    Submit for review
                                  </Button>
                                )}
                              </Box>
                            </CardActions>
                          </Card>
                        ))}
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog
          open={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Assign Task
            {taskToAssign && (
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                {taskToAssign.title}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {taskToAssign?.assignee && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Assignee
                  </Typography>
                  <Chip
                    avatar={<Avatar>{taskToAssign.assignee.avatar}</Avatar>}
                    label={`${taskToAssign.assignee.name} (${taskToAssign.assignee.role})`}
                    onDelete={() => handleAssignTask(null)}
                    sx={{ bgcolor: 'primary.light' }}
                  />
                </Box>
              )}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Team Members
              </Typography>
              <Stack spacing={1}>
                {selectedProject?.team.map((member) => (
                  <Card
                    key={member.name}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: taskToAssign?.assignee?.name === member.name ? 'primary.light' : 'background.paper',
                    }}
                    onClick={() => handleAssignTask(member)}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: selectedProject.color }}>
                        {member.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.role}
                        </Typography>
                      </Box>
                      {taskToAssign?.assignee?.name === member.name && (
                        <Chip
                          size="small"
                          label="Current"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog
          open={editTaskDialogOpen}
          onClose={() => setEditTaskDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            {editingTask && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Task Title"
                  name="title"
                  value={editingTask.title}
                  onChange={handleEditTaskChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={editingTask.description}
                  onChange={handleEditTaskChange}
                  multiline
                  rows={3}
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Due Date"
                      name="dueDate"
                      type="date"
                      value={editingTask.dueDate}
                      onChange={handleEditTaskChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={editingTask.priority}
                        onChange={(e) => handleEditTaskChange(e as any)}
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={editingTask.status}
                        onChange={(e) => handleEditTaskChange(e as any)}
                        label="Status"
                      >
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {editingTask.status === 'in_progress' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Progress (%)"
                        name="progress"
                        type="number"
                        value={editingTask.progress}
                        onChange={handleEditTaskChange}
                        fullWidth
                        InputProps={{
                          inputProps: { min: 0, max: 100 }
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditTaskDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleEditTaskSubmit}
              disabled={!editingTask?.title}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog
          open={notesDialogOpen}
          onClose={() => setNotesDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Project Notes - {selectedProjectForNotes?.name}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Notes List */}
              <List>
                {selectedProjectForNotes?.notes.map((note) => (
                  <React.Fragment key={note.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: selectedProjectForNotes?.color }}>
                          {note.avatar}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {note.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(note.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={note.content}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>

              {/* Add Note */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  multiline
                  maxRows={3}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          color="primary"
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotesDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Project Details Dialog */}
        <Dialog
          open={projectDetailsOpen}
          onClose={() => setProjectDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${selectedProject?.color || '#2196f3'} 0%, ${selectedProject?.color || '#2196f3'}CC 100%)`,
            color: 'white',
            borderRadius: '16px 16px 0 0',
            p: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '16px 16px 0 0',
              pointerEvents: 'none'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <FolderOpen sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {selectedProject?.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    opacity: 0.95, 
                    fontWeight: 500,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    Project Details & Management
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => handleEditProject(selectedProject!)}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  onClick={() => setProjectDetailsOpen(false)}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4, background: 'transparent' }}>
            {selectedProject && (
              <Stack spacing={4} sx={{ mt: 2 }}>
                {/* Project Overview */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Project Overview
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {selectedProject.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${selectedProject.completedTasks}/${selectedProject.tasks} tasks completed`}
                      sx={{ 
                        bgcolor: `${selectedProject.color}20`, 
                        color: selectedProject.color,
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                    <Chip
                      label={`${selectedProject.progress}% complete`}
                      sx={{ 
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                  </Box>
                </Box>

                {/* Progress Bar */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Project Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={selectedProject.progress}
                    sx={{
                        flexGrow: 1,
                        height: 16,
                        borderRadius: 8,
                        bgcolor: `${selectedProject.color}20`,
                      '& .MuiLinearProgress-bar': {
                          bgcolor: selectedProject.color,
                          borderRadius: 8,
                      },
                    }}
                  />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: selectedProject.color, minWidth: '50px' }}>
                      {selectedProject.progress}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {selectedProject.progress === 100 ? 'Project Completed' : selectedProject.progress > 75 ? 'Almost Finished' : selectedProject.progress > 50 ? 'In Progress' : 'Getting Started'}
                  </Typography>
                </Box>

                {/* Team Members */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Team Members ({selectedProject.team.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedProject.team.map((member, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          }
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar 
                                src={member.avatar}
                                sx={{ 
                                  bgcolor: selectedProject.color,
                                  width: 40,
                                  height: 40,
                                  fontWeight: 'bold'
                                }}
                              >
                                {member.avatar || member.name.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {member.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Project Schedule */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Project Schedule
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Start Date"
                        value={selectedProject.startDate}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="End Date"
                        value={selectedProject.endDate}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Start Time"
                        value={selectedProject.startTime}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="End Time"
                        value={selectedProject.endTime}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Quick Actions */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Quick Actions
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setProjectDetailsOpen(false);
                        handleNewTask(selectedProject);
                      }}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${selectedProject.color} 0%, ${selectedProject.color}CC 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${selectedProject.color}CC 0%, ${selectedProject.color} 100%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Add Task
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<VideoCall />}
                      onClick={() => {
                        setProjectDetailsOpen(false);
                        handleScheduleMeeting(selectedProject);
                      }}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        borderColor: selectedProject.color,
                        color: selectedProject.color,
                        '&:hover': {
                          borderColor: selectedProject.color,
                          bgcolor: `${selectedProject.color}15`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CommentIcon />}
                      onClick={() => {
                        setProjectDetailsOpen(false);
                        handleOpenNotes(selectedProject);
                      }}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        borderColor: selectedProject.color,
                        color: selectedProject.color,
                        '&:hover': {
                          borderColor: selectedProject.color,
                          bgcolor: `${selectedProject.color}15`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      View Notes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setOpenInvoiceDialog(true);
                      }}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        borderColor: selectedProject.color,
                        color: selectedProject.color,
                        '&:hover': {
                          borderColor: selectedProject.color,
                          bgcolor: `${selectedProject.color}15`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Create Invoice
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
            flexDirection: 'column',
            alignItems: 'stretch'
          }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setProjectDetailsOpen(false)}
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(0,0,0,0.2)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'rgba(0,0,0,0.4)',
                    background: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Invoice Creation Dialog */}
        <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogContent>
            <TextField
              label="Client"
              fullWidth
              value={invoiceData.client}
              onChange={e => handleInvoiceChange('client', e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceData.dueDate}
              onChange={e => handleInvoiceChange('dueDate', e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={invoiceData.description}
              onChange={e => handleInvoiceChange('description', e.target.value)}
              sx={{ mt: 2 }}
            />
            <List sx={{ mt: 2 }}>
              {invoiceData.lineItems.map((item, idx) => (
                <ListItem key={idx}>
                  <TextField
                    label="Item Description"
                    value={item.description}
                    onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={item.amount}
                    onChange={e => handleLineItemChange(idx, 'amount', e.target.value)}
                    sx={{ width: 120, mr: 2 }}
                  />
                  <IconButton onClick={() => handleRemoveLineItem(idx)} disabled={invoiceData.lineItems.length === 1}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
              <ListItem button onClick={handleAddLineItem}>
                <ListItemIcon><Add /></ListItemIcon>
                <ListItemText primary="Add Line Item" />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInvoiceDialog(false)}>Cancel</Button>
            <Button variant="outlined" color="primary" onClick={handleDownloadInvoiceCSV} disabled={invoiceData.lineItems.length === 0}>
              Download CSV
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveInvoice} disabled={!invoiceData.client || invoiceData.lineItems.length === 0}>
              Save Invoice
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Projects;
