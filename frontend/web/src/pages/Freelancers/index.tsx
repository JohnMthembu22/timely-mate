import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  Avatar,
  Rating,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Person,
  Work,
  AttachMoney,
  Payment,
  Add,
  Edit,
  Delete,
  MoreVert,
  FilterList,
  Search,
  Download,
  Send,
  Description,
  Assignment,
  EmojiEvents,
  CalendarToday,
  CheckCircle,
  AccessTime,
  Star,
  Upload,
  TableChart,
  Error,
  Warning,
  Info,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { tabA11yProps, tabPanelA11yProps } from '../../utils/tabA11y';
import FeatureGuard from '../../components/FeatureGuard';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useEmployees, Employee } from '../../contexts/EmployeeContext';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
// No longer need mock data utilities

// Define freelancer interface
interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  location: string;
  availability: string;
  joinDate: string;
  projectsCompleted: number;
  ongoingProjects: number;
  totalHours: number;
  status: string;
  email: string;
  phone: string;
  contract: {
    startDate: string;
    endDate: string;
    type: string;
    terms: string;
  };
}

// Define import freelancer interface
interface ImportFreelancer {
  name: string;
  title: string;
  skills: string;
  hourlyRate: number;
  email: string;
  phone: string;
  location: string;
  availability: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

// Define import state interface
interface ImportState {
  step: number;
  file: File | null;
  data: ImportFreelancer[];
  validationErrors: string[];
  isProcessing: boolean;
  previewData: ImportFreelancer[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  importProgress: number;
  batchSize: number;
  processedBatches: number;
  totalBatches: number;
  isImporting: boolean;
}

// Empty array for freelancers
const freelancers: Freelancer[] = [];

// Define project interface
interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  startDate: string;
  dueDate: string;
  deadline: string;
  budget: number;
  spent: number;
  freelancers: string[];
  progress: number;
}

// Empty array for projects
const projects: Project[] = [];

// Define payment interface
interface Payment {
  id: string;
  freelancer: string;
  amount: number;
  date: string;
  status: string;
  project: string;
  type: string;
  reference: string;
  invoice: string;
  hours: number;
}

// Empty array for payments
const payments: Payment[] = [];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const FREELANCER_TAB_PREFIX = 'freelancer';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...tabPanelA11yProps(index, FREELANCER_TAB_PREFIX)}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Freelancers: React.FC = () => {
  const theme = useTheme();
  const { formatAmount, getSymbol } = useCurrency();
  const { employees, addEmployee } = useEmployees();
  const { addNotification } = useNotifications();
  const [freelancersList, setFreelancersList] = useState<Freelancer[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContractDialogOpen, setEditContractDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [newContractDialogOpen, setNewContractDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // Advanced filter states
  const [advancedFilters, setAdvancedFilters] = useState({
    skills: [] as string[],
    hourlyRateMin: '',
    hourlyRateMax: '',
    ratingMin: 0,
    location: '',
    availability: 'all',
    joinDateFrom: '',
    joinDateTo: '',
    projectsCompletedMin: '',
    projectsCompletedMax: '',
  });
  
  // Import functionality states
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importState, setImportState] = useState<ImportState>({
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
  
  // New freelancer form state
  const [newFreelancer, setNewFreelancer] = useState({
    name: '',
    title: '',
    skills: '',
    hourlyRate: 0,
    email: '',
    phone: '',
    location: '',
    availability: 'Available',
    status: 'active' as 'active' | 'inactive',
  });

  // Edit freelancer form state
  const [editFreelancer, setEditFreelancer] = useState({
    name: '',
    title: '',
    skills: '',
    hourlyRate: 0,
    email: '',
    phone: '',
    location: '',
    availability: 'Available',
    status: 'active' as 'active' | 'inactive',
  });

  // Edit contract form state
  const [editContract, setEditContract] = useState({
    startDate: '',
    endDate: '',
    type: '',
    terms: '',
  });
  
  // Convert employees to freelancers
  useEffect(() => {
    console.log('Employees in Freelancers page:', employees);
    console.log('Employees with employmentType freelancer:', employees.filter(emp => emp.employmentType === 'freelancer'));
    
    const convertedFreelancers: Freelancer[] = employees
      .filter(employee => employee.employmentType === 'freelancer')
      .map((employee, index) => {
        // Convert benefits to skills array
        let skills: string[] = [];
        if (employee.benefits) {
          if (typeof employee.benefits === 'string') {
            // Split by commas and clean up
            skills = employee.benefits.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
          } else if (Array.isArray(employee.benefits)) {
            skills = employee.benefits;
          }
        }
        
        // If no skills from benefits, generate some based on position
        if (skills.length === 0) {
          const positionSkills: { [key: string]: string[] } = {
            'Developer': ['JavaScript', 'React', 'Node.js', 'TypeScript'],
            'Designer': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
            'Project Manager': ['Agile', 'Scrum', 'JIRA', 'Team Leadership'],
            'QA Engineer': ['Testing', 'Automation', 'Selenium', 'Quality Assurance'],
            'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
            'Business Analyst': ['Requirements Analysis', 'SQL', 'Process Modeling', 'Stakeholder Management'],
            'Product Owner': ['Product Strategy', 'User Stories', 'Backlog Management', 'Market Research'],
            'Scrum Master': ['Agile Coaching', 'Sprint Planning', 'Retrospectives', 'Team Facilitation']
          };
          
          skills = positionSkills[employee.position] || ['Problem Solving', 'Communication', 'Teamwork'];
        }

        return {
          id: employee.id,
          name: employee.name,
          avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
          title: employee.position,
          skills: skills,
          hourlyRate: Math.floor(employee.salary / 2080), // Convert annual salary to hourly rate
          rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
          location: 'Remote',
          availability: 'Available',
          joinDate: employee.joinDate,
          projectsCompleted: Math.floor(Math.random() * 20) + 5,
          ongoingProjects: Math.floor(Math.random() * 3) + 1,
          totalHours: Math.floor(Math.random() * 1000) + 500,
          status: employee.status,
          email: employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          contract: {
            startDate: employee.joinDate,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: 'Full-time',
            terms: 'Standard employment contract',
          },
        };
      });
    
    console.log('Converted freelancers:', convertedFreelancers);
    setFreelancersList(convertedFreelancers);
  }, [employees]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterStatus(event.target.value as string);
  };

  const handleAddFreelancer = (newFreelancer: any) => {
    // Logic to add a new freelancer
    setFreelancersList([...freelancersList, { ...newFreelancer, id: (freelancersList.length + 1).toString() }]);
    setAddDialogOpen(false);
  };

  const handleDeleteFreelancer = (id: string) => {
    setFreelancersList(freelancersList.filter(f => f.id !== id));
    setDeleteDialogOpen(false);
    setSelectedFreelancer(null);
  };

  const handleProjectDetailsOpen = (project: Project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
    setSelectedFreelancer(null);
    setSelectedProject(null);
  };

  const handleEditFreelancer = () => {
    if (selectedFreelancer) {
      setEditFreelancer({
        name: selectedFreelancer.name,
        title: selectedFreelancer.title,
        skills: selectedFreelancer.skills.join(', '),
        hourlyRate: selectedFreelancer.hourlyRate,
        email: selectedFreelancer.email,
        phone: selectedFreelancer.phone,
        location: selectedFreelancer.location,
        availability: selectedFreelancer.availability,
        status: selectedFreelancer.status as 'active' | 'inactive',
      });
      setDetailsDialogOpen(false);
      setEditDialogOpen(true);
    }
  };

  const handleEditFreelancerSubmit = () => {
    if (selectedFreelancer) {
      const skillsArray = editFreelancer.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
      
      const updatedFreelancer: Freelancer = {
        ...selectedFreelancer,
        name: editFreelancer.name,
        title: editFreelancer.title,
        skills: skillsArray,
        hourlyRate: editFreelancer.hourlyRate,
        email: editFreelancer.email,
        phone: editFreelancer.phone,
        location: editFreelancer.location,
        availability: editFreelancer.availability,
        status: editFreelancer.status,
      };

      setFreelancersList(prev => prev.map(f => f.id === selectedFreelancer.id ? updatedFreelancer : f));
      setEditDialogOpen(false);
      setSelectedFreelancer(null);
      
      addNotification(createNotification(
        'success',
        'Freelancer Updated',
        `${editFreelancer.name} has been successfully updated.`
      ));
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedFreelancer(null);
  };

  const handleEditContract = () => {
    if (selectedFreelancer) {
      setEditContract({
        startDate: selectedFreelancer.contract.startDate,
        endDate: selectedFreelancer.contract.endDate,
        type: selectedFreelancer.contract.type,
        terms: selectedFreelancer.contract.terms,
      });
      setEditContractDialogOpen(true);
    }
  };

  const handleEditContractSubmit = () => {
    if (selectedFreelancer) {
      const updatedFreelancer: Freelancer = {
        ...selectedFreelancer,
        contract: {
          startDate: editContract.startDate,
          endDate: editContract.endDate,
          type: editContract.type,
          terms: editContract.terms,
        },
      };

      setFreelancersList(prev => prev.map(f => f.id === selectedFreelancer.id ? updatedFreelancer : f));
      setEditContractDialogOpen(false);
      
      addNotification(createNotification(
        'success',
        'Contract Updated',
        `Contract for ${selectedFreelancer.name} has been successfully updated.`
      ));
    }
  };

  const handleEditContractDialogClose = () => {
    setEditContractDialogOpen(false);
  };

  // Import functionality handlers
  const handleImportClick = () => {
    setOpenImportDialog(true);
    setImportState(prev => ({ ...prev, step: 0 }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setImportState(prev => ({ 
      ...prev, 
      file, 
      isProcessing: true, 
      step: 1,
      data: [],
      validationErrors: [],
      previewData: []
    }));

    try {
      let data: ImportFreelancer[] = [];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = await readCSVFile(file);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        data = await readPDFFile(file);
      } else {
        data = await readExcelFile(file);
      }

      console.log('Processed data:', data);
      console.log('Total records found:', data.length);

      const validationErrors = validateImportData(data);
      
      console.log('Validation errors:', validationErrors);
      
      setImportState(prev => ({
        ...prev,
        data,
        validationErrors,
        isProcessing: false,
        step: validationErrors.length === 0 ? 2 : 1,
        totalPages: Math.ceil(data.length / prev.itemsPerPage),
        totalBatches: Math.ceil(data.length / prev.batchSize),
        processedBatches: 0,
        importProgress: 0
      }));

      updatePreviewData(data, 1);
    } catch (error) {
      console.error('Error processing file:', error);
      setImportState(prev => ({
        ...prev,
        isProcessing: false,
        validationErrors: [`Error processing file: ${error}`]
      }));
    }
  };

  const readExcelFile = (file: File): Promise<ImportFreelancer[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            reject(new Error('File must contain at least a header row and one data row'));
            return;
          }

          const headers = jsonData[0].map((header: any) => String(header).toLowerCase().trim());
          const rows = jsonData.slice(1);
          
          const mappedData: ImportFreelancer[] = rows
            .map((row, index) => {
              const rowData: any = {};
              headers.forEach((header, colIndex) => {
                rowData[header] = row[colIndex];
              });

              // Map headers to fields with flexible matching
              const name = rowData.name || rowData['full name'] || rowData['first name'] || rowData['last name'] || '';
              const title = rowData.title || rowData.position || rowData.role || rowData.job || '';
              const skills = rowData.skills || rowData.expertise || rowData.technologies || '';
              
              // Improved hourly rate parsing
              let hourlyRate = 0;
              const rateValue = rowData['hourly rate'] || rowData.rate || rowData.salary || rowData['hourlyrate'] || rowData['hourly_rate'] || '';
              if (rateValue !== '') {
                const parsed = parseFloat(String(rateValue).replace(/[^\d.-]/g, ''));
                hourlyRate = isNaN(parsed) ? 0 : parsed;
              }
              
              const email = rowData.email || rowData['email address'] || rowData['e-mail'] || '';
              const phone = rowData.phone || rowData.telephone || rowData.mobile || rowData['phone number'] || '';
              const location = rowData.location || rowData.city || rowData.country || 'Remote';
              const availability = rowData.availability || rowData.status || 'Available';
              const joinDate = rowData['join date'] || rowData['start date'] || rowData['contract start'] || new Date().toISOString().split('T')[0];
              const status = (rowData.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive';
              
              // Check employment type - only import freelancers
              const employmentType = (rowData['employment type'] || rowData['employmenttype'] || rowData['type'] || '').toLowerCase();
              if (employmentType && employmentType !== 'freelancer' && employmentType !== 'freelance') {
                return null; // Skip non-freelancer employees
              }

              return {
                name: String(name).trim(),
                title: String(title).trim(),
                skills: String(skills).trim(),
                hourlyRate: hourlyRate,
                email: String(email).trim(),
                phone: String(phone).trim(),
                location: String(location).trim(),
                availability: String(availability).trim(),
                joinDate: String(joinDate).trim(),
                status
              };
            })
            .filter((item): item is ImportFreelancer => item !== null); // Remove null items

          resolve(mappedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const readCSVFile = (file: File): Promise<ImportFreelancer[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV must contain at least a header row and one data row'));
            return;
          }

          const headers = lines[0].split(',').map(header => header.toLowerCase().trim().replace(/"/g, ''));
          const rows = lines.slice(1);
          
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

          const mappedData: ImportFreelancer[] = rows
            .map((row, index) => {
              const values = parseCSVLine(row);
              const rowData: any = {};
              headers.forEach((header, colIndex) => {
                rowData[header] = values[colIndex];
              });

              // Map headers to fields with flexible matching
              const name = rowData.name || rowData['full name'] || rowData['first name'] || rowData['last name'] || '';
              const title = rowData.title || rowData.position || rowData.role || rowData.job || '';
              const skills = rowData.skills || rowData.expertise || rowData.technologies || '';
              
              // Improved hourly rate parsing
              let hourlyRate = 0;
              const rateValue = rowData['hourly rate'] || rowData.rate || rowData.salary || rowData['hourlyrate'] || rowData['hourly_rate'] || '';
              if (rateValue !== '') {
                const parsed = parseFloat(String(rateValue).replace(/[^\d.-]/g, ''));
                hourlyRate = isNaN(parsed) ? 0 : parsed;
              }
              
              const email = rowData.email || rowData['email address'] || rowData['e-mail'] || '';
              const phone = rowData.phone || rowData.telephone || rowData.mobile || rowData['phone number'] || '';
              const location = rowData.location || rowData.city || rowData.country || 'Remote';
              const availability = rowData.availability || rowData.status || 'Available';
              const joinDate = rowData['join date'] || rowData['start date'] || rowData['contract start'] || new Date().toISOString().split('T')[0];
              const status = (rowData.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive';
              
              // Check employment type - only import freelancers
              const employmentType = (rowData['employment type'] || rowData['employmenttype'] || rowData['type'] || '').toLowerCase();
              if (employmentType && employmentType !== 'freelancer' && employmentType !== 'freelance') {
                return null; // Skip non-freelancer employees
              }

              return {
                name: String(name).trim(),
                title: String(title).trim(),
                skills: String(skills).trim(),
                hourlyRate: hourlyRate,
                email: String(email).trim(),
                phone: String(phone).trim(),
                location: String(location).trim(),
                availability: String(availability).trim(),
                joinDate: String(joinDate).trim(),
                status
              };
            })
            .filter((item): item is ImportFreelancer => item !== null); // Remove null items

          resolve(mappedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const readPDFFile = (file: File): Promise<ImportFreelancer[]> => {
    // Placeholder for PDF import - would need a PDF parsing library
    return new Promise((resolve) => {
      // For now, return empty array with a note that PDF import is not yet implemented
      resolve([]);
    });
  };

  const validateImportData = (data: ImportFreelancer[]): string[] => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No freelancer data found in the file. Please ensure the file contains freelancer records.');
      return errors;
    }

    data.forEach((freelancer, index) => {
      if (!freelancer.name || freelancer.name.trim() === '') {
        errors.push(`Row ${index + 2}: Name is required`);
      }
      if (!freelancer.title || freelancer.title.trim() === '') {
        errors.push(`Row ${index + 2}: Title/Position is required`);
      }
      if (freelancer.hourlyRate <= 0) {
        errors.push(`Row ${index + 2}: Hourly rate must be greater than 0 (found: ${freelancer.hourlyRate})`);
      }
      // Email is now optional - removed validation
    });

    return errors;
  };

  const updatePreviewData = (data: ImportFreelancer[], page: number) => {
    const startIndex = (page - 1) * importState.itemsPerPage;
    const endIndex = startIndex + importState.itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    
    setImportState(prev => ({
      ...prev,
      previewData: pageData,
      currentPage: page
    }));
  };

  const handlePageChange = (newPage: number) => {
    updatePreviewData(importState.data, newPage);
  };

  const handleImportFreelancers = async () => {
    setImportState(prev => ({ ...prev, isImporting: true }));
    
    const { data, batchSize } = importState;
    const totalBatches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batch = data.slice(startIndex, endIndex);
      
      // Convert import data to employee format and add to global state
      for (const freelancerData of batch) {
        const skillsArray = freelancerData.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
        
        const employeeData: Employee = {
          id: `freelancer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: freelancerData.name,
          position: freelancerData.title,
          department: 'Freelancers',
          email: freelancerData.email,
          salary: freelancerData.hourlyRate * 2080, // Convert hourly rate to annual salary
          level: 'mid',
          benefits: skillsArray,
          employmentType: 'freelancer',
          status: freelancerData.status,
          joinDate: freelancerData.joinDate,
          avatar: `https://i.pravatar.cc/150?u=${freelancerData.name}`,
        };
        
        addEmployee(employeeData);
      }
      
      // Update progress
      const progress = ((i + 1) / totalBatches) * 100;
      setImportState(prev => ({
        ...prev,
        processedBatches: i + 1,
        importProgress: progress
      }));
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setImportState(prev => ({ ...prev, isImporting: false, step: 3 }));
    setOpenImportDialog(false);
    
    // Send notification for successful import
    addNotification(createNotification.freelancer(
      'Freelancers Imported Successfully',
      `${data.length} freelancers have been imported from the file`
    ));
  };

  const downloadTemplate = (format: 'excel' | 'csv' = 'excel') => {
    const headers = ['Name', 'Title', 'Skills', 'Hourly Rate', 'Email', 'Phone', 'Location', 'Availability', 'Join Date', 'Status', 'Employment Type'];
    const sampleData = [
      ['John Smith', 'Frontend Developer', 'React, TypeScript, CSS', '75', 'john.smith@email.com', '+1-555-0123', 'Remote', 'Available', '2024-01-15', 'active', 'freelancer'],
      ['Sarah Johnson', 'UI/UX Designer', 'Figma, Adobe Creative Suite, Prototyping', '85', 'sarah.johnson@email.com', '+1-555-0124', 'New York', 'Part-time', '2024-02-01', 'active', 'freelancer'],
      ['Mike Chen', 'Backend Developer', 'Node.js, Python, PostgreSQL', '90', 'mike.chen@email.com', '+1-555-0125', 'San Francisco', 'Full-time', '2024-01-20', 'active', 'freelancer'],
    ];
    
    const data = [headers, ...sampleData];
    
    if (format === 'csv') {
      const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'freelancers_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Freelancers');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'freelancers_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleNewFreelancerSubmit = () => {
    const skillsArray = newFreelancer.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
    
    const employeeData: Employee = {
      id: `freelancer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newFreelancer.name,
      position: newFreelancer.title,
      department: 'Freelancers',
      email: newFreelancer.email,
      salary: newFreelancer.hourlyRate * 2080, // Convert hourly rate to annual salary
      level: 'mid',
      benefits: skillsArray,
      employmentType: 'freelancer',
      status: newFreelancer.status,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${newFreelancer.name}`,
    };
    
    addEmployee(employeeData);
    
    // Send notification
    addNotification(createNotification.freelancer(
      'New Freelancer Added',
      `${newFreelancer.name} has been added as a freelancer with ${newFreelancer.title} role`
    ));
    
    setAddDialogOpen(false);
    setNewFreelancer({
      name: '',
      title: '',
      skills: '',
      hourlyRate: 0,
      email: '',
      phone: '',
      location: '',
      availability: 'Available',
      status: 'active',
    });
  };

  const filteredFreelancers = freelancersList.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || freelancer.status === filterStatus;
    
    // Advanced filters
    const matchesSkills = advancedFilters.skills.length === 0 || 
                         advancedFilters.skills.some(skill => freelancer.skills.some(freelancerSkill => 
                           freelancerSkill.toLowerCase().includes(skill.toLowerCase())
                         ));
    
    const matchesHourlyRate = (!advancedFilters.hourlyRateMin || freelancer.hourlyRate >= Number(advancedFilters.hourlyRateMin)) &&
                             (!advancedFilters.hourlyRateMax || freelancer.hourlyRate <= Number(advancedFilters.hourlyRateMax));
    
    const matchesRating = freelancer.rating >= advancedFilters.ratingMin;
    
    const matchesLocation = !advancedFilters.location || 
                           freelancer.location.toLowerCase().includes(advancedFilters.location.toLowerCase());
    
    const matchesAvailability = advancedFilters.availability === 'all' || 
                               freelancer.availability.toLowerCase() === advancedFilters.availability.toLowerCase();
    
    const matchesProjectsCompleted = (!advancedFilters.projectsCompletedMin || freelancer.projectsCompleted >= Number(advancedFilters.projectsCompletedMin)) &&
                                    (!advancedFilters.projectsCompletedMax || freelancer.projectsCompleted <= Number(advancedFilters.projectsCompletedMax));
    
    const matchesJoinDate = (!advancedFilters.joinDateFrom || new Date(freelancer.joinDate) >= new Date(advancedFilters.joinDateFrom)) &&
                          (!advancedFilters.joinDateTo || new Date(freelancer.joinDate) <= new Date(advancedFilters.joinDateTo));
    
    return matchesSearch && matchesFilter && matchesSkills && matchesHourlyRate && 
           matchesRating && matchesLocation && matchesAvailability && 
           matchesProjectsCompleted && matchesJoinDate;
  });

  const getFreelancerProjects = (freelancerId: string) => {
    const filteredProjects = projectsList.filter(project => project.freelancers.includes(freelancerId));
    return filteredProjects;
  };

  const getFreelancerPayments = (freelancerId: string) => {
    const filteredPayments = paymentsList.filter(payment => payment.freelancer === freelancerId);
    return filteredPayments;
  };

  const handleDetailsOpen = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setDetailsDialogOpen(true);
  };

  const handleExportFreelancers = () => {
    const exportData = filteredFreelancers.map(freelancer => ({
      'Name': freelancer.name,
      'Title': freelancer.title,
      'Skills': freelancer.skills.join(', '),
      'Hourly Rate': freelancer.hourlyRate,
      'Rating': freelancer.rating,
      'Location': freelancer.location,
      'Availability': freelancer.availability,
      'Join Date': freelancer.joinDate,
      'Projects Completed': freelancer.projectsCompleted,
      'Ongoing Projects': freelancer.ongoingProjects,
      'Total Hours': freelancer.totalHours,
      'Status': freelancer.status,
      'Email': freelancer.email,
      'Phone': freelancer.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Freelancers');
    
    const fileName = `freelancers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    addNotification(createNotification({
      type: 'system',
      title: 'Export Successful',
      description: `Freelancer data exported successfully. File: ${fileName}`,
      time: new Date().toLocaleTimeString(),
    }));
  };

  const handleMoreFiltersOpen = () => {
    setMoreFiltersOpen(true);
  };

  const handleMoreFiltersClose = () => {
    setMoreFiltersOpen(false);
  };

  const handleAdvancedFilterChange = (field: string, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setAdvancedFilters({
      skills: [],
      hourlyRateMin: '',
      hourlyRateMax: '',
      ratingMin: 0,
      location: '',
      availability: 'all',
      joinDateFrom: '',
      joinDateTo: '',
      projectsCompletedMin: '',
      projectsCompletedMax: '',
    });
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="freelancers">
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Freelancer Management
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: '50px' }}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={handleImportClick}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'grey.300',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Import
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Add />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Add Freelancer
                </Button>
              </Stack>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage external contractors and freelancers
            </Typography>
          </Container>
        </Box>

        {/* Filters and Search */}
        <Container maxWidth="xl" sx={{ mt: -4, mb: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, title, or skills..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value as string)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      sx={{ borderRadius: 2 }}
                      onClick={handleMoreFiltersOpen}
                    >
                      More Filters
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{ borderRadius: 2 }}
                      onClick={handleExportFreelancers}
                    >
                      Export
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>

        {/* Freelancers List */}
        <Container maxWidth="xl" sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Freelancers ({filteredFreelancers.length})
          </Typography>
          <Grid container spacing={3}>
            {filteredFreelancers.map((freelancer) => (
              <Grid item xs={12} md={6} lg={4} key={freelancer.id}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    boxShadow: 2,
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => handleDetailsOpen(freelancer)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar 
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        sx={{ width: 64, height: 64 }}
                      />
                      <Chip 
                        label={freelancer.status === 'active' ? 'Active' : 'Inactive'} 
                        color={freelancer.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                      {freelancer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {freelancer.title}
                    </Typography>
                    <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Rating value={freelancer.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {freelancer.rating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <AttachMoney sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatAmount(freelancer.hourlyRate)}/hour
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {freelancer.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Projects
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {freelancer.projectsCompleted} completed, {freelancer.ongoingProjects} ongoing
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Total Hours
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {freelancer.totalHours}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Quick Actions */}
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => setNewContractDialogOpen(true)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">New Contract</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a new contract for a freelancer
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">New Project</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assign freelancers to a new project
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Send sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">Batch Invoices</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generate and send multiple invoices
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Stats */}
        <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
          <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
              Freelancer Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <EmojiEvents sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Typography variant="h4">
                        {freelancers.filter(f => f.status === 'active').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Freelancers
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Work sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Typography variant="h4">
                        {projects.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Projects
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Star sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Typography variant="h4">
                        {(freelancers.reduce((acc, f) => acc + f.rating, 0) / freelancers.length).toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Payment sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Typography variant="h4">
                        {formatAmount(payments.reduce((acc, p) => acc + p.amount, 0))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Payments this Month
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Freelancer Details Dialog */}
        <Dialog 
          open={detailsDialogOpen} 
          onClose={handleDetailsClose}
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
          {selectedFreelancer && (
            <>
              <DialogTitle sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <VideocamIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={selectedFreelancer.avatar} 
                        alt={selectedFreelancer.name}
                        sx={{ width: 60, height: 60, mr: 2, border: '2px solid rgba(255,255,255,0.3)' }}
                      />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {selectedFreelancer.name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          {selectedFreelancer.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip 
                    label={selectedFreelancer.status === 'active' ? 'Active' : 'Inactive'} 
                    color={selectedFreelancer.status === 'active' ? 'success' : 'default'}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="freelancer details tabs">
                      <Tab label="Overview" {...tabA11yProps(0, FREELANCER_TAB_PREFIX)} />
                      <Tab label="Projects" {...tabA11yProps(1, FREELANCER_TAB_PREFIX)} />
                      <Tab label="Payments" {...tabA11yProps(2, FREELANCER_TAB_PREFIX)} />
                      <Tab label="Contract" {...tabA11yProps(3, FREELANCER_TAB_PREFIX)} />
                    </Tabs>
                  </Box>
                  
                  {/* Overview Tab */}
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2"><strong>Email:</strong> {selectedFreelancer.email}</Typography>
                          <Typography variant="body2"><strong>Phone:</strong> {selectedFreelancer.phone}</Typography>
                          <Typography variant="body2"><strong>Location:</strong> {selectedFreelancer.location}</Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom>Skills</Typography>
                        <Box sx={{ mb: 2 }}>
                          {selectedFreelancer.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom>Performance</Typography>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={selectedFreelancer.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {selectedFreelancer.rating.toFixed(1)}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            <strong>Completed Projects:</strong> {selectedFreelancer.projectsCompleted}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Ongoing Projects:</strong> {selectedFreelancer.ongoingProjects}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total Hours:</strong> {selectedFreelancer.totalHours}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>Availability</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">{selectedFreelancer.availability}</Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom>Payment Information</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Hourly Rate:</strong> {formatAmount(selectedFreelancer.hourlyRate)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Join Date:</strong> {new Date(selectedFreelancer.joinDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom>Recent Activity</Typography>
                        <Box>
                          <List>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <CheckCircle color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Completed Website Homepage Design" 
                                secondary="2 days ago" 
                              />
                            </ListItem>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <AccessTime color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Submitted time report for Data Analysis project" 
                                secondary="5 days ago" 
                              />
                            </ListItem>
                          </List>
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Projects Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Deadline</TableCell>
                            <TableCell>Budget</TableCell>
                            <TableCell>Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFreelancerProjects(selectedFreelancer.id).map((project) => (
                            <TableRow key={project.id}>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>{project.client}</TableCell>
                              <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                              <TableCell>{formatAmount(project.budget)}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={project.progress} 
                                      sx={{ height: 8, borderRadius: 4 }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {project.progress}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Payments Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFreelancerPayments(selectedFreelancer.id).map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.invoice}</TableCell>
                              <TableCell>{payment.project}</TableCell>
                              <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                              <TableCell>{payment.hours}</TableCell>
                              <TableCell>{formatAmount(payment.amount)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={payment.status === 'paid' ? 'Paid' : 'Pending'} 
                                  color={payment.status === 'paid' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Contract Tab */}
                  <TabPanel value={tabValue} index={3}>
                    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Active Contract</Typography>
                        <Chip label="Current" color="success" size="small" />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">
                            <strong>Type:</strong> {selectedFreelancer.contract.type}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Start Date:</strong> {new Date(selectedFreelancer.contract.startDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>End Date:</strong> {new Date(selectedFreelancer.contract.endDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">
                            <strong>Payment Terms:</strong> {selectedFreelancer.contract.terms}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Hourly Rate:</strong> {formatAmount(selectedFreelancer.hourlyRate)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEditContract}
                      >
                        Edit Contract
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                      >
                        Download Contract
                      </Button>
                    </Box>
                  </TabPanel>
                </Box>
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
                    onClick={handleDetailsClose}
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
                    startIcon={<Edit />}
                    onClick={handleEditFreelancer}
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
                    Edit Freelancer
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add Freelancer Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
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
                <VideocamIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Add New Freelancer
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Expand your talent pool
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={newFreelancer.name}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Title/Position"
                value={newFreelancer.title}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                value={newFreelancer.skills}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, TypeScript, UI/UX Design"
              />
              <TextField
                fullWidth
                label="Hourly Rate"
                type="number"
                value={newFreelancer.hourlyRate}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                required
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>R</Typography>,
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newFreelancer.email}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., john.smith@email.com"
              />
              <TextField
                fullWidth
                label="Phone"
                value={newFreelancer.phone}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, phone: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Location"
                value={newFreelancer.location}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote, New York, London"
              />
              <TextField
                fullWidth
                label="Availability"
                value={newFreelancer.availability}
                onChange={(e) => setNewFreelancer(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., Available, Part-time, Full-time"
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newFreelancer.status}
                  label="Status"
                  onChange={(e) => setNewFreelancer(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                onClick={() => setAddDialogOpen(false)}
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
                onClick={handleNewFreelancerSubmit}
                disabled={!newFreelancer.name || !newFreelancer.title || !newFreelancer.hourlyRate}
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
                Add Freelancer
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Edit Freelancer Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose} 
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
                <VideocamIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Edit Freelancer
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Update freelancer information
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFreelancer.name}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Title/Position"
                value={editFreelancer.title}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                value={editFreelancer.skills}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, TypeScript, UI/UX Design"
              />
              <TextField
                fullWidth
                label="Hourly Rate"
                type="number"
                value={editFreelancer.hourlyRate}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                required
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>R</Typography>,
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFreelancer.email}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., john.smith@email.com"
              />
              <TextField
                fullWidth
                label="Phone"
                value={editFreelancer.phone}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., +27 12 345 6789"
              />
              <TextField
                fullWidth
                label="Location"
                value={editFreelancer.location}
                onChange={(e) => setEditFreelancer(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Cape Town, South Africa"
              />
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={editFreelancer.availability}
                  label="Availability"
                  onChange={(e) => setEditFreelancer(prev => ({ ...prev, availability: e.target.value }))}
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Busy">Busy</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFreelancer.status}
                  label="Status"
                  onChange={(e) => setEditFreelancer(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                onClick={handleEditDialogClose}
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
                onClick={handleEditFreelancerSubmit}
                disabled={!editFreelancer.name || !editFreelancer.title || !editFreelancer.hourlyRate}
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
                Update Freelancer
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Edit Contract Dialog */}
        <Dialog 
          open={editContractDialogOpen} 
          onClose={handleEditContractDialogClose} 
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
                <VideocamIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Edit Contract
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Update contract details
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={editContract.type}
                  label="Contract Type"
                  onChange={(e) => setEditContract(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Fixed Price">Fixed Price</MenuItem>
                  <MenuItem value="Hourly">Hourly</MenuItem>
                  <MenuItem value="Project Based">Project Based</MenuItem>
                  <MenuItem value="Retainer">Retainer</MenuItem>
                  <MenuItem value="Freelance">Freelance</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={editContract.startDate}
                onChange={(e) => setEditContract(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={editContract.endDate}
                onChange={(e) => setEditContract(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                fullWidth
                label="Contract Terms"
                multiline
                rows={4}
                value={editContract.terms}
                onChange={(e) => setEditContract(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Enter contract terms and conditions..."
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
                onClick={handleEditContractDialogClose}
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
                onClick={handleEditContractSubmit}
                disabled={!editContract.type || !editContract.startDate || !editContract.endDate}
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
                Update Contract
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Import Dialog */}
        <Dialog 
          open={openImportDialog} 
          onClose={() => setOpenImportDialog(false)} 
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
                  Import Freelancers
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Upload and process freelancer data
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stepper activeStep={importState.step} orientation="vertical" sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Upload File</StepLabel>
                <StepContent>
                  <Stack spacing={3}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Supported Formats:</strong> Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)
                        <br />
                        <strong>Required columns:</strong> Name, Title/Position, Hourly Rate
                        <br />
                        <strong>Optional columns:</strong> Email, Skills, Phone, Location, Availability, Join Date, Status, Employment Type
                        <br />
                        <strong>Important:</strong> Only records with Employment Type = "freelancer" or "freelance" will be imported. Other employment types will be filtered out.
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
                  </Stack>
                </StepContent>
              </Step>
              
              <Step>
                <StepLabel>Validate Data</StepLabel>
                <StepContent>
                  {importState.isProcessing ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Processing file...
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {importState.validationErrors.length > 0 ? (
                        <Alert severity="error">
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Validation Errors:</strong>
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {importState.validationErrors.map((error, index) => (
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
                      
                      {importState.previewData.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Data Preview ({importState.data.length} total freelancers)
                          </Typography>
                          
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              Showing page {importState.currentPage} of {importState.totalPages} 
                              ({importState.itemsPerPage} freelancers per page)
                            </Typography>
                          </Alert>
                          
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Title</TableCell>
                                  <TableCell>Skills</TableCell>
                                  <TableCell>Hourly Rate</TableCell>
                                  <TableCell>Email</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {importState.previewData.map((freelancer, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{freelancer.name}</TableCell>
                                    <TableCell>{freelancer.title}</TableCell>
                                    <TableCell>{freelancer.skills}</TableCell>
                                    <TableCell>{formatAmount(freelancer.hourlyRate)}</TableCell>
                                    <TableCell>{freelancer.email}</TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={freelancer.status} 
                                        size="small" 
                                        color={freelancer.status === 'active' ? 'success' : 'default'} 
                                        variant="outlined" 
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {importState.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                              <Pagination
                                count={importState.totalPages}
                                page={importState.currentPage}
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
                <StepLabel>Import Freelancers</StepLabel>
                <StepContent>
                  <Stack spacing={3}>
                    {importState.isImporting ? (
                      <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Importing in Progress:</strong> Processing {importState.data.length} freelancers in batches of {importState.batchSize}
                          </Typography>
                        </Alert>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              Progress: {importState.processedBatches} of {importState.totalBatches} batches
                            </Typography>
                            <Typography variant="body2">
                              {Math.round(importState.importProgress)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={importState.importProgress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <CircularProgress size={40} sx={{ mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Importing freelancers... Please don't close this window.
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Alert severity="info">
                          <Typography variant="body2">
                            <strong>Ready to Import:</strong> {importState.data.length} freelancers will be added to the system.
                          </Typography>
                        </Alert>
                        
                        <Alert severity="warning">
                          <Typography variant="body2">
                            <strong>Large Dataset:</strong> This will import {importState.data.length} freelancers in {importState.totalBatches} batches. 
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
                                  {importState.data.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Freelancers
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item>
                              <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                <Typography variant="h4" color="success.main">
                                  {importState.data.filter(f => f.status === 'active').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Active
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item>
                              <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                <Typography variant="h4" color="info.main">
                                  {importState.totalBatches}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Batches
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item>
                              <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                <Typography variant="h4" color="warning.main">
                                  {formatAmount(importState.data.reduce((sum, f) => sum + f.hourlyRate, 0))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Hourly Rate
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
                onClick={() => setOpenImportDialog(false)} 
                disabled={importState.isImporting}
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
              {importState.step === 2 && (
                <Button
                  variant="contained"
                  startIcon={importState.isImporting ? <CircularProgress size={20} /> : <Upload />}
                  onClick={handleImportFreelancers}
                  disabled={importState.isImporting || importState.validationErrors.length > 0}
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
                  {importState.isImporting
                    ? `Importing... (${importState.processedBatches}/${importState.totalBatches})` 
                    : `Import ${importState.data.length} Freelancers`
                  }
                </Button>
              )}
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
      </FeatureGuard>

      {/* More Filters Dialog */}
      <Dialog
        open={moreFiltersOpen}
        onClose={handleMoreFiltersClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Advanced Filters
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            sx={{ borderRadius: 2 }}
          >
            Clear All
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Skills Filter */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                placeholder="e.g., React, Node.js, Design"
                value={advancedFilters.skills.join(', ')}
                onChange={(e) => handleAdvancedFilterChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                helperText="Enter skills separated by commas"
              />
            </Grid>

            {/* Location Filter */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                placeholder="e.g., New York, Remote"
                value={advancedFilters.location}
                onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
              />
            </Grid>

            {/* Hourly Rate Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Hourly Rate Range
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min Rate"
                  type="number"
                  value={advancedFilters.hourlyRateMin}
                  onChange={(e) => handleAdvancedFilterChange('hourlyRateMin', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max Rate"
                  type="number"
                  value={advancedFilters.hourlyRateMax}
                  onChange={(e) => handleAdvancedFilterChange('hourlyRateMax', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Grid>

            {/* Rating Filter */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Minimum Rating
              </Typography>
              <Rating
                value={advancedFilters.ratingMin}
                onChange={(_, value) => handleAdvancedFilterChange('ratingMin', value || 0)}
                precision={0.5}
                size="large"
              />
            </Grid>

            {/* Availability Filter */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={advancedFilters.availability}
                  label="Availability"
                  onChange={(e) => handleAdvancedFilterChange('availability', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="busy">Busy</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Projects Completed Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Projects Completed Range
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Min Projects"
                  type="number"
                  value={advancedFilters.projectsCompletedMin}
                  onChange={(e) => handleAdvancedFilterChange('projectsCompletedMin', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max Projects"
                  type="number"
                  value={advancedFilters.projectsCompletedMax}
                  onChange={(e) => handleAdvancedFilterChange('projectsCompletedMax', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Grid>

            {/* Join Date Range */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Join Date Range
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="From Date"
                  type="date"
                  value={advancedFilters.joinDateFrom}
                  onChange={(e) => handleAdvancedFilterChange('joinDateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={advancedFilters.joinDateTo}
                  onChange={(e) => handleAdvancedFilterChange('joinDateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          gap: 1
        }}>
          <Button
            onClick={handleMoreFiltersClose}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMoreFiltersClose}
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Freelancers; 