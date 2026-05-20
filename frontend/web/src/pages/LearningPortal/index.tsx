import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Badge,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  School,
  PlayCircle,
  Assignment,
  Star,
  Timer,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  Timeline,
  Group,
  Construction,
  Code,
  Analytics,
  Description,
  VideoLibrary,
  MenuBook,
  VerifiedUser,
  TrendingUp,
  Lightbulb,
  Add,
  Upload,
  Download,
  Edit,
  Delete,
  FileUpload,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  EmojiEvents,
  Save,
  Cancel,
  CloudUpload,
  GetApp,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import FeatureGuard from '../../components/FeatureGuard';
import CourseView from './CourseView';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  image: string;
  instructor: string;
  enrolled: number;
  isSaved: boolean;
  category: string;
  price?: number;
  materials: CourseMaterial[];
  assignments: Assignment[];
  certificate?: Certificate;
  createdAt: string;
  updatedAt: string;
}

interface LearningMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Interactive';
  description: string;
  duration?: string;
  fileSize?: string;
  icon: React.ReactNode;
}

interface Certification {
  id: string;
  title: string;
  organization: string;
  level: string;
  duration: string;
  price: string;
  skills: string[];
}

interface CourseMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Audio' | 'Document' | 'Link';
  url: string;
  description: string;
  duration?: string;
  fileSize?: string;
  uploadDate: string;
  downloads: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'Quiz' | 'Project' | 'Essay' | 'Practical';
  totalPoints: number;
  dueDate: string;
  instructions: string;
  attachments: string[];
  submissions: AssignmentSubmission[];
  createdAt: string;
}

interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  attachments: string[];
  grade?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Late' | 'Missing';
}

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  completionDate: string;
  grade: string;
  credentialId: string;
  validUntil?: string;
  skills: string[];
  template: string;
  companyInfo: CompanyInfo;
  certificateType: 'Completion' | 'Achievement' | 'Proficiency' | 'Mastery';
  totalHours: number;
  certificateNumber: string;
  issuedDate: string;
  digitalSignature: string;
  verificationUrl: string;
}

interface CompanyInfo {
  name: string;
  logo: string;
  ceoName: string;
  ceoTitle: string;
  ceoSignature: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  registrationNumber: string;
  accreditation: string[];
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Project Management Fundamentals',
    description: 'Learn the essential principles and practices of effective project management.',
    duration: '8 hours',
    level: 'Beginner',
    progress: 75,
    image: '/api/placeholder/300/200',
    instructor: 'Sarah Johnson',
    enrolled: 1250,
    isSaved: true,
    category: 'Project Management',
    price: 299,
    materials: [
      { id: '1', title: 'Introduction to Project Management', type: 'Video', duration: '45 min', isCompleted: true },
      { id: '2', title: 'Project Planning Templates', type: 'PDF', fileSize: '2.1 MB', isCompleted: true },
      { id: '3', title: 'Risk Management Strategies', type: 'Video', duration: '30 min', isCompleted: false },
    ],
    assignments: [
      { id: '1', title: 'Create Project Charter', dueDate: '2024-01-15', status: 'completed', score: 95 },
      { id: '2', title: 'Risk Assessment Exercise', dueDate: '2024-01-22', status: 'pending', score: null },
    ],
    certificate: {
      id: '1',
      title: 'Project Management Fundamentals Certificate',
      issuedDate: '2024-01-10',
      expiryDate: '2025-01-10',
      registrationNumber: 'PMF-2024-001',
      accreditation: ['PMI', 'APM']
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Advanced Construction Management',
    description: 'Master advanced techniques for managing complex construction projects.',
    duration: '12 hours',
    level: 'Advanced',
    progress: 45,
    image: '/api/placeholder/300/200',
    instructor: 'Mike Chen',
    enrolled: 890,
    isSaved: false,
    category: 'Construction',
    price: 499,
    materials: [
      { id: '1', title: 'Construction Planning & Scheduling', type: 'Video', duration: '60 min', isCompleted: true },
      { id: '2', title: 'Safety Management Systems', type: 'PDF', fileSize: '3.2 MB', isCompleted: true },
      { id: '3', title: 'Cost Control Methods', type: 'Video', duration: '45 min', isCompleted: false },
      { id: '4', title: 'Quality Assurance Protocols', type: 'PDF', fileSize: '1.8 MB', isCompleted: false },
    ],
    assignments: [
      { id: '1', title: 'Construction Schedule Analysis', dueDate: '2024-01-20', status: 'completed', score: 88 },
      { id: '2', title: 'Safety Plan Development', dueDate: '2024-01-27', status: 'in-progress', score: null },
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: 'Team Leadership & Communication',
    description: 'Develop essential leadership skills and effective communication strategies.',
    duration: '6 hours',
    level: 'Intermediate',
    progress: 90,
    image: '/api/placeholder/300/200',
    instructor: 'Emma Wilson',
    enrolled: 2100,
    isSaved: true,
    category: 'Leadership',
    price: 199,
    materials: [
      { id: '1', title: 'Leadership Styles & Approaches', type: 'Video', duration: '40 min', isCompleted: true },
      { id: '2', title: 'Communication Best Practices', type: 'Video', duration: '35 min', isCompleted: true },
      { id: '3', title: 'Conflict Resolution Techniques', type: 'PDF', fileSize: '1.5 MB', isCompleted: true },
    ],
    assignments: [
      { id: '1', title: 'Leadership Assessment', dueDate: '2024-01-12', status: 'completed', score: 92 },
      { id: '2', title: 'Communication Plan', dueDate: '2024-01-19', status: 'completed', score: 89 },
    ],
    certificate: {
      id: '2',
      title: 'Team Leadership Certificate',
      issuedDate: '2024-01-18',
      expiryDate: '2025-01-18',
      registrationNumber: 'TLC-2024-002',
      accreditation: ['ILM', 'CMI']
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-19'
  },
  {
    id: '4',
    title: 'Digital Tools for Project Management',
    description: 'Master modern digital tools and software for efficient project management.',
    duration: '10 hours',
    level: 'Intermediate',
    progress: 30,
    image: '/api/placeholder/300/200',
    instructor: 'David Brown',
    enrolled: 1650,
    isSaved: false,
    category: 'Technology',
    price: 349,
    materials: [
      { id: '1', title: 'Project Management Software Overview', type: 'Video', duration: '50 min', isCompleted: true },
      { id: '2', title: 'Microsoft Project Tutorial', type: 'Video', duration: '45 min', isCompleted: false },
      { id: '3', title: 'Agile Tools & Methodologies', type: 'PDF', fileSize: '2.8 MB', isCompleted: false },
    ],
    assignments: [
      { id: '1', title: 'Software Comparison Report', dueDate: '2024-01-25', status: 'pending', score: null },
    ],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-20'
  },
  {
    id: '5',
    title: 'Financial Management for Projects',
    description: 'Learn to manage project budgets, costs, and financial reporting effectively.',
    duration: '7 hours',
    level: 'Intermediate',
    progress: 60,
    image: '/api/placeholder/300/200',
    instructor: 'Lisa Garcia',
    enrolled: 980,
    isSaved: true,
    category: 'Finance',
    price: 279,
    materials: [
      { id: '1', title: 'Budget Planning & Forecasting', type: 'Video', duration: '55 min', isCompleted: true },
      { id: '2', title: 'Cost Control Strategies', type: 'PDF', fileSize: '2.3 MB', isCompleted: true },
      { id: '3', title: 'Financial Reporting Standards', type: 'Video', duration: '40 min', isCompleted: false },
    ],
    assignments: [
      { id: '1', title: 'Budget Analysis Exercise', dueDate: '2024-01-18', status: 'completed', score: 91 },
      { id: '2', title: 'Financial Report Creation', dueDate: '2024-01-25', status: 'in-progress', score: null },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-22'
  },
  {
    id: '6',
    title: 'Safety Management in Construction',
    description: 'Comprehensive safety protocols and risk management for construction projects.',
    duration: '5 hours',
    level: 'Beginner',
    progress: 100,
    image: '/api/placeholder/300/200',
    instructor: 'Robert Taylor',
    enrolled: 3200,
    isSaved: true,
    category: 'Safety',
    price: 149,
    materials: [
      { id: '1', title: 'OSHA Safety Standards', type: 'Video', duration: '30 min', isCompleted: true },
      { id: '2', title: 'Risk Assessment Procedures', type: 'PDF', fileSize: '1.9 MB', isCompleted: true },
      { id: '3', title: 'Emergency Response Planning', type: 'Video', duration: '25 min', isCompleted: true },
    ],
    assignments: [
      { id: '1', title: 'Safety Inspection Checklist', dueDate: '2024-01-15', status: 'completed', score: 96 },
      { id: '2', title: 'Emergency Plan Development', dueDate: '2024-01-22', status: 'completed', score: 94 },
    ],
    certificate: {
      id: '3',
      title: 'Construction Safety Management Certificate',
      issuedDate: '2024-01-22',
      expiryDate: '2025-01-22',
      registrationNumber: 'CSM-2024-003',
      accreditation: ['OSHA', 'NEBOSH']
    },
    createdAt: '2024-01-14',
    updatedAt: '2024-01-22'
  }
];

const learningPaths = [
  {
    title: 'Project Manager Certification',
    description: 'Complete pathway to become a certified project manager',
    duration: '40 hours',
    courses: 8,
    completionRate: 65,
    icon: <Timeline />,
  },
  {
    title: 'Team Leader Training',
    description: 'Essential skills for leading and managing teams',
    duration: '25 hours',
    courses: 6,
    completionRate: 40,
    icon: <Group />,
  },
  {
    title: 'Construction Management',
    description: 'Specialized track for construction industry professionals',
    duration: '35 hours',
    courses: 7,
    completionRate: 20,
    icon: <Construction />,
  },
];

const learningMaterials: LearningMaterial[] = [
  {
    id: '1',
    title: 'Construction Project Management Guide',
    type: 'PDF',
    description: 'Comprehensive guide covering all aspects of construction project management.',
    fileSize: '2.5 MB',
    icon: <Description />,
  },
  {
    id: '2',
    title: 'Time Tracking Best Practices',
    type: 'Video',
    description: 'Video series on implementing effective time tracking methods.',
    duration: '45 min',
    icon: <VideoLibrary />,
  },
  {
    id: '3',
    title: 'Team Leadership Workshop',
    type: 'Interactive',
    description: 'Interactive workshop with real-world scenarios and exercises.',
    duration: '2 hours',
    icon: <MenuBook />,
  },
];

const certifications: Certification[] = [
  {
    id: '1',
    title: 'Certified Construction Project Manager',
    organization: 'Construction Management Institute',
    level: 'Professional',
    duration: '6 months',
    price: '$599',
    skills: ['Project Planning', 'Risk Management', 'Quality Control'],
  },
  {
    id: '2',
    title: 'Advanced Team Leadership',
    organization: 'Leadership Excellence Academy',
    level: 'Advanced',
    duration: '3 months',
    price: '$399',
    skills: ['Team Building', 'Conflict Resolution', 'Performance Management'],
  },
  {
    id: '3',
    title: 'Digital Construction Technologies',
    organization: 'Tech in Construction Association',
    level: 'Intermediate',
    duration: '4 months',
    price: '$499',
    skills: ['BIM', 'Digital Documentation', 'Site Technology'],
  },
];

const recommendedCourses: Course[] = [];

// Company Information for Certificate Generation
const companyInfo: CompanyInfo = {
  name: "Timely Mate Academy",
  logo: "/company-logo.png",
  ceoName: "John Anderson",
  ceoTitle: "Chief Executive Officer",
  ceoSignature: "/ceo-signature.png",
  address: "123 Business District, Professional Tower, Suite 500, Metropolitan City, MC 12345",
  website: "www.timelymate.com",
  phone: "+1 (555) 123-4567",
  email: "academy@timelymate.com",
  registrationNumber: "REG-TMA-2024-001",
  accreditation: [
    "International Association for Continuing Education and Training (IACET)",
    "Project Management Institute (PMI) Registered Education Provider",
    "Society for Human Resource Management (SHRM) Preferred Provider"
  ]
};

// Certificate Templates
const certificateTemplates = {
  professional: {
    name: "Professional Certificate",
    backgroundColor: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    borderColor: "#d4af37",
    fontFamily: "Georgia, serif",
    layout: "formal"
  },
  modern: {
    name: "Modern Achievement",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderColor: "#4a90e2",
    fontFamily: "Arial, sans-serif",
    layout: "contemporary"
  },
  classic: {
    name: "Classic Completion",
    backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    borderColor: "#8b4513",
    fontFamily: "Times New Roman, serif",
    layout: "traditional"
  }
};

const LearningPortal: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Course Management
  const [coursesData, setCoursesData] = useState<Course[]>(courses);
  const [createCourseDialogOpen, setCreateCourseDialogOpen] = useState(false);
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Material Management
  const [materialsData, setMaterialsData] = useState<CourseMaterial[]>([]);
  const [addMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Assignment Management
  const [assignmentsData, setAssignmentsData] = useState<Assignment[]>([]);
  const [createAssignmentDialogOpen, setCreateAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Certificate Management
  const [certificatesData, setCertificatesData] = useState<Certificate[]>([]);
  const [generateCertificateDialogOpen, setGenerateCertificateDialogOpen] = useState(false);
  
  // UI State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleSavedCourse = (courseId: string) => {
    setSavedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Handler functions
  const handleCreateCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: 'New Course',
      description: 'Course description',
      duration: '4 hours',
      level: 'Beginner',
      progress: 0,
      image: '',
      instructor: 'Current User',
      enrolled: 0,
      isSaved: false,
      category: 'General',
      materials: [],
      assignments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCoursesData([...coursesData, newCourse]);
    setCreateCourseDialogOpen(false);
    setSnackbarMessage('Course created successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleAddMaterial = () => {
    const newMaterial: CourseMaterial = {
      id: Date.now().toString(),
      title: 'New Material',
      type: 'PDF',
      url: '',
      description: 'Material description',
      uploadDate: new Date().toLocaleDateString(),
      downloads: 0,
    };
    setMaterialsData([...materialsData, newMaterial]);
    setAddMaterialDialogOpen(false);
    setSnackbarMessage('Material uploaded successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCreateAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: 'New Assignment',
      description: 'Assignment description',
      type: 'Quiz',
      totalPoints: 100,
      dueDate: new Date().toISOString(),
      instructions: 'Assignment instructions',
      attachments: [],
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    setAssignmentsData([...assignmentsData, newAssignment]);
    setCreateAssignmentDialogOpen(false);
    setSnackbarMessage('Assignment created successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleGenerateCertificate = (certificateData?: any) => {
    const currentDate = new Date();
    const certificateNumber = `TMA-${currentDate.getFullYear()}-${String(Date.now()).slice(-6)}`;
    const credentialId = `CRED-${Date.now()}`;
    
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      courseId: certificateData?.courseId || '1',
      courseName: certificateData?.courseName || 'Sample Course',
      studentName: certificateData?.studentName || 'John Doe',
      instructorName: certificateData?.instructorName || 'Jane Smith',
      completionDate: certificateData?.completionDate || currentDate.toLocaleDateString(),
      grade: certificateData?.grade || 'A',
      credentialId,
      skills: certificateData?.skills || ['Project Management', 'Time Tracking', 'Team Leadership'],
      template: certificateData?.template || 'professional',
      companyInfo,
      certificateType: certificateData?.certificateType || 'Completion',
      totalHours: certificateData?.totalHours || 40,
      certificateNumber,
      issuedDate: currentDate.toLocaleDateString(),
      digitalSignature: `DS-${Date.now()}`,
      verificationUrl: `https://timelymate.com/verify/${credentialId}`,
      validUntil: new Date(currentDate.getTime() + (365 * 24 * 60 * 60 * 1000)).toLocaleDateString(), // Valid for 1 year
    };
    
    setCertificatesData([...certificatesData, newCertificate]);
    setGenerateCertificateDialogOpen(false);
    setSnackbarMessage('Professional certificate generated successfully with company branding!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleExportCertificate = (certificate: Certificate) => {
    // Generate professional certificate content
    const certificateHTML = generateCertificateHTML(certificate);
    
    // Create a new window for certificate preview
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      
      // Auto-trigger print dialog after content loads
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
    
    setSnackbarMessage('Professional certificate generated and ready for download!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const generateCertificateHTML = (certificate: Certificate) => {
    const template = certificateTemplates[certificate.template as keyof typeof certificateTemplates] || certificateTemplates.professional;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of ${certificate.certificateType} - ${certificate.studentName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 40px;
            font-family: ${template.fontFamily};
            background: ${template.backgroundColor};
            color: #333;
            height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          
          .certificate-container {
            background: white;
            padding: 60px;
            border: 8px solid ${template.borderColor};
            border-radius: 20px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            position: relative;
          }
          
          .certificate-header {
            margin-bottom: 30px;
          }
          
          .company-logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            background: #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: ${template.borderColor};
            font-weight: bold;
          }
          
          .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: ${template.borderColor};
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          
          .certificate-subtitle {
            font-size: 24px;
            color: #666;
            margin: 10px 0 30px;
          }
          
          .student-name {
            font-size: 42px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0;
            text-decoration: underline;
            text-decoration-color: ${template.borderColor};
          }
          
          .course-info {
            font-size: 20px;
            margin: 20px 0;
            line-height: 1.6;
          }
          
          .completion-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
            text-align: left;
          }
          
          .detail-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid ${template.borderColor};
          }
          
          .detail-label {
            font-weight: bold;
            color: #2c3e50;
          }
          
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 50px;
            text-align: center;
          }
          
          .signature-block {
            padding-top: 40px;
            border-top: 2px solid #333;
          }
          
          .signature-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 5px;
          }
          
          .signature-title {
            color: #666;
            font-size: 14px;
          }
          
          .certificate-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          
          .skills-section {
            margin: 20px 0;
            text-align: center;
          }
          
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
          }
          
          .skill-tag {
            background: ${template.borderColor};
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
          }
          
          .watermark {
            position: absolute;
            top: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 120px;
            color: ${template.borderColor};
            transform: rotate(-45deg);
            pointer-events: none;
          }
          
          .verification-info {
            position: absolute;
            bottom: 10px;
            right: 20px;
            font-size: 10px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="watermark">★</div>
          
          <div class="certificate-header">
            <div class="company-logo">TM</div>
            <h1 style="margin: 0; font-size: 28px; color: ${template.borderColor};">${certificate.companyInfo.name}</h1>
            <p style="margin: 5px 0; color: #666;">${certificate.companyInfo.website} | ${certificate.companyInfo.email}</p>
          </div>
          
          <h2 class="certificate-title">Certificate of ${certificate.certificateType}</h2>
          <p class="certificate-subtitle">This is to certify that</p>
          
          <h3 class="student-name">${certificate.studentName}</h3>
          
          <div class="course-info">
            <p>has successfully completed the course</p>
            <h4 style="font-size: 28px; color: ${template.borderColor}; margin: 15px 0;">${certificate.courseName}</h4>
            <p>with a grade of <strong>${certificate.grade}</strong></p>
          </div>
          
          <div class="completion-details">
            <div class="detail-item">
              <div class="detail-label">Course Duration:</div>
              <div>${certificate.totalHours} hours</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Completion Date:</div>
              <div>${certificate.completionDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Certificate Number:</div>
              <div>${certificate.certificateNumber}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Credential ID:</div>
              <div>${certificate.credentialId}</div>
            </div>
          </div>
          
          <div class="skills-section">
            <p><strong>Skills Acquired:</strong></p>
            <div class="skills-list">
              ${certificate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-name">${certificate.instructorName}</div>
              <div class="signature-title">Course Instructor</div>
            </div>
            <div class="signature-block">
              <div class="signature-name">${certificate.companyInfo.ceoName}</div>
              <div class="signature-title">${certificate.companyInfo.ceoTitle}</div>
              <div class="signature-title">${certificate.companyInfo.name}</div>
            </div>
          </div>
          
          <div class="certificate-footer">
            <p><strong>Accredited by:</strong> ${certificate.companyInfo.accreditation.join(' | ')}</p>
            <p>${certificate.companyInfo.address}</p>
            <p>Valid until: ${certificate.validUntil} | Verify at: ${certificate.verificationUrl}</p>
            <p>Digital Signature: ${certificate.digitalSignature} | Registration: ${certificate.companyInfo.registrationNumber}</p>
          </div>
          
          <div class="verification-info">
            Issued: ${certificate.issuedDate}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (selectedCourseId) {
    return (
      <CourseView
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  return (
    <DashboardLayout>
      <FeatureGuard feature="learningPortal">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #9c27b0 100%)',
            color: 'white',
            pt: 4,
            pb: 6,
            px: 3,
            mb: 4,
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 500, mb: 1 }}>
              Learning Portal
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Enhance your skills with our comprehensive learning resources
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                      12
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Courses in Progress
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                      8
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Completed Courses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Star sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                      45
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Achievements Earned
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Timer sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                      86h
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Learning Hours
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
              <Tab label="Featured Courses" />
              <Tab label="Learning Paths" />
              <Tab label="Recommended" />
              <Tab label="Materials" />
              <Tab label="Certifications" />
              <Tab label="My Progress" />
            </Tabs>

            {currentTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Featured Courses
                </Typography>
                <Grid container spacing={3}>
                  {coursesData.map((course) => (
                    <Grid item xs={12} md={4} key={course.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 140,
                            bgcolor: 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <School sx={{ fontSize: 60, color: 'white' }} />
                        </CardMedia>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {course.title}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleSavedCourse(course.id)}
                            >
                              {savedCourses.includes(course.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip size="small" label={course.level} color="primary" />
                            <Chip size="small" label={course.duration} />
                          </Stack>
                          {course.progress > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={course.progress} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {course.progress}% Complete
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {course.enrolled} enrolled
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={() => setSelectedCourseId(course.id)}
                                startIcon={course.progress > 0 ? <PlayCircle /> : <School />}
                              >
                                {course.progress > 0 ? 'Continue' : 'Start Learning'}
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {learningPaths.map((path, index) => (
                    <Grid item xs={12} key={index}>
                      <Card>
                        <CardContent>
                          <Grid container spacing={3} alignItems="center">
                            <Grid item>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: 'primary.main', 
                                borderRadius: 2,
                                color: 'white',
                              }}>
                                {path.icon}
                              </Box>
                            </Grid>
                            <Grid item xs>
                              <Typography variant="h6" gutterBottom>
                                {path.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {path.description}
                              </Typography>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Chip 
                                  size="small" 
                                  icon={<Timer />} 
                                  label={path.duration}
                                />
                                <Chip 
                                  size="small" 
                                  icon={<School />} 
                                  label={`${path.courses} Courses`}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={path.completionRate} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {path.completionRate}% Complete
                                </Typography>
                              </Stack>
                            </Grid>
                            <Grid item>
                              <Button 
                                variant="contained" 
                                startIcon={<PlayCircle />}
                              >
                                Continue
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {currentTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TrendingUp sx={{ mr: 1 }} /> Recommended for You
                </Typography>
                <Grid container spacing={3}>
                  {recommendedCourses.map((course) => (
                    <Grid item xs={12} md={4} key={course.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 140,
                            bgcolor: 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <School sx={{ fontSize: 60, color: 'white' }} />
                        </CardMedia>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {course.title}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleSavedCourse(course.id)}
                            >
                              {savedCourses.includes(course.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip size="small" label={course.level} color="primary" />
                            <Chip size="small" label={course.duration} />
                          </Stack>
                          {course.progress > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={course.progress} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {course.progress}% Complete
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {course.enrolled} enrolled
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={() => setSelectedCourseId(course.id)}
                                startIcon={<PlayCircle />}
                              >
                                Start Learning
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Materials Tab */}
            {currentTab === 3 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBook sx={{ mr: 1 }} /> Course Materials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddMaterialDialogOpen(true)}
                  >
                    Add Material
                  </Button>
                </Box>
                
                {materialsData.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <MenuBook sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No materials uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Start by uploading your first course material
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => setAddMaterialDialogOpen(true)}
                    >
                      Upload Material
                    </Button>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {materialsData.map((material) => (
                      <Grid item xs={12} md={6} lg={4} key={material.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {material.type === 'PDF' && <PictureAsPdf sx={{ mr: 1, color: 'error.main' }} />}
                              {material.type === 'Video' && <VideoFile sx={{ mr: 1, color: 'primary.main' }} />}
                              {material.type === 'Audio' && <AudioFile sx={{ mr: 1, color: 'success.main' }} />}
                              {material.type === 'Document' && <InsertDriveFile sx={{ mr: 1, color: 'info.main' }} />}
                              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                {material.title}
                              </Typography>
                              <IconButton size="small">
                                <Download />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {material.description}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip size="small" label={material.type} />
                              {material.fileSize && <Chip size="small" label={material.fileSize} />}
                              {material.duration && <Chip size="small" label={material.duration} />}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {material.downloads} downloads • Uploaded {material.uploadDate}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Certifications Tab */}
            {currentTab === 4 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmojiEvents sx={{ mr: 1 }} /> Certificates
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setGenerateCertificateDialogOpen(true)}
                  >
                    Generate Certificate
                  </Button>
                </Box>
                
                {certificatesData.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <EmojiEvents sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No certificates earned yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Complete courses to earn certificates
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {certificatesData.map((certificate) => (
                      <Grid item xs={12} md={6} key={certificate.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                {certificate.courseName}
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                onClick={() => handleExportCertificate(certificate)}
                              >
                                Export
                              </Button>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              Issued to: {certificate.studentName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              Instructor: {certificate.instructorName}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip size="small" label={`Grade: ${certificate.grade}`} color="success" />
                              <Chip size="small" label={certificate.completionDate} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Credential ID: {certificate.credentialId}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* My Progress Tab */}
            {currentTab === 5 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Analytics sx={{ mr: 1 }} /> My Learning Progress
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Course Progress
                        </Typography>
                        {coursesData.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No courses in progress
                          </Typography>
                        ) : (
                          coursesData.map((course) => (
                            <Box key={course.id} sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">{course.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {course.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={course.progress} 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Achievements
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Star sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary="First Course Completed"
                              secondary="Complete your first course"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <EmojiEvents sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Certificate Earned"
                              secondary="Earn your first certificate"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          {/* Floating Action Button for Quick Actions */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setCreateCourseDialogOpen(true)}
          >
            <Add />
          </Fab>

          {/* Create Course Dialog */}
          <Dialog 
            open={createCourseDialogOpen} 
            onClose={() => setCreateCourseDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <School sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Create New Course
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Course Title"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Level</InputLabel>
                    <Select
                      label="Level"
                      defaultValue=""
                    >
                      <MenuItem value="Beginner">Beginner</MenuItem>
                      <MenuItem value="Intermediate">Intermediate</MenuItem>
                      <MenuItem value="Advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    variant="outlined"
                    placeholder="e.g., 4 hours"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price (optional)"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 4, 
              pt: 2,
              background: 'transparent',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              gap: 2,
            }}>
              <Button 
                onClick={() => setCreateCourseDialogOpen(false)}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCreateCourse}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  }
                }}
              >
                Create Course
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Material Dialog */}
          <Dialog 
            open={addMaterialDialogOpen} 
            onClose={() => setAddMaterialDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Course Material</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Material Title"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      label="Material Type"
                      defaultValue=""
                    >
                      <MenuItem value="PDF">PDF Document</MenuItem>
                      <MenuItem value="Video">Video</MenuItem>
                      <MenuItem value="Audio">Audio</MenuItem>
                      <MenuItem value="Document">Document</MenuItem>
                      <MenuItem value="Link">External Link</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      border: '2px dashed #ccc',
                      cursor: 'pointer'
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Drag and drop files here or click to browse
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: PDF, MP4, MP3, DOC, PPT
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddMaterialDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddMaterial}
              >
                Upload Material
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create Assignment Dialog */}
          <Dialog 
            open={createAssignmentDialogOpen} 
            onClose={() => setCreateAssignmentDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Assignment Title"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assignment Type</InputLabel>
                    <Select
                      label="Assignment Type"
                      defaultValue=""
                    >
                      <MenuItem value="Quiz">Quiz</MenuItem>
                      <MenuItem value="Project">Project</MenuItem>
                      <MenuItem value="Essay">Essay</MenuItem>
                      <MenuItem value="Practical">Practical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Points"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="datetime-local"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateAssignmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCreateAssignment}
              >
                Create Assignment
              </Button>
            </DialogActions>
          </Dialog>

          {/* Generate Certificate Dialog */}
          <Dialog 
            open={generateCertificateDialogOpen} 
            onClose={() => setGenerateCertificateDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <EmojiEvents />
                Generate Professional Certificate
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Student Name"
                    fullWidth
                    margin="normal"
                    defaultValue="John Doe"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select Course</InputLabel>
                    <Select defaultValue="" label="Select Course">
                      {coursesData.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Instructor Name"
                    fullWidth
                    margin="normal"
                    defaultValue="Dr. Sarah Wilson"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Grade</InputLabel>
                    <Select defaultValue="A" label="Grade">
                      <MenuItem value="A+">A+ (95-100%)</MenuItem>
                      <MenuItem value="A">A (90-94%)</MenuItem>
                      <MenuItem value="B+">B+ (85-89%)</MenuItem>
                      <MenuItem value="B">B (80-84%)</MenuItem>
                      <MenuItem value="C+">C+ (75-79%)</MenuItem>
                      <MenuItem value="C">C (70-74%)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Certificate Type</InputLabel>
                    <Select defaultValue="Completion" label="Certificate Type">
                      <MenuItem value="Completion">Certificate of Completion</MenuItem>
                      <MenuItem value="Achievement">Certificate of Achievement</MenuItem>
                      <MenuItem value="Proficiency">Certificate of Proficiency</MenuItem>
                      <MenuItem value="Mastery">Certificate of Mastery</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Course Hours"
                    type="number"
                    fullWidth
                    margin="normal"
                    defaultValue={40}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Certificate Template</InputLabel>
                    <Select defaultValue="professional" label="Certificate Template">
                      <MenuItem value="professional">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box width={20} height={20} bgcolor="#d4af37" borderRadius="50%" />
                          Professional Certificate (Gold Border)
                        </Box>
                      </MenuItem>
                      <MenuItem value="modern">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box width={20} height={20} bgcolor="#4a90e2" borderRadius="50%" />
                          Modern Achievement (Blue Theme)
                        </Box>
                      </MenuItem>
                      <MenuItem value="classic">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box width={20} height={20} bgcolor="#8b4513" borderRadius="50%" />
                          Classic Completion (Traditional Style)
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Skills Acquired (comma-separated)"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    defaultValue="Project Management, Time Tracking, Team Leadership, Risk Assessment, Strategic Planning"
                  />
                </Grid>
              </Grid>
              
              <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                <Typography variant="h6" gutterBottom color="primary">
                  🏢 Company Information Included:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Company:</strong> {companyInfo.name}</Typography>
                    <Typography variant="body2"><strong>CEO:</strong> {companyInfo.ceoName}</Typography>
                    <Typography variant="body2"><strong>Title:</strong> {companyInfo.ceoTitle}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Website:</strong> {companyInfo.website}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {companyInfo.email}</Typography>
                    <Typography variant="body2"><strong>Registration:</strong> {companyInfo.registrationNumber}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" mt={1}>
                  <strong>Accreditations:</strong> {companyInfo.accreditation.slice(0, 2).join(', ')} + {companyInfo.accreditation.length - 2} more
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGenerateCertificateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateCertificate} variant="contained" startIcon={<EmojiEvents />}>
                Generate Professional Certificate
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default LearningPortal; 