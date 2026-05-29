import React, { useState, useEffect, useMemo } from 'react';
import { isPresentationActiveJob } from '../../utils/legacyDemoCleanup';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Checkbox,
  ListItemButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Timer,
  LocationOn,
  Watch,
  Mic,
  QrCode,
  Videocam as VideocamIcon,
  Refresh,
  PlayArrow,
  Pause,
  Stop,
  Work,
  CheckCircle,
  Person,
  Group,
  CalendarToday,
  Edit,
  Close,
  Chat,
  Assignment,
  Download,
  Upload,
  Add,
  FilterList,
  Search,
  AutoAwesome,
  Psychology,
  SmartToy,
  TrendingUp,
  Schedule,
  AttachMoney,
  HourglassEmpty,
  AccessTimeFilled,
  CloudUpload,
  Storage,
  VideoCall,
  RateReview,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import TimeTrackingConsole from '../../components/TimeTrackingConsole';
import { HeaderVerificationStrip } from '../../components/TimeTrackingConsole/HeaderVerificationStrip';
import {
  formatMsToElapsed,
  msToHours,
  parseElapsedToMs,
} from '../../components/TimeTrackingConsole/timeTrackingTimer';
import TimesheetsConsole, {
  type LedgerFilterStatus,
  type TimesheetLedgerGroup,
} from '../../components/TimesheetsConsole';
import JobReviewConsole from '../../components/JobReviewConsole';
import { useAppSelector } from '../../store';
import {
  buildManagerOptions,
  getAuthUserLabel,
  getManagerDisplayName,
  getManagerRecipientId,
  managerMatchesUser,
} from '../../utils/managerReview';
import {
  briefedByFromUser,
  notifyJobSubmittedToBriefedBy,
  resolveLineManagerDisplayName,
  resolveLineManagerRecipient,
  type BriefedByRef,
} from '../../utils/jobLineManager';
import { getOfficeAssignableEmployees } from '../../utils/offsiteWorkers';
import { FieldScannerCapture } from '../OffsiteWork/FieldScannerCapture';
import { resolveFieldOpsLineManager } from '../OffsiteWork/fieldOpsReview';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useArrayPersistence } from '../../hooks/usePersistence';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import usePermissions from '../../hooks/usePermissions';
import { saveAs } from 'file-saver';
// No longer need mock data utilities

// Tab options
enum MainTab {
  TIME_TRACKING = 'time-tracking',
  TIMESHEETS = 'timesheets',
  JOBS_TO_REVIEW = 'jobs-to-review',
}

const DEFAULT_HOURLY_RATE_ZAR = 850;

// Define the job interface type
interface Job {
  id: string;
  name: string;
  client: string;
  startTime: string;
  startDate: string;
  endTime: string;
  elapsedTime: string;
  totalTime: string;
  progress: number;
  status: string;
  assignedMembers: string[];
  pauseCondition: string;
  pauseTask: string | null;
  allocatedHours?: number; // Total hours allocated to this job
  currentTimesheetId?: string; // ID of current active timesheet
  isTracking?: boolean; // Whether currently tracking time
  trackingStartedAt?: string; // ISO when live timer started
  trackingBaseMs?: number; // Elapsed ms before current live session
  breakStartTime?: string; // When break started
  isOnBreak?: boolean; // Whether currently on break
  totalBreakTime?: number; // Total break time in minutes
  assignedToManager?: string; // Manager assigned for review
  briefedByEmail?: string;
  briefedById?: string;
  briefedByName?: string;
  reviewNotes?: string;
  submittedBy?: string;
  submittedById?: string;
  submittedForReviewAt?: string;
}

// Define timesheet entry interface with enhanced fields
interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  project: string;
  projectId?: string;
  hoursWorked: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  managerComment?: string;
  isAutomated: boolean;
  tags: string[];
  billableHours?: number;
  hourlyRate?: number;
  totalAmount?: number;
  breakTime?: number;
  overtime?: number;
  category: 'development' | 'meeting' | 'research' | 'administration' | 'other';
  aiSuggestions?: {
    suggestedHours?: number;
    suggestedDescription?: string;
    confidence?: number;
  };
}

// Enhanced timesheet state and filters
interface TimesheetFilters {
  dateRange: { start: string; end: string };
  status: string[];
  employees: string[];
  projects: string[];
  categories: string[];
  isAutomated?: boolean;
  searchTerm: string;
}

// AI prediction interface
interface AITimePrediction {
  projectId: string;
  predictedHours: number;
  confidence: number;
  reasoning: string;
  suggestedBreakdown: { task: string; hours: number }[];
}

// Empty array for jobs - no mock data

// No mock data - empty array

// Add pause conditions with associated tasks
const pauseConditions = [
  { 
    id: 'staff-meeting',
    label: 'Staff Meeting',
    task: 'Attend team meeting and provide updates on current progress'
  },
  { 
    id: 'qa-review',
    label: 'QA Review',
    task: 'Address feedback from QA team and fix reported issues'
  },
  { 
    id: 'client-call',
    label: 'Client Call',
    task: 'Prepare for client presentation and gather required materials'
  },
  { 
    id: 'lunch-break',
    label: 'Lunch Break',
    task: 'Take a break and return refreshed'
  },
  { 
    id: 'technical-issue',
    label: 'Technical Issue',
    task: 'Troubleshoot and resolve the technical problem'
  },
  { 
    id: 'waiting-resources',
    label: 'Waiting for Resources',
    task: 'Follow up with team members to obtain required resources'
  },
  { 
    id: 'other',
    label: 'Other',
    task: ''
  }
];

const TimeTracking: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { employees } = useEmployees();
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const { isAdmin, isTeamLeader, isEmployee } = usePermissions();
  
  // Tab state
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(() => {
    const tab = searchParams.get('tab');
    if (tab === MainTab.JOBS_TO_REVIEW) return MainTab.JOBS_TO_REVIEW;
    if (tab === MainTab.TIMESHEETS) return MainTab.TIMESHEETS;
    return MainTab.TIME_TRACKING;
  });

  const managerOptions = useMemo(() => buildManagerOptions(employees), [employees]);
  
  // Convert employees to team members for time tracking - dynamically update when employees change
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; role: string }[]>([]);
  
  // Update team members whenever employees change
  useEffect(() => {
    if (employees && employees.length > 0) {
      const convertedTeamMembers = getOfficeAssignableEmployees(employees).map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.position || 'Team Member',
      }));
      setTeamMembers(convertedTeamMembers);
    } else {
      setTeamMembers([]);
    }
  }, [employees]);
  
  // Initialize check-in state from localStorage
  const clockInToday = localStorage.getItem('clockInToday');
  const savedClockInTime = localStorage.getItem('clockInTime');
  
  // Check if user has already clocked in based on localStorage values
  const [mobileOfflineMode, setMobileOfflineMode] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(clockInToday === new Date().toDateString());
  const [checkInTime, setCheckInTime] = useState<string | null>(
    clockInToday === new Date().toDateString() ? savedClockInTime : null
  );
  
  // Generate daily code if user is checked in
  const [dailyCode, setDailyCode] = useState(() => {
    return isCheckedIn ? Math.random().toString(36).substring(2, 8).toUpperCase() : '';
  });
  
  // Rest of state variables
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [qrScanData, setQrScanData] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useArrayPersistence<Job>('timelymate_active_jobs', []);

  useEffect(() => {
    setActiveJobs((prev) => {
      if (!prev.some(isPresentationActiveJob)) return prev;
      return prev.filter((j) => !isPresentationActiveJob(j));
    });
  }, [setActiveJobs]);
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [teamViewOpen, setTeamViewOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [teamTimeStats, setTeamTimeStats] = useState({
    totalHours: 0,
    activeProjects: 0,
    completedTasks: 0,
    averageProgress: 0,
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    assignedTeamMembers: 0,
    departmentBreakdown: {} as { [key: string]: number },
  });
  const [newJob, setNewJob] = useState({
    name: '',
    client: '',
    totalTime: '',
    startDate: '',
    startTime: '',
    endTime: '',
    assignedMembers: [] as string[],
    allocatedHours: 8, // Default 8 hours allocation
  });
  const [editJobDialogOpen, setEditJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedPauseCondition, setSelectedPauseCondition] = useState('');
  const [customPauseTask, setCustomPauseTask] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string }[]>([]);
  const [objectDialogOpen, setObjectDialogOpen] = useState(false);
  const [objectTargetId, setObjectTargetId] = useState<string | null>(null);
  const [objectComment, setObjectComment] = useState('');
  
  // Automatic timesheet tracking state
  const [jobStartConfirmationOpen, setJobStartConfirmationOpen] = useState(false);
  const [jobToStart, setJobToStart] = useState<Job | null>(null);
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [jobOnBreak, setJobOnBreak] = useState<Job | null>(null);
  const [timeAllocationCompleteDialogOpen, setTimeAllocationCompleteDialogOpen] = useState(false);
  const [jobTimeComplete, setJobTimeComplete] = useState<Job | null>(null);
  const [reviewSubmissionDialogOpen, setReviewSubmissionDialogOpen] = useState(false);
  const [jobForReview, setJobForReview] = useState<Job | null>(null);
  const [reassignmentDialogOpen, setReassignmentDialogOpen] = useState(false);
  const [jobForReassignment] = useState<Job | null>(null);
  
  // Enhanced stop workflow state
  const [stopWorkflowDialogOpen, setStopWorkflowDialogOpen] = useState(false);
  const [jobToStop, setJobToStop] = useState<Job | null>(null);
  const [stopWorkflowStep, setStopWorkflowStep] = useState<'options' | 'review' | 'manager'>('options');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Enhanced Timesheet state
  const [timesheetEntries, setTimesheetEntries] = useArrayPersistence<TimesheetEntry>(
    'timelymate_timesheet_entries',
    []
  );

  // Persist timesheets to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timelymate_timesheets');
      if (saved) {
        const parsed = JSON.parse(saved) as TimesheetEntry[];
        if (Array.isArray(parsed)) {
          setTimesheetEntries(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('timelymate_timesheets', JSON.stringify(timesheetEntries));
    } catch {}
  }, [timesheetEntries]);

  // Enhanced timesheet management state
  const [timesheetFilters, setTimesheetFilters] = useState<TimesheetFilters>({
    dateRange: { 
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      end: new Date().toISOString().split('T')[0] 
    },
    status: [],
    employees: [],
    projects: [],
    categories: [],
    searchTerm: '',
  });

  const [newTimesheetDialogOpen, setNewTimesheetDialogOpen] = useState(false);
  const [editTimesheetDialogOpen, setEditTimesheetDialogOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<TimesheetEntry | null>(null);
  const [aiSuggestionsDialogOpen, setAiSuggestionsDialogOpen] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [bulkActionsDialogOpen, setBulkActionsDialogOpen] = useState(false);
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
  const [ledgerFilterStatus, setLedgerFilterStatus] = useState<LedgerFilterStatus>('All');

  const [newTimesheet, setNewTimesheet] = useState<Partial<TimesheetEntry>>({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 0,
    description: '',
    status: 'draft',
    isAutomated: false,
    tags: [],
    category: 'development',
    breakTime: 0,
    overtime: 0,
  });

  const [aiPredictions, setAiPredictions] = useState<AITimePrediction[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Import/Export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importOfflineDialogOpen, setImportOfflineDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-generate timesheets from active jobs
  useEffect(() => {
    if (automationEnabled && activeJobs.length > 0) {
      generateAutomatedTimesheets();
    }
  }, [activeJobs, automationEnabled]);

  // Generate automated timesheets from active jobs
  const generateAutomatedTimesheets = () => {
    const today = new Date().toISOString().split('T')[0];
    const automatedEntries: TimesheetEntry[] = [];

    activeJobs.forEach(job => {
      if (job.status === 'active' && job.assignedMembers) {
        job.assignedMembers.forEach(memberId => {
          const member = teamMembers.find(m => m.id === memberId);
          if (member) {
            // Check if entry already exists
            const existingEntry = timesheetEntries.find(
              entry => entry.employeeId === memberId && 
                      entry.projectId === job.id && 
                      entry.date === today
            );

            if (!existingEntry) {
              const [elapsedHours] = job.elapsedTime.split('h').map(Number);
              automatedEntries.push({
                id: `auto-${job.id}-${memberId}-${today}`,
                employeeId: memberId,
                employeeName: member.name,
                date: today,
                project: job.name,
                projectId: job.id,
                hoursWorked: elapsedHours || 0,
                description: `Automated entry for ${job.name} - ${job.client}`,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                isAutomated: true,
                tags: ['Automated'],
                category: 'development',
                breakTime: 0,
                overtime: elapsedHours > 8 ? elapsedHours - 8 : 0,
                aiSuggestions: generateAISuggestions(job, elapsedHours || 0),
              });
            }
          }
        });
      }
    });

    if (automatedEntries.length > 0) {
      setTimesheetEntries((prev: TimesheetEntry[]) => [...prev, ...automatedEntries]);
      addNotification(createNotification.system(
        'Automated Timesheets Generated',
        `${automatedEntries.length} timesheet entries were automatically created from active projects`
      ));
    }
  };

  // Generate AI suggestions for timesheet entries
  const generateAISuggestions = (_job: Job, hours: number) => {
    const suggestions = [
      'Code review and testing implementation',
      'Feature development and bug fixes',
      'Client requirements analysis and documentation',
      'Team collaboration and knowledge sharing',
      'Performance optimization and refactoring',
    ];

    return {
      suggestedHours: Math.min(hours, 8),
      suggestedDescription: suggestions[Math.floor(Math.random() * suggestions.length)],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
    };
  };

  // AI-powered time predictions
  const generateAIPredictions = async () => {
    setIsGeneratingAI(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const predictions: AITimePrediction[] = activeJobs.map(job => ({
        projectId: job.id,
        predictedHours: Math.floor(Math.random() * 6) + 2, // 2-8 hours
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
        reasoning: `Based on historical data and project complexity, this task typically requires ${Math.floor(Math.random() * 6) + 2} hours`,
        suggestedBreakdown: [
          { task: 'Planning and setup', hours: 1 },
          { task: 'Implementation', hours: Math.floor(Math.random() * 4) + 2 },
          { task: 'Testing and review', hours: 1 },
        ],
      }));
      
      setAiPredictions(predictions);
      setIsGeneratingAI(false);
      
      addNotification(createNotification.system(
        'AI Predictions Generated',
        `Generated time predictions for ${predictions.length} active projects`
      ));
    }, 2000);
  };

  // Handle manual timesheet creation
  const handleCreateTimesheet = () => {
    if (newTimesheet.hoursWorked && newTimesheet.project && newTimesheet.description) {
      const timesheetEntry: TimesheetEntry = {
        id: Date.now().toString(),
        employeeId: 'current-user', // Would be from auth context
        employeeName: 'Current User', // Would be from auth context
        date: newTimesheet.date || new Date().toISOString().split('T')[0],
        project: newTimesheet.project || '',
        projectId: newTimesheet.projectId,
        hoursWorked: newTimesheet.hoursWorked || 0,
        description: newTimesheet.description || '',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        isAutomated: false,
        tags: newTimesheet.tags || [],
        category: newTimesheet.category || 'development',
        breakTime: newTimesheet.breakTime || 0,
        overtime: (newTimesheet.hoursWorked || 0) > 8 ? (newTimesheet.hoursWorked || 0) - 8 : 0,
        billableHours: newTimesheet.hoursWorked,
        hourlyRate: 50, // Would be from employee data
        totalAmount: (newTimesheet.hoursWorked || 0) * DEFAULT_HOURLY_RATE_ZAR,
      };

      setTimesheetEntries((prev: TimesheetEntry[]) => [...prev, timesheetEntry]);
      setNewTimesheetDialogOpen(false);
      setNewTimesheet({
        date: new Date().toISOString().split('T')[0],
        hoursWorked: 0,
        description: '',
        status: 'draft',
        isAutomated: false,
        tags: [],
        category: 'development',
        breakTime: 0,
        overtime: 0,
      });

      addNotification(createNotification.system(
        'Timesheet Created',
        'Your timesheet entry has been created successfully'
      ));
    }
  };

  const beginJobTracking = (job: Job) => {
    const timesheetId = job.currentTimesheetId ?? Date.now().toString();
    const trackingBaseMs = job.trackingBaseMs ?? parseElapsedToMs(job.elapsedTime || '0h 00m');
    const now = new Date().toISOString();
    const submitterName = getAuthUserLabel(user);
    const submitterId = user ? getManagerRecipientId(user) : 'current-user';

    setActiveJobs((prevJobs: Job[]) =>
      prevJobs.map((j: Job) => {
        if (j.id === job.id) {
          return {
            ...j,
            status: 'active',
            isTracking: true,
            isOnBreak: false,
            trackingStartedAt: now,
            trackingBaseMs,
            currentTimesheetId: timesheetId,
            pauseCondition: '',
            pauseTask: null,
          };
        }
        if (j.isTracking && j.trackingStartedAt) {
          const base = j.trackingBaseMs ?? 0;
          const totalMs = base + (Date.now() - new Date(j.trackingStartedAt).getTime());
          return {
            ...j,
            isTracking: false,
            trackingStartedAt: undefined,
            trackingBaseMs: totalMs,
            elapsedTime: formatMsToElapsed(totalMs),
          };
        }
        return { ...j, isTracking: false, trackingStartedAt: undefined };
      })
    );

    setTimesheetEntries((prev: TimesheetEntry[]) => {
      if (prev.some((e) => e.id === timesheetId)) return prev;
      return [
        ...prev,
        {
          id: timesheetId,
          employeeId: submitterId,
          employeeName: submitterName,
          date: new Date().toISOString().split('T')[0],
          project: job.name,
          projectId: job.id,
          hoursWorked: 0,
          breakTime: 0,
          description: `Automatic tracking for ${job.name}`,
          status: 'draft',
          submittedAt: now,
          isAutomated: true,
          tags: ['auto-tracked'],
          category: 'development',
          hourlyRate: DEFAULT_HOURLY_RATE_ZAR,
          billableHours: 0,
          totalAmount: 0,
        },
      ];
    });

    addNotification(
      createNotification.timesheet(
        'Job Started',
        `Live time tracking started for ${job.name}. Hours accrue to your timesheet automatically.`
      )
    );
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveJobs((prevJobs) => {
        const tracking = prevJobs.filter(
          (j) => j.isTracking && j.trackingStartedAt && j.status === 'active' && !j.isOnBreak
        );
        if (!tracking.length) return prevJobs;

        const updatedJobs = prevJobs.map((job) => {
          if (!job.isTracking || !job.trackingStartedAt || job.status !== 'active' || job.isOnBreak) {
            return job;
          }
          const base = job.trackingBaseMs ?? 0;
          const totalMs = base + (Date.now() - new Date(job.trackingStartedAt).getTime());
          return { ...job, elapsedTime: formatMsToElapsed(totalMs) };
        });

        setTimesheetEntries((prevTs) =>
          prevTs.map((entry) => {
            const job = updatedJobs.find((j) => j.currentTimesheetId === entry.id);
            if (!job?.trackingStartedAt || job.isOnBreak) return entry;
            const base = job.trackingBaseMs ?? 0;
            const hours = msToHours(base + (Date.now() - new Date(job.trackingStartedAt).getTime()));
            const rate = entry.hourlyRate ?? DEFAULT_HOURLY_RATE_ZAR;
            if (entry.hoursWorked === hours) return entry;
            return {
              ...entry,
              hoursWorked: hours,
              billableHours: hours,
              totalAmount: Math.round(hours * rate * 100) / 100,
            };
          })
        );

        return updatedJobs;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleConfirmJobStart = () => {
    if (!jobToStart) return;
    beginJobTracking(jobToStart);
    setJobStartConfirmationOpen(false);
    setJobToStart(null);
  };

  const handleStartBreak = () => {
    if (!jobOnBreak) return;

    const breakStartTime = new Date().toISOString();
    
    setActiveJobs((prevJobs: Job[]) =>
      prevJobs.map((job: Job) => {
        if (job.id !== jobOnBreak.id) return job;
        let trackingBaseMs = job.trackingBaseMs ?? parseElapsedToMs(job.elapsedTime || '0h 00m');
        if (job.isTracking && job.trackingStartedAt) {
          trackingBaseMs += Date.now() - new Date(job.trackingStartedAt).getTime();
        }
        return {
          ...job,
          isOnBreak: true,
          isTracking: false,
          trackingStartedAt: undefined,
          trackingBaseMs,
          elapsedTime: formatMsToElapsed(trackingBaseMs),
          breakStartTime,
          status: 'paused',
        };
      })
    );

    setBreakDialogOpen(false);
    setJobOnBreak(null);

    addNotification(createNotification.timesheet(
      "Break Started",
      `Break time started for ${jobOnBreak.name}. Timesheet tracking is paused.`
    ));
  };

  const handleEndBreak = (jobId: string) => {
    const job = activeJobs.find(j => j.id === jobId);
    if (!job || !job.isOnBreak || !job.breakStartTime) return;

    const breakEndTime = new Date();
    const breakStartTime = new Date(job.breakStartTime);
    const breakDurationMinutes = Math.floor((breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60));
    const totalBreakTime = (job.totalBreakTime || 0) + breakDurationMinutes;

    setActiveJobs((prevJobs: Job[]) => 
      prevJobs.map((j: Job) => {
        if (j.id === jobId) {
          return {
            ...j,
            isOnBreak: false,
            breakStartTime: undefined,
            totalBreakTime,
            status: 'active',
            isTracking: true,
            trackingStartedAt: new Date().toISOString(),
          };
        }
        return j;
      })
    );

    addNotification(createNotification.timesheet(
      "Break Ended",
      `Break ended for ${job.name}. Timesheet tracking resumed.`
    ));
  };

  const handleTimeAllocationComplete = () => {
    if (!jobTimeComplete) return;

    setTimeAllocationCompleteDialogOpen(false);
    setJobToStop(jobTimeComplete);
    setStopWorkflowStep('review');
    setStopWorkflowDialogOpen(true);
    setJobTimeComplete(null);
  };

  const handleSubmitForReview = () => {
    if (!jobForReview) return;

    const managerId =
      resolveLineManagerRecipient(
        {
          email: jobForReview.briefedByEmail,
          id: jobForReview.briefedById,
          name: jobForReview.briefedByName,
        },
        employees
      ) ?? managerOptions[0]?.id;

    // Update timesheet status to pending
    setTimesheetEntries((prev: TimesheetEntry[]) => 
      prev.map((entry: TimesheetEntry) => {
        if (entry.projectId === jobForReview.id) {
          return { ...entry, status: 'pending' };
        }
        return entry;
      })
    );

    // Update job status
    setActiveJobs((prevJobs: Job[]) => 
      prevJobs.map((job: Job) => {
        if (job.id === jobForReview.id) {
          return { 
            ...job, 
            status: 'pending_review',
            isTracking: false,
            assignedToManager: managerId,
          };
        }
        return job;
      })
    );

    if (managerId) {
      notifyManagerOfJobReview(jobForReview, managerId);
    }

    setReviewSubmissionDialogOpen(false);
    setJobForReview(null);
  };


  // Enhanced stop workflow handlers
  const handleStopOptionSelect = (option: 'break' | 'meeting' | 'review') => {
    
    if (option === 'review') {
      setStopWorkflowStep('review');
    } else {
      // Handle break or meeting
      handleStopWorkflowComplete(option);
    }
  };

  const handleStopWorkflowComplete = (option: 'break' | 'meeting' | 'review') => {
    if (!jobToStop) return;

    if (option === 'break') {
      // Start break
      const breakStartTime = new Date().toISOString();
      setActiveJobs((prevJobs: Job[]) => 
        prevJobs.map((job: Job) => {
          if (job.id === jobToStop.id) {
            return { 
              ...job, 
              isOnBreak: true,
              breakStartTime: breakStartTime,
              status: 'paused'
            };
          }
          return job;
        })
      );
      
      addNotification(createNotification.timesheet(
        "Break Started",
        `Break time started for ${jobToStop.name}. Timesheet tracking is paused.`
      ));
    } else if (option === 'meeting') {
      // Pause for meeting
      setActiveJobs((prevJobs: Job[]) => 
        prevJobs.map((job: Job) => {
          if (job.id === jobToStop.id) {
            return { 
              ...job, 
              status: 'paused',
              pauseCondition: 'meeting',
              pauseTask: 'Attending meeting'
            };
          }
          return job;
        })
      );
      
      addNotification(createNotification.timesheet(
        "Meeting Started",
        `${jobToStop.name} paused for meeting. Timesheet tracking is paused.`
      ));
    } else if (option === 'review') {
      const briefedBy = briefedByFromUser(user);
      const fromJob = jobToStop.briefedByEmail
        ? resolveLineManagerRecipient(
            {
              email: jobToStop.briefedByEmail,
              id: jobToStop.briefedById,
              name: jobToStop.briefedByName,
            },
            employees
          )
        : null;
      const autoManager =
        fromJob ??
        resolveLineManagerRecipient(briefedBy, employees) ??
        managerOptions[0]?.id ??
        '';
      if (autoManager) setSelectedManager(autoManager);
      setStopWorkflowStep('manager');
      return;
    }

    // Close dialog
    setStopWorkflowDialogOpen(false);
    setJobToStop(null);
    setStopWorkflowStep('options');
  };

  const notifyManagerOfJobReview = (job: Job, managerId: string) => {
    const submitterName = getAuthUserLabel(user);
    const managerName = getManagerDisplayName(managerId, employees, managerOptions);
    const briefedBy = {
      email: job.briefedByEmail,
      id: job.briefedById ?? managerId,
      name: job.briefedByName ?? managerName,
    };

    notifyJobSubmittedToBriefedBy({
      briefedBy,
      submitterEmail: user?.email,
      employees,
      notification: {
        ...createNotification.job(
          'Job submitted for your review',
          `${submitterName} submitted "${job.name}" (${job.client}) for your review.`
        ),
        actionUrl: '/time-tracking?tab=jobs-to-review',
      },
      addNotificationForRecipient,
      addNotification,
    });

    const submitterRecipient = user ? getManagerRecipientId(user) : undefined;
    const confirmNotification = createNotification.timesheet(
      'Submitted for Review',
      `"${job.name}" was sent to ${managerName} (who briefed this job) for review.`
    );
    if (submitterRecipient) {
      addNotificationForRecipient(submitterRecipient, confirmNotification);
    } else {
      addNotification(confirmNotification);
    }
  };

  const handleManagerSelection = () => {
    if (!jobToStop || !selectedManager) return;

    const submittedAt = new Date().toISOString();
    const submitterName = getAuthUserLabel(user);
    const submitterId = user ? getManagerRecipientId(user) : undefined;

    // Update timesheet status to pending
    setTimesheetEntries((prev: TimesheetEntry[]) => 
      prev.map((entry: TimesheetEntry) => {
        if (entry.projectId === jobToStop.id) {
          return { 
            ...entry, 
            status: 'pending',
            description: reviewNotes || entry.description
          };
        }
        return entry;
      })
    );

    // Update job status
    setActiveJobs((prevJobs: Job[]) => 
      prevJobs.map((job: Job) => {
        if (job.id === jobToStop.id) {
          return { 
            ...job, 
            status: 'pending_review',
            isTracking: false,
            assignedToManager: selectedManager,
            reviewNotes: reviewNotes || job.reviewNotes,
            submittedBy: submitterName,
            submittedById: submitterId,
            submittedForReviewAt: submittedAt,
          };
        }
        return job;
      })
    );

    notifyManagerOfJobReview(jobToStop, selectedManager);

    // Close dialog
    setStopWorkflowDialogOpen(false);
    setJobToStop(null);
    setStopWorkflowStep('options');
    setSelectedManager('');
    setReviewNotes('');
  };

  const handleApproveJobReview = (jobId: string) => {
    const job = activeJobs.find((j) => j.id === jobId);
    if (!job) return;

    setActiveJobs((prevJobs: Job[]) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed',
              isTracking: false,
              assignedToManager: undefined,
              reviewNotes: undefined,
            }
          : j
      )
    );

    setTimesheetEntries((prev: TimesheetEntry[]) =>
      prev.map((entry) =>
        entry.projectId === jobId ? { ...entry, status: 'approved' as const } : entry
      )
    );

    if (job.submittedById) {
      addNotificationForRecipient(
        job.submittedById,
        createNotification.job(
          'Work approved',
          `Your submission for "${job.name}" was approved.`,
          job.id
        )
      );
    }

    addNotification(
      createNotification.system(
        'Review complete',
        `"${job.name}" has been marked as approved.`
      )
    );
  };

  const handleRequestChangesJobReview = (jobId: string) => {
    const job = activeJobs.find((j) => j.id === jobId);
    if (!job) return;

    setActiveJobs((prevJobs: Job[]) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'active',
              isTracking: false,
              assignedToManager: undefined,
              progress: Math.min(j.progress, 85),
            }
          : j
      )
    );

    if (job.submittedById) {
      addNotificationForRecipient(
        job.submittedById,
        createNotification.job(
          'Changes requested',
          `Your manager requested changes on "${job.name}". You can resume work on this assignment.`,
          job.id
        )
      );
    }

    addNotification(
      createNotification.system(
        'Changes requested',
        `"${job.name}" was returned to the assignee for updates.`
      )
    );
  };

  const handleStopWorkflowCancel = () => {
    setStopWorkflowDialogOpen(false);
    setJobToStop(null);
    setStopWorkflowStep('options');
    setSelectedManager('');
    setReviewNotes('');
  };

  const handleStopWorkflowBack = () => {
    if (stopWorkflowStep === 'manager') {
      setStopWorkflowStep('review');
    } else if (stopWorkflowStep === 'review') {
      setStopWorkflowStep('options');
    }
  };

  // Handle timesheet editing
  const handleEditTimesheet = (timesheet: TimesheetEntry) => {
    setEditingTimesheet(timesheet);
    setEditTimesheetDialogOpen(true);
  };

  const handleLedgerEntryAction = (entryId: string) => {
    const entry = timesheetEntries.find((e) => e.id === entryId);
    if (entry) handleEditTimesheet(entry);
  };

  const handleSaveTimesheetEdit = () => {
    if (editingTimesheet) {
      setTimesheetEntries(prev =>
        prev.map(entry =>
          entry.id === editingTimesheet.id 
            ? { 
                ...editingTimesheet, 
                totalAmount:
                  (editingTimesheet.billableHours || editingTimesheet.hoursWorked) *
                  (editingTimesheet.hourlyRate || DEFAULT_HOURLY_RATE_ZAR),
                overtime: editingTimesheet.hoursWorked > 8 ? editingTimesheet.hoursWorked - 8 : 0,
              }
            : entry
        )
      );
      setEditTimesheetDialogOpen(false);
      setEditingTimesheet(null);

      addNotification(createNotification.system(
        'Timesheet Updated',
        'Your timesheet entry has been updated successfully'
      ));
    }
  };

  // Handle bulk actions
  const handleBulkApprove = () => {
    setTimesheetEntries(prev =>
      prev.map(entry =>
        selectedTimesheets.includes(entry.id)
          ? { ...entry, status: 'approved' as const, approvedAt: new Date().toISOString(), approvedBy: 'Manager' }
          : entry
      )
    );
    setSelectedTimesheets([]);
    setBulkActionsDialogOpen(false);
    
    addNotification(createNotification.system(
      'Bulk Approval Complete',
      `${selectedTimesheets.length} timesheets have been approved`
    ));
  };

  const handleBulkReject = () => {
    setTimesheetEntries(prev =>
      prev.map(entry =>
        selectedTimesheets.includes(entry.id)
          ? { ...entry, status: 'rejected' as const }
          : entry
      )
    );
    setSelectedTimesheets([]);
    setBulkActionsDialogOpen(false);
    
    addNotification(createNotification.system(
      'Bulk Rejection Complete',
      `${selectedTimesheets.length} timesheets have been rejected`
    ));
  };

  // Apply AI suggestions to timesheet
  const applyAISuggestions = (timesheetId: string) => {
    const timesheet = timesheetEntries.find(t => t.id === timesheetId);
    if (timesheet?.aiSuggestions) {
      setTimesheetEntries(prev =>
        prev.map(entry =>
          entry.id === timesheetId
            ? {
                ...entry,
                hoursWorked: entry.aiSuggestions?.suggestedHours || entry.hoursWorked,
                description: entry.aiSuggestions?.suggestedDescription || entry.description,
              }
            : entry
        )
      );

      addNotification(createNotification.system(
        'AI Suggestions Applied',
        'Timesheet has been updated with AI suggestions'
      ));
    }
  };

  // Export functionality
  const handleExportTimesheets = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvContent = [
        ['ID', 'Employee', 'Date', 'Project', 'Hours', 'Description', 'Status', 'Category', 'Billable Hours', 'Hourly Rate', 'Total Amount', 'Automated'].join(','),
        ...filteredTimesheets.map(entry => [
          entry.id,
          entry.employeeName,
          entry.date,
          entry.project,
          entry.hoursWorked,
          `"${entry.description.replace(/"/g, '""')}"`,
          entry.status,
          entry.category,
          entry.billableHours || '',
          entry.hourlyRate || '',
          entry.totalAmount || '',
          entry.isAutomated ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `timesheets_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const jsonContent = JSON.stringify(filteredTimesheets, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      saveAs(blob, `timesheets_${new Date().toISOString().split('T')[0]}.json`);
    }
    
    addNotification(createNotification.system(
      'Export Successful',
      `Timesheets exported as ${format.toUpperCase()} file.`
    ));
    setExportDialogOpen(false);
  };

  // Import functionality
  const handleImportTimesheets = () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedEntries: TimesheetEntry[] = [];
        
        if (selectedFile.name.endsWith('.csv')) {
          const lines = content.split('\n');
          importedEntries = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',');
            return {
              id: `imported_${Date.now()}_${index}`,
              employeeId: values[1] || '',
              employeeName: values[1] || '',
              date: values[2] || new Date().toISOString().split('T')[0],
              project: values[3] || '',
              projectId: values[3]?.toLowerCase().replace(/\s+/g, '-') || '',
              hoursWorked: parseFloat(values[4]) || 0,
              description: values[5]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
              status: (values[6] as TimesheetEntry['status']) || 'draft',
              submittedAt: new Date().toISOString(),
              isAutomated: false,
              tags: [],
              category: (values[7] as TimesheetEntry['category']) || 'development',
              billableHours: parseFloat(values[8]) || undefined,
              hourlyRate: parseFloat(values[9]) || undefined,
              totalAmount: parseFloat(values[10]) || undefined,
              breakTime: 0,
              overtime: 0,
            } as TimesheetEntry;
          });
        } else if (selectedFile.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          importedEntries = Array.isArray(parsed) ? parsed.map((entry, index) => ({
            ...entry,
            id: `imported_${Date.now()}_${index}`,
          })) : [{ ...parsed, id: `imported_${Date.now()}_0` }];
        }
        
        setTimesheetEntries((prev: TimesheetEntry[]) => [...prev, ...importedEntries]);
        addNotification(createNotification.system(
          'Import Successful',
          `${importedEntries.length} timesheet entries imported successfully.`
        ));
        
      } catch (error) {
        addNotification(createNotification.system(
          'Import Failed',
          'Failed to parse the selected file. Please check the file format.'
        ));
      }
    };
    
    reader.readAsText(selectedFile);
    setImportDialogOpen(false);
    setSelectedFile(null);
  };

  // Import offline data functionality
  const handleImportOfflineData = () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const offlineData = JSON.parse(content);
        
        // Extract timesheets from offline data structure
        const offlineTimesheets = offlineData.timesheets || offlineData.timeEntries || offlineData;
        let importedEntries: TimesheetEntry[] = [];
        
        if (Array.isArray(offlineTimesheets)) {
          importedEntries = offlineTimesheets.map((entry, index) => ({
            id: `offline_${Date.now()}_${index}`,
            employeeId: entry.employeeId || entry.employee || 'unknown',
            employeeName: entry.employeeName || entry.employee || 'Offline User',
            date: entry.date || new Date().toISOString().split('T')[0],
            project: entry.project || entry.projectName || 'Offline Project',
            projectId: entry.projectId || entry.project?.toLowerCase().replace(/\s+/g, '-') || 'offline-project',
            hoursWorked: parseFloat(entry.hoursWorked || entry.hours || entry.duration) || 0,
            description: entry.description || entry.notes || 'Imported from offline data',
            status: 'pending' as const,
            submittedAt: new Date().toISOString(),
            isAutomated: false,
            tags: entry.tags || ['offline'],
            category: (entry.category as TimesheetEntry['category']) || 'development',
            billableHours: parseFloat(entry.billableHours || entry.hours) || undefined,
            hourlyRate: parseFloat(entry.hourlyRate || entry.rate) || undefined,
            totalAmount: parseFloat(entry.totalAmount || entry.amount) || undefined,
            breakTime: parseFloat(entry.breakTime || entry.breaks) || 0,
            overtime: parseFloat(entry.overtime) || 0,
          }));
        }
        
        setTimesheetEntries((prev: TimesheetEntry[]) => [...prev, ...importedEntries]);
        addNotification(createNotification.system(
          'Offline Data Imported',
          `${importedEntries.length} offline timesheet entries imported successfully.`
        ));
        
      } catch (error) {
        addNotification(createNotification.system(
          'Import Failed',
          'Failed to parse the offline data file. Please check the file format.'
        ));
      }
    };
    
    reader.readAsText(selectedFile);
    setImportOfflineDialogOpen(false);
    setSelectedFile(null);
  };

  // Filter timesheets based on current filters
  const filteredTimesheets = timesheetEntries.filter(entry => {
    const matchesDateRange = (!timesheetFilters.dateRange.start || entry.date >= timesheetFilters.dateRange.start) &&
                            (!timesheetFilters.dateRange.end || entry.date <= timesheetFilters.dateRange.end);
    const matchesStatus = timesheetFilters.status.length === 0 || timesheetFilters.status.includes(entry.status);
    const matchesEmployee = timesheetFilters.employees.length === 0 || timesheetFilters.employees.includes(entry.employeeId);
    const matchesProject = timesheetFilters.projects.length === 0 || timesheetFilters.projects.includes(entry.project);
    const matchesCategory = timesheetFilters.categories.length === 0 || timesheetFilters.categories.includes(entry.category);
    const matchesAutomation = timesheetFilters.isAutomated === undefined || entry.isAutomated === timesheetFilters.isAutomated;
    const matchesSearch = !timesheetFilters.searchTerm || 
                         entry.description.toLowerCase().includes(timesheetFilters.searchTerm.toLowerCase()) ||
                         entry.project.toLowerCase().includes(timesheetFilters.searchTerm.toLowerCase()) ||
                         entry.employeeName.toLowerCase().includes(timesheetFilters.searchTerm.toLowerCase());

    return matchesDateRange && matchesStatus && matchesEmployee && matchesProject && 
           matchesCategory && matchesAutomation && matchesSearch;
  });

  // Calculate enhanced timesheet statistics
  const timesheetStats = {
    totalEntries: filteredTimesheets.length,
    pendingReview: filteredTimesheets.filter(entry => entry.status === 'pending').length,
    totalHours: filteredTimesheets.reduce((sum, entry) => sum + entry.hoursWorked, 0),
    approved: filteredTimesheets.filter(entry => entry.status === 'approved').length,
    totalAmount: filteredTimesheets.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0),
    automatedEntries: filteredTimesheets.filter(entry => entry.isAutomated).length,
    averageHoursPerDay: filteredTimesheets.length > 0 
      ? Math.round((filteredTimesheets.reduce((sum, entry) => sum + entry.hoursWorked, 0) / filteredTimesheets.length) * 10) / 10
      : 0,
    overtime: filteredTimesheets.reduce((sum, entry) => sum + (entry.overtime || 0), 0),
  };

  const formatLedgerDuration = (hours: number) => {
    const h = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
    return `${h} hrs`;
  };

  const formatLedgerStatus = (
    status: TimesheetEntry['status']
  ): TimesheetLedgerGroup['entries'][0]['status'] => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Draft';
    }
  };

  const formatTaskCode = (entry: TimesheetEntry) => {
    if (entry.projectId) {
      const slug = entry.projectId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const prefix = slug.slice(0, 3) || 'TS';
      return `${prefix}-${entry.id.replace(/\D/g, '').slice(-3).padStart(3, '0')}`;
    }
    const initials = entry.project
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    return `${initials || 'TS'}-${entry.id.replace(/\D/g, '').slice(-3).padStart(3, '0')}`;
  };

  const getDateGroupLabel = (dateStr: string) => {
    const d = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    const dayLabel = format(d, 'EEEE, d MMMM yyyy');
    if (isToday(d)) return `Today • ${dayLabel}`;
    if (isYesterday(d)) return `Yesterday • ${dayLabel}`;
    return dayLabel;
  };

  const ledgerFilteredEntries = useMemo(() => {
    let entries = [...filteredTimesheets];
    if (ledgerFilterStatus === 'Approved') {
      entries = entries.filter((e) => e.status === 'approved');
    } else if (ledgerFilterStatus === 'Pending') {
      entries = entries.filter((e) => e.status === 'pending');
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTimesheets, ledgerFilterStatus]);

  const ledgerGroups = useMemo((): TimesheetLedgerGroup[] => {
    const byDate = new Map<string, TimesheetEntry[]>();
    ledgerFilteredEntries.forEach((entry) => {
      const key = entry.date;
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(entry);
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entries]) => {
        const total = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
        return {
          date: getDateGroupLabel(date),
          totalHours: formatLedgerDuration(total),
          entries: entries.map((e) => ({
            id: e.id,
            code: formatTaskCode(e),
            project: e.project,
            description: e.description,
            duration: formatLedgerDuration(e.hoursWorked),
            status: formatLedgerStatus(e.status),
          })),
        };
      });
  }, [ledgerFilteredEntries]);

  const payCycleLabel = useMemo(() => {
    const start = timesheetFilters.dateRange.start
      ? parseISO(`${timesheetFilters.dateRange.start}T12:00:00`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = timesheetFilters.dateRange.end
      ? parseISO(`${timesheetFilters.dateRange.end}T12:00:00`)
      : new Date();
    return `${format(start, 'd MMM')} — ${format(end, 'd MMM')} Cycle`;
  }, [timesheetFilters.dateRange.start, timesheetFilters.dateRange.end]);

  const ledgerApprovedHours = useMemo(() => {
    const total = filteredTimesheets
      .filter((e) => e.status === 'approved')
      .reduce((sum, e) => sum + e.hoursWorked, 0);
    return formatLedgerDuration(total);
  }, [filteredTimesheets]);

  const ledgerPendingHours = useMemo(() => {
    const total = filteredTimesheets
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.hoursWorked, 0);
    return formatLedgerDuration(total);
  }, [filteredTimesheets]);

  // Convert employees to team members
  useEffect(() => {
    console.log('Employees in TimeTracking page:', employees);
    
    const convertedTeamMembers = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      role: employee.position,
    }));
    
    console.log('Converted team members:', convertedTeamMembers);
    setTeamMembers(convertedTeamMembers);
  }, [employees]);

  // Update team statistics based on imported employees and active jobs
  useEffect(() => {
    if (employees.length > 0) {
      const stats = {
        totalHours: activeJobs.reduce((sum, job) => {
          const [hours] = job.elapsedTime.split('h').map(Number);
          return sum + (hours || 0);
        }, 0),
        activeProjects: activeJobs.filter(job => job.status === 'active').length,
        completedTasks: activeJobs.filter(job => job.status === 'completed').length,
        averageProgress: activeJobs.length > 0 ? Math.round(
          activeJobs.reduce((sum, job) => sum + job.progress, 0) / activeJobs.length
        ) : 0,
        // Additional statistics based on imported employees
        totalTeamMembers: employees.length,
        activeTeamMembers: employees.filter(emp => emp.status === 'active').length,
        assignedTeamMembers: [...new Set(activeJobs.flatMap(job => job.assignedMembers))].length,
        departmentBreakdown: employees.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
      };
      
      console.log('Updated team statistics:', stats);
      setTeamTimeStats(stats);
    }
  }, [employees, activeJobs]);

  const generateDailyCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDailyCode(code);
  };

  const handleCheckIn = (method: string) => {
    setSelectedMethod(method);
    setQrScanData(null);
    setDialogOpen(true);
  };

  const confirmCheckIn = () => {
    const now = new Date();
    setIsCheckedIn(true);
    setCheckInTime(now.toLocaleTimeString());
    
    // Store clock-in info in localStorage
    localStorage.setItem('clockInToday', new Date().toDateString());
    localStorage.setItem('clockInTime', now.toISOString());
    
    // Send notification
    addNotification(createNotification.timesheet(
      'Check-in Successful',
      `You have successfully checked in at ${now.toLocaleTimeString()}`
    ));
    
    generateDailyCode();
    setDialogOpen(false);
  };

  const handleJobAction = (jobId: string, action: 'start' | 'pause' | 'stop') => {
    // Enforce check-in before starting any project
    if (action === 'start' && !isCheckedIn) {
      console.log('Job action prevented: User not checked in');
      alert('You must check in before starting any project. Please check in first.');
      return;
    }

    console.log(`Job action: ${action} on job ${jobId}, check-in status: ${isCheckedIn}`);

    if (action === 'start') {
      const job = activeJobs.find(j => j.id === jobId);
      if (job) {
        setJobToStart(job);
        setJobStartConfirmationOpen(true);
      }
      return;
    }

    if (action === 'pause') {
      const job = activeJobs.find(j => j.id === jobId);
      if (job && job.isTracking) {
        setJobOnBreak(job);
        setBreakDialogOpen(true);
      } else {
      setSelectedJobId(jobId);
      setPauseDialogOpen(true);
      }
      return;
    }
    
    if (action === 'stop') {
      const job = activeJobs.find(j => j.id === jobId);
      if (job) {
        setJobToStop(job);
        setStopWorkflowDialogOpen(true);
        setStopWorkflowStep('options');
      }
      return;
    }
  };

  const handlePauseConfirm = () => {
    if (selectedJobId && selectedPauseCondition) {
      const selectedCondition = pauseConditions.find(c => c.id === selectedPauseCondition);
      const taskToCreate = selectedCondition?.id === 'other' 
        ? customPauseTask 
        : selectedCondition?.task || '';
      
      const jobToUpdate = activeJobs.find(job => job.id === selectedJobId);
      
      setActiveJobs((prevJobs: Job[]) => 
        prevJobs.map((job: Job) => {
          if (job.id === selectedJobId) {
            return { 
              ...job, 
              status: 'paused', 
              pauseCondition: selectedCondition?.label || '',
              pauseTask: taskToCreate
            };
          }
          return job;
        })
      );
      
      // Send notification
      if (jobToUpdate) {
        addNotification(createNotification.job(
          'Job Paused',
          `Job "${jobToUpdate.name}" has been paused due to ${selectedCondition?.label || 'other reason'}`
        ));
      }
      
      setPauseDialogOpen(false);
      setSelectedJobId(null);
      setSelectedPauseCondition('');
      setCustomPauseTask('');
    }
  };

  const handlePauseCancel = () => {
    setPauseDialogOpen(false);
    setSelectedJobId(null);
    setSelectedPauseCondition('');
    setCustomPauseTask('');
  };

  const handleStopConfirm = () => {
    if (selectedJobId) {
      const jobToComplete = activeJobs.find(job => job.id === selectedJobId);
      
      setActiveJobs((prevJobs: Job[]) => 
        prevJobs.map((job: Job) => {
          if (job.id === selectedJobId) {
            return { ...job, status: 'completed', pauseCondition: '', pauseTask: null };
          }
          return job;
        })
      );
      
      if (jobToComplete) {
        const submitterLabel = getAuthUserLabel(user);
        notifyJobSubmittedToBriefedBy({
          briefedBy: {
            email: jobToComplete.briefedByEmail,
            id: jobToComplete.briefedById,
            name: jobToComplete.briefedByName,
          },
          submitterEmail: user?.email,
          employees,
          notification: {
            ...createNotification.job(
              'Job completed',
              `${submitterLabel} marked "${jobToComplete.name}" complete and sent it for your review.`
            ),
            actionUrl: '/time-tracking',
          },
          addNotificationForRecipient,
          addNotification,
        });
      }
      
      setStopDialogOpen(false);
      setSelectedJobId(null);
    }
  };

  const handleStopCancel = () => {
    setStopDialogOpen(false);
    setSelectedJobId(null);
  };

  const handleAddNewJob = () => {
    if (newJob.name && newJob.client && newJob.totalTime && newJob.startDate && newJob.startTime) {
      const jobId = (activeJobs.length + 1).toString();
      
      const briefed = briefedByFromUser(user);
      const jobToAdd = {
        id: jobId,
        name: newJob.name,
        client: newJob.client,
        startTime: newJob.startTime,
        startDate: newJob.startDate,
        endTime: newJob.endTime || '',
        assignedMembers: newJob.assignedMembers,
        elapsedTime: '0h 00m',
        totalTime: newJob.totalTime,
        progress: 0,
        status: 'pending' as const,
        pauseCondition: '',
        pauseTask: null as string | null,
        allocatedHours: newJob.allocatedHours || 8,
        isTracking: false,
        isOnBreak: false,
        totalBreakTime: 0,
        briefedByEmail: briefed.email,
        briefedById: briefed.id,
        briefedByName: briefed.name,
      };

      setActiveJobs([...activeJobs, jobToAdd]);
      
      // Send notification
      addNotification(createNotification.job(
        'New Job Created',
        `Job "${newJob.name}" has been created for client ${newJob.client}`
      ));
      
      setNewJobDialogOpen(false);
      setNewJob({ 
        name: '', 
        client: '', 
        totalTime: '', 
        startDate: '', 
        startTime: '', 
        endTime: '', 
        assignedMembers: [],
        allocatedHours: 8,
      });
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setEditJobDialogOpen(true);
  };

  const handleSaveJobEdit = () => {
    if (editingJob) {
      setActiveJobs((prevJobs: Job[]) =>
        prevJobs.map((job: Job) =>
          job.id === editingJob.id ? editingJob : job
        )
      );
      setEditJobDialogOpen(false);
      setEditingJob(null);
    }
  };

  const handleTeamViewOpen = () => {
    console.log('View Team Progress button clicked');
    console.log('Current team members:', teamMembers);
    console.log('Current active jobs:', activeJobs);
    console.log('Current team time stats:', teamTimeStats);
    
    // Don't override the existing team statistics - they're already being calculated in useEffect
    // Just open the dialog
    setTeamViewOpen(true);
  };

  const handleTeamMemberSelect = (memberId: string) => {
    setSelectedTeamMember(memberId);
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedTeamMember) {
      const newMessage = {
        sender: 'Team Leader',
        content: message.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleMessageClick = (memberId: string) => {
    setSelectedTeamMember(memberId);
    setMessageDialogOpen(true);
    setMessages([]); // Clear previous messages when starting a new conversation
  };

  const checkInMethods = [
    {
      icon: <QrCode sx={{ fontSize: 40 }} />,
      title: 'Office Scan',
      description: 'Scan QR code at office entrance',
      action: () => handleCheckIn('qr'),
    },
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: 'Remote Check-in',
      description: 'Use geofencing for remote work',
      action: () => handleCheckIn('location'),
    },
    {
      icon: <Watch sx={{ fontSize: 40 }} />,
      title: 'Smart Watch',
      description: 'Track time with pulse monitoring',
      action: () => handleCheckIn('watch'),
    },
    {
      icon: <Mic sx={{ fontSize: 40 }} />,
      title: 'Voice Command',
      description: 'Use voice for hands-free check-in',
      action: () => handleCheckIn('voice'),
    },
  ];

  // Synchronize with localStorage on component mount and on localStorage changes
  useEffect(() => {
    // Check for clock-in status when component mounts
    const hasClockInToday = localStorage.getItem('clockInToday') === new Date().toDateString();
    const savedClockInTime = localStorage.getItem('clockInTime');
    
    if (hasClockInToday && savedClockInTime) {
      // Update state only if the values are different
      if (!isCheckedIn) {
        console.log('Restoring check-in state from localStorage');
        setIsCheckedIn(true);
        
        // Convert ISO time to locale time string for display
        const date = new Date(savedClockInTime);
        setCheckInTime(date.toLocaleTimeString());
        
        // Generate daily code if not already set
        if (!dailyCode) {
          generateDailyCode();
        }
      }
    }
    
    // This could be enhanced with a localStorage event listener if needed
  }, [isCheckedIn, dailyCode]);

  // We no longer automatically redirect users if they haven't clocked in
  // This allows new users to start using the time tracking page without mock data
  useEffect(() => {
    const hasClockInToday = localStorage.getItem('clockInToday') === new Date().toDateString();
    
    // Instead of redirecting, we just log the status
    if (!hasClockInToday) {
      console.log('Not clocked in yet - showing check-in options');
      // Show the check-in dialog if not already checked in
      setDialogOpen(true);
    }
  }, []);
  
  // Function to handle direct clock-in from Time Tracking page
  const handleDirectClockIn = () => {
    const now = new Date();
    console.log('Clocked in directly from Time Tracking at', now.toLocaleTimeString());
    
    // Store clock-in info in localStorage with today's date string
    localStorage.setItem('clockInToday', now.toDateString());
    localStorage.setItem('clockInTime', now.toISOString());
    
    // Update local state
    setIsCheckedIn(true);
    setCheckInTime(now.toLocaleTimeString());
    setDialogOpen(false);
    
    // Generate a daily code
    generateDailyCode();
  };

  const handleDirectClockOut = () => {
    localStorage.removeItem('clockInToday');
    localStorage.removeItem('clockInTime');
    setIsCheckedIn(false);
    setCheckInTime(null);
    setDailyCode('');
    addNotification(createNotification.timesheet(
      'Shift Ended',
      'You have ended your shift for today.'
    ));
  };

  const handleToggleShift = () => {
    if (isCheckedIn) {
      handleDirectClockOut();
    } else {
      handleDirectClockIn();
    }
  };

  const handleConsoleJobToggle = (jobId: string, isRunning: boolean) => {
    if (isRunning) {
      handleJobAction(jobId, 'stop');
      return;
    }
    if (!isCheckedIn) {
      alert('You must check in before starting any project. Please check in first.');
      return;
    }
    const job = activeJobs.find((j) => j.id === jobId);
    if (job) beginJobTracking(job);
  };

  const handleConsoleBreak = () => {
    const trackingJob = activeJobs.find((job) => job.isTracking);
    if (trackingJob) {
      handleJobAction(trackingJob.id, 'pause');
    }
  };

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    teamMembers.forEach((m) => map.set(m.id, m.name));
    employees.forEach((e) => map.set(e.id, e.name));
    return map;
  }, [teamMembers, employees]);

  const consoleJobRows = activeJobs.map((job) => ({
    id: job.id,
    name: job.name,
    team: job.client || 'Internal Team',
    progress: job.progress,
    timeSpent: job.elapsedTime || job.totalTime || '0h 0m',
    isRunning: Boolean(job.isTracking && !job.isOnBreak),
    trackingStartedAt: job.trackingStartedAt ?? null,
    trackingBaseMs: job.trackingBaseMs ?? parseElapsedToMs(job.elapsedTime || '0h 00m'),
    status: job.status,
    assignedMembers: (job.assignedMembers ?? [])
      .map((id) => memberNameById.get(id) ?? '')
      .filter(Boolean),
  }));

  const workforceEmployeeNames = useMemo(
    () => employees.map((e) => e.name?.trim() || 'Team member').filter(Boolean),
    [employees]
  );

  const handleAssignmentQuickAction = (
    jobId: string,
    action: 'pause' | 'voice' | 'proof' | 'assist'
  ) => {
    const job = activeJobs.find((j) => j.id === jobId);
    const label = job?.name ?? 'Assignment';

    switch (action) {
      case 'pause':
        if (job?.isTracking) handleJobAction(jobId, 'pause');
        break;
      case 'voice':
        addNotification(
          createNotification.system(
            'Voice update',
            `Voice note will attach to "${label}" for your line manager (coming soon).`,
            'low'
          )
        );
        break;
      case 'proof':
        addNotification(
          createNotification.system(
            'Field proof',
            `Capture photo or scan for "${label}" — open Field Operations tools.`,
            'medium'
          )
        );
        break;
      case 'assist': {
        if (!user) {
          addNotification(
            createNotification.system(
              'Sign in required',
              'Sign in with your work account to request supervisor assistance on active assignments.',
              'urgent'
            )
          );
          break;
        }

        const submitterName = getAuthUserLabel(user);
        const jobBriefedBy: BriefedByRef | null =
          job?.briefedByEmail || job?.briefedById || job?.briefedByName
            ? {
                email: job.briefedByEmail,
                id: job.briefedById,
                name: job.briefedByName,
              }
            : null;

        let lineManagerBriefedBy: BriefedByRef = jobBriefedBy ?? (() => {
          const mgr = resolveFieldOpsLineManager(employees, user);
          return { id: mgr.id, name: mgr.name };
        })();

        let lineManagerName = resolveLineManagerDisplayName(lineManagerBriefedBy, employees);
        if (!resolveLineManagerRecipient(lineManagerBriefedBy, employees)) {
          const mgr = resolveFieldOpsLineManager(employees, user);
          lineManagerBriefedBy = { id: mgr.id, name: mgr.name };
          lineManagerName = mgr.name;
        }

        const { managerName } = notifyJobSubmittedToBriefedBy({
          briefedBy: lineManagerBriefedBy,
          submitterEmail: user.email,
          employees,
          notification: {
            ...createNotification.team(
              'Assistance requested',
              `${submitterName} needs support on "${label}"${job?.client ? ` (${job.client})` : ''}. Routed to line manager ${lineManagerName}.`
            ),
            priority: 'urgent',
            actionUrl: '/time-tracking',
            jobId,
          },
          addNotificationForRecipient,
          addNotification,
        });

        const submitterRecipient = getManagerRecipientId(user);
        const confirmNotification = {
          ...createNotification.timesheet(
            'Assistance requested',
            `Logged as ${submitterName}. Your line manager, ${managerName}, has been notified.`
          ),
          priority: 'high' as const,
          jobId,
        };
        if (submitterRecipient) {
          addNotificationForRecipient(submitterRecipient, confirmNotification);
        } else {
          addNotification(confirmNotification);
        }
        break;
      }
    }
  };

  const jobsPendingReview = useMemo(
    () => activeJobs.filter((job) => job.status === 'pending_review'),
    [activeJobs]
  );

  const jobsToReview = useMemo(() => {
    return jobsPendingReview.filter((job) => {
      if (isAdmin()) return true;
      return managerMatchesUser(job.assignedToManager, user, employees);
    });
  }, [jobsPendingReview, user, employees]);

  const showReviewTab = isAdmin() || isTeamLeader() || jobsToReview.length > 0;

  const jobReviewRows = useMemo(
    () =>
      jobsToReview.map((job) => ({
        id: job.id,
        name: job.name,
        client: job.client,
        elapsedTime: job.elapsedTime || job.totalTime || '0h',
        progress: job.progress,
        submittedBy: job.submittedBy,
        submittedForReviewAt: job.submittedForReviewAt,
        reviewNotes: job.reviewNotes,
        assignedToManager: job.assignedToManager,
        managerDisplayName: getManagerDisplayName(
          job.assignedToManager,
          employees,
          managerOptions
        ),
      })),
    [jobsToReview, employees, managerOptions]
  );

  // Tab change handler
  const handleMainTabChange = (_: React.SyntheticEvent, newValue: MainTab) => {
    setActiveMainTab(newValue);
    if (newValue === MainTab.TIME_TRACKING) {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', newValue);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Timesheet handlers
  const handleApproveTimesheet = (id: string) => {
    setTimesheetEntries((prev: TimesheetEntry[]) => 
      prev.map(entry => 
        entry.id === id ? { ...entry, status: 'approved' as const, approvedAt: new Date().toISOString() } : entry
      )
    );
    
    const entry = timesheetEntries.find(e => e.id === id);
    if (entry) {
      addNotification(createNotification.system(
        'Timesheet Approved',
        `Timesheet for ${entry.employeeName} has been approved`
      ));
    }
  };

  const handleRejectTimesheet = (id: string) => {
    setObjectDialogOpen(true);
    setObjectTargetId(id);
  };

  const getStatusColor = (status: TimesheetEntry['status']) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: TimesheetEntry['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending Review';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: activeMainTab === MainTab.TIME_TRACKING ? 1 : 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Time Management
              </Typography>
            </Box>
            {activeMainTab === MainTab.TIME_TRACKING && (
              <HeaderVerificationStrip
                isCheckedIn={isCheckedIn}
                onVerify={(key) => handleCheckIn(key)}
                onPlaceholder={(title) => {
                  addNotification(
                    createNotification.system(
                      `${title} — pilot channel`,
                      'This verification method will be available in the enterprise biometric rollout. Use QR, geofence, smartwatch, or voice to check in today.',
                      'low'
                    )
                  );
                }}
              />
            )}
            <Typography variant="h6" sx={{ opacity: 0.9, mt: activeMainTab === MainTab.TIME_TRACKING ? 0 : undefined }}>
              {activeMainTab === MainTab.TIME_TRACKING
                ? 'Track your time with biometric precision'
                : 'Manage and review employee timesheets'}
            </Typography>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: -4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 4, overflow: 'visible' }}>
            {/* Main Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
              <Tabs 
                value={activeMainTab} 
                onChange={handleMainTabChange}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 500,
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: 120
                  }
                }}
              >
                <Tab 
                  label="Time Tracking" 
                  value={MainTab.TIME_TRACKING}
                  icon={<Timer />}
                  iconPosition="start"
                />
                <Tab 
                  label="Timesheets" 
                  value={MainTab.TIMESHEETS}
                  icon={<Assignment />}
                  iconPosition="start"
                />
                {showReviewTab && (
                  <Tab
                    label={
                      jobsToReview.length > 0
                        ? `Jobs to Review (${jobsToReview.length})`
                        : 'Jobs to Review'
                    }
                    value={MainTab.JOBS_TO_REVIEW}
                    icon={<RateReview />}
                    iconPosition="start"
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab Content */}
            {activeMainTab === MainTab.TIME_TRACKING ? (
              <TimeTrackingConsole
                isCheckedIn={isCheckedIn}
                checkInTime={checkInTime}
                dailyCode={dailyCode}
                activeJobs={consoleJobRows}
                employeeNames={workforceEmployeeNames}
                onToggleShift={handleToggleShift}
                onTakeBreak={handleConsoleBreak}
                onJobToggle={handleConsoleJobToggle}
                onAssignmentAction={handleAssignmentQuickAction}
                onProductivityInsightNotify={(title, description, priority = 'medium') => {
                  addNotification(createNotification.system(title, description, priority));
                }}
                onMobileNotify={(title, description) => {
                  addNotification(createNotification.system(title, description, 'low'));
                }}
                offlineMode={mobileOfflineMode}
                onToggleOffline={() => setMobileOfflineMode((prev) => !prev)}
                approvedHours={ledgerApprovedHours}
                pendingHours={ledgerPendingHours}
                payCycleLabel={payCycleLabel}
                teamStats={teamTimeStats}
                hasTeamMembers={teamMembers.length > 0}
                onOpenTeamView={handleTeamViewOpen}
              />
            ) : activeMainTab === MainTab.JOBS_TO_REVIEW ? (
              <JobReviewConsole
                jobs={jobReviewRows}
                onApprove={handleApproveJobReview}
                onRequestChanges={handleRequestChangesJobReview}
                isAdminView={isAdmin()}
              />
            ) : (
              <TimesheetsConsole
                groups={ledgerGroups}
                filterStatus={ledgerFilterStatus}
                onFilterStatusChange={setLedgerFilterStatus}
                onExport={() => setExportDialogOpen(true)}
                onEntryAction={handleLedgerEntryAction}
                onCompileReport={() => handleExportTimesheets('csv')}
                onSync={generateAutomatedTimesheets}
                payCycleLabel={payCycleLabel}
                approvedHours={ledgerApprovedHours}
                pendingHours={ledgerPendingHours}
                emptyMessage={
                  ledgerFilterStatus !== 'All' || timesheetFilters.searchTerm
                    ? 'No entries match the current filter.'
                    : 'Create a timesheet entry or sync from active projects to populate the ledger.'
                }
                onAuditNotify={(title, message) => {
                  addNotification(createNotification.system(title, message, 'medium'));
                }}
              />
            )}
          </Card>
        </Container>

        {/* Check-in Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Check-in Required</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ py: 2 }}>
              {!selectedMethod ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    You need to check in before accessing the Time Tracking features.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Please select a check-in method below or use the quick check-in option.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    fullWidth 
                    onClick={handleDirectClockIn}
                    startIcon={<Timer />}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    Quick Check-in Now
                  </Button>
                  <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">OR SELECT A METHOD</Typography></Divider>
                </>
              ) : (
                <>
                  {selectedMethod === 'qr' ? (
                    <FieldScannerCapture
                      active={dialogOpen && selectedMethod === 'qr'}
                      mode="qr"
                      userName={getAuthUserLabel(user ?? undefined)}
                      accentColor="#2196f3"
                      onScan={(result) => setQrScanData(result.data)}
                    />
                  ) : (
                    <>
                      <Typography>
                        {selectedMethod === 'location' && 'Verifying your location...'}
                        {selectedMethod === 'watch' && 'Connecting to your smart watch...'}
                        {selectedMethod === 'voice' && 'Listening for voice command...'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {selectedMethod === 'location' && <LocationOn sx={{ fontSize: 100, color: 'primary.main' }} />}
                        {selectedMethod === 'watch' && <Watch sx={{ fontSize: 100, color: 'primary.main' }} />}
                        {selectedMethod === 'voice' && <Mic sx={{ fontSize: 100, color: 'primary.main' }} />}
                      </Box>
                    </>
                  )}
                  {selectedMethod === 'qr' && qrScanData && (
                    <Typography variant="body2" color="success.main" fontWeight={600} textAlign="center">
                      QR verified: {qrScanData.slice(0, 48)}
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            {selectedMethod ? (
              <>
                <Button onClick={() => { setSelectedMethod(null); setQrScanData(null); }}>Back</Button>
                <Button
                  variant="contained"
                  onClick={confirmCheckIn}
                  disabled={selectedMethod === 'qr' && !qrScanData}
                >
                  Confirm Check-in
                </Button>
              </>
            ) : (
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            )}
          </DialogActions>
        </Dialog>

          {/* Object / Reject Timesheet Dialog */}
          <Dialog 
            open={objectDialogOpen} 
            onClose={() => { setObjectDialogOpen(false); setObjectComment(''); setObjectTargetId(null); }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Object / Reject Timesheet</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Comment to employee"
                multiline
                rows={4}
                value={objectComment}
                onChange={(e) => setObjectComment(e.target.value)}
                placeholder="Explain the reason for objection or required changes..."
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setObjectDialogOpen(false); setObjectComment(''); setObjectTargetId(null); }}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  if (!objectTargetId) return;
                  setTimesheetEntries((prev: TimesheetEntry[]) => prev.map(entry => entry.id === objectTargetId ? { ...entry, status: 'rejected' as const, managerComment: objectComment } : entry));
                  const entry = timesheetEntries.find(e => e.id === objectTargetId);
                  if (entry) {
                    addNotification(createNotification.system(
                      'Timesheet Rejected',
                      `Timesheet for ${entry.employeeName} has been rejected`
                    ));
                  }
                  setObjectDialogOpen(false);
                  setObjectComment('');
                  setObjectTargetId(null);
                }}
                disabled={!objectComment.trim()}
              >
                Reject with Comment
              </Button>
          </DialogActions>
        </Dialog>

        {/* Add New Job Dialog */}
        <Dialog 
          open={newJobDialogOpen} 
          onClose={() => setNewJobDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <VideocamIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Add New Job
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Create and assign a new project job
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Job Name"
                    fullWidth
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Client"
                    fullWidth
                    value={newJob.client}
                    onChange={(e) => setNewJob({ ...newJob, client: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Estimated Total Time (e.g., 8h 00m)"
                    fullWidth
                    value={newJob.totalTime}
                    onChange={(e) => setNewJob({ ...newJob, totalTime: e.target.value })}
                    required
                    helperText="Format: Xh Ym (e.g., 8h 00m)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Allocated Hours"
                    type="number"
                    fullWidth
                    value={newJob.allocatedHours}
                    onChange={(e) => setNewJob({ ...newJob, allocatedHours: parseInt(e.target.value) || 8 })}
                    required
                    helperText="Total hours allocated for this job (default: 8)"
                    inputProps={{ min: 1, max: 24 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={newJob.startDate}
                    onChange={(e) => setNewJob({ ...newJob, startDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={newJob.startTime}
                    onChange={(e) => setNewJob({ ...newJob, startTime: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Time (Optional)"
                    type="time"
                    fullWidth
                    value={newJob.endTime}
                    onChange={(e) => setNewJob({ ...newJob, endTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Assign Team Members
                  </Typography>
                  {teamMembers.length === 0 && employees.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No team members available. Please add employees through the HR page.
                      </Typography>
                    </Paper>
                  ) : (
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List>
                        {(teamMembers.length > 0 ? teamMembers : employees.map(emp => ({
                          id: emp.id,
                          name: emp.name,
                          role: emp.position || 'Team Member',
                        }))).map((member) => (
                        <ListItem key={member.id} disablePadding>
                          <ListItemButton 
                            dense
                            onClick={() => {
                              const newAssignedMembers = newJob.assignedMembers.includes(member.id)
                                ? newJob.assignedMembers.filter(id => id !== member.id)
                                : [...newJob.assignedMembers, member.id];
                              setNewJob({ ...newJob, assignedMembers: newAssignedMembers });
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={newJob.assignedMembers.includes(member.id)}
                                tabIndex={-1}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={member.name} 
                              secondary={member.role} 
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                  )}
                </Grid>
              </Grid>
            </Stack>
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
                onClick={() => setNewJobDialogOpen(false)}
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
                Cancel
              </Button>
            <Button 
              variant="contained" 
              onClick={handleAddNewJob}
              disabled={!newJob.name || !newJob.client || !newJob.totalTime || !newJob.startDate || !newJob.startTime}
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2, #667eea)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102,126,234,0.4)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))',
                    color: 'rgba(255,255,255,0.7)'
                  }
                }}
            >
              Add Job
            </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog 
          open={editJobDialogOpen} 
          onClose={() => setEditJobDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Job</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Job Name"
                    fullWidth
                    value={editingJob?.name || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Client"
                    fullWidth
                    value={editingJob?.client || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, client: e.target.value } : null)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Estimated Total Time (e.g., 8h 00m)"
                    fullWidth
                    value={editingJob?.totalTime || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, totalTime: e.target.value } : null)}
                    required
                    helperText="Format: Xh Ym (e.g., 8h 00m)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={editingJob?.startDate || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={editingJob?.startTime || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Time (Optional)"
                    type="time"
                    fullWidth
                    value={editingJob?.endTime || ''}
                    onChange={(e) => setEditingJob(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Assign Team Members
                  </Typography>
                  {teamMembers.length === 0 && employees.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No team members available. Please add employees through the HR page.
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                      <List>
                        {(teamMembers.length > 0 ? teamMembers : employees.map(emp => ({
                          id: emp.id,
                          name: emp.name,
                          role: emp.position || 'Team Member',
                        }))).map((member) => (
                          <ListItem key={member.id} disablePadding>
                            <ListItemButton 
                              dense
                              onClick={() => {
                                if (editingJob) {
                                  const newAssignedMembers = editingJob.assignedMembers?.includes(member.id)
                                    ? editingJob.assignedMembers.filter(id => id !== member.id)
                                    : [...(editingJob.assignedMembers || []), member.id];
                                  setEditingJob({ ...editingJob, assignedMembers: newAssignedMembers });
                                }
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={editingJob?.assignedMembers?.includes(member.id) || false}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={member.name} 
                                secondary={member.role} 
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditJobDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveJobEdit}
              disabled={!editingJob?.name || !editingJob?.client || !editingJob?.totalTime || !editingJob?.startDate || !editingJob?.startTime}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pause Condition Dialog */}
        <Dialog open={pauseDialogOpen} onClose={handlePauseCancel} maxWidth="sm" fullWidth>
          <DialogTitle>Pause Job</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please select a reason for pausing this job:
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="pause-condition-label">Pause Condition</InputLabel>
              <Select
                labelId="pause-condition-label"
                value={selectedPauseCondition}
                label="Pause Condition"
                onChange={(e) => setSelectedPauseCondition(e.target.value)}
              >
                {pauseConditions.map((condition) => (
                  <MenuItem key={condition.id} value={condition.id}>
                    {condition.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedPauseCondition === 'other' && (
              <TextField
                fullWidth
                label="Specify Task"
                multiline
                rows={3}
                value={customPauseTask}
                onChange={(e) => setCustomPauseTask(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
            
            {selectedPauseCondition && selectedPauseCondition !== 'other' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Task to be created:
                </Typography>
                <Typography variant="body2">
                  {pauseConditions.find(c => c.id === selectedPauseCondition)?.task}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePauseCancel}>Cancel</Button>
            <Button 
              onClick={handlePauseConfirm} 
              variant="contained" 
              disabled={!selectedPauseCondition || (selectedPauseCondition === 'other' && !customPauseTask)}
            >
              Pause Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stop Confirmation Dialog */}
        <Dialog open={stopDialogOpen} onClose={handleStopCancel}>
          <DialogTitle>Confirm Stop Job</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to stop this job? This action will mark the job as completed.
            </Typography>
            {selectedJobId && (
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Job: {activeJobs.find(job => job.id === selectedJobId)?.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStopCancel}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleStopConfirm}>
              Stop Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* All Dialogs */}
        
        {/* Check-in Method Selection Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Select Check-in Method
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {checkInMethods.map((method, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' },
                      border: selectedMethod === method.title ? 2 : 1,
                      borderColor: selectedMethod === method.title ? 'primary.main' : 'divider',
                    }}
                    onClick={() => setSelectedMethod(method.title)}
                  >
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Box sx={{ color: 'primary.main' }}>
                          {method.icon}
                        </Box>
                        <Typography variant="h6" fontSize="1rem">
                          {method.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={confirmCheckIn}
              disabled={!selectedMethod}
            >
              Check In
            </Button>
          </DialogActions>
        </Dialog>



        {/* Pause Job Dialog */}
        <Dialog open={pauseDialogOpen} onClose={handlePauseCancel} maxWidth="sm" fullWidth>
          <DialogTitle>Pause Job</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Why are you pausing this job?
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Pause Reason</InputLabel>
              <Select
                value={selectedPauseCondition}
                onChange={(e) => setSelectedPauseCondition(e.target.value)}
                label="Pause Reason"
              >
                <MenuItem value="Break">Break</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Lunch">Lunch</MenuItem>
                <MenuItem value="Technical Issue">Technical Issue</MenuItem>
                <MenuItem value="Waiting for Approval">Waiting for Approval</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            {selectedPauseCondition === 'Other' && (
              <TextField
                fullWidth
                label="Custom Task"
                value={customPauseTask}
                onChange={(e) => setCustomPauseTask(e.target.value)}
                multiline
                rows={2}
                placeholder="Describe what you're working on..."
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePauseCancel}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handlePauseConfirm}
              disabled={!selectedPauseCondition}
            >
              Pause Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stop Job Dialog */}
        <Dialog open={stopDialogOpen} onClose={handleStopCancel} maxWidth="sm" fullWidth>
          <DialogTitle>Complete Job</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to mark this job as completed? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStopCancel}>Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleStopConfirm}
            >
              Complete Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Send Message to {teamMembers.find(m => m.id === selectedTeamMember)?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
              {messages.map((msg, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {msg.sender} - {msg.timestamp}
                  </Typography>
                  <Typography variant="body2">
                    {msg.content}
                  </Typography>
                </Box>
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMessageDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* Team View Dialog */}
        <Dialog 
          open={teamViewOpen} 
          onClose={() => setTeamViewOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { minHeight: '80vh' }
          }}
        >
          <DialogTitle>
            Team Progress Overview
          </DialogTitle>
          <DialogContent dividers>
            {teamMembers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Group sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Team Members Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please import employees through the HR page to view team progress.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Team Members List */}
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ height: '100%' }}>
                    <List>
                      {teamMembers.map(member => {
                        const assignedJobs = activeJobs.filter(job => job.assignedMembers?.includes(member.id));
                        const totalAssignedHours = assignedJobs.reduce((sum, job) => {
                          const [hours] = job.elapsedTime.split('h').map(Number);
                          return sum + (hours || 0);
                        }, 0);
                        
                        return (
                          <ListItemButton 
                            key={member.id}
                            selected={selectedTeamMember === member.id}
                            onClick={() => handleTeamMemberSelect(member.id)}
                            sx={{ 
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <ListItemIcon>
                              <Person />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2">
                                    {member.name}
                                  </Typography>
                                  <Chip 
                                    label={assignedJobs.length} 
                                    size="small" 
                                    color={assignedJobs.length > 0 ? 'primary' : 'default'}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.role}
                                  </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                    {totalAssignedHours}h logged
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMessageClick(member.id);
                                }}
                              >
                                <Chat />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Paper>
                </Grid>
                
                {/* Member Details */}
                <Grid item xs={12} md={8}>
                  {selectedTeamMember ? (
                    <Box>
                      {(() => {
                        const selectedEmployee = employees.find(emp => emp.id === selectedTeamMember);
                        const assignedJobs = activeJobs.filter(job => job.assignedMembers?.includes(selectedTeamMember));
                        const totalAssignedHours = assignedJobs.reduce((sum, job) => {
                          const [hours] = job.elapsedTime.split('h').map(Number);
                          return sum + (hours || 0);
                        }, 0);
                        const averageProgress = assignedJobs.length > 0 ? 
                          Math.round(assignedJobs.reduce((sum, job) => sum + job.progress, 0) / assignedJobs.length) : 0;
                        
                        return (
                          <>
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="h6" gutterBottom>
                                {teamMembers.find(m => m.id === selectedTeamMember)?.name}'s Profile
                              </Typography>
                              {selectedEmployee && (
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Email:</strong> {selectedEmployee.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Status:</strong> {selectedEmployee.status}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Department:</strong> {selectedEmployee.department}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Phone:</strong> {selectedEmployee.phone}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Start Date:</strong> {selectedEmployee.startDate}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Position:</strong> {selectedEmployee.position}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Employment Type:</strong> {selectedEmployee.employmentType}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              )}
                            </Box>
                            
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
                              <Typography variant="h6" gutterBottom>
                                Work Summary
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold">
                                      {assignedJobs.length}
                                    </Typography>
                                    <Typography variant="body2">
                                      Assigned Jobs
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold">
                                      {totalAssignedHours}h
                                    </Typography>
                                    <Typography variant="body2">
                                      Total Hours
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold">
                                      {averageProgress}%
                                    </Typography>
                                    <Typography variant="body2">
                                      Avg Progress
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold">
                                      {assignedJobs.filter(job => job.status === 'active').length}
                                    </Typography>
                                    <Typography variant="body2">
                                      Active Jobs
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                            
                            <Typography variant="h6" gutterBottom>
                              Assigned Projects
                            </Typography>
                            <List>
                              {assignedJobs.length > 0 ? (
                                assignedJobs.map(job => (
                                  <Paper key={job.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                      {job.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Client: {job.client}
                                    </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {job.startDate} • {job.elapsedTime} / {job.totalTime}
                                        </Typography>
                                      </Box>
                                      <Chip 
                                        label={job.status} 
                                        size="small"
                                        color={job.status === 'active' ? 'success' : job.status === 'paused' ? 'warning' : 'default'}
                                      />
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="body2" display="flex" justifyContent="space-between">
                                        <span>Progress</span>
                                        <span>{job.progress}%</span>
                                      </Typography>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={job.progress} 
                                        sx={{ mt: 1, height: 8, borderRadius: 4 }} 
                                      />
                                    </Box>
                                  </Paper>
                                ))
                              ) : (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                                  <Typography variant="body1" color="text.secondary">
                                    No projects assigned yet
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    This team member is not currently assigned to any projects
                                  </Typography>
                                </Paper>
                              )}
                            </List>
                          </>
                        );
                      })()}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      textAlign: 'center' 
                    }}>
                      <Box>
                        <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Select a team member
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Choose a team member from the list to view their details and assigned projects
                      </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTeamViewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add New Timesheet Dialog */}
        <Dialog 
          open={newTimesheetDialogOpen} 
          onClose={() => setNewTimesheetDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Timesheet Entry</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={newTimesheet.date}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={activeJobs.map(job => ({
                    label: `${job.name} - ${job.client}`,
                    value: job.name,
                    id: job.id
                  }))}
                  value={newTimesheet.project || ''}
                  onChange={(_, value) => {
                    if (typeof value === 'string') {
                      setNewTimesheet(prev => ({ 
                        ...prev, 
                        project: value,
                        projectId: undefined
                      }));
                    } else if (value) {
                      setNewTimesheet(prev => ({ 
                        ...prev, 
                        project: value.value,
                        projectId: value.id
                      }));
                    }
                  }}
                  onInputChange={(_, value) => {
                    setNewTimesheet(prev => ({ 
                      ...prev, 
                      project: value,
                      projectId: undefined
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project"
                      placeholder="Select existing project or type a new one..."
                      required
                      helperText="You can select from existing projects or type a custom project name"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.value}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeJobs.find(job => job.id === option.id)?.client}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Hours Worked"
                  type="number"
                  value={newTimesheet.hoursWorked || ''}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, hoursWorked: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, max: 24, step: 0.25 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Break Time (hours)"
                  type="number"
                  value={newTimesheet.breakTime || ''}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, breakTime: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, max: 8, step: 0.25 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTimesheet.category || 'development'}
                    onChange={(e) => setNewTimesheet(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="meeting">Meeting</MenuItem>
                    <MenuItem value="research">Research</MenuItem>
                    <MenuItem value="administration">Administration</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newTimesheet.description || ''}
                  onChange={(e) => setNewTimesheet(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the work performed..."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={['Frontend', 'Backend', 'Testing', 'Documentation', 'Review', 'Bug Fix']}
                  value={newTimesheet.tags || []}
                  onChange={(_, newValue) => setNewTimesheet(prev => ({ ...prev, tags: newValue }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewTimesheetDialogOpen(false)}>Cancel</Button>
                        <Button 
              variant="contained" 
              onClick={handleCreateTimesheet}
              disabled={!newTimesheet.project || !newTimesheet.hoursWorked || !newTimesheet.description}
            >
              Create Timesheet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Timesheet Dialog */}
        <Dialog 
          open={editTimesheetDialogOpen} 
          onClose={() => setEditTimesheetDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Timesheet Entry</DialogTitle>
          <DialogContent>
            {editingTimesheet && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={editingTimesheet.date}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project"
                    value={editingTimesheet.project}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, project: e.target.value }) : null)}
                    required
                    disabled={editingTimesheet.isAutomated}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Hours Worked"
                    type="number"
                    value={editingTimesheet.hoursWorked}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, hoursWorked: parseFloat(e.target.value) || 0 }) : null)}
                    inputProps={{ min: 0, max: 24, step: 0.25 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Billable Hours"
                    type="number"
                    value={editingTimesheet.billableHours || editingTimesheet.hoursWorked}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, billableHours: parseFloat(e.target.value) || 0 }) : null)}
                    inputProps={{ min: 0, max: 24, step: 0.25 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Hourly Rate (ZAR)"
                    type="number"
                    value={editingTimesheet.hourlyRate || DEFAULT_HOURLY_RATE_ZAR}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }) : null)}
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Break Time (hours)"
                    type="number"
                    value={editingTimesheet.breakTime || 0}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, breakTime: parseFloat(e.target.value) || 0 }) : null)}
                    inputProps={{ min: 0, max: 8, step: 0.25 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editingTimesheet.category}
                      onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, category: e.target.value as any }) : null)}
                    >
                      <MenuItem value="development">Development</MenuItem>
                      <MenuItem value="meeting">Meeting</MenuItem>
                      <MenuItem value="research">Research</MenuItem>
                      <MenuItem value="administration">Administration</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={editingTimesheet.description}
                    onChange={(e) => setEditingTimesheet(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={['Frontend', 'Backend', 'Testing', 'Documentation', 'Review', 'Bug Fix']}
                    value={editingTimesheet.tags || []}
                    onChange={(_, newValue) => setEditingTimesheet(prev => prev ? ({ ...prev, tags: newValue }) : null)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Add tags..."
                      />
                    )}
                  />
                </Grid>

                {editingTimesheet.isAutomated && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.contrastText">
                        <SmartToy sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                        This is an automated timesheet entry. Some fields may be restricted.
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {editingTimesheet.aiSuggestions && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'secondary.light' }}>
                      <Typography variant="h6" gutterBottom>
                        AI Suggestions (Confidence: {editingTimesheet.aiSuggestions.confidence}%)
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Suggested Hours:</strong> {editingTimesheet.aiSuggestions.suggestedHours}h
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Suggested Description:</strong> {editingTimesheet.aiSuggestions.suggestedDescription}
                      </Typography>
                      <Button
                        size="small"
                          variant="outlined" 
                        startIcon={<AutoAwesome />}
                        onClick={() => applyAISuggestions(editingTimesheet.id)}
                        >
                        Apply Suggestions
                        </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditTimesheetDialogOpen(false)}>Cancel</Button>
                        <Button 
                          variant="contained"
              onClick={handleSaveTimesheetEdit}
              disabled={!editingTimesheet?.project || !editingTimesheet?.hoursWorked || !editingTimesheet?.description}
                        >
              Save Changes
                        </Button>
          </DialogActions>
        </Dialog>

        {/* AI Suggestions Dialog */}
        <Dialog 
          open={aiSuggestionsDialogOpen} 
          onClose={() => setAiSuggestionsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              AI Time Predictions
                      </Box>
          </DialogTitle>
          <DialogContent>
            {aiPredictions.length > 0 ? (
              <Grid container spacing={2}>
                {aiPredictions.map(prediction => (
                  <Grid item xs={12} key={prediction.projectId}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">
                            {activeJobs.find(job => job.id === prediction.projectId)?.name || 'Unknown Project'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Confidence: {prediction.confidence}%
                          </Typography>
                    </Box>
                        <Chip 
                          label={`${prediction.predictedHours}h predicted`}
                          color="primary"
                          icon={<TrendingUp />}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {prediction.reasoning}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested Task Breakdown:
                      </Typography>
                      <List dense>
                        {prediction.suggestedBreakdown.map((task, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={task.task}
                              secondary={`${task.hours} hour(s)`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Psychology sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No AI predictions available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate AI predictions to see intelligent time estimates for your projects
                      </Typography>
                    </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAiSuggestionsDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<AutoAwesome />}
              onClick={generateAIPredictions}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? 'Generating...' : 'Regenerate Predictions'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Actions Dialog */}
        <Dialog
          open={bulkActionsDialogOpen} 
          onClose={() => setBulkActionsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              You have selected {selectedTimesheets.length} timesheet entries.
              </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an action to apply to all selected timesheets:
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkActionsDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleBulkReject}
              startIcon={<Close />}
            >
              Reject All
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleBulkApprove}
              startIcon={<CheckCircle />}
            >
              Approve All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog 
          open={exportDialogOpen} 
          onClose={() => setExportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Download color="primary" />
              Export Timesheets
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Export {filteredTimesheets.length} timesheet entries
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose the export format for your timesheet data:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => handleExportTimesheets('csv')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6">CSV Format</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compatible with Excel, Google Sheets, and other spreadsheet applications
                    </Typography>
                </Box>
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => handleExportTimesheets('json')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6">JSON Format</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Structured data format ideal for data processing and backup
                  </Typography>
                </Box>
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Import Timesheets Dialog */}
        <Dialog 
          open={importDialogOpen} 
          onClose={() => setImportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload color="primary" />
              Import Timesheets
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Import timesheet entries from a file
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Supported formats: CSV, JSON
            </Typography>
            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Box>
            {selectedFile && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Selected file:</strong> {selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                      </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={handleImportTimesheets}
              disabled={!selectedFile}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Offline Data Dialog */}
        <Dialog 
          open={importOfflineDialogOpen} 
          onClose={() => setImportOfflineDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage color="primary" />
              Import Offline Data
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Import timesheet data from offline storage
                      </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This feature allows you to import timesheet data that was collected offline, such as from mobile apps or local storage systems.
                      </Typography>
            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Box>
            {selectedFile && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Selected file:</strong> {selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                      </Typography>
        </Box>
            )}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>Note:</strong> Offline data will be imported with 'pending' status for review.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportOfflineDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={handleImportOfflineData}
              disabled={!selectedFile}
            >
              Import Offline Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Job Start Confirmation Dialog */}
        <Dialog
          open={jobStartConfirmationOpen}
          onClose={() => setJobStartConfirmationOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayArrow color="primary" />
              Start Job Tracking
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              You're about to start tracking time for:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {jobToStart?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Client: {jobToStart?.client}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Allocated Time: {jobToStart?.allocatedHours || 8} hours
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Automatic Timesheet Tracking:</strong> Time will be automatically recorded against this job. 
                Break times will be tracked separately and paused automatically.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJobStartConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PlayArrow />}
              onClick={handleConfirmJobStart}
            >
              Start Tracking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Break Time Dialog */}
        <Dialog
          open={breakDialogOpen}
          onClose={() => setBreakDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Pause color="warning" />
              Start Break Time
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              You're about to start a break for:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {jobOnBreak?.name}
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Timesheet Paused:</strong> Time tracking will be paused during your break. 
                You can resume tracking when you return.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBreakDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<Pause />}
              onClick={handleStartBreak}
            >
              Start Break
            </Button>
          </DialogActions>
        </Dialog>

        {/* Time Allocation Complete Dialog */}
        <Dialog
          open={timeAllocationCompleteDialogOpen}
          onClose={() => setTimeAllocationCompleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              Time Allocation Complete
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              You've completed the allocated time for:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {jobTimeComplete?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Allocated Time: {jobTimeComplete?.allocatedHours || 8} hours
            </Typography>
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Ready for Review:</strong> Your work is complete and ready to be submitted for review.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Next:</strong> You&apos;ll select a manager to review this work.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimeAllocationCompleteDialogOpen(false)}>
              Continue Working
            </Button>
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleTimeAllocationComplete}
            >
              Submit for Review
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Submission Dialog */}
        <Dialog
          open={reviewSubmissionDialogOpen}
          onClose={() => setReviewSubmissionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="primary" />
              Submit for Review
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Submit your completed work for review:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {jobForReview?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Client: {jobForReview?.client}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Next:</strong> You&apos;ll select a manager to review this work.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                If changes are needed after review, the job can be reassigned to you.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewSubmissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Assignment />}
              onClick={handleSubmitForReview}
            >
              Submit for Review
            </Button>
          </DialogActions>
        </Dialog>

        {/* Job Reassignment Dialog */}
        <Dialog
          open={reassignmentDialogOpen}
          onClose={() => setReassignmentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Refresh color="warning" />
              Job Reassigned
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              This job has been reassigned to you:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {jobForReassignment?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Client: {jobForReassignment?.client}
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Changes Required:</strong> Your manager has requested changes to this job. 
                You can start working on it again.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReassignmentDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PlayArrow />}
              onClick={() => {
                setReassignmentDialogOpen(false);
                if (jobForReassignment) {
                  setJobToStart(jobForReassignment);
                  setJobStartConfirmationOpen(true);
                }
              }}
            >
              Start Working
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Stop Workflow Dialog */}
        <Dialog
          open={stopWorkflowDialogOpen}
          onClose={handleStopWorkflowCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Stop color="error" />
              Stop Job: {jobToStop?.name}
            </Box>
          </DialogTitle>
          <DialogContent>
            {stopWorkflowStep === 'options' && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  What would you like to do with this job?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Client: {jobToStop?.client}
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Pause />}
                    onClick={() => handleStopOptionSelect('break')}
                    sx={{ 
                      justifyContent: 'flex-start',
                      p: 2,
                      textAlign: 'left'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Take a Break
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pause timesheet tracking for a break
                      </Typography>
                    </Box>
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<VideoCall />}
                    onClick={() => handleStopOptionSelect('meeting')}
                    sx={{ 
                      justifyContent: 'flex-start',
                      p: 2,
                      textAlign: 'left'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Attend Meeting
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pause for a meeting or call
                      </Typography>
                    </Box>
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    onClick={() => handleStopOptionSelect('review')}
                    sx={{ 
                      justifyContent: 'flex-start',
                      p: 2,
                      textAlign: 'left'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Send for Review
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submit completed work for manager review
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Next: You&apos;ll select a manager to review this work.
                      </Typography>
                    </Box>
                  </Button>
                </Stack>
              </Box>
            )}

            {stopWorkflowStep === 'review' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add any notes about the completed work for the reviewer
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe what was completed, any issues encountered, or additional context..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Next:</strong> You'll select a manager to review this work.
                  </Typography>
                </Alert>
              </Box>
            )}

            {stopWorkflowStep === 'manager' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Assign to Manager
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {jobToStop?.briefedByName
                    ? `This job was briefed by ${jobToStop.briefedByName}. Review is routed to them automatically.`
                    : 'Select the line manager who briefed this job to review submitted work'}
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Manager</InputLabel>
                  <Select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    label="Select Manager"
                  >
                    {managerOptions.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        <Box>
                          <Typography variant="subtitle2">{manager.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {manager.role}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {reviewNotes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Review Notes:</strong> {reviewNotes}
                    </Typography>
                  </Alert>
                )}
                
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Ready to Submit:</strong> This job will be submitted for review and timesheet tracking will stop.
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStopWorkflowCancel}>
              Cancel
            </Button>
            
            {stopWorkflowStep === 'review' && (
              <>
                <Button onClick={handleStopWorkflowBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setStopWorkflowStep('manager')}
                >
                  Continue
                </Button>
              </>
            )}
            
            {stopWorkflowStep === 'manager' && (
              <>
                <Button onClick={handleStopWorkflowBack}>
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Assignment />}
                  onClick={handleManagerSelection}
                  disabled={!selectedManager}
                >
                  Submit for Review
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TimeTracking;
