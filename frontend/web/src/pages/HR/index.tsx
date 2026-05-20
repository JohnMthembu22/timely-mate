import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Users, Briefcase, AlertCircle, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  DialogContentText,
  Checkbox,
  ListItemText as MuiListItemText,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Pagination,
  FormControlLabel,
} from '@mui/material';
import {
  Payment,
  EventAvailable,
  Group,
  Assessment,
  TrendingUp,
  CalendarToday,
  AccessTime,
  CheckCircle,
  PendingActions,
  LocalAtm,
  Receipt,
  AccountBalance,
  People,
  PersonAdd,
  Badge,
  Timeline,
  Settings,
  Computer,
  Palette,
  Upload,
  Download,
  Info,
  Cancel,
  EventNote,
  FilterList,
  ReportProblem,
  GroupWork,
  Add as AddIcon,
  AutoAwesome,
  Psychology,
  SmartToy,
  Functions,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { MetricsGrid } from '../../components/MetricsGrid/MetricsGrid';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatZAR } from '../../utils/currency';
import { useEmployees, Employee } from '../../contexts/EmployeeContext';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { emailService } from '../../services/emailService';
import { useAppSelector } from '../../store';
// @ts-ignore
import { saveAs } from 'file-saver';
import DeleteIcon from '@mui/icons-material/Delete';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  avatar: string;
  reason: string;
  daysRequested: number;
  submittedDate: string;
  rejectionReason?: string; // Add rejection reason field
}

interface ImportEmployee {
  name: string;
  position: string;
  department: string;
  email: string;
  joinDate: string;
  salary: number;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  status: 'active' | 'on-leave' | 'terminated';
  benefits: string;
  employmentType: 'permanent' | 'contract' | 'freelancer';
}

interface ImportState {
  step: number;
  file: File | null;
  data: ImportEmployee[];
  validationErrors: string[];
  isProcessing: boolean;
  previewData: ImportEmployee[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  importProgress: number;
  batchSize: number;
  processedBatches: number;
  totalBatches: number;
  isImporting: boolean;
}

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  leaveType: string;
}

interface LeaveDetails {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  joinDate: string;
  leaveBalances: {
    annual: LeaveBalance;
    sick: LeaveBalance;
    personal: LeaveBalance;
    maternity: LeaveBalance;
  };
  leaveHistory: LeaveRequest[];
  pendingRequests: LeaveRequest[];
}

// Enhanced payroll interfaces
interface BankingInstitution {
  id: string;
  name: string;
  code: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'business';
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  isActive: boolean;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: 'bank_transfer' | 'paypal' | 'stripe' | 'payoneer' | 'wise' | 'revolut' | 'payfast' | 'peach_payments' | 'paygate' | 'ozow' | 'yoco' | 'snapcan' | 'zapper';
  apiKey: string;
  isActive: boolean;
  processingFee: number;
  processingTime: string;
  supportedCurrencies: string[];
}

interface PayrollBatch {
  id: string;
  name: string;
  period: string;
  paymentDate: string;
  totalAmount: number;
  employeeCount: number;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'payment_gateway' | 'cash' | 'check';
  bankingInstitution?: string;
  paymentGateway?: string;
  employees: PayrollBatchEmployee[];
  createdAt: string;
  processedAt?: string;
}

interface PayrollBatchEmployee {
  employeeId: string;
  employeeName: string;
  salary: number;
  deductions: number;
  bonuses: number;
  netAmount: number;
  bankAccount?: string;
  paymentMethod: 'bank_transfer' | 'payment_gateway' | 'cash' | 'check';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  errorMessage?: string;
}

interface PayrollSettings {
  defaultPaymentMethod: 'bank_transfer' | 'payment_gateway' | 'cash' | 'check';
  defaultBankingInstitution?: string;
  defaultPaymentGateway?: string;
  autoProcessPayroll: boolean;
  requireApproval: boolean;
  taxDeductions: boolean;
  benefitsDeductions: boolean;
  overtimeCalculation: boolean;
  groupPaymentsEnabled: boolean;
  aiOptimizationEnabled: boolean;
}

// New interfaces for group payments and AI capabilities
interface PayrollGroup {
  id: string;
  name: string;
  salaryAmount: number;
  employees: PayrollBatchEmployee[];
  paymentMethod: 'bank_transfer' | 'payment_gateway' | 'cash' | 'check';
  bankingInstitution?: string;
  paymentGateway?: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
}

interface AIPayrollInsight {
  type: 'cost_optimization' | 'fraud_detection' | 'compliance_check' | 'performance_bonus';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendations: string[];
  potentialSavings?: number;
  affectedEmployees: string[];
}

interface AIGroupingRecommendation {
  groupName: string;
  employees: PayrollBatchEmployee[];
  reasoning: string;
  efficiency: number;
  estimatedSavings: number;
}

const salaryBrackets = [
  { min: 0, max: 70000, name: 'Entry Level' },
  { min: 70001, max: 90000, name: 'Mid Level' },
  { min: 90001, max: 120000, name: 'Senior Level' },
  { min: 120001, max: Infinity, name: 'Executive Level' },
];

const availableBenefits = [
  'Health Insurance',
  '401k',
  'Remote Work',
  'Car Allowance',
  'Stock Options',
  'Gym Membership',
  'Professional Development',
  'Child Care',
  'Life Insurance',
  'Disability Insurance',
];

const HR: React.FC = () => {
  const { employees, addEmployee, addEmployees, updateEmployee } = useEmployees();
  const { addNotification } = useNotifications();
  const { currentPlan } = useSubscription();
  const user = useAppSelector((state) => state.auth.user);
  const [currentTab, setCurrentTab] = useState(0);
  const [openAddEmployee, setOpenAddEmployee] = useState(false);
  const [openAddLeave, setOpenAddLeave] = useState(false);
  const [openProcessPayroll, setOpenProcessPayroll] = useState(false);
  const [openPromoteEmployee, setOpenPromoteEmployee] = useState(false);
  const [openExcelImport, setOpenExcelImport] = useState(false);
  const [selectedEmployeeForPromotion, setSelectedEmployeeForPromotion] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    salary: 0,
    level: 'junior' as 'junior' | 'mid' | 'senior' | 'lead',
    benefits: [] as string[],
    employmentType: 'permanent' as 'permanent' | 'contract' | 'freelancer',
  });
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [payrollPeriod, setPayrollPeriod] = useState({
    period: '',
    paymentDate: '',
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedLeaveEmployee, setSelectedLeaveEmployee] = useState<LeaveDetails | null>(null);
  const [openLeaveDetails, setOpenLeaveDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openEmployeeDetails, setOpenEmployeeDetails] = useState(false);
  const [openLeaveApproval, setOpenLeaveApproval] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [leaveApprovalAction, setLeaveApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Simple error check for rejection reason
  const rejectionError = leaveApprovalAction === 'reject' && !rejectionReason.trim();
  
  // Excel import states
  const [excelImport, setExcelImport] = useState<ImportState>({
    step: 0,
    file: null,
    data: [],
    validationErrors: [],
    isProcessing: false,
    previewData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    importProgress: 0,
    batchSize: 50,
    processedBatches: 0,
    totalBatches: 0,
    isImporting: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate sample leave requests from imported employees
  useEffect(() => {
    if (employees.length > 0) {
      const sampleLeaveRequests: LeaveRequest[] = employees
        .filter(employee => employee.status === 'active') // Only active employees can request leave
        .slice(0, Math.min(employees.length, 10)) // Limit to 10 sample requests
        .map((employee, index) => {
          const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave'];
          const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
          
          // Generate random dates within the last 3 months
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-15 days leave
          
          const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          return {
            id: `leave-${employee.id}-${index}`,
            employeeName: employee.name,
            employeeId: employee.id,
            type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
            reason: 'Sample leave request',
            daysRequested,
            submittedDate: startDate.toISOString().split('T')[0],
          };
        });
      
      setLeaveRequests(sampleLeaveRequests);
    } else {
      setLeaveRequests([]);
    }
  }, [employees]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
      case 'active':
        return 'success';
      case 'pending':
      case 'on-leave':
        return 'warning';
      case 'rejected':
      case 'failed':
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddEmployee = () => {
    // Check free tier employee limit
    if (currentPlan?.id === 'free' && employees.length >= 5) {
      addNotification(createNotification.employee(
        'Employee Limit Reached',
        'Free tier is limited to 5 employees. Please upgrade to add more employees.'
      ));
      return;
    }
    
    // Create new employee with proper structure
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name,
      position: newEmployee.position,
      department: newEmployee.department,
      email: newEmployee.email,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: '',
      salary: newEmployee.salary,
      benefits: newEmployee.benefits,
      level: newEmployee.level as 'junior' | 'mid' | 'senior' | 'lead',
      employmentType: newEmployee.employmentType,
    };
    
    addEmployee(newEmp);
    
    // Send notification
    addNotification(createNotification.employee(
      'New Employee Added',
      `${newEmp.name} has been added to the ${newEmp.department} department as ${newEmp.position}`
    ));
    
    // Send invitation email to the new employee
    const invitationLink = emailService.generateInvitationLink(newEmp.email);
    emailService.sendEmployeeInvitation({
      to: newEmp.email,
      employeeName: newEmp.name,
      organizationName: user?.organizationName || 'Your Organization',
      position: newEmp.position,
      department: newEmp.department,
      invitationLink: invitationLink,
    }).then((success) => {
      if (success) {
        addNotification(createNotification.employee(
          'Invitation Sent',
          `An invitation email has been sent to ${newEmp.email}`
        ));
      } else {
        addNotification(createNotification.employee(
          'Invitation Email',
          `Please send an invitation email to ${newEmp.email} manually`
        ));
      }
    }).catch((error) => {
      console.error('Error sending invitation email:', error);
      addNotification(createNotification.employee(
        'Email Error',
        `Could not send invitation email. Please contact ${newEmp.email} manually.`
      ));
    });
    
    setNewEmployee({ name: '', position: '', department: '', email: '', salary: 0, level: 'junior', benefits: [], employmentType: 'permanent' });
    setOpenAddEmployee(false);
  };

  const handleAddLeave = () => {
    // Find the selected employee
    const selectedEmployee = employees.find(emp => emp.id === newLeave.employeeId);
    
    if (selectedEmployee) {
      // Calculate days requested
      const startDate = new Date(newLeave.startDate);
      const endDate = new Date(newLeave.endDate);
      const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Create a new leave request
      const newLeaveRequest: LeaveRequest = {
        id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.id,
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        status: 'pending',
        avatar: selectedEmployee.avatar || `https://i.pravatar.cc/150?u=${selectedEmployee.id}`,
        reason: newLeave.reason,
        daysRequested,
        submittedDate: new Date().toISOString().split('T')[0],
      };
      
      // Add to leave requests
      setLeaveRequests((prevRequests: LeaveRequest[]) => [...prevRequests, newLeaveRequest]);
      
      // Send notification
      addNotification(createNotification.leave(
        'Leave Request Created',
        `${selectedEmployee.name} has requested ${newLeave.type} from ${newLeave.startDate} to ${newLeave.endDate}`
      ));
      
      console.log('Adding leave request:', newLeaveRequest);
    }
    
    setNewLeave({ employeeId: '', type: '', startDate: '', endDate: '', reason: '' });
    setOpenAddLeave(false);
  };

  const handlePromoteEmployee = (employee: Employee) => {
    setSelectedEmployeeForPromotion(employee);
    setOpenPromoteEmployee(true);
  };

  const handlePromotionConfirm = () => {
    if (selectedEmployeeForPromotion) {
      // Update employee level and salary
      updateEmployee(selectedEmployeeForPromotion.id, {
        level: selectedEmployeeForPromotion.level,
        salary: selectedEmployeeForPromotion.salary,
      });
      
      // Send notification
      addNotification(createNotification.employee(
        'Employee Promoted',
        `${selectedEmployeeForPromotion.name} has been promoted to ${selectedEmployeeForPromotion.level} level`
      ));
      
      setOpenPromoteEmployee(false);
      setSelectedEmployeeForPromotion(null);
    }
  };

  const handleProcessPayroll = () => {
    // Group employees by salary bracket
    employees.reduce((acc, employee) => {
      const bracket = salaryBrackets.find(
        bracket => employee.salary >= bracket.min && employee.salary <= bracket.max
      );
      if (bracket) {
        if (!acc[bracket.name]) {
          acc[bracket.name] = [];
        }
        acc[bracket.name].push(employee);
      }
      return acc;
    }, {} as Record<string, Employee[]>);

    // Create payroll batch
    const batchId = `batch-${Date.now()}`;
    const batchEmployees: PayrollBatchEmployee[] = employees.map(employee => {
      const deductions = payrollSettings.taxDeductions ? employee.salary * 0.15 : 0; // 15% tax
      const bonuses = 0; // Could be calculated based on performance
      const netAmount = employee.salary - deductions + bonuses;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        salary: employee.salary,
        deductions,
        bonuses,
        netAmount,
        paymentMethod: payrollSettings.defaultPaymentMethod,
        status: 'pending',
      };
    });

    const newBatch: PayrollBatch = {
      id: batchId,
      name: `Payroll Batch - ${payrollPeriod.period}`,
      period: payrollPeriod.period,
      paymentDate: payrollPeriod.paymentDate,
      totalAmount: batchEmployees.reduce((sum, emp) => sum + emp.netAmount, 0),
      employeeCount: batchEmployees.length,
      status: 'draft',
      paymentMethod: payrollSettings.defaultPaymentMethod,
      bankingInstitution: payrollSettings.defaultBankingInstitution,
      paymentGateway: payrollSettings.defaultPaymentGateway,
      employees: batchEmployees,
      createdAt: new Date().toISOString(),
    };

    setCurrentPayrollBatch(newBatch);
    setOpenPayrollBatch(true);

    // Send notification
    addNotification(createNotification.hr(
      'Payroll Batch Created',
      `Payroll batch created for ${employees.length} employees totaling ${formatZAR(newBatch.totalAmount)}`
    ));
  };

  const handleProcessPayrollBatch = async (batch: PayrollBatch) => {
    try {
      // Update batch status to processing
      // Batch processing started

      // Simulate processing each employee payment
      const processedEmployees = await Promise.all(
        batch.employees.map(async (employee, index) => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 100 * (index + 1)));

          // Simulate payment processing based on method
          let status: 'completed' | 'failed' = 'completed';
          let transactionId = `txn_${Date.now()}_${employee.employeeId}`;
          let errorMessage = '';

          if (employee.paymentMethod === 'bank_transfer') {
            // Simulate bank transfer
            const bank = bankingInstitutions.find(b => b.id === batch.bankingInstitution);
            if (!bank?.isActive) {
              status = 'failed';
              errorMessage = 'Bank account not active';
            }
          } else if (employee.paymentMethod === 'payment_gateway') {
            // Simulate payment gateway processing
            const gateway = paymentGateways.find(pg => pg.id === batch.paymentGateway);
            if (!gateway?.isActive) {
              status = 'failed';
              errorMessage = 'Payment gateway not active';
            }
          }

          return {
            ...employee,
            status,
            transactionId: status === 'completed' ? transactionId : undefined,
            errorMessage: status === 'failed' ? errorMessage : undefined,
          };
        })
      );

      // Update batch with processed results
      // Batch processing completed

      setCurrentPayrollBatch(null);
      setOpenPayrollBatch(false);

      // Send notification
      const successCount = processedEmployees.filter(emp => emp.status === 'completed').length;
      const failedCount = processedEmployees.filter(emp => emp.status === 'failed').length;
      
      addNotification(createNotification.hr(
        'Payroll Processing Complete',
        `Processed ${successCount} payments successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`
      ));

    } catch (error) {
      console.error('Error processing payroll batch:', error);
      addNotification(createNotification.hr(
        'Payroll Processing Failed',
        'An error occurred while processing the payroll batch'
      ));
    }
  };



  const handleLeaveAction = (requestId: string, action: 'approve' | 'reject') => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (request) {
      setSelectedLeaveRequest(request);
      setLeaveApprovalAction(action);
      setRejectionReason('');
      setOpenLeaveApproval(true);
    }
  };

  const handleLeaveApprovalConfirm = () => {
    console.log('handleLeaveApprovalConfirm called with:', {
      selectedLeaveRequest,
      leaveApprovalAction,
      rejectionReason,
      leaveRequestsLength: leaveRequests.length
    });

    try {
      if (!selectedLeaveRequest) {
        console.error('No leave request selected for approval/rejection.');
        return;
      }

      if (
        leaveApprovalAction === 'reject' &&
        (!rejectionReason || !rejectionReason.trim())
      ) {
        console.error('Rejection reason is required.');
        return;
      }

      console.log('Creating updated requests...');
      const updatedRequests = leaveRequests.map(request => {
        if (request.id === selectedLeaveRequest.id) {
          const updatedRequest = {
            id: request.id,
            employeeName: request.employeeName,
            employeeId: request.employeeId,
            type: request.type,
            startDate: request.startDate,
            endDate: request.endDate,
            status: (leaveApprovalAction === 'approve' ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected',
            avatar: request.avatar,
            reason: request.reason,
            daysRequested: request.daysRequested,
            submittedDate: request.submittedDate,
            rejectionReason: leaveApprovalAction === 'reject' ? rejectionReason : undefined,
          };
          console.log('Updated request:', updatedRequest);
          return updatedRequest;
        }
        return request;
      });

      console.log('Setting leave requests...');
      setLeaveRequests(updatedRequests);

      console.log('Creating notification...');
      const action = leaveApprovalAction === 'approve' ? 'approved' : 'rejected';
      const notificationMessage = leaveApprovalAction === 'reject' && rejectionReason
        ? `${selectedLeaveRequest.employeeName}'s leave request has been rejected. Reason: ${rejectionReason}`
        : `${selectedLeaveRequest.employeeName}'s leave request has been ${action}`;

      console.log('Adding notification...');
      try {
        addNotification(createNotification.leave(
          `Leave Request ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          notificationMessage
        ));
      } catch (notificationError) {
        console.error('Error adding notification:', notificationError);
        // Continue with the process even if notification fails
      }

      console.log('Closing dialog and resetting state...');
      try {
        setOpenLeaveApproval(false);
        setSelectedLeaveRequest(null);
        setLeaveApprovalAction('approve');
        setRejectionReason('');
      } catch (stateError) {
        console.error('Error resetting state:', stateError);
      }

      console.log('handleLeaveApprovalConfirm completed successfully');
    } catch (err: any) {
      console.error('Error in handleLeaveApprovalConfirm:', err);
      console.error('Error stack:', err?.stack || 'No stack trace');
      alert('An error occurred while processing the leave request. Please try again.');
    }
  };

  const calculateLeaveBalance = (employeeId: string, leaveType: string): LeaveBalance => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return {
        employeeId,
        employeeName: '',
        totalDays: 0,
        usedDays: 0,
        remainingDays: 0,
        pendingDays: 0,
        leaveType
      };
    }

    const employeeLeaves = leaveRequests.filter(leave => 
      leave.employeeName === employee.name && leave.type === leaveType
    );

    const approvedLeaves = employeeLeaves.filter(leave => leave.status === 'approved');
    const pendingLeaves = employeeLeaves.filter(leave => leave.status === 'pending');

    // Calculate days (simplified calculation)
    const usedDays = approvedLeaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

    const pendingDays = pendingLeaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

    // Default leave allocations based on type
    const totalDays = leaveType === 'Annual Leave' ? 25 : 
                     leaveType === 'Sick Leave' ? 15 :
                     leaveType === 'Personal Leave' ? 5 :
                     leaveType === 'Maternity Leave' ? 90 : 10;

    return {
      employeeId,
      employeeName: employee.name,
      totalDays,
      usedDays,
      remainingDays: totalDays - usedDays,
      pendingDays,
      leaveType
    };
  };

  const getEmployeeLeaveDetails = (employeeId: string): LeaveDetails | null => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;

    const employeeLeaves = leaveRequests.filter(leave => leave.employeeName === employee.name);
    const pendingRequests = employeeLeaves.filter(leave => leave.status === 'pending');

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      position: employee.position,
      department: employee.department,
      joinDate: employee.joinDate,
      leaveBalances: {
        annual: calculateLeaveBalance(employee.id, 'Annual Leave'),
        sick: calculateLeaveBalance(employee.id, 'Sick Leave'),
        personal: calculateLeaveBalance(employee.id, 'Personal Leave'),
        maternity: calculateLeaveBalance(employee.id, 'Maternity Leave'),
      },
      leaveHistory: employeeLeaves.filter(leave => leave.status !== 'pending'),
      pendingRequests
    };
  };

  const handleViewLeaveDetails = (employeeId: string) => {
    const leaveDetails = getEmployeeLeaveDetails(employeeId);
    if (leaveDetails) {
      setSelectedLeaveEmployee(leaveDetails);
      setOpenLeaveDetails(true);
    }
  };

  const handleViewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenEmployeeDetails(true);
  };

  const handleExcelImportClick = () => {
    setOpenExcelImport(true);
    setExcelImport({
      step: 0,
      file: null,
      data: [],
      validationErrors: [],
      isProcessing: false,
      previewData: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      importProgress: 0,
      batchSize: 50,
      processedBatches: 0,
      totalBatches: 0,
      isImporting: false,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Validate file type - support Excel, CSV, and PDF
      const fileName = file.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      const isCSV = fileName.endsWith('.csv');
      const isPDF = fileName.endsWith('.pdf');
      
      if (!isExcel && !isCSV && !isPDF) {
        setExcelImport(prev => ({
          ...prev,
          validationErrors: ['Please select a valid file (.xlsx, .xls, .csv, or .pdf)'],
          step: 1,
        }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setExcelImport(prev => ({
          ...prev,
          validationErrors: ['File size too large. Please select a file smaller than 10MB'],
          step: 1,
        }));
        return;
      }
      
      setExcelImport(prev => ({
        ...prev,
        file,
        validationErrors: [],
        step: 0,
      }));
      
      processFile(file);
    }
    
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const processFile = async (file: File) => {
    setExcelImport(prev => ({ ...prev, isProcessing: true }));
    
    try {
      console.log('Starting file processing...', file.name, file.size);
      
      // Add a small delay to show processing state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const fileName = file.name.toLowerCase();
      let data: ImportEmployee[];
      
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        data = await readExcelFile(file);
      } else if (fileName.endsWith('.csv')) {
        data = await readCSVFile(file);
      } else if (fileName.endsWith('.pdf')) {
        data = await readPDFFile(file);
      } else {
        throw 'Unsupported file format';
      }
      
      console.log('File processed successfully:', data.length, 'employees found');
      
      const validationErrors = validateExcelData(data);
      const totalPages = Math.ceil(data.length / excelImport.itemsPerPage);
      const previewData = data.slice(0, excelImport.itemsPerPage);
      const totalBatches = Math.ceil(data.length / excelImport.batchSize);
      
      setExcelImport(prev => ({
        ...prev,
        data,
        validationErrors,
        previewData,
        totalPages,
        totalBatches,
        step: validationErrors.length === 0 ? 2 : 1,
        isProcessing: false,
      }));
    } catch (error) {
      console.error('Error processing file:', error);
      
      let errorMessage = 'Failed to process file. Please check the file format and try again.';
      
      // Handle both string errors and Error objects
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      setExcelImport(prev => ({
        ...prev,
        validationErrors: [errorMessage],
        isProcessing: false,
        step: 1, // Stay on validation step to show errors
      }));
    }
  };

  const readExcelFile = (file: File): Promise<ImportEmployee[]> => {
    return new Promise((resolve, reject) => {
      // Add timeout protection
      const timeout = setTimeout(() => {
        reject('File processing timeout. Please try with a smaller file or check the file format.');
      }, 30000); // 30 second timeout

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          clearTimeout(timeout);
          
          if (!e.target?.result) {
            reject('Failed to read file content');
            return;
          }

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          
          let workbook;
          try {
            workbook = XLSX.read(data, { type: 'array' });
          } catch (xlsxError) {
            console.error('XLSX read error:', xlsxError);
            reject('Invalid Excel file format. Please ensure the file is a valid Excel document.');
            return;
          }
          
          if (!workbook.SheetNames.length) {
            reject('No sheets found in Excel file');
            return;
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          let jsonData;
          try {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          } catch (jsonError) {
            console.error('Sheet to JSON error:', jsonError);
            reject('Error reading Excel data. Please check if the file contains valid data.');
            return;
          }
          
          if (!jsonData || jsonData.length < 2) {
            reject('Excel file must contain at least a header row and one data row');
            return;
          }
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          if (!headers || headers.length === 0) {
            reject('No headers found in Excel file');
            return;
          }
          
          // Map headers to expected format with more flexible matching
          const headerMap: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            if (!header) return;
            
            const normalizedHeader = header.toString().toLowerCase().trim();
            console.log(`Processing header: "${header}" -> normalized: "${normalizedHeader}"`);
            
            // More flexible header matching
            if (normalizedHeader.includes('name') || normalizedHeader.includes('employee') || normalizedHeader.includes('first')) {
              headerMap.name = index.toString();
            }
            if (normalizedHeader.includes('surname') || normalizedHeader.includes('last')) {
              // Combine with name if we have both
              if (headerMap.name !== undefined) {
                // We'll handle this in the data processing
                headerMap.surname = index.toString();
              } else {
                headerMap.name = index.toString();
              }
            }
            if (normalizedHeader.includes('position') || normalizedHeader.includes('title') || normalizedHeader.includes('role') || normalizedHeader.includes('job')) {
              headerMap.position = index.toString();
            }
            if (normalizedHeader.includes('department') || normalizedHeader.includes('dept') || normalizedHeader.includes('team') || normalizedHeader.includes('division')) {
              headerMap.department = index.toString();
            }
            if (normalizedHeader.includes('email') || normalizedHeader.includes('mail') || normalizedHeader.includes('e-mail')) {
              headerMap.email = index.toString();
            }
            if (normalizedHeader.includes('join') || normalizedHeader.includes('date') || normalizedHeader.includes('start') || normalizedHeader.includes('hire')) {
              headerMap.joinDate = index.toString();
            }
            if (normalizedHeader.includes('salary') || normalizedHeader.includes('pay') || normalizedHeader.includes('compensation') || normalizedHeader.includes('zar')) {
              headerMap.salary = index.toString();
            }
            if (normalizedHeader.includes('level') || normalizedHeader.includes('seniority') || normalizedHeader.includes('grade') || normalizedHeader.includes('seniority level')) {
              headerMap.level = index.toString();
            }
            if (normalizedHeader.includes('status') || normalizedHeader.includes('employment') || normalizedHeader.includes('active')) {
              headerMap.status = index.toString();
            }
            if (normalizedHeader.includes('benefit') || normalizedHeader.includes('perk') || normalizedHeader.includes('leave days')) {
              headerMap.benefits = index.toString();
            }
            if (normalizedHeader.includes('employment type') || normalizedHeader.includes('employment') || normalizedHeader.includes('type') || normalizedHeader.includes('contract type')) {
              headerMap.employmentType = index.toString();
            }
          });
          
          console.log('Header mapping result:', headerMap);
          console.log('Available headers:', headers);
          
          // Validate required headers - make some fields optional
          const requiredHeaders = ['name', 'position', 'salary']; // Only truly required fields
          const missingHeaders = requiredHeaders.filter(header => !headerMap[header]);
          
          if (missingHeaders.length > 0) {
            reject(`Missing required columns: ${missingHeaders.join(', ')}. Found columns: ${headers.join(', ')}`);
            return;
          }
          
          // Set defaults for missing optional fields
          if (!headerMap.department) {
            console.log('Department column not found, will use default value');
          }
          if (!headerMap.email) {
            console.log('Email column not found, will generate default email');
          }
          if (!headerMap.joinDate) {
            console.log('Join date column not found, will use current date');
          }
          if (!headerMap.level) {
            console.log('Level column not found, will use default "junior"');
          }
          if (!headerMap.status) {
            console.log('Status column not found, will use default "active"');
          }
          if (!headerMap.benefits) {
            console.log('Benefits column not found, will use empty string');
          }
          if (!headerMap.employmentType) {
            console.log('Employment Type column not found, will use default "permanent"');
          }
          
          // Convert rows to ExcelEmployee objects with better error handling
          const employees: ImportEmployee[] = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            // Skip empty rows
            if (!row || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
              continue;
            }
            
            try {
              // Handle name (combine first name and surname if both exist)
              let name = row[parseInt(headerMap.name)]?.toString() || '';
              if (headerMap.surname) {
                const surname = row[parseInt(headerMap.surname)]?.toString() || '';
                name = name ? `${name} ${surname}`.trim() : surname;
              }
              
              const position = row[parseInt(headerMap.position)]?.toString() || '';
              
              // Use default values for missing optional fields
              const department = headerMap.department ? row[parseInt(headerMap.department)]?.toString() || '' : 'General';
              
              // Generate email if not provided
              let email = '';
              if (headerMap.email) {
                email = row[parseInt(headerMap.email)]?.toString() || '';
              } else {
                // Generate email from name
                const emailName = name.toLowerCase().replace(/[^a-z]/g, '');
                email = emailName ? `${emailName}@company.com` : '';
              }
              
              // Handle Excel date formats or use current date
              let joinDate = '';
              if (headerMap.joinDate) {
                const dateValue = row[parseInt(headerMap.joinDate)];
                if (dateValue) {
                  if (typeof dateValue === 'number') {
                    // Excel serial date number
                    const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
                    joinDate = excelDate.toISOString().split('T')[0];
                  } else {
                    // String date
                    joinDate = dateValue.toString();
                  }
                }
              } else {
                // Use current date as default
                joinDate = new Date().toISOString().split('T')[0];
              }
              
              const salary = parseFloat(row[parseInt(headerMap.salary)]?.toString() || '0') || 0;
              
              // Map seniority level to our format
              let level = 'junior';
              if (headerMap.level) {
                const levelValue = row[parseInt(headerMap.level)]?.toString() || '';
                const normalizedLevel = levelValue.toLowerCase();
                if (normalizedLevel.includes('senior') || normalizedLevel.includes('lead')) {
                  level = 'senior';
                } else if (normalizedLevel.includes('mid') || normalizedLevel.includes('intermediate')) {
                  level = 'mid';
                } else if (normalizedLevel.includes('lead') || normalizedLevel.includes('manager')) {
                  level = 'lead';
                }
              }
              
              const status = headerMap.status ? (row[parseInt(headerMap.status)]?.toString() || 'active').toLowerCase() : 'active';
              const benefits = headerMap.benefits ? row[parseInt(headerMap.benefits)]?.toString() || '' : '';
              
              // Handle employment type with validation
              let employmentType: 'permanent' | 'contract' | 'freelancer' = 'permanent';
              if (headerMap.employmentType) {
                const typeValue = row[parseInt(headerMap.employmentType)]?.toString()?.toLowerCase() || '';
                if (typeValue === 'contract' || typeValue === 'freelancer') {
                  employmentType = typeValue;
                }
                // Default to 'permanent' for any other value
              }
              
              employees.push({
                name,
                position,
                department,
                email,
                joinDate,
                salary,
                level: level as 'junior' | 'mid' | 'senior' | 'lead',
                status: status as 'active' | 'on-leave' | 'terminated',
                benefits,
                employmentType,
              });
            } catch (rowError) {
              console.warn(`Error processing row ${i + 1}:`, rowError);
              // Continue processing other rows
            }
          }
          
          if (employees.length === 0) {
            reject('No valid employee data found in the Excel file');
            return;
          }
          
          resolve(employees);
        } catch (error) {
          clearTimeout(timeout);
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        clearTimeout(timeout);
        reject('Failed to read file. Please check if the file is corrupted or in an unsupported format.');
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const readCSVFile = (file: File): Promise<ImportEmployee[]> => {
    return new Promise((resolve, reject) => {
      // Add timeout protection
      const timeout = setTimeout(() => {
        reject('File processing timeout. Please try with a smaller file or check the file format.');
      }, 30000); // 30 second timeout

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          clearTimeout(timeout);
          
          if (!e.target?.result) {
            reject('Failed to read file content');
            return;
          }

          const csvContent = e.target.result as string;
          const lines = csvContent.split('\n');
          
          if (lines.length < 2) {
            reject('CSV file must contain at least a header row and one data row');
            return;
          }
          
          // Parse CSV with proper handling of quoted fields
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };
          
          const headers = parseCSVLine(lines[0]);
          const rows = lines.slice(1).filter(line => line.trim()).map(parseCSVLine);
          
          if (!headers || headers.length === 0) {
            reject('No headers found in CSV file');
            return;
          }
          
          // Use the same header mapping logic as Excel
          const headerMap: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            if (!header) return;
            
            const normalizedHeader = header.toString().toLowerCase().trim();
            console.log(`Processing CSV header: "${header}" -> normalized: "${normalizedHeader}"`);
            
            // More flexible header matching
            if (normalizedHeader.includes('name') || normalizedHeader.includes('employee') || normalizedHeader.includes('first')) {
              headerMap.name = index.toString();
            }
            if (normalizedHeader.includes('surname') || normalizedHeader.includes('last')) {
              if (headerMap.name !== undefined) {
                headerMap.surname = index.toString();
              } else {
                headerMap.name = index.toString();
              }
            }
            if (normalizedHeader.includes('position') || normalizedHeader.includes('title') || normalizedHeader.includes('role') || normalizedHeader.includes('job')) {
              headerMap.position = index.toString();
            }
            if (normalizedHeader.includes('department') || normalizedHeader.includes('dept') || normalizedHeader.includes('team') || normalizedHeader.includes('division')) {
              headerMap.department = index.toString();
            }
            if (normalizedHeader.includes('email') || normalizedHeader.includes('mail') || normalizedHeader.includes('e-mail')) {
              headerMap.email = index.toString();
            }
            if (normalizedHeader.includes('join') || normalizedHeader.includes('date') || normalizedHeader.includes('start') || normalizedHeader.includes('hire')) {
              headerMap.joinDate = index.toString();
            }
            if (normalizedHeader.includes('salary') || normalizedHeader.includes('pay') || normalizedHeader.includes('compensation') || normalizedHeader.includes('zar')) {
              headerMap.salary = index.toString();
            }
            if (normalizedHeader.includes('level') || normalizedHeader.includes('seniority') || normalizedHeader.includes('grade') || normalizedHeader.includes('seniority level')) {
              headerMap.level = index.toString();
            }
            if (normalizedHeader.includes('status') || normalizedHeader.includes('employment') || normalizedHeader.includes('active')) {
              headerMap.status = index.toString();
            }
            if (normalizedHeader.includes('benefit') || normalizedHeader.includes('perk') || normalizedHeader.includes('leave days')) {
              headerMap.benefits = index.toString();
            }
            if (normalizedHeader.includes('employment type') || normalizedHeader.includes('employment') || normalizedHeader.includes('type') || normalizedHeader.includes('contract type')) {
              headerMap.employmentType = index.toString();
            }
          });
          
          console.log('CSV Header mapping result:', headerMap);
          
          // Validate required headers
          const requiredHeaders = ['name', 'position', 'salary'];
          const missingHeaders = requiredHeaders.filter(header => !headerMap[header]);
          
          if (missingHeaders.length > 0) {
            reject(`Missing required columns: ${missingHeaders.join(', ')}. Found columns: ${headers.join(', ')}`);
            return;
          }
          
          // Set defaults for missing optional fields
          if (!headerMap.department) {
            console.log('Department column not found, will use default value');
          }
          if (!headerMap.email) {
            console.log('Email column not found, will generate default email');
          }
          if (!headerMap.joinDate) {
            console.log('Join date column not found, will use current date');
          }
          if (!headerMap.level) {
            console.log('Level column not found, will use default "junior"');
          }
          if (!headerMap.status) {
            console.log('Status column not found, will use default "active"');
          }
          if (!headerMap.benefits) {
            console.log('Benefits column not found, will use empty string');
          }
          if (!headerMap.employmentType) {
            console.log('Employment Type column not found, will use default "permanent"');
          }
          
          // Convert rows to ImportEmployee objects
          const employees: ImportEmployee[] = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            // Skip empty rows
            if (!row || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
              continue;
            }
            
            try {
              // Handle name (combine first name and surname if both exist)
              let name = row[parseInt(headerMap.name)]?.toString() || '';
              if (headerMap.surname) {
                const surname = row[parseInt(headerMap.surname)]?.toString() || '';
                name = name ? `${name} ${surname}`.trim() : surname;
              }
              
              const position = row[parseInt(headerMap.position)]?.toString() || '';
              
              // Use default values for missing optional fields
              const department = headerMap.department ? row[parseInt(headerMap.department)]?.toString() || '' : 'General';
              
              // Generate email if not provided
              let email = '';
              if (headerMap.email) {
                email = row[parseInt(headerMap.email)]?.toString() || '';
              } else {
                const emailName = name.toLowerCase().replace(/[^a-z]/g, '');
                email = emailName ? `${emailName}@company.com` : '';
              }
              
              // Handle date formats
              let joinDate = '';
              if (headerMap.joinDate) {
                const dateValue = row[parseInt(headerMap.joinDate)];
                if (dateValue) {
                  joinDate = dateValue.toString();
                }
              } else {
                joinDate = new Date().toISOString().split('T')[0];
              }
              
              const salary = parseFloat(row[parseInt(headerMap.salary)]?.toString() || '0') || 0;
              
              // Map seniority level
              let level = 'junior';
              if (headerMap.level) {
                const levelValue = row[parseInt(headerMap.level)]?.toString() || '';
                const normalizedLevel = levelValue.toLowerCase();
                if (normalizedLevel.includes('senior') || normalizedLevel.includes('lead')) {
                  level = 'senior';
                } else if (normalizedLevel.includes('mid') || normalizedLevel.includes('intermediate')) {
                  level = 'mid';
                } else if (normalizedLevel.includes('lead') || normalizedLevel.includes('manager')) {
                  level = 'lead';
                }
              }
              
              const status = headerMap.status ? (row[parseInt(headerMap.status)]?.toString() || 'active').toLowerCase() : 'active';
              const benefits = headerMap.benefits ? row[parseInt(headerMap.benefits)]?.toString() || '' : '';
              
              // Handle employment type with validation
              let employmentType: 'permanent' | 'contract' | 'freelancer' = 'permanent';
              if (headerMap.employmentType) {
                const typeValue = row[parseInt(headerMap.employmentType)]?.toString()?.toLowerCase() || '';
                if (typeValue === 'contract' || typeValue === 'freelancer') {
                  employmentType = typeValue;
                }
              }
              
              employees.push({
                name,
                position,
                department,
                email,
                joinDate,
                salary,
                level: level as 'junior' | 'mid' | 'senior' | 'lead',
                status: status as 'active' | 'on-leave' | 'terminated',
                benefits,
                employmentType,
              });
            } catch (rowError) {
              console.warn(`Error processing CSV row ${i + 1}:`, rowError);
            }
          }
          
          if (employees.length === 0) {
            reject('No valid employee data found in the CSV file');
            return;
          }
          
          resolve(employees);
        } catch (error) {
          clearTimeout(timeout);
          console.error('Error processing CSV file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        clearTimeout(timeout);
        reject('Failed to read CSV file. Please check if the file is corrupted or in an unsupported format.');
      };
      
      reader.readAsText(file);
    });
  };

  const readPDFFile = (_file: File): Promise<ImportEmployee[]> => {
    return new Promise((_resolve, reject) => {
      // Add timeout protection
      const timeout = setTimeout(() => {
        reject('PDF processing timeout. Please try with a smaller file or check the file format.');
      }, 30000); // 30 second timeout

      // For PDF processing, we'll need to use a PDF parsing library
      // For now, we'll show a message that PDF processing is not yet implemented
      clearTimeout(timeout);
      reject('PDF import is not yet implemented. Please use Excel (.xlsx, .xls) or CSV (.csv) files for now.');
    });
  };

  const validateExcelData = (data: ImportEmployee[]): string[] => {
    const errors: string[] = [];
    const maxErrors = 50; // Limit error reporting to prevent UI overload
    
    for (let i = 0; i < data.length && errors.length < maxErrors; i++) {
      const employee = data[i];
      
      // Only validate essential fields
      if (!employee.name) errors.push(`Row ${i + 1}: Name is required`);
      if (!employee.position) errors.push(`Row ${i + 1}: Position is required`);
      if (employee.salary <= 0) errors.push(`Row ${i + 1}: Salary must be greater than 0`);
      
      // Validate email format only if email is provided
      if (employee.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employee.email)) {
          errors.push(`Row ${i + 1}: Invalid email format`);
        }
      }
      
      // Validate date format only if join date is provided
      if (employee.joinDate && isNaN(Date.parse(employee.joinDate))) {
        errors.push(`Row ${i + 1}: Invalid date format (use YYYY-MM-DD)`);
      }
    }
    
    if (errors.length >= maxErrors) {
      errors.push(`... and ${data.length - maxErrors} more validation errors. Please fix the issues and try again.`);
    }
    
    return errors;
  };

  const handlePageChange = (newPage: number) => {
    const startIndex = (newPage - 1) * excelImport.itemsPerPage;
    const endIndex = startIndex + excelImport.itemsPerPage;
    const newPreviewData = excelImport.data.slice(startIndex, endIndex);
    
    setExcelImport(prev => ({
      ...prev,
      currentPage: newPage,
      previewData: newPreviewData,
    }));
  };

  const handleImportEmployees = async () => {
    setExcelImport(prev => ({ ...prev, isImporting: true, importProgress: 0, processedBatches: 0 }));
    
    try {
      const { data, batchSize } = excelImport;
      const totalBatches = Math.ceil(data.length / batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, data.length);
        const batchData = data.slice(startIndex, endIndex);
        
        // Process batch
        const newEmployees: Employee[] = batchData.map((excelEmp, index) => ({
          id: `emp-${Date.now()}-${startIndex + index}`,
          name: excelEmp.name,
          position: excelEmp.position,
          department: excelEmp.department,
          joinDate: excelEmp.joinDate,
          status: excelEmp.status,
          avatar: '',
          salary: excelEmp.salary,
          benefits: excelEmp.benefits ? excelEmp.benefits.split(', ') : [],
          level: excelEmp.level,
          employmentType: excelEmp.employmentType,
        }));
        
        // Simulate batch processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update employees state with batch
        addEmployees(newEmployees);
        
        // Update progress
        const progress = ((batchIndex + 1) / totalBatches) * 100;
        setExcelImport(prev => ({
          ...prev,
          importProgress: progress,
          processedBatches: batchIndex + 1,
        }));
      }
      
      setOpenExcelImport(false);
      
      // Send notification for successful import
      addNotification(createNotification.employee(
        'Employees Imported Successfully',
        `${data.length} employees have been imported from the file`
      ));
      
      // Reset excel import state
      setExcelImport({
        step: 0,
        file: null,
        data: [],
        validationErrors: [],
        isProcessing: false,
        previewData: [],
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        importProgress: 0,
        batchSize: 50,
        processedBatches: 0,
        totalBatches: 0,
        isImporting: false,
      });
    } catch (error) {
      setExcelImport(prev => ({
        ...prev,
        validationErrors: ['Failed to import employees. Please try again.'],
        isImporting: false,
      }));
    }
  };

  const downloadTemplate = (format: 'excel' | 'csv' = 'excel') => {
    const template = [
      ['Name', 'Position', 'Department', 'Email', 'Join Date', 'Salary', 'Level', 'Status', 'Benefits', 'Employment Type', 'Phone', 'Location', 'Manager', 'Skills', 'Events', 'Meetings', 'Avatar'],
      ['John Smith', 'Software Engineer', 'Engineering', 'john.smith@company.com', '2024-01-15', '85000', 'mid', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0101', 'New York, NY', 'Sarah Johnson', 'React, Node.js, TypeScript', 'Company Retreat 2024, Team Building', 'Weekly Standup, Sprint Planning', 'https://i.pravatar.cc/150?u=john-smith'],
      ['Sarah Johnson', 'Product Manager', 'Product', 'sarah.johnson@company.com', '2024-02-01', '95000', 'senior', 'active', 'Health Insurance, 401k, Stock Options', 'permanent', '+1-555-0102', 'San Francisco, CA', 'CEO', 'Product Strategy, Agile, Leadership', 'Product Launch Event, All Hands Meeting', 'Product Reviews, Customer Meetings', 'https://i.pravatar.cc/150?u=sarah-johnson'],
      ['Mike Wilson', 'UX Designer', 'Design', 'mike.wilson@company.com', '2024-03-10', '75000', 'junior', 'active', 'Health Insurance, Gym Membership', 'contract', '+1-555-0103', 'Austin, TX', 'Jennifer Kim', 'Figma, Adobe Creative Suite, User Research', 'Design Workshop, Creative Summit', 'Design Reviews, User Testing Sessions', 'https://i.pravatar.cc/150?u=mike-wilson'],
      ['Lisa Brown', 'Data Analyst', 'Data', 'lisa.brown@company.com', '2024-01-20', '70000', 'mid', 'active', 'Health Insurance, 401k', 'permanent', '+1-555-0104', 'Chicago, IL', 'Maria Garcia', 'Python, SQL, Tableau, Machine Learning', 'Data Science Conference, Analytics Workshop', 'Data Reviews, Stakeholder Presentations', 'https://i.pravatar.cc/150?u=lisa-brown'],
      ['David Lee', 'Marketing Specialist', 'Marketing', 'david.lee@company.com', '2024-02-15', '65000', 'junior', 'active', 'Health Insurance', 'freelancer', '+1-555-0105', 'Los Angeles, CA', 'Emma Davis', 'Digital Marketing, SEO, Content Creation', 'Marketing Summit, Brand Workshop', 'Campaign Reviews, Client Meetings', 'https://i.pravatar.cc/150?u=david-lee'],
      ['Emma Davis', 'Sales Representative', 'Sales', 'emma.davis@company.com', '2024-03-01', '60000', 'junior', 'active', 'Health Insurance, Car Allowance', 'permanent', '+1-555-0106', 'Miami, FL', 'Sales Director', 'CRM, Sales Strategy, Negotiation', 'Sales Conference, Territory Planning', 'Sales Reviews, Client Calls', 'https://i.pravatar.cc/150?u=emma-davis'],
      ['Alex Chen', 'HR Coordinator', 'HR', 'alex.chen@company.com', '2024-01-10', '55000', 'junior', 'active', 'Health Insurance', 'contract', '+1-555-0107', 'Seattle, WA', 'HR Director', 'HRIS, Recruitment, Employee Relations', 'HR Summit, Training Workshop', 'HR Reviews, Recruitment Meetings', 'https://i.pravatar.cc/150?u=alex-chen'],
      ['Maria Garcia', 'Finance Analyst', 'Finance', 'maria.garcia@company.com', '2024-02-20', '80000', 'mid', 'active', 'Health Insurance, 401k, Stock Options', 'permanent', '+1-555-0108', 'Boston, MA', 'CFO', 'Excel, Financial Modeling, Budgeting', 'Finance Conference, Budget Planning', 'Financial Reviews, Board Meetings', 'https://i.pravatar.cc/150?u=maria-garcia'],
      ['James Wilson', 'Senior Engineer', 'Engineering', 'james.wilson@company.com', '2023-06-15', '110000', 'senior', 'active', 'Health Insurance, 401k, Remote Work, Stock Options', 'permanent', '+1-555-0109', 'Denver, CO', 'Sarah Johnson', 'Java, Spring Boot, Microservices, AWS', 'Tech Conference, Engineering Summit', 'Architecture Reviews, Code Reviews', 'https://i.pravatar.cc/150?u=james-wilson'],
      ['Jennifer Kim', 'Lead Designer', 'Design', 'jennifer.kim@company.com', '2023-08-01', '120000', 'lead', 'active', 'Health Insurance, 401k, Remote Work, Stock Options, Gym Membership', 'permanent', '+1-555-0110', 'Portland, OR', 'Design Director', 'Design Systems, Leadership, Figma', 'Design Leadership Summit, Creative Retreat', 'Design Leadership Meetings, Team Reviews', 'https://i.pravatar.cc/150?u=jennifer-kim'],
      ['Robert Taylor', 'DevOps Engineer', 'Engineering', 'robert.taylor@company.com', '2023-09-15', '105000', 'senior', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0111', 'Phoenix, AZ', 'Sarah Johnson', 'Docker, Kubernetes, AWS, CI/CD', 'DevOps Conference, Infrastructure Summit', 'Infrastructure Reviews, Deployment Meetings', 'https://i.pravatar.cc/150?u=robert-taylor'],
      ['Amanda Rodriguez', 'Content Writer', 'Marketing', 'amanda.rodriguez@company.com', '2024-04-01', '58000', 'junior', 'active', 'Health Insurance', 'freelancer', '+1-555-0112', 'Nashville, TN', 'David Lee', 'Content Strategy, SEO Writing, Social Media', 'Content Marketing Summit, Writing Workshop', 'Content Reviews, Editorial Meetings', 'https://i.pravatar.cc/150?u=amanda-rodriguez'],
      ['Michael Thompson', 'QA Engineer', 'Engineering', 'michael.thompson@company.com', '2023-11-20', '75000', 'mid', 'active', 'Health Insurance, 401k', 'permanent', '+1-555-0113', 'Salt Lake City, UT', 'Sarah Johnson', 'Selenium, Test Automation, Manual Testing', 'QA Conference, Testing Workshop', 'Test Reviews, Bug Triage Meetings', 'https://i.pravatar.cc/150?u=michael-thompson'],
      ['Jessica White', 'Business Analyst', 'Product', 'jessica.white@company.com', '2024-01-05', '72000', 'mid', 'active', 'Health Insurance, 401k', 'permanent', '+1-555-0114', 'Orlando, FL', 'Sarah Johnson', 'Business Analysis, Requirements Gathering, SQL', 'Business Analysis Summit, Process Workshop', 'Requirements Reviews, Stakeholder Meetings', 'https://i.pravatar.cc/150?u=jessica-white'],
      ['Christopher Lee', 'Mobile Developer', 'Engineering', 'christopher.lee@company.com', '2023-12-10', '90000', 'mid', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0115', 'San Diego, CA', 'Sarah Johnson', 'React Native, iOS, Android, Swift', 'Mobile Dev Conference, App Workshop', 'Mobile Reviews, Platform Meetings', 'https://i.pravatar.cc/150?u=christopher-lee'],
      ['Rachel Green', 'Customer Success Manager', 'Sales', 'rachel.green@company.com', '2024-02-28', '68000', 'mid', 'active', 'Health Insurance, Car Allowance', 'permanent', '+1-555-0116', 'Atlanta, GA', 'Sales Director', 'Customer Success, Account Management, CRM', 'Customer Success Summit, Retention Workshop', 'Customer Reviews, Success Meetings', 'https://i.pravatar.cc/150?u=rachel-green'],
      ['Daniel Park', 'Security Engineer', 'Engineering', 'daniel.park@company.com', '2023-10-15', '115000', 'senior', 'active', 'Health Insurance, 401k, Remote Work, Stock Options', 'permanent', '+1-555-0117', 'Las Vegas, NV', 'Sarah Johnson', 'Cybersecurity, Penetration Testing, Compliance', 'Security Conference, Compliance Workshop', 'Security Reviews, Audit Meetings', 'https://i.pravatar.cc/150?u=daniel-park'],
      ['Sophie Martinez', 'Graphic Designer', 'Design', 'sophie.martinez@company.com', '2024-03-15', '62000', 'junior', 'active', 'Health Insurance, Gym Membership', 'freelancer', '+1-555-0118', 'Tampa, FL', 'Jennifer Kim', 'Adobe Creative Suite, Branding, Print Design', 'Design Conference, Creative Workshop', 'Design Reviews, Brand Meetings', 'https://i.pravatar.cc/150?u=sophie-martinez'],
      ['Kevin Johnson', 'Project Manager', 'Product', 'kevin.johnson@company.com', '2023-07-20', '88000', 'senior', 'active', 'Health Insurance, 401k, Stock Options', 'permanent', '+1-555-0119', 'Minneapolis, MN', 'Sarah Johnson', 'Project Management, Agile, Scrum, Leadership', 'PM Conference, Agile Workshop', 'Project Reviews, Sprint Planning', 'https://i.pravatar.cc/150?u=kevin-johnson'],
      ['Nicole Brown', 'Operations Manager', 'Operations', 'nicole.brown@company.com', '2023-05-10', '95000', 'senior', 'active', 'Health Insurance, 401k, Stock Options', 'permanent', '+1-555-0120', 'Kansas City, MO', 'COO', 'Operations Management, Process Improvement, Leadership', 'Operations Summit, Process Workshop', 'Operations Reviews, Efficiency Meetings', 'https://i.pravatar.cc/150?u=nicole-brown'],
      ['Ryan Davis', 'Frontend Developer', 'Engineering', 'ryan.davis@company.com', '2024-01-25', '78000', 'mid', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0121', 'Raleigh, NC', 'Sarah Johnson', 'React, Vue.js, CSS, JavaScript', 'Frontend Conference, UI Workshop', 'Frontend Reviews, Component Meetings', 'https://i.pravatar.cc/150?u=ryan-davis'],
      ['Michelle Wilson', 'Training Coordinator', 'HR', 'michelle.wilson@company.com', '2024-03-05', '52000', 'junior', 'active', 'Health Insurance', 'contract', '+1-555-0122', 'Richmond, VA', 'HR Director', 'Training Development, Learning Management, Facilitation', 'Training Summit, Learning Workshop', 'Training Reviews, Development Meetings', 'https://i.pravatar.cc/150?u=michelle-wilson'],
      ['Andrew Garcia', 'Database Administrator', 'Engineering', 'andrew.garcia@company.com', '2023-08-15', '92000', 'senior', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0123', 'Memphis, TN', 'Sarah Johnson', 'SQL Server, PostgreSQL, Database Design, Performance', 'Database Conference, Performance Workshop', 'Database Reviews, Optimization Meetings', 'https://i.pravatar.cc/150?u=andrew-garcia'],
      ['Stephanie Miller', 'Social Media Manager', 'Marketing', 'stephanie.miller@company.com', '2024-02-10', '55000', 'junior', 'active', 'Health Insurance', 'freelancer', '+1-555-0124', 'Louisville, KY', 'David Lee', 'Social Media Strategy, Content Creation, Analytics', 'Social Media Summit, Content Workshop', 'Social Media Reviews, Campaign Meetings', 'https://i.pravatar.cc/150?u=stephanie-miller'],
      ['Brandon Anderson', 'Technical Writer', 'Engineering', 'brandon.anderson@company.com', '2024-01-30', '65000', 'junior', 'active', 'Health Insurance, 401k', 'contract', '+1-555-0125', 'Birmingham, AL', 'Sarah Johnson', 'Technical Writing, Documentation, API Documentation', 'Technical Writing Conference, Documentation Workshop', 'Documentation Reviews, Technical Meetings', 'https://i.pravatar.cc/150?u=brandon-anderson'],
      ['Ashley Thomas', 'Recruiter', 'HR', 'ashley.thomas@company.com', '2023-12-01', '60000', 'mid', 'active', 'Health Insurance, 401k', 'permanent', '+1-555-0126', 'Mobile, AL', 'HR Director', 'Recruitment, Sourcing, Interviewing, ATS', 'Recruitment Summit, Sourcing Workshop', 'Recruitment Reviews, Interview Meetings', 'https://i.pravatar.cc/150?u=ashley-thomas'],
      ['Jonathan Jackson', 'Backend Developer', 'Engineering', 'jonathan.jackson@company.com', '2023-09-01', '85000', 'mid', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0127', 'Anchorage, AK', 'Sarah Johnson', 'Python, Django, PostgreSQL, API Development', 'Backend Conference, API Workshop', 'Backend Reviews, API Meetings', 'https://i.pravatar.cc/150?u=jonathan-jackson'],
      ['Megan White', 'Event Coordinator', 'Marketing', 'megan.white@company.com', '2024-03-20', '48000', 'junior', 'active', 'Health Insurance', 'freelancer', '+1-555-0128', 'Honolulu, HI', 'David Lee', 'Event Planning, Vendor Management, Logistics', 'Event Planning Summit, Coordination Workshop', 'Event Reviews, Planning Meetings', 'https://i.pravatar.cc/150?u=megan-white'],
      ['Tyler Moore', 'System Administrator', 'Engineering', 'tyler.moore@company.com', '2023-11-01', '80000', 'mid', 'active', 'Health Insurance, 401k, Remote Work', 'permanent', '+1-555-0129', 'Boise, ID', 'Sarah Johnson', 'Windows Server, Linux, Active Directory, Networking', 'System Admin Conference, Infrastructure Workshop', 'System Reviews, Maintenance Meetings', 'https://i.pravatar.cc/150?u=tyler-moore'],
      ['Samantha Taylor', 'Compliance Officer', 'Legal', 'samantha.taylor@company.com', '2023-06-01', '105000', 'senior', 'active', 'Health Insurance, 401k, Stock Options', 'permanent', '+1-555-0130', 'Des Moines, IA', 'General Counsel', 'Compliance, Risk Management, Legal Research', 'Compliance Conference, Legal Workshop', 'Compliance Reviews, Legal Meetings', 'https://i.pravatar.cc/150?u=samantha-taylor'],
    ];
    
    if (format === 'csv') {
      const csvContent = template.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Excel format
      const csvContent = template.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  // Optimized dialog close handler
  const handleLeaveApprovalClose = useCallback(() => {
    setOpenLeaveApproval(false);
    setSelectedLeaveRequest(null);
    setLeaveApprovalAction('approve');
    setRejectionReason('');
  }, []);

  // Enhanced payroll state
  const [bankingInstitutions] = useState<BankingInstitution[]>([
    {
      id: 'bank-1',
      name: 'First National Bank',
      code: 'FNB',
      accountNumber: '1234567890',
      accountType: 'business',
      routingNumber: '250655',
      swiftCode: 'FIRNZAJJ',
      isActive: true,
    },
    {
      id: 'bank-2',
      name: 'Standard Bank',
      code: 'STD',
      accountNumber: '0987654321',
      accountType: 'business',
      routingNumber: '051001',
      swiftCode: 'SBZAZAJJ',
      isActive: true,
    },
    {
      id: 'bank-3',
      name: 'Nedbank',
      code: 'NED',
      accountNumber: '1122334455',
      accountType: 'business',
      routingNumber: '198765',
      swiftCode: 'NEDSZAJJ',
      isActive: true,
    },
    {
      id: 'bank-4',
      name: 'ABSA Bank',
      code: 'ABSA',
      accountNumber: '5566778899',
      accountType: 'business',
      routingNumber: '632005',
      swiftCode: 'ABSAZAJJ',
      isActive: true,
    },
    {
      id: 'bank-5',
      name: 'Capitec Bank',
      code: 'CAP',
      accountNumber: '9988776655',
      accountType: 'business',
      routingNumber: '470010',
      swiftCode: 'CABLZAJJ',
      isActive: true,
    },
    {
      id: 'bank-6',
      name: 'Investec Bank',
      code: 'INV',
      accountNumber: '3344556677',
      accountType: 'business',
      routingNumber: '580105',
      swiftCode: 'IVESZAJJ',
      isActive: true,
    },
    {
      id: 'bank-7',
      name: 'African Bank',
      code: 'AFB',
      accountNumber: '7788990011',
      accountType: 'business',
      routingNumber: '430000',
      swiftCode: 'AFRCZAJJ',
      isActive: true,
    },
    {
      id: 'bank-8',
      name: 'Discovery Bank',
      code: 'DSC',
      accountNumber: '1122334456',
      accountType: 'business',
      routingNumber: '679000',
      swiftCode: 'DISCZA22',
      isActive: true,
    },
    {
      id: 'bank-9',
      name: 'TymeBank',
      code: 'TYM',
      accountNumber: '5544332211',
      accountType: 'business',
      routingNumber: '678910',
      swiftCode: 'TYMEZA22',
      isActive: true,
    },
    {
      id: 'bank-10',
      name: 'Bidvest Bank',
      code: 'BID',
      accountNumber: '9900112233',
      accountType: 'business',
      routingNumber: '462005',
      swiftCode: 'BIDVZAJJ',
      isActive: true,
    },
    {
      id: 'bank-11',
      name: 'Sasfin Bank',
      code: 'SAS',
      accountNumber: '4455667788',
      accountType: 'business',
      routingNumber: '683000',
      swiftCode: 'SASZAJJ',
      isActive: true,
    },
    {
      id: 'bank-12',
      name: 'Bank Zero',
      code: 'BZ',
      accountNumber: '1357924680',
      accountType: 'business',
      routingNumber: '888000',
      swiftCode: 'BZROZA22',
      isActive: true,
    },
    {
      id: 'bank-13',
      name: 'Grobank',
      code: 'GRO',
      accountNumber: '2468135790',
      accountType: 'business',
      routingNumber: '584000',
      swiftCode: 'GROCZAJJ',
      isActive: true,
    },
    {
      id: 'bank-14',
      name: 'Mercantile Bank',
      code: 'MER',
      accountNumber: '1324567890',
      accountType: 'business',
      routingNumber: '450000',
      swiftCode: 'MBLJZAJJ',
      isActive: true,
    },
    {
      id: 'bank-15',
      name: 'PostBank',
      code: 'PB',
      accountNumber: '9876543210',
      accountType: 'business',
      routingNumber: '460005',
      swiftCode: 'POSZAJJ',
      isActive: true,
    },
  ]);

  const [paymentGateways] = useState<PaymentGateway[]>([
    {
      id: 'pg-1',
      name: 'PayPal',
      type: 'paypal',
      apiKey: 'pk_test_123456789',
      isActive: true,
      processingFee: 2.9,
      processingTime: '1-2 business days',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    },
    {
      id: 'pg-2',
      name: 'Stripe',
      type: 'stripe',
      apiKey: 'sk_test_123456789',
      isActive: true,
      processingFee: 2.9,
      processingTime: '1-3 business days',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    },
    {
      id: 'pg-3',
      name: 'Wise',
      type: 'wise',
      apiKey: 'wise_test_123456789',
      isActive: true,
      processingFee: 0.5,
      processingTime: '1-2 business days',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    },
    {
      id: 'pg-4',
      name: 'PayFast',
      type: 'payfast',
      apiKey: 'payfast_test_key_123456789',
      isActive: true,
      processingFee: 2.85,
      processingTime: 'Instant - 2 business days',
      supportedCurrencies: ['ZAR'],
    },
    {
      id: 'pg-5',
      name: 'Ozow',
      type: 'ozow',
      apiKey: 'ozow_test_api_123456789',
      isActive: true,
      processingFee: 1.5,
      processingTime: 'Instant',
      supportedCurrencies: ['ZAR'],
    },
    {
      id: 'pg-6',
      name: 'Yoco',
      type: 'yoco',
      apiKey: 'yoco_test_key_123456789',
      isActive: true,
      processingFee: 2.9,
      processingTime: '1-2 business days',
      supportedCurrencies: ['ZAR'],
    },
  ]);

  const [currentPayrollBatch, setCurrentPayrollBatch] = useState<PayrollBatch | null>(null);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>({
    defaultPaymentMethod: 'bank_transfer',
    defaultBankingInstitution: 'bank-1',
    defaultPaymentGateway: 'pg-1',
    autoProcessPayroll: false,
    requireApproval: true,
    taxDeductions: true,
    benefitsDeductions: true,
    overtimeCalculation: true,
    groupPaymentsEnabled: true,
    aiOptimizationEnabled: true,
  });

  // Payroll dialogs
  const [openPayrollBatch, setOpenPayrollBatch] = useState(false);
  const [openBankingSetup, setOpenBankingSetup] = useState(false);
  const [bankingTabValue, setBankingTabValue] = useState(0);
  const [openPayrollSettings, setOpenPayrollSettings] = useState(false);
  
  // New state for group payments and AI features
  const [payrollGroups, setPayrollGroups] = useState<PayrollGroup[]>([]);
  const [openGroupPayments, setOpenGroupPayments] = useState(false);
  const [openAIInsights, setOpenAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<AIPayrollInsight[]>([]);
  const [aiGroupingRecommendations, setAIGroupingRecommendations] = useState<AIGroupingRecommendation[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Add this function inside the HR component
  const handleGenerateTaxCSV = () => {
    if (!currentPayrollBatch) return;
    const headers = [
      'Employee Name',
      'Employee ID',
      'Salary',
      'Deductions',
      'Bonuses',
      'Net Amount',
      'Period',
      'Payment Date',
    ];
    const rows = currentPayrollBatch.employees.map(emp => [
      emp.employeeName,
      emp.employeeId,
      emp.salary,
      emp.deductions,
      emp.bonuses,
      emp.netAmount,
      currentPayrollBatch.period,
      currentPayrollBatch.paymentDate,
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `tax_certification_emp201_${currentPayrollBatch.period.replace(/\s+/g, '_')}.csv`);
  };

  // Add state for payroll integrations and dialog
  const [openPayrollIntegration, setOpenPayrollIntegration] = useState(false);
  const [payrollIntegrations, setPayrollIntegrations] = useState<{ name: string; apiKey: string }[]>([]);
  const [integrationName, setIntegrationName] = useState('');
  const [integrationApiKey, setIntegrationApiKey] = useState('');

  const handleAddIntegration = () => {
    if (integrationName && integrationApiKey) {
      setPayrollIntegrations(prev => [...prev, { name: integrationName, apiKey: integrationApiKey }]);
      setIntegrationName('');
      setIntegrationApiKey('');
    }
  };
  const handleRemoveIntegration = (index: number) => {
    setPayrollIntegrations(prev => prev.filter((_, i) => i !== index));
  };

  // Add state for invoice creation dialog and invoices
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    client: '',
    dueDate: '',
    description: '',
    lineItems: [{ description: '', amount: '' }],
  });

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

  // Group Payments Functions
  const generatePayrollGroups = (batchEmployees: PayrollBatchEmployee[]): PayrollGroup[] => {
    const groupMap = new Map<number, PayrollBatchEmployee[]>();
    
    // Group employees by salary amount (rounded to nearest 1000 for grouping)
    batchEmployees.forEach(employee => {
      const roundedSalary = Math.round(employee.salary / 1000) * 1000;
      if (!groupMap.has(roundedSalary)) {
        groupMap.set(roundedSalary, []);
      }
      groupMap.get(roundedSalary)!.push(employee);
    });

    const groups: PayrollGroup[] = [];
    groupMap.forEach((employees, salary) => {
      if (employees.length > 1) { // Only create groups for multiple employees
        const totalAmount = employees.reduce((sum, emp) => sum + emp.netAmount, 0);
        groups.push({
          id: `group-${salary}-${Date.now()}`,
          name: `Salary Group ${formatZAR(salary)}`,
          salaryAmount: salary,
          employees,
          paymentMethod: payrollSettings.defaultPaymentMethod,
          bankingInstitution: payrollSettings.defaultBankingInstitution,
          paymentGateway: payrollSettings.defaultPaymentGateway,
          totalAmount,
          status: 'draft',
        });
      }
    });

    return groups.sort((a, b) => b.salaryAmount - a.salaryAmount);
  };

  const handleCreateGroupPayments = () => {
    if (!currentPayrollBatch) return;
    
    const groups = generatePayrollGroups(currentPayrollBatch.employees);
    setPayrollGroups(groups);
    setOpenGroupPayments(true);
    
    addNotification(createNotification.hr(
      'Group Payments Created',
      `Created ${groups.length} payment groups based on salary ranges`
    ));
  };

  const handleProcessGroupPayment = async (group: PayrollGroup) => {
    try {
      // Update group status to processing
      const updatedGroup = { ...group, status: 'processing' as const };
      setPayrollGroups(prev => prev.map(g => g.id === group.id ? updatedGroup : g));

      // Simulate batch payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update group status to completed
      const completedGroup = { ...updatedGroup, status: 'completed' as const };
      setPayrollGroups(prev => prev.map(g => g.id === group.id ? completedGroup : g));

      addNotification(createNotification.hr(
        'Group Payment Processed',
        `Successfully processed payment for ${group.employees.length} employees (${formatZAR(group.totalAmount)})`
      ));
    } catch (error) {
      setPayrollGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'failed' as const } : g
      ));
      
      addNotification(createNotification.hr(
        'Group Payment Failed',
        'Failed to process group payment. Please try again.'
      ));
    }
  };

  // AI Functions
  const generateAIInsights = async () => {
    if (!currentPayrollBatch) return;
    
    setIsGeneratingAI(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const insights: AIPayrollInsight[] = [
        {
          type: 'cost_optimization',
          title: 'Bulk Payment Processing Savings',
          description: 'Grouping employees with similar salaries can reduce transaction fees by 15-20%',
          impact: 'medium',
          confidence: 0.87,
          recommendations: [
            'Group 8 employees earning R50,000-R55,000 into single payment',
            'Consider using bank transfers for groups over 5 employees',
            'Schedule payments during off-peak hours for better rates'
          ],
          potentialSavings: 1250,
          affectedEmployees: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6', 'emp-7', 'emp-8'],
        },
        {
          type: 'compliance_check',
          title: 'Tax Compliance Analysis',
          description: 'All employee deductions comply with South African labour law requirements',
          impact: 'high',
          confidence: 0.95,
          recommendations: [
            'UIF contributions are correctly calculated at 2% (capped)',
            'PAYE deductions align with SARS tax tables',
            'SDL contributions calculated at 1% of gross salary'
          ],
          affectedEmployees: currentPayrollBatch.employees.map(emp => emp.employeeId),
        },
        {
          type: 'fraud_detection',
          title: 'Payment Anomaly Detection',
          description: 'No suspicious payment patterns detected in current batch',
          impact: 'high',
          confidence: 0.92,
          recommendations: [
            'All salary amounts are within expected ranges',
            'No duplicate bank account numbers detected',
            'Payment timing follows normal schedule patterns'
          ],
          affectedEmployees: [],
        },
        {
          type: 'performance_bonus',
          title: 'Performance-Based Bonus Recommendations',
          description: 'AI analysis suggests 3 employees eligible for performance bonuses',
          impact: 'medium',
          confidence: 0.79,
          recommendations: [
            'Sarah Johnson: 5% bonus based on project delivery performance',
            'Mike Chen: 3% bonus for consistent overtime contribution',
            'Lisa Williams: 4% bonus for client satisfaction scores'
          ],
          potentialSavings: -7500, // Negative because it's additional cost
          affectedEmployees: ['emp-2', 'emp-5', 'emp-7'],
        }
      ];

      setAIInsights(insights);
      setIsGeneratingAI(false);
      
      addNotification(createNotification.hr(
        'AI Analysis Complete',
        `Generated ${insights.length} AI insights for payroll optimization`
      ));
    }, 2500);
  };

  const generateAIGroupingRecommendations = async () => {
    if (!currentPayrollBatch) return;
    
    setIsGeneratingAI(true);
    
    setTimeout(() => {
      const recommendations: AIGroupingRecommendation[] = [
        {
          groupName: 'Senior Developers (R80K-R90K)',
          employees: currentPayrollBatch.employees.filter(emp => 
            emp.salary >= 80000 && emp.salary <= 90000
          ),
          reasoning: 'Similar salary range and payment timing preferences. High efficiency for bulk processing.',
          efficiency: 0.89,
          estimatedSavings: 850,
        },
        {
          groupName: 'Mid-Level Staff (R50K-R60K)',
          employees: currentPayrollBatch.employees.filter(emp => 
            emp.salary >= 50000 && emp.salary <= 60000
          ),
          reasoning: 'Consistent payment method preferences and similar bank processing requirements.',
          efficiency: 0.82,
          estimatedSavings: 620,
        },
        {
          groupName: 'Remote Workers (All Levels)',
          employees: currentPayrollBatch.employees.filter(_emp => 
            Math.random() > 0.7 // Simulate remote workers
          ),
          reasoning: 'Remote employees often prefer digital payment methods. Can optimize for lower fees.',
          efficiency: 0.75,
          estimatedSavings: 340,
        },
      ].filter(rec => rec.employees.length > 1); // Only show groups with multiple employees

      setAIGroupingRecommendations(recommendations);
      setIsGeneratingAI(false);
      
      addNotification(createNotification.hr(
        'AI Grouping Recommendations Ready',
        `Generated ${recommendations.length} intelligent grouping strategies`
      ));
    }, 2000);
  };

  const applyAIGroupingRecommendation = (recommendation: AIGroupingRecommendation) => {
    const newGroup: PayrollGroup = {
      id: `ai-group-${Date.now()}`,
      name: recommendation.groupName,
      salaryAmount: Math.round(recommendation.employees.reduce((sum, emp) => sum + emp.salary, 0) / recommendation.employees.length),
      employees: recommendation.employees,
      paymentMethod: payrollSettings.defaultPaymentMethod,
      bankingInstitution: payrollSettings.defaultBankingInstitution,
      paymentGateway: payrollSettings.defaultPaymentGateway,
      totalAmount: recommendation.employees.reduce((sum, emp) => sum + emp.netAmount, 0),
      status: 'draft',
    };

    setPayrollGroups(prev => [...prev, newGroup]);
    
    addNotification(createNotification.hr(
      'AI Recommendation Applied',
      `Created "${recommendation.groupName}" group with ${recommendation.employees.length} employees`
    ));
  };

  // Payroll Settings Save Function
  const handleSavePayrollSettings = () => {
    // Here you would typically save to a backend API
    // For now, we'll just show a success notification since settings are already in state
    
    addNotification(createNotification.hr(
      'Settings Saved',
      'Payroll settings have been successfully updated'
    ));
    
    setOpenPayrollSettings(false);
  };

  const hrHeroMetrics = useMemo(() => {
    const deptSet = new Set(
      employees.map((e) => e.department?.trim()).filter((d): d is string => Boolean(d))
    );
    const activeEmps = employees.filter((e) => e.status === 'active');
    const positionSet = new Set(
      activeEmps.map((e) => e.position?.trim()).filter((p): p is string => Boolean(p))
    );
    const avgAnn =
      employees.length === 0
        ? 0
        : employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) / employees.length;

    const avgDisplay = employees.length === 0 ? '—' : `R${Math.round(avgAnn / 1000)}k`;

    return [
      {
        title: 'Total Employees',
        value: String(employees.length),
        change:
          employees.length === 0 ? 'Import employees to get started' : `${activeEmps.length} active`,
        icon: Users,
        iconColor: '#3b82f6',
        iconBg: '#eff6ff',
      },
      {
        title: 'Departments',
        value: String(deptSet.size),
        change: deptSet.size === 0 ? 'No departments yet' : 'Active across org',
        icon: Briefcase,
        iconColor: '#10b981',
        iconBg: '#ecfdf5',
      },
      {
        title: 'Active Positions',
        value: String(positionSet.size),
        change: positionSet.size === 0 ? 'No open roles' : `${positionSet.size} roles filled`,
        icon: AlertCircle,
        iconColor: '#f59e0b',
        iconBg: '#fffbeb',
      },
      {
        title: 'Avg. Salary',
        value: avgDisplay,
        change: employees.length === 0 ? 'No salary data' : 'Per annum avg.',
        icon: DollarSign,
        iconColor: '#a855f7',
        iconBg: '#faf5ff',
      },
    ];
  }, [employees]);

  return (
    <DashboardLayout>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
          color: 'white',
          pt: 4,
          pb: 6,
          px: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 700, mb: 1 }}>
            Human Resources
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
            Manage your team, payroll, and HR operations
          </Typography>

          <MetricsGrid metrics={hrHeroMetrics} />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4 }}>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
            <Tab label="Employees" icon={<Group />} iconPosition="start" />
                          <Tab 
                label="Leave Management" 
                icon={<EventAvailable />} 
                iconPosition="start"
              disabled={employees.length === 0}
              />
                          <Tab 
                label="Payroll" 
                icon={<Payment />} 
                iconPosition="start"
              disabled={employees.length === 0}
              />
          </Tabs>

          {currentTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Recent Activities
                    </Typography>
                    {employees.length === 0 && leaveRequests.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Stack spacing={2} alignItems="center">
                          <Assessment sx={{ fontSize: 60, color: 'text.secondary' }} />
                          <Typography variant="h6" color="text.secondary">
                            No Recent Activities
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Activities will appear here as you add employees and manage leave requests.
                          </Typography>
                        </Stack>
                      </Box>
                    ) : (
                      <List>
                        {leaveRequests.length > 0 && (
                          <>
                            <ListItem>
                              <ListItemIcon>
                                <EventAvailable color="primary" />
                              </ListItemIcon>
                              <MuiListItemText
                                primary="Leave Requests"
                                secondary={`${leaveRequests.filter(r => r.status === 'pending').length} pending requests`}
                              />
                              <Chip label="Pending" color="warning" size="small" />
                            </ListItem>
                            <Divider />
                          </>
                        )}
                        {employees.length > 0 && (
                          <>
                            <ListItem>
                              <ListItemIcon>
                                <Group color="success" />
                              </ListItemIcon>
                              <MuiListItemText
                                primary="Employee Management"
                                secondary={`${employees.length} total employees`}
                              />
                              <Chip label="Active" color="success" size="small" />
                            </ListItem>
                            <Divider />
                          </>
                        )}
                        <ListItem>
                          <ListItemIcon>
                            <Payment color="info" />
                          </ListItemIcon>
                          <MuiListItemText
                            primary="Payroll System"
                            secondary="Ready to process payroll"
                          />
                          <Chip label="Ready" color="info" size="small" />
                        </ListItem>
                      </List>
                    )}
                  </Paper>
                  
                  {/* Department Overview - Full Width */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Department Overview
                      </Typography>
                      {employees.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Stack spacing={2} alignItems="center">
                            <Computer sx={{ fontSize: 60, color: 'text.secondary' }} />
                            <Typography variant="h6" color="text.secondary">
                              No Departments Yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Department data will appear here when you add employees.
                            </Typography>
                          </Stack>
                        </Box>
                      ) : (
                        <>
                          {/* Department Summary */}
                          <Box sx={{ 
                            p: 2, 
                            mb: 3, 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText',
                            borderRadius: 1
                          }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={6}>
                                <Typography variant="h4" fontWeight="bold">
                                  {[...new Set(employees.map(emp => emp.department))].length}
                                </Typography>
                                <Typography variant="body2">
                                  Total Departments
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h4" fontWeight="bold">
                                  {employees.length}
                                </Typography>
                                <Typography variant="body2">
                                  Total Employees
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                          
                          {/* Department Distribution Chart */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              Department Distribution
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120 }}>
                              {(() => {
                                const departments = [...new Set(employees.map(emp => emp.department))];
                                const maxEmployees = Math.max(...departments.map(dept => 
                                  employees.filter(emp => emp.department === dept).length
                                ));
                                
                                return departments.map((dept) => {
                                  const deptEmployees = employees.filter(emp => emp.department === dept);
                                  const height = (deptEmployees.length / maxEmployees) * 100;
                                  
                                  return (
                                    <Box key={dept} sx={{ flex: 1, textAlign: 'center' }}>
                                      <Box sx={{ 
                                        height: `${height}%`, 
                                        minHeight: 20,
                                        bgcolor: 'primary.main', 
                                        borderRadius: '4px 4px 0 0',
                                        mb: 1,
                                        position: 'relative'
                                      }}>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            position: 'absolute', 
                                            top: -20, 
                                            left: '50%', 
                                            transform: 'translateX(-50%)',
                                            color: 'text.primary',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          {deptEmployees.length}
                                        </Typography>
                                      </Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        {dept.length > 8 ? dept.substring(0, 8) + '...' : dept}
                                      </Typography>
                                    </Box>
                                  );
                                });
                              })()}
                            </Box>
                          </Box>
                          
                          <Stack spacing={2}>
                            {(() => {
                              const departments = [...new Set(employees.map(emp => emp.department))];
                              return departments.map((dept, _index) => {
                                const deptEmployees = employees.filter(emp => emp.department === dept);
                                const percentage = Math.round((deptEmployees.length / employees.length) * 100);
                                const activeEmployees = deptEmployees.filter(emp => emp.status === 'active').length;
                                const avgSalary = Math.round(deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length);
                                
                                return (
                                  <Box key={dept} sx={{ 
                                    p: 2, 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 1,
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      bgcolor: 'action.hover'
                                    }
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Box sx={{ 
                                        p: 1, 
                                        borderRadius: 1, 
                                        bgcolor: 'primary.light', 
                                        color: 'primary.contrastText',
                                        mr: 2
                                      }}>
                                        {dept === 'Engineering' ? <Computer fontSize="small" /> :
                                         dept === 'Project Management' ? <Assessment fontSize="small" /> :
                                         dept === 'Design' ? <Palette fontSize="small" /> :
                                         dept === 'Product' ? <Timeline fontSize="small" /> :
                                         dept === 'Marketing' ? <TrendingUp fontSize="small" /> :
                                         dept === 'Sales' ? <Payment fontSize="small" /> : 
                                         <Group fontSize="small" />}
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                          {dept}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {deptEmployees.length} employees • {activeEmployees} active
                                        </Typography>
                                      </Box>
                                      <Typography variant="h6" color="primary" fontWeight="bold">
                                        {percentage}%
                                      </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 4,
                                          bgcolor: 'grey.200',
                                          '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                          }
                                        }}
                                      />
                                    </Box>
                                    
                                    <Grid container spacing={3} sx={{ mt: 1 }}>
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                          Avg Salary
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                          {formatZAR(avgSalary)}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                          Active Rate
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                          {Math.round((activeEmployees / deptEmployees.length) * 100)}%
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                );
                              });
                            })()}
                          </Stack>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  {currentPlan?.id !== 'free' && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<PersonAdd />}
                          fullWidth
                          onClick={() => setOpenAddEmployee(true)}
                        >
                          Add Employee
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<EventAvailable />}
                          fullWidth
                          onClick={() => setOpenAddLeave(true)}
                        >
                          Manage Leave
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Payment />}
                          fullWidth
                          onClick={() => setOpenProcessPayroll(true)}
                        >
                          Process Payroll
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Assessment />}
                          fullWidth
                        >
                          Generate Report
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                  
                  {/* Employee Statistics moved under Quick Actions */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employee Statistics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Group />
                          </ListItemIcon>
                          <MuiListItemText
                            primary="Total Employees"
                            secondary="Current workforce size"
                          />
                          <Typography variant="h6">
                            {employees.length}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventAvailable />
                          </ListItemIcon>
                          <MuiListItemText
                            primary="Pending Leave Requests"
                            secondary="Requests awaiting approval"
                          />
                          <Typography variant="h6">
                            {leaveRequests.filter(r => r.status === 'pending').length}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Timeline />
                          </ListItemIcon>
                          <MuiListItemText
                            primary="Active Employees"
                            secondary="Currently working"
                          />
                          <Typography variant="h6">
                            {employees.filter(e => e.status === 'active').length}
                          </Typography>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
                    Employee Directory
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your team members and their information
                  </Typography>
                  {currentPlan?.id === 'free' && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                      Free tier: {employees.length}/5 employees. Upgrade to add more.
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={handleExcelImportClick}
                  >
                    Import Employees
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setOpenAddEmployee(true)}
                  >
                    Add Employee
                  </Button>
                </Stack>
              </Box>
              <Grid container spacing={3}>
                {employees.length === 0 ? (
                  <Grid item xs={12}>
                    <Card 
                      sx={{ 
                        borderRadius: 4,
                        textAlign: 'center',
                        py: 8,
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.02), rgba(118,75,162,0.02))',
                          pointerEvents: 'none',
                          zIndex: 0
                        }
                      }}
                    >
                      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack spacing={3} alignItems="center">
                          <Box
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'linear-gradient(145deg, #e6f7ff, #bbdefb)',
                              boxShadow: '0 8px 16px rgba(3, 169, 244, 0.2)',
                              mb: 2
                            }}
                          >
                            <Group sx={{ fontSize: 64, color: '#1976d2' }} />
                          </Box>
                          <Typography variant="h5" fontWeight={600} color="text.primary">
                            No Employees Yet
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                            Get started by adding your first employee. You can manage their information, leave requests, and payroll all in one place.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            size="large"
                            onClick={() => setOpenAddEmployee(true)}
                            sx={{ 
                              borderRadius: 3, 
                              mt: 2, 
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
                              }
                            }}
                          >
                            Add Your First Employee
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  employees.map((employee) => (
                    <Grid item xs={12} md={4} key={employee.id}>
                      <Card 
                        sx={{ 
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.98)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            borderColor: 'rgba(0,0,0,0.12)',
                          },
                        }}
                        onClick={() => handleViewEmployeeDetails(employee)}
                      >
                        {/* Status Indicator */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: employee.status === 'active' 
                            ? 'linear-gradient(90deg, #10b981, #059669)' 
                            : employee.status === 'on-leave' 
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        }} />
                        
                        {/* Header Section */}
                        <Box sx={{ 
                          position: 'relative', 
                          pt: 4, 
                          pb: 2,
                          px: 3,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8))',
                        }}>
                          <Avatar
                            src={employee.avatar}
                            sx={{ 
                              width: 72, 
                              height: 72, 
                              border: '3px solid #fff',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                              mx: 'auto',
                              mb: 2
                            }}
                          />
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: '#1f2937',
                            mb: 0.5,
                            fontSize: '1.1rem'
                          }}>
                              {employee.name}
                            </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6b7280',
                            mb: 1.5,
                            fontSize: '0.875rem'
                          }}>
                              {employee.position}
                            </Typography>
                            <Chip
                              label={employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                              color={getStatusColor(employee.status)}
                              size="small"
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                        </Box>
                        
                        {/* Content Section */}
                        <CardContent sx={{ 
                          pt: 1, 
                          px: 3, 
                          pb: 3,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Stack spacing={2} sx={{ flex: 1 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.5
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}>
                                  Department
                                </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                              }}>
                                {employee.department}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.5
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}>
                                  Join Date
                                </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                              }}>
                                {new Date(employee.joinDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.5
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}>
                                  Level
                                </Typography>
                              <Chip 
                                label={employee.level.charAt(0).toUpperCase() + employee.level.slice(1)}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 2,
                                  fontSize: '0.75rem',
                                  height: 22,
                                  backgroundColor: employee.level === 'senior' || employee.level === 'lead' 
                                    ? 'rgba(59, 130, 246, 0.1)' 
                                    : 'rgba(156, 163, 175, 0.1)',
                                  borderColor: employee.level === 'senior' || employee.level === 'lead' 
                                    ? 'rgba(59, 130, 246, 0.3)' 
                                    : 'rgba(156, 163, 175, 0.3)',
                                  color: employee.level === 'senior' || employee.level === 'lead' 
                                    ? '#3b82f6' 
                                    : '#6b7280'
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.5
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}>
                                  Salary
                                </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700,
                                color: '#059669',
                                fontSize: '0.875rem'
                              }}>
                                {formatZAR(employee.salary)}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          {/* Action Buttons */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1.5,
                            mt: 3,
                            pt: 2,
                            borderTop: '1px solid rgba(0,0,0,0.06)'
                          }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<TrendingUp sx={{ fontSize: 16 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromoteEmployee(employee);
                              }}
                              sx={{ 
                                borderRadius: 2,
                                flex: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1,
                                px: 2,
                                fontSize: '0.8rem',
                                borderColor: 'rgba(0,0,0,0.15)',
                                color: '#6b7280',
                                '&:hover': {
                                  borderColor: 'rgba(0,0,0,0.25)',
                                  backgroundColor: 'rgba(0,0,0,0.02)',
                                  color: '#374151'
                                }
                              }}
                            >
                              Promote
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<EventAvailable sx={{ fontSize: 16 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(employee);
                                setOpenAddLeave(true);
                              }}
                              sx={{ 
                                borderRadius: 2,
                                flex: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1,
                                px: 2,
                                fontSize: '0.8rem',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                }
                              }}
                            >
                              Leave
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          )}

          {currentTab === 2 && employees.length > 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Leave Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<EventAvailable />}
                  onClick={() => setOpenAddLeave(true)}
                >
                  New Leave Request
                </Button>
              </Box>
              
              {/* Recent Leave Requests - Moved to top for prominence */}
              <Paper 
                sx={{ 
                  mb: 4, 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2.5, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <EventAvailable 
                    sx={{ 
                      mr: 1.5, 
                      color: 'white',
                      fontSize: 24 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    Recent Leave Requests
                  </Typography>
                </Box>
                
                {/* Filter Toolbar */}
                {leaveRequests.length > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: 1,
                      borderColor: 'divider',
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 180,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <InputLabel id="leave-status-filter">Status</InputLabel>
                        <Select
                          labelId="leave-status-filter"
                          label="Status"
                          defaultValue="all"
                          startAdornment={<FilterList sx={{ ml: -0.5, mr: 0.5, fontSize: 20, color: 'text.secondary' }} />}
                        >
                          <MenuItem value="all">All Statuses</MenuItem>
                          <MenuItem value="pending">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PendingActions sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                              Pending
                            </Box>
                          </MenuItem>
                          <MenuItem value="approved">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                              Approved
                            </Box>
                          </MenuItem>
                          <MenuItem value="rejected">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Cancel sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
                              Rejected
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 180,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <InputLabel id="leave-type-filter">Leave Type</InputLabel>
                        <Select
                          labelId="leave-type-filter"
                          label="Leave Type"
                          defaultValue="all"
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="annual">Annual Leave</MenuItem>
                          <MenuItem value="sick">Sick Leave</MenuItem>
                          <MenuItem value="maternity">Maternity Leave</MenuItem>
                          <MenuItem value="paternity">Paternity Leave</MenuItem>
                          <MenuItem value="bereavement">Bereavement</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 180,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <InputLabel id="leave-date-filter">Date Range</InputLabel>
                        <Select
                          labelId="leave-date-filter"
                          label="Date Range"
                          defaultValue="all"
                          startAdornment={<CalendarToday sx={{ ml: -0.5, mr: 0.5, fontSize: 20, color: 'text.secondary' }} />}
                        >
                          <MenuItem value="all">All Dates</MenuItem>
                          <MenuItem value="current">Current Month</MenuItem>
                          <MenuItem value="next">Next Month</MenuItem>
                          <MenuItem value="previous">Previous Month</MenuItem>
                          <MenuItem value="custom">Custom Range...</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Button 
                        variant="outlined" 
                        startIcon={<Download />} 
                        size="small"
                        sx={{ 
                          borderRadius: 2,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          ml: 2
                        }}
                      >
                        Export
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {leaveRequests.length === 0 ? (
                  <Box 
                    sx={{ 
                      p: 8, 
                      textAlign: 'center',
                      borderRadius: 4,
                      background: theme => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Stack spacing={4} alignItems="center">
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          mb: 1
                        }}
                      >
                        <EventAvailable sx={{ fontSize: 54, color: 'white' }} />
                      </Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {employees.length === 0 ? 'No Employees Imported' : 'No Leave Requests'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, fontSize: '1.05rem' }}>
                        {employees.length === 0 
                          ? 'No employees have been imported yet. Import employees first to manage their leave requests.'
                          : 'No leave requests have been submitted yet. Employees can submit leave requests which will appear here for approval.'
                        }
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={employees.length === 0 ? <Upload /> : <EventAvailable />}
                        size="large"
                        onClick={() => employees.length === 0 ? setOpenExcelImport(true) : setOpenAddLeave(true)}
                        sx={{ 
                          borderRadius: 2, 
                          mt: 2, 
                          px: 4, 
                          py: 1.5,
                          background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                          '&:hover': {
                            boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {employees.length === 0 ? 'Import Employees' : 'Create Leave Request'}
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3} sx={{ 
                      mt: 1,
                      '& .MuiGrid-item': {
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)'
                        }
                      }
                    }}>
                      {leaveRequests
                        .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                        .map((request) => {
                          const employee = employees.find(emp => emp.name === request.employeeName);
                          const daysRequested = request.daysRequested || 
                            Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          
                          return (
                            <Grid item xs={12} md={6} lg={4} key={request.id}>
                              <Card 
                                sx={{ 
                                  cursor: 'pointer',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  borderRadius: 4,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                                  backdropFilter: 'blur(20px)',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: request.status === 'pending' 
                                      ? 'linear-gradient(90deg, #ff9800, #ffc107)' 
                                      : request.status === 'approved' 
                                      ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                                      : 'linear-gradient(90deg, #f44336, #ef5350)',
                                  },
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: request.status === 'pending' 
                                      ? 'linear-gradient(135deg, rgba(255,152,0,0.02), rgba(255,193,7,0.02))' 
                                      : request.status === 'approved' 
                                      ? 'linear-gradient(135deg, rgba(76,175,80,0.02), rgba(102,187,106,0.02))' 
                                      : 'linear-gradient(135deg, rgba(244,67,54,0.02), rgba(239,83,80,0.02))',
                                    pointerEvents: 'none',
                                    zIndex: 0
                                  },
                                  '&:hover': { 
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                                    borderColor: request.status === 'pending' 
                                      ? 'warning.main' 
                                      : request.status === 'approved' 
                                      ? 'success.main' 
                                      : 'error.main',
                                  }
                                }}
                                onClick={() => {
                                  if (employee) {
                                    handleViewLeaveDetails(employee.id);
                                  }
                                }}
                              >
                                <CardContent sx={{ flexGrow: 1, p: 3, pt: 3.5 }}>
                                  {/* Header with Avatar and Status */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                      src={request.avatar} 
                                      sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        mr: 2.5,
                                        border: 2,
                                        borderColor: 'background.paper',
                                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                                        bgcolor: theme => request.status === 'pending' 
                                          ? theme.palette.warning.light
                                          : request.status === 'approved' 
                                          ? theme.palette.success.light 
                                          : theme.palette.error.light
                                      }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {request.employeeName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {employee ? `${employee.position} • ${employee.department}` : ''}
                                      </Typography>
                                      <Chip
                                        label={request.status}
                                        color={getStatusColor(request.status)}
                                        size="small"
                                        sx={{ 
                                          fontWeight: 600,
                                          textTransform: 'capitalize',
                                          borderRadius: '12px',
                                          px: 1,
                                          '& .MuiChip-label': {
                                            px: 1
                                          },
                                          background: theme => request.status === 'pending'
                                            ? `linear-gradient(45deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`
                                            : request.status === 'approved'
                                            ? `linear-gradient(45deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
                                            : `linear-gradient(45deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
                                          boxShadow: request.status === 'pending'
                                            ? '0 2px 10px rgba(255, 152, 0, 0.2)'
                                            : request.status === 'approved'
                                            ? '0 2px 10px rgba(46, 125, 50, 0.2)'
                                            : '0 2px 10px rgba(211, 47, 47, 0.2)'
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Leave Details */}
                                  <Box 
                                    sx={{ 
                                      mb: 3, 
                                      mt: 2,
                                      p: 3, 
                                      borderRadius: 3, 
                                      background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
                                      backdropFilter: 'blur(10px)',
                                      border: '1px solid rgba(255,255,255,0.2)',
                                      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background: request.status === 'pending' 
                                          ? 'linear-gradient(90deg, #ff9800, #ffc107)' 
                                          : request.status === 'approved' 
                                          ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                                          : 'linear-gradient(90deg, #f44336, #ef5350)',
                                        borderRadius: '3px 3px 0 0'
                                      }
                                    }}
                                  >
                                    <Typography 
                                      variant="subtitle2" 
                                      sx={{ 
                                        fontWeight: 800, 
                                        mb: 2,
                                        fontSize: '0.9rem',
                                        background: request.status === 'pending' 
                                          ? 'linear-gradient(135deg, #ff9800, #ffc107)' 
                                          : request.status === 'approved' 
                                          ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                                          : 'linear-gradient(135deg, #f44336, #ef5350)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}
                                    >
                                      <Box sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%',
                                        background: request.status === 'pending' 
                                          ? 'linear-gradient(135deg, #ff9800, #ffc107)' 
                                          : request.status === 'approved' 
                                          ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                                          : 'linear-gradient(135deg, #f44336, #ef5350)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                      }} />
                                      {request.type}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Box sx={{ 
                                        p: 1.5, 
                                        borderRadius: 2, 
                                        background: 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(33,150,243,0.05))',
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <CalendarToday sx={{ fontSize: 20, color: '#2196f3' }} />
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Box sx={{ 
                                        p: 1.5, 
                                        borderRadius: 2, 
                                        background: 'linear-gradient(135deg, rgba(156,39,176,0.1), rgba(156,39,176,0.05))',
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <AccessTime sx={{ fontSize: 20, color: '#9c27b0' }} />
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {daysRequested} day{daysRequested > 1 ? 's' : ''}
                                      </Typography>
                                    </Box>
                                    {request.reason && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Box sx={{ 
                                          p: 1.5, 
                                          borderRadius: 2, 
                                          background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,193,7,0.05))',
                                          mr: 2,
                                          mt: 0.2,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}>
                                          <Info sx={{ fontSize: 20, color: '#ffc107' }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ 
                                          fontStyle: 'italic', 
                                          color: 'text.primary', 
                                          fontWeight: 500,
                                          lineHeight: 1.6,
                                          background: 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01))',
                                          p: 1.5,
                                          borderRadius: 2,
                                          border: '1px solid rgba(0,0,0,0.05)',
                                          flex: 1
                                        }}>
                                          {request.reason}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>

                                  {/* Rejection Reason */}
                                  {request.status === 'rejected' && request.rejectionReason && (
                                    <Box sx={{ 
                                      p: 2, 
                                      bgcolor: 'error.light',
                                      backgroundImage: 'linear-gradient(to right, rgba(211,47,47,0.05), rgba(211,47,47,0.15))',
                                      borderRadius: 2,
                                      mb: 2,
                                      border: '1px solid',
                                      borderColor: 'error.main',
                                      boxShadow: '0 2px 8px rgba(211,47,47,0.1)',
                                      position: 'relative',
                                      pl: 4.5
                                    }}>
                                      <ReportProblem 
                                        sx={{ 
                                          position: 'absolute',
                                          left: 12,
                                          top: 16,
                                          color: 'error.main',
                                          fontSize: 22
                                        }} 
                                      />
                                      <Typography variant="caption" color="error.dark" sx={{ 
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.7rem'
                                      }}>
                                        Rejection Reason:
                                      </Typography>
                                      <Typography variant="body2" color="error.dark" sx={{ mt: 0.5, fontWeight: 500 }}>
                                        {request.rejectionReason}
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Action Buttons */}
                                  {request.status === 'pending' && (
                                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                      <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={<CheckCircle />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLeaveAction(request.id, 'approve');
                                        }}
                                        sx={{ 
                                          fontWeight: 700,
                                          textTransform: 'none',
                                          py: 1.5,
                                          px: 3,
                                          borderRadius: 3,
                                          fontSize: '0.95rem',
                                          background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                                          border: 'none',
                                          boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                                          position: 'relative',
                                          overflow: 'hidden',
                                          '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s'
                                          },
                                          '&:hover': {
                                            background: 'linear-gradient(135deg, #66bb6a, #4caf50)',
                                            transform: 'translateY(-3px) scale(1.02)',
                                            boxShadow: '0 12px 32px rgba(76, 175, 80, 0.4)',
                                            '&::before': {
                                              left: '100%'
                                            }
                                          }
                                        }}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={<Cancel />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLeaveAction(request.id, 'reject');
                                        }}
                                        sx={{ 
                                          fontWeight: 700,
                                          textTransform: 'none',
                                          py: 1.5,
                                          px: 3,
                                          borderRadius: 3,
                                          fontSize: '0.95rem',
                                          background: 'linear-gradient(135deg, #f44336, #ef5350)',
                                          border: 'none',
                                          boxShadow: '0 8px 24px rgba(244, 67, 54, 0.3)',
                                          position: 'relative',
                                          overflow: 'hidden',
                                          '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s'
                                          },
                                          '&:hover': {
                                            background: 'linear-gradient(135deg, #ef5350, #f44336)',
                                            transform: 'translateY(-3px) scale(1.02)',
                                            boxShadow: '0 12px 32px rgba(244, 67, 54, 0.4)',
                                            '&::before': {
                                              left: '100%'
                                            }
                                          }
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </Box>
                                  )}

                                  {/* Submission Date */}
                                  <Box 
                                    sx={{ 
                                      mt: 3, 
                                      pt: 2.5, 
                                      borderTop: '1px solid rgba(0,0,0,0.08)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01))',
                                      borderRadius: 2,
                                      p: 2,
                                      mx: -1
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ 
                                        p: 1, 
                                        borderRadius: 1.5, 
                                        background: 'linear-gradient(135deg, rgba(63,81,181,0.1), rgba(63,81,181,0.05))',
                                        mr: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <EventNote sx={{ fontSize: 16, color: '#3f51b5' }} />
                                      </Box>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          fontWeight: 600,
                                          color: 'text.primary',
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ 
                                        p: 1, 
                                        borderRadius: 1.5, 
                                        background: 'linear-gradient(135deg, rgba(158,158,158,0.1), rgba(158,158,158,0.05))',
                                        mr: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <AccessTime sx={{ fontSize: 14, color: '#9e9e9e' }} />
                                      </Box>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          fontWeight: 500,
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        {new Date(request.submittedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          {/* No employees message for Leave Management */}
          {currentTab === 2 && employees.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <EventAvailable sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                No Employees Available
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Add employees first to manage leave requests and track attendance.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setOpenAddEmployee(true)}
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
                  }
                }}
              >
                Add First Employee
              </Button>
            </Box>
          )}

          {currentTab === 3 && employees.length > 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Payroll Management
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => setOpenPayrollSettings(true)}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AccountBalance />}
                    onClick={() => setOpenBankingSetup(true)}
                  >
                    Banking Setup
                  </Button>
                  {currentPayrollBatch && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Receipt />}
                      onClick={handleGenerateTaxCSV}
                    >
                      Generate Tax Certification CSV (EMP201)
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={() => setOpenProcessPayroll(true)}
                  >
                    Process Payroll
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setOpenPayrollIntegration(true)}
                  >
                    Payroll Software Integration
                  </Button>

                </Stack>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper>
                    {employees.length === 0 ? (
                      <Box sx={{ p: 8, textAlign: 'center' }}>
                        <Stack spacing={3} alignItems="center">
                          <Payment sx={{ fontSize: 80, color: 'text.secondary' }} />
                          <Typography variant="h5" color="text.secondary">
                            No Payroll Data
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                            No employees have been added yet. Add employees first to manage their payroll and salary information.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            size="large"
                            onClick={() => setOpenAddEmployee(true)}
                            sx={{ borderRadius: 2, mt: 2 }}
                          >
                            Add Employee
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <List>
                        {salaryBrackets.map((bracket, index) => (
                          <React.Fragment key={bracket.name}>
                            {index > 0 && <Divider />}
                            <ListItem>
                              <ListItemIcon>
                                <AccountBalance />
                              </ListItemIcon>
                              <MuiListItemText
                                primary={bracket.name}
                                secondary={`${bracket.min.toLocaleString()} - ${bracket.max.toLocaleString()}`}
                              />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {employees.filter(emp => emp.salary >= bracket.min && emp.salary <= bracket.max).length} employees
                              </Typography>
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* No employees message for Payroll */}
          {currentTab === 3 && employees.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Payment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                No Employees Available
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Add employees first to process payroll and manage salary payments.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setOpenAddEmployee(true)}
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
                  }
                }}
              >
                Add First Employee
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* Add Employee Dialog */}
      <Dialog 
        open={openAddEmployee} 
        onClose={() => setOpenAddEmployee(false)} 
        maxWidth="sm" 
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
              <PersonAdd sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Add New Employee
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Expand your team with new talent
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <TextField
              label="Position"
              fullWidth
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={newEmployee.department}
                label="Department"
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Project Management">Project Management</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
            <TextField
              label="Salary"
              fullWidth
              type="number"
              value={newEmployee.salary}
              onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={newEmployee.level}
                label="Level"
                onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value as 'junior' | 'mid' | 'senior' | 'lead' })}
              >
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Mid</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={newEmployee.employmentType}
                label="Employment Type"
                onChange={(e) => setNewEmployee({ ...newEmployee, employmentType: e.target.value as 'permanent' | 'contract' | 'freelancer' })}
              >
                <MenuItem value="permanent">Permanent</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="freelancer">Freelancer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Benefits</InputLabel>
              <Select
                multiple
                value={newEmployee.benefits}
                label="Benefits"
                onChange={(e) => setNewEmployee({ ...newEmployee, benefits: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {availableBenefits.map((benefit) => (
                  <MenuItem key={benefit} value={benefit}>
                    <Checkbox checked={newEmployee.benefits.indexOf(benefit) > -1} />
                    <MuiListItemText primary={benefit} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              onClick={() => setOpenAddEmployee(false)}
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
              onClick={handleAddEmployee} 
              variant="contained" 
              color="primary"
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
                }
              }}
            >
            Add Employee
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Add Leave Request Dialog */}
      <Dialog 
        open={openAddLeave} 
        onClose={() => setOpenAddLeave(false)} 
        maxWidth="sm" 
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
              <EventNote sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                New Leave Request
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Submit a leave request for approval
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={newLeave.employeeId}
                label="Employee"
                onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newLeave.type}
                label="Leave Type"
                onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
              >
                <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Personal Leave">Personal Leave</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newLeave.startDate}
              onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newLeave.endDate}
              onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
            />
            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={3}
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            />
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
              onClick={() => setOpenAddLeave(false)}
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
              onClick={handleAddLeave} 
              variant="contained" 
              color="primary"
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
                }
              }}
            >
            Submit Request
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Promote/Demote Employee Dialog */}
      <Dialog 
        open={openPromoteEmployee} 
        onClose={() => setOpenPromoteEmployee(false)} 
        maxWidth="sm" 
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
              <TrendingUp sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedEmployeeForPromotion ? `Promote/Demote ${selectedEmployeeForPromotion.name}` : 'Employee Promotion'}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Update employee level and position
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>New Level</InputLabel>
              <Select
                value={selectedEmployeeForPromotion?.level || ''}
                label="New Level"
                onChange={(e) => setSelectedEmployeeForPromotion(prev => prev ? { ...prev, level: e.target.value as Employee['level'] } : null)}
              >
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Mid</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="New Salary"
              fullWidth
              type="number"
              value={selectedEmployeeForPromotion?.salary || ''}
              onChange={(e) => setSelectedEmployeeForPromotion(prev => prev ? { ...prev, salary: Number(e.target.value) } : null)}
            />
            <FormControl fullWidth>
              <InputLabel>Additional Benefits</InputLabel>
              <Select
                multiple
                value={selectedEmployeeForPromotion?.benefits || []}
                label="Additional Benefits"
                onChange={(e) => setSelectedEmployeeForPromotion(prev => prev ? { ...prev, benefits: e.target.value as string[] } : null)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {availableBenefits.map((benefit) => (
                  <MenuItem key={benefit} value={benefit}>
                    <Checkbox checked={(selectedEmployeeForPromotion?.benefits || []).indexOf(benefit) > -1} />
                    <MuiListItemText primary={benefit} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              onClick={() => setOpenPromoteEmployee(false)}
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
              onClick={handlePromotionConfirm} 
              variant="contained" 
              color="primary"
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
                }
              }}
            >
            Confirm Changes
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Process Payroll Dialog */}
      <Dialog open={openProcessPayroll} onClose={() => setOpenProcessPayroll(false)} maxWidth="md" fullWidth>
        <DialogTitle>Process Payroll</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Please confirm the payroll period and payment date. Employees will be processed according to their salary brackets.
          </DialogContentText>
          <Stack spacing={3}>
            <TextField
              label="Payroll Period"
              fullWidth
              value={payrollPeriod.period}
              onChange={(e) => setPayrollPeriod({ ...payrollPeriod, period: e.target.value })}
              placeholder="e.g., March 2024"
            />
            <TextField
              label="Payment Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={payrollPeriod.paymentDate}
              onChange={(e) => setPayrollPeriod({ ...payrollPeriod, paymentDate: e.target.value })}
            />
            
            {payrollSettings.groupPaymentsEnabled && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Processing Options
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Group payments allow you to process employees with similar salaries together, reducing transaction fees by up to 20%.
                  </Typography>
                </Alert>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.groupPaymentsEnabled}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        groupPaymentsEnabled: e.target.checked
                      }))}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupWork />
                      <Typography>Enable group payments for cost optimization</Typography>
                    </Box>
                  }
                />
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Salary Brackets
              </Typography>
              {salaryBrackets.map((bracket) => (
                <Box key={bracket.name} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {bracket.name} ({formatZAR(bracket.min)} - {bracket.max === Infinity ? 'No limit' : formatZAR(bracket.max)})
                  </Typography>
                  <Typography variant="body2">
                    {employees.filter(emp => emp.salary >= bracket.min && emp.salary <= bracket.max).length} employees
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProcessPayroll(false)}>Cancel</Button>
          {payrollSettings.groupPaymentsEnabled && (
            <Button 
              onClick={() => {
                handleProcessPayroll();
                setTimeout(() => {
                  handleCreateGroupPayments();
                }, 500);
              }} 
              variant="outlined" 
              color="secondary"
              startIcon={<GroupWork />}
            >
              Process with Groups
            </Button>
          )}
          <Button onClick={handleProcessPayroll} variant="contained" color="primary">
            Process Payroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Import Dialog */}
      <Dialog 
        open={openExcelImport} 
        onClose={() => setOpenExcelImport(false)} 
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
              <Upload sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Import Employees
            </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Upload and process employee data
            </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={excelImport.step} orientation="vertical" sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Upload File</StepLabel>
              <StepContent>
                <Stack spacing={3}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Supported Formats:</strong> Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)
                      <br />
                      <strong>Required columns:</strong> Name, Position/Role, Salary
                      <br />
                      <strong>Optional columns:</strong> Department, Email, Join Date, Level, Status, Benefits, Employment Type
                      <br />
                      The system will automatically map similar column names and provide defaults for missing fields.
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => downloadTemplate('csv')}
                      >
                        Download CSV Template
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => downloadTemplate('excel')}
                      >
                        Download Excel Template
                      </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Download a template to see the required format. Make sure your file has the same column headers.
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ py: 2 }}
                  >
                    Select File (.xlsx, .xls, .csv, .pdf)
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls,.csv,.pdf"
                    style={{ display: 'none' }}
                  />
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      // Create a simple test file for debugging
                      const testData = [
                        ['Name', 'Position', 'Department', 'Email', 'Join Date', 'Salary', 'Level', 'Status', 'Benefits'],
                        ['John Smith', 'Software Engineer', 'Engineering', 'john.smith@company.com', '2024-01-15', '85000', 'mid', 'active', 'Health Insurance, 401k'],
                        ['Sarah Johnson', 'Product Manager', 'Product', 'sarah.johnson@company.com', '2024-02-01', '95000', 'senior', 'active', 'Health Insurance, 401k, Stock Options'],
                      ];
                      
                      const ws = XLSX.utils.aoa_to_sheet(testData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Employees');
                      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                      const testFile = new File([excelBuffer], 'test_employees.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                      
                      processFile(testFile);
                    }}
                    sx={{ py: 1, mt: 1 }}
                  >
                    Test with Sample File
                  </Button>
                </Stack>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Validate Data</StepLabel>
              <StepContent>
                {excelImport.isProcessing ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Processing Excel file...
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {excelImport.validationErrors.length > 0 ? (
                      <Alert severity="error">
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Validation Errors:</strong>
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {excelImport.validationErrors.map((error, index) => (
                            <Typography key={index} variant="body2" component="li">
                              {error}
                            </Typography>
                          ))}
                        </Box>
                      </Alert>
                    ) : (
                      <Alert severity="success">
                        <Typography variant="body2">
                          <strong>Validation Successful!</strong> All data looks good.
                        </Typography>
                      </Alert>
                    )}
                    
                    {excelImport.previewData.length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Data Preview ({excelImport.data.length} total employees)
                        </Typography>
                        
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Showing page {excelImport.currentPage} of {excelImport.totalPages} 
                            ({excelImport.itemsPerPage} employees per page)
                          </Typography>
                        </Alert>
                        
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Join Date</TableCell>
                                <TableCell>Salary</TableCell>
                                <TableCell>Level</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {excelImport.previewData.map((employee, index) => (
                                <TableRow key={index}>
                                  <TableCell>{employee.name}</TableCell>
                                  <TableCell>{employee.position}</TableCell>
                                  <TableCell>{employee.department}</TableCell>
                                  <TableCell>{employee.email}</TableCell>
                                  <TableCell>{employee.joinDate}</TableCell>
                                  <TableCell>{formatZAR(employee.salary)}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={employee.level} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined" 
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        {excelImport.totalPages > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                              count={excelImport.totalPages}
                              page={excelImport.currentPage}
                              onChange={(_, page) => handlePageChange(page)}
                              size="small"
                              showFirstButton
                              showLastButton
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  </Stack>
                )}
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Import Employees</StepLabel>
              <StepContent>
                <Stack spacing={3}>
                  {excelImport.isImporting ? (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Importing in Progress:</strong> Processing {excelImport.data.length} employees in batches of {excelImport.batchSize}
                        </Typography>
                      </Alert>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Progress: {excelImport.processedBatches} of {excelImport.totalBatches} batches
                          </Typography>
                          <Typography variant="body2">
                            {Math.round(excelImport.importProgress)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={excelImport.importProgress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Importing employees... Please don't close this window.
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Ready to Import:</strong> {excelImport.data.length} employees will be added to the system.
                        </Typography>
                      </Alert>
                      
                      <Alert severity="warning">
                        <Typography variant="body2">
                          <strong>Large Dataset:</strong> This will import {excelImport.data.length} employees in {excelImport.totalBatches} batches. 
                          The process may take a few minutes for large datasets.
                        </Typography>
                      </Alert>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          Import Summary
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                          <Grid item>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                              <Typography variant="h4" color="primary">
                                {excelImport.data.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Employees
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                              <Typography variant="h4" color="success.main">
                                {excelImport.data.filter(emp => emp.status === 'active').length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Active
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                              <Typography variant="h4" color="info.main">
                                {excelImport.totalBatches}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Batches
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                              <Typography variant="h4" color="warning.main">
                                {formatZAR(excelImport.data.reduce((sum, emp) => sum + emp.salary, 0))}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Salary
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}
                </Stack>
              </StepContent>
            </Step>
          </Stepper>
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
              onClick={() => setOpenExcelImport(false)} 
              disabled={excelImport.isImporting}
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
          {excelImport.step === 2 && (
            <Button
              variant="contained"
              startIcon={excelImport.isImporting ? <CircularProgress size={20} /> : <Upload />}
              onClick={handleImportEmployees}
              disabled={excelImport.isImporting || excelImport.validationErrors.length > 0}
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
              {excelImport.isImporting 
                ? `Importing... (${excelImport.processedBatches}/${excelImport.totalBatches})` 
                : `Import ${excelImport.data.length} Employees`
              }
            </Button>
          )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Leave Approval Dialog */}
      <Dialog 
        open={openLeaveApproval} 
        onClose={handleLeaveApprovalClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{
          background: theme => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: 2,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative'  
        }}>
          {leaveApprovalAction === 'approve' ? (
            <>
              <CheckCircle sx={{ mr: 1 }} />
              Approve Leave Request
            </>
          ) : (
            <>
              <Cancel sx={{ mr: 1 }} />
              Reject Leave Request
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedLeaveRequest && (
              <Box sx={{
                position: 'relative',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: selectedLeaveRequest.status === 'pending' 
                    ? 'warning.main' 
                    : selectedLeaveRequest.status === 'approved' 
                    ? 'success.main' 
                    : 'error.main',
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  mb: 2
                }}>
                  <EventNote fontSize="small" />
                  Leave Request Details
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3 
                }}>
                  <Avatar 
                    src={selectedLeaveRequest.avatar} 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      mr: 2,
                      border: 3,
                      borderColor: selectedLeaveRequest.status === 'pending' 
                        ? 'warning.main' 
                        : selectedLeaveRequest.status === 'approved' 
                        ? 'success.main' 
                        : 'error.main',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}>
                      {selectedLeaveRequest.employeeName}
                    </Typography>
                    <Chip 
                      label={selectedLeaveRequest.status} 
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: selectedLeaveRequest.status === 'pending' 
                          ? 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)' 
                          : selectedLeaveRequest.status === 'approved' 
                          ? 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)' 
                          : 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                        color: 'white',
                        boxShadow: selectedLeaveRequest.status === 'pending' 
                          ? '0 2px 6px rgba(255, 167, 38, 0.4)' 
                          : selectedLeaveRequest.status === 'approved' 
                          ? '0 2px 6px rgba(102, 187, 106, 0.4)' 
                          : '0 2px 6px rgba(239, 83, 80, 0.4)',
                      }} 
                    />
                    <Typography variant="body2" sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <EventAvailable fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                      {selectedLeaveRequest.type}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  backgroundColor: 'background.paper', 
                  borderRadius: 1.5,
                  p: 2,
                  boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1, fontSize: '0.9rem', opacity: 0.7 }} />
                        Start Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedLeaveRequest.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1, fontSize: '0.9rem', opacity: 0.7 }} />
                        End Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedLeaveRequest.endDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1, fontSize: '0.9rem', opacity: 0.7 }} />
                        Duration
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedLeaveRequest.daysRequested} day{selectedLeaveRequest.daysRequested > 1 ? 's' : ''}
                      </Typography>
                    </Grid>
                    {selectedLeaveRequest.reason && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Info fontSize="small" sx={{ mr: 1, fontSize: '0.9rem', opacity: 0.7 }} />
                          Reason
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontStyle: 'italic',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          p: 1.5,
                          borderRadius: 1,
                          borderLeft: '3px solid',
                          borderColor: 'primary.light'
                        }}>
                          {selectedLeaveRequest.reason}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PendingActions fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    Submitted on {new Date(selectedLeaveRequest.submittedDate).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {leaveApprovalAction === 'reject' && (
              <Box sx={{
                position: 'relative',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: theme => `linear-gradient(to bottom, ${theme.palette.error.light}15 0%, ${theme.palette.background.paper} 100%)`,
                border: '1px solid',
                borderColor: 'error.light',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <ReportProblem sx={{ color: 'error.main', mr: 1.5, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', mb: 0.5 }}>
                      Provide Rejection Reason
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Please explain why this leave request is being rejected. This information will be shared with the employee.
                    </Typography>
                  </Box>
                </Box>
                <TextField
                  label="Rejection Reason"
                  fullWidth
                  multiline
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this leave request..."
                  required
                  error={rejectionError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main',
                        borderWidth: '2px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'error.main'
                    }
                  }}
                  helperText={rejectionError ? 'Rejection reason is required' : ''}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeaveApprovalClose}>Cancel</Button>
          <Button 
            onClick={handleLeaveApprovalConfirm} 
            variant="contained" 
            color={leaveApprovalAction === 'approve' ? 'success' : 'error'}
            disabled={rejectionError}
          >
            {leaveApprovalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Details Dialog */}
      <Dialog 
        open={openLeaveDetails} 
        onClose={() => setOpenLeaveDetails(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <EventAvailable sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Leave Details
            </Typography>
            {selectedLeaveEmployee && (
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {selectedLeaveEmployee.employeeName} • {selectedLeaveEmployee.position}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, background: 'transparent' }}>
          {selectedLeaveEmployee ? (
            <Stack spacing={4}>
              {/* Employee Info Header */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        fontSize: '2rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                      }}
                    >
                      {selectedLeaveEmployee.employeeName.charAt(0)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {selectedLeaveEmployee.employeeName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      {selectedLeaveEmployee.position} • {selectedLeaveEmployee.department}
                    </Typography>
                    <Chip 
                      label={`Joined ${new Date(selectedLeaveEmployee.joinDate).toLocaleDateString()}`}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                        color: '#667eea',
                        fontWeight: 600
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Leave Balances */}
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }} />
                  Leave Balances
                </Typography>
                
                <Grid container spacing={3}>
                  {Object.entries(selectedLeaveEmployee.leaveBalances).map(([key, balance]) => {
                    const leaveTypeConfig = {
                      annual: { color: '#4caf50', icon: '🏖️', name: 'Annual Leave' },
                      sick: { color: '#f44336', icon: '🏥', name: 'Sick Leave' },
                      personal: { color: '#ff9800', icon: '👤', name: 'Personal Leave' },
                      maternity: { color: '#e91e63', icon: '👶', name: 'Maternity Leave' }
                    };
                    const config = leaveTypeConfig[key as keyof typeof leaveTypeConfig];
                    const percentage = (balance.usedDays / balance.totalDays) * 100;
                    
                    return (
                      <Grid item xs={12} md={6} key={key}>
                        <Card sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${config.color}, ${config.color}CC)`
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '1.5rem', mr: 1.5 }}>
                                {config.icon}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {config.name}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Progress
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {balance.usedDays} / {balance.totalDays} days
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={percentage}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  background: 'rgba(0,0,0,0.05)',
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${config.color}, ${config.color}CC)`,
                                    borderRadius: 4
                                  }
                                }}
                              />
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, background: 'rgba(76,175,80,0.1)' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                    {balance.remainingDays}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Remaining
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, background: 'rgba(255,152,0,0.1)' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                                    {balance.pendingDays}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Pending
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Leave History */}
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }} />
                  Leave History
                </Typography>
                
                <Card sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}>
                  <List sx={{ p: 0 }}>
                    {selectedLeaveEmployee.leaveHistory.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No leave history available
                        </Typography>
                      </Box>
                    ) : (
                      selectedLeaveEmployee.leaveHistory.map((leave, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ py: 2, px: 3 }}>
                            <ListItemIcon>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: leave.status === 'approved' 
                                  ? 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.05))'
                                  : 'linear-gradient(135deg, rgba(244,67,54,0.1), rgba(244,67,54,0.05))'
                              }}>
                                <EventAvailable sx={{ 
                                  color: leave.status === 'approved' ? '#4caf50' : '#f44336',
                                  fontSize: 20 
                                }} />
                              </Box>
                            </ListItemIcon>
                            <MuiListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {leave.type}
                                  </Typography>
                                  <Chip 
                                    label={leave.status}
                                    size="small"
                                    sx={{
                                      background: leave.status === 'approved'
                                        ? 'linear-gradient(135deg, #4caf50, #66bb6a)'
                                        : 'linear-gradient(135deg, #f44336, #ef5350)',
                                      color: 'white',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Stack spacing={1}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    📅 {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                  </Typography>
                                  {leave.reason && (
                                    <Typography variant="body2" sx={{ 
                                      fontStyle: 'italic',
                                      p: 1.5,
                                      borderRadius: 2,
                                      background: 'rgba(0,0,0,0.02)',
                                      border: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      💬 {leave.reason}
                                    </Typography>
                                  )}
                                  {leave.status === 'rejected' && leave.rejectionReason && (
                                    <Typography variant="body2" sx={{ 
                                      color: 'error.main',
                                      fontStyle: 'italic',
                                      p: 1.5,
                                      borderRadius: 2,
                                      background: 'rgba(244,67,54,0.05)',
                                      border: '1px solid rgba(244,67,54,0.1)'
                                    }}>
                                      ❌ Rejection: {leave.rejectionReason}
                                    </Typography>
                                  )}
                                </Stack>
                              }
                            />
                          </ListItem>
                          {index < selectedLeaveEmployee.leaveHistory.length - 1 && (
                            <Divider sx={{ mx: 3, background: 'rgba(0,0,0,0.05)' }} />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </Card>
              </Box>

              {/* Pending Requests */}
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9800, #ffc107)'
                  }} />
                  Pending Leave Requests
                </Typography>
                
                <Card sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}>
                  <List sx={{ p: 0 }}>
                    {selectedLeaveEmployee.pendingRequests.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No pending requests
                        </Typography>
                      </Box>
                    ) : (
                      selectedLeaveEmployee.pendingRequests.map((request, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ py: 2, px: 3 }}>
                            <ListItemIcon>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,193,7,0.05))'
                              }}>
                                <PendingActions sx={{ color: '#ff9800', fontSize: 20 }} />
                              </Box>
                            </ListItemIcon>
                            <MuiListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {request.type}
                                  </Typography>
                                  <Chip 
                                    label="Pending"
                                    size="small"
                                    sx={{
                                      background: 'linear-gradient(135deg, #ff9800, #ffc107)',
                                      color: 'white',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Stack spacing={1}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    📅 {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                  </Typography>
                                  {request.reason && (
                                    <Typography variant="body2" sx={{ 
                                      fontStyle: 'italic',
                                      p: 1.5,
                                      borderRadius: 2,
                                      background: 'rgba(255,152,0,0.05)',
                                      border: '1px solid rgba(255,152,0,0.1)'
                                    }}>
                                      💬 {request.reason}
                                    </Typography>
                                  )}
                                </Stack>
                              }
                            />
                          </ListItem>
                          {index < selectedLeaveEmployee.pendingRequests.length - 1 && (
                            <Divider sx={{ mx: 3, background: 'rgba(0,0,0,0.05)' }} />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </Card>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
              borderRadius: 3,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No leave details available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please select an employee to view their leave information
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          pt: 2,
          background: 'transparent',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Button 
            onClick={() => setOpenLeaveDetails(false)}
            variant="contained"
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
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog 
        open={openEmployeeDetails} 
        onClose={() => setOpenEmployeeDetails(false)} 
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <People sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Employee Details
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {selectedEmployee?.name || 'Employee Information'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedEmployee && (
            <Stack spacing={4}>
              {/* Employee Header */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: selectedEmployee.status === 'active' 
                    ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                    : selectedEmployee.status === 'on-leave' 
                    ? 'linear-gradient(90deg, #ff9800, #ffc107)' 
                    : 'linear-gradient(90deg, #f44336, #ef5350)',
                }
              }}>
                <Avatar
                  src={selectedEmployee.avatar}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: 4,
                    borderColor: 'background.paper',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
                    {selectedEmployee.name}
                  </Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                    {selectedEmployee.position}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                      color={getStatusColor(selectedEmployee.status)}
                      size="medium"
                      sx={{ 
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                      label={selectedEmployee.level.charAt(0).toUpperCase() + selectedEmployee.level.slice(1)}
                      variant="outlined"
                      size="medium"
                      sx={{ 
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Employee Information Grid */}
              <Grid container spacing={3} sx={{ alignItems: 'stretch', justifyContent: 'center' }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', marginLeft: '-45px' }}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Badge sx={{ color: 'primary.main', fontSize: 24 }} />
                      Basic Information
                    </Typography>
                    <Stack spacing={3} sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Department</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>{selectedEmployee.department}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Employment Type</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>{selectedEmployee.employmentType}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Join Date</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>
                          {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Email</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>{selectedEmployee.email}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', marginLeft: '-25px' }}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocalAtm sx={{ color: 'primary.main', fontSize: 24 }} />
                      Compensation
                    </Typography>
                    <Stack spacing={3} sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Salary</Typography>
                        <Typography variant="body1" fontWeight={600} color="primary.main" sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>
                          {formatZAR(selectedEmployee.salary)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Level</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>{selectedEmployee.level}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 32 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, flex: '0 0 auto' }}>Benefits</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textAlign: 'right', flex: '1 1 auto', ml: 2 }}>
                          {selectedEmployee.benefits.length > 0 ? selectedEmployee.benefits.join(', ') : 'None'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Leave Information */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginLeft: '-40px' }}>
                  <Paper sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                    width: '100%',
                    maxWidth: '800px'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <EventAvailable sx={{ color: 'primary.main', fontSize: 24 }} />
                      Leave Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          borderRadius: 3, 
                          bgcolor: 'primary.light',
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)'
                        }}>
                          <Typography variant="h3" color="primary.contrastText" fontWeight={700} sx={{ mb: 1 }}>
                            {calculateLeaveBalance(selectedEmployee.id, 'Annual Leave').remainingDays}
                          </Typography>
                          <Typography variant="body2" color="primary.contrastText" sx={{ fontWeight: 500 }}>
                            Annual Days Left
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          borderRadius: 3, 
                          bgcolor: 'warning.light',
                          boxShadow: '0 4px 16px rgba(255, 152, 0, 0.2)'
                        }}>
                          <Typography variant="h3" color="warning.contrastText" fontWeight={700} sx={{ mb: 1 }}>
                            {calculateLeaveBalance(selectedEmployee.id, 'Sick Leave').remainingDays}
                          </Typography>
                          <Typography variant="body2" color="warning.contrastText" sx={{ fontWeight: 500 }}>
                            Sick Days Left
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          borderRadius: 3, 
                          bgcolor: 'info.light',
                          boxShadow: '0 4px 16px rgba(33, 150, 243, 0.2)'
                        }}>
                          <Typography variant="h3" color="info.contrastText" fontWeight={700} sx={{ mb: 1 }}>
                            {calculateLeaveBalance(selectedEmployee.id, 'Personal Leave').remainingDays}
                          </Typography>
                          <Typography variant="body2" color="info.contrastText" sx={{ fontWeight: 500 }}>
                            Personal Days Left
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          borderRadius: 3, 
                          bgcolor: 'success.light',
                          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)'
                        }}>
                          <Typography variant="h3" color="success.contrastText" fontWeight={700} sx={{ mb: 1 }}>
                            {leaveRequests.filter(req => req.employeeName === selectedEmployee.name && req.status === 'pending').length}
                          </Typography>
                          <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 500 }}>
                            Pending Requests
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
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
              onClick={() => setOpenEmployeeDetails(false)}
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
            <Button
              variant="contained"
              size="large"
              startIcon={<TrendingUp />}
              onClick={() => {
                setOpenEmployeeDetails(false);
                handlePromoteEmployee(selectedEmployee!);
              }}
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
                }
              }}
            >
              Promote Employee
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Payroll Batch Processing Dialog */}
      <Dialog open={openPayrollBatch} onClose={() => setOpenPayrollBatch(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance />
            <Typography variant="h6">
              Payroll Batch Processing
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {currentPayrollBatch && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Batch Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Batch Name</Typography>
                    <Typography variant="body1">{currentPayrollBatch.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Period</Typography>
                    <Typography variant="body1">{currentPayrollBatch.period}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Payment Date</Typography>
                    <Typography variant="body1">{currentPayrollBatch.paymentDate}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1" fontWeight="bold">{formatZAR(currentPayrollBatch.totalAmount)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Employee Count</Typography>
                    <Typography variant="body1">{currentPayrollBatch.employeeCount}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {currentPayrollBatch.paymentMethod.replace('_', ' ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Payment Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={currentPayrollBatch.paymentMethod}
                        onChange={(e) => setCurrentPayrollBatch(prev => prev ? {
                          ...prev,
                          paymentMethod: e.target.value as any
                        } : null)}
                        label="Payment Method"
                      >
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="payment_gateway">Payment Gateway</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {currentPayrollBatch.paymentMethod === 'bank_transfer' && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Banking Institution</InputLabel>
                        <Select
                          value={currentPayrollBatch.bankingInstitution || ''}
                          onChange={(e) => setCurrentPayrollBatch(prev => prev ? {
                            ...prev,
                            bankingInstitution: e.target.value
                          } : null)}
                          label="Banking Institution"
                        >
                          {bankingInstitutions.filter(bank => bank.isActive).map(bank => (
                            <MenuItem key={bank.id} value={bank.id}>
                              {bank.name} ({bank.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {currentPayrollBatch.paymentMethod === 'payment_gateway' && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Gateway</InputLabel>
                        <Select
                          value={currentPayrollBatch.paymentGateway || ''}
                          onChange={(e) => setCurrentPayrollBatch(prev => prev ? {
                            ...prev,
                            paymentGateway: e.target.value
                          } : null)}
                          label="Payment Gateway"
                        >
                          {paymentGateways.filter(pg => pg.isActive).map(gateway => (
                            <MenuItem key={gateway.id} value={gateway.id}>
                              {gateway.name} ({gateway.processingFee}% fee)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Employee Payments ({currentPayrollBatch.employees.length} employees)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Salary</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Bonuses</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatZAR(currentPayrollBatch.totalAmount)}</TableCell>
                        <TableCell>Payment Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPayrollBatch.employees.map((employee) => (
                        <TableRow key={employee.employeeId}>
                          <TableCell>{employee.employeeName}</TableCell>
                          <TableCell>{formatZAR(employee.salary)}</TableCell>
                          <TableCell>{formatZAR(employee.deductions)}</TableCell>
                          <TableCell>{formatZAR(employee.bonuses)}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{formatZAR(employee.netAmount)}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {employee.paymentMethod.replace('_', ' ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayrollBatch(false)}>Cancel</Button>
          <Button 
            onClick={() => currentPayrollBatch && handleProcessPayrollBatch(currentPayrollBatch)} 
            variant="contained" 
            color="primary"
            disabled={!currentPayrollBatch}
          >
            Process Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banking Setup Dialog */}
      <Dialog open={openBankingSetup} onClose={() => setOpenBankingSetup(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance />
            <Typography variant="h6">
              Banking & Payment Setup
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ width: '100%' }}>
            <Tabs 
              value={bankingTabValue} 
              onChange={(_, newValue) => setBankingTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab 
                label="Banking Institutions" 
                icon={<AccountBalance />}
                iconPosition="start"
              />
              <Tab 
                label="Payment Gateways" 
                icon={<Payment />}
                iconPosition="start"
              />
            </Tabs>
            
            {bankingTabValue === 0 && (
              <Stack spacing={3}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Add banking institutions to enable direct bank transfers for payroll processing.
                  </Typography>
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Bank Name"
                      fullWidth
                      placeholder="e.g., First National Bank"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Bank Code"
                      fullWidth
                      placeholder="e.g., FNB"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Account Number"
                      fullWidth
                      placeholder="e.g., 1234567890"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select label="Account Type">
                        <MenuItem value="savings">Savings</MenuItem>
                        <MenuItem value="checking">Checking</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Routing Number"
                      fullWidth
                      placeholder="e.g., 021000021"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="SWIFT Code"
                      fullWidth
                      placeholder="e.g., FNBBUS33"
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
            
            {bankingTabValue === 1 && (
              <Stack spacing={3}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Integrate payment gateways to enable digital payments for payroll processing.
                  </Typography>
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gateway Type</InputLabel>
                      <Select label="Gateway Type">
                        {/* International Payment Gateways */}
                        <MenuItem value="paypal">PayPal</MenuItem>
                        <MenuItem value="stripe">Stripe</MenuItem>
                        <MenuItem value="payoneer">Payoneer</MenuItem>
                        <MenuItem value="wise">Wise</MenuItem>
                        <MenuItem value="revolut">Revolut</MenuItem>
                        
                        {/* South African Payment Gateways */}
                        <MenuItem value="payfast">PayFast</MenuItem>
                        <MenuItem value="peach_payments">Peach Payments</MenuItem>
                        <MenuItem value="paygate">PayGate</MenuItem>
                        <MenuItem value="ozow">Ozow</MenuItem>
                        <MenuItem value="yoco">Yoco</MenuItem>
                        <MenuItem value="snapcan">SnapScan</MenuItem>
                        <MenuItem value="zapper">Zapper</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="API Key"
                      fullWidth
                      placeholder="Enter your API key"
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Processing Fee (%)"
                      fullWidth
                      type="number"
                      placeholder="e.g., 2.9"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Processing Time"
                      fullWidth
                      placeholder="e.g., 1-2 business days"
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBankingSetup(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            {bankingTabValue === 0 ? 'Add Bank' : 'Add Gateway'}
          </Button>
        </DialogActions>
      </Dialog>



      {/* Payroll Settings Dialog */}
      <Dialog open={openPayrollSettings} onClose={() => setOpenPayrollSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            <Typography variant="h6">
              Payroll Settings
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Payment Method</InputLabel>
                  <Select
                    value={payrollSettings.defaultPaymentMethod}
                    onChange={(e) => setPayrollSettings(prev => ({
                      ...prev,
                      defaultPaymentMethod: e.target.value as any
                    }))}
                    label="Default Payment Method"
                  >
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="payment_gateway">Payment Gateway</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Banking Institution</InputLabel>
                  <Select
                    value={payrollSettings.defaultBankingInstitution || ''}
                    onChange={(e) => setPayrollSettings(prev => ({
                      ...prev,
                      defaultBankingInstitution: e.target.value
                    }))}
                    label="Default Banking Institution"
                  >
                    {bankingInstitutions.filter(bank => bank.isActive).map(bank => (
                      <MenuItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Payment Gateway</InputLabel>
                  <Select
                    value={payrollSettings.defaultPaymentGateway || ''}
                    onChange={(e) => setPayrollSettings(prev => ({
                      ...prev,
                      defaultPaymentGateway: e.target.value
                    }))}
                    label="Default Payment Gateway"
                  >
                    {paymentGateways.filter(pg => pg.isActive).map(gateway => (
                      <MenuItem key={gateway.id} value={gateway.id}>
                        {gateway.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6" gutterBottom>
              Processing Options
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.autoProcessPayroll}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        autoProcessPayroll: e.target.checked
                      }))}
                    />
                  }
                  label="Auto-process payroll"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.requireApproval}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        requireApproval: e.target.checked
                      }))}
                    />
                  }
                  label="Require approval"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.taxDeductions}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        taxDeductions: e.target.checked
                      }))}
                    />
                  }
                  label="Include tax deductions"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.benefitsDeductions}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        benefitsDeductions: e.target.checked
                      }))}
                    />
                  }
                  label="Include benefits deductions"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.overtimeCalculation}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        overtimeCalculation: e.target.checked
                      }))}
                    />
                  }
                  label="Include overtime calculation"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.groupPaymentsEnabled}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        groupPaymentsEnabled: e.target.checked
                      }))}
                    />
                  }
                  label="Enable group payments"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payrollSettings.aiOptimizationEnabled}
                      onChange={(e) => setPayrollSettings(prev => ({
                        ...prev,
                        aiOptimizationEnabled: e.target.checked
                      }))}
                    />
                  }
                  label="Enable AI optimization"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayrollSettings(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSavePayrollSettings}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payroll Software Integration Dialog */}
      <Dialog open={openPayrollIntegration} onClose={() => setOpenPayrollIntegration(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payroll Software Integration</DialogTitle>
        <DialogContent>
          <List>
            {payrollIntegrations.map((integration, idx) => (
              <ListItem key={idx} secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveIntegration(idx)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText primary={integration.name} secondary={`API Key: ${integration.apiKey}`} />
              </ListItem>
            ))}
          </List>
          <TextField
            label="Software Name (e.g., Sage, Xero)"
            fullWidth
            value={integrationName}
            onChange={e => setIntegrationName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="API Key"
            fullWidth
            value={integrationApiKey}
            onChange={e => setIntegrationApiKey(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayrollIntegration(false)}>Close</Button>
          <Button variant="contained" color="primary" onClick={handleAddIntegration} disabled={!integrationName || !integrationApiKey}>
            Add Integration
          </Button>
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
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
            <ListItem button onClick={handleAddLineItem}>
              <ListItemIcon><AddIcon /></ListItemIcon>
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
      {/* Group Payments Dialog */}
      <Dialog open={openGroupPayments} onClose={() => setOpenGroupPayments(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupWork />
            <Typography variant="h6">
              Group Payments Management
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                Group payments allow you to process multiple employees with similar salaries together, reducing transaction fees and processing time.
              </Typography>
            </Alert>
            
            {payrollGroups.length > 0 ? (
              <Grid container spacing={3}>
                {payrollGroups.map((group) => (
                  <Grid item xs={12} md={6} key={group.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6">{group.name}</Typography>
                          <Chip 
                            label={group.status}
                            color={group.status === 'completed' ? 'success' : group.status === 'failed' ? 'error' : 'default'}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {group.employees.length} employees • {formatZAR(group.totalAmount)}
                        </Typography>
                        
                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                          Payment Method: {group.paymentMethod.replace('_', ' ')}
                        </Typography>
                        
                        <Stack spacing={1}>
                          {group.employees.slice(0, 3).map((employee) => (
                            <Typography key={employee.employeeId} variant="body2">
                              {employee.employeeName} - {formatZAR(employee.netAmount)}
                            </Typography>
                          ))}
                          {group.employees.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{group.employees.length - 3} more employees
                            </Typography>
                          )}
                        </Stack>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleProcessGroupPayment(group)}
                            disabled={group.status === 'processing' || group.status === 'completed'}
                          >
                            {group.status === 'processing' ? 'Processing...' : 
                             group.status === 'completed' ? 'Completed' : 'Process Group'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <GroupWork sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No payment groups created
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a payroll batch first, then generate group payments
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupPayments(false)}>Close</Button>
          {currentPayrollBatch && (
            <Button 
              variant="contained" 
              onClick={generateAIGroupingRecommendations}
              startIcon={<AutoAwesome />}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? 'Generating...' : 'Get AI Recommendations'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={openAIInsights} onClose={() => setOpenAIInsights(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology />
            <Typography variant="h6">
              AI Payroll Insights & Optimization
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={generateAIInsights}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? 'Analyzing...' : 'Generate AI Insights'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<SmartToy />}
                onClick={generateAIGroupingRecommendations}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? 'Processing...' : 'AI Grouping Recommendations'}
              </Button>
            </Box>

            {/* AI Insights */}
            {aiInsights.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  AI Insights & Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {aiInsights.map((insight, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6">{insight.title}</Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip 
                                label={`${Math.round(insight.confidence * 100)}% confidence`}
                                size="small"
                                color="primary"
                              />
                              <Chip 
                                label={insight.impact}
                                size="small"
                                color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                              />
                            </Stack>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {insight.description}
                          </Typography>
                          
                          {insight.potentialSavings && (
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                              {insight.potentialSavings > 0 ? 'Potential Savings: ' : 'Additional Cost: '}
                              {formatZAR(Math.abs(insight.potentialSavings))}
                            </Typography>
                          )}
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Recommendations:
                          </Typography>
                          <List dense>
                            {insight.recommendations.map((recommendation, idx) => (
                              <ListItem key={idx} disablePadding>
                                <ListItemText 
                                  primary={recommendation}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                          
                          {insight.affectedEmployees.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Affects {insight.affectedEmployees.length} employee(s)
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* AI Grouping Recommendations */}
            {aiGroupingRecommendations.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  AI Grouping Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {aiGroupingRecommendations.map((recommendation, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6">{recommendation.groupName}</Typography>
                            <Chip 
                              label={`${Math.round(recommendation.efficiency * 100)}% efficiency`}
                              color="success"
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {recommendation.reasoning}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Estimated Savings: {formatZAR(recommendation.estimatedSavings)}
                          </Typography>
                          
                          <Typography variant="body2" gutterBottom>
                            Employees in this group: {recommendation.employees.length}
                          </Typography>
                          
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Functions />}
                            onClick={() => applyAIGroupingRecommendation(recommendation)}
                            sx={{ mt: 2 }}
                          >
                            Apply Recommendation
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {aiInsights.length === 0 && aiGroupingRecommendations.length === 0 && !isGeneratingAI && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Psychology sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No AI insights available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate AI insights to get intelligent recommendations for payroll optimization
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAIInsights(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
};

export default HR; 