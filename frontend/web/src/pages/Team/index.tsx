import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Email,
  LinkedIn,
  GitHub,
  Add,
  Edit,
  Message,
  Schedule,
  WorkOutline,
  TrendingUp,
  Groups,
  Group,
  CompareArrows,
  Warning,
  Assessment,
  Timeline,
  BarChart,
  PieChart,
  Wifi,
  WifiOff,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import TeamMemberStatus from '../../components/TeamMemberStatus';
import FeatureGuard from '../../components/FeatureGuard';
import { UserStatus } from '../../contexts/UserStatusContext';
import { useEmployees, Employee } from '../../contexts/EmployeeContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  linkedIn?: string;
  github?: string;
  skills: string[];
  projects: number;
  tasksCompleted: number;
  activeProjects: string[];
  availability: number;
  workload: number;
  overtime: number;
  performance: number;
  hoursWorked: number;
  leaveTaken: number;
  isOnline: boolean;
  status: UserStatus;
  lastActive: string;
  workLocation: 'office' | 'remote' | 'hybrid';
  yearStats: {
    projects: number;
    tasksCompleted: number;
    overtime: number;
    performance: number;
    hoursWorked: number;
    leaveTaken: number;
  };
}

interface YearlyStats {
  year: number;
  totalProjects: number;
  completedTasks: number;
  averageWorkload: number;
  overworkedMembers: number;
  teamPerformance: number;
  newHires: number;
  departures: number;
  totalHoursWorked: number;
  totalLeaveTaken: number;
}

const initialTeamMembers: TeamMember[] = [];

const employeeStartYears: any[] = [];

const workLifeBalanceRecommendations: any[] = [];

const yearlyStats: YearlyStats[] = [];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Team: React.FC = () => {
  const { employees, getEmployeesByDepartment } = useEmployees();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberDialog, setNewMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberDetailsDialog, setMemberDetailsDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [analyticsTab, setAnalyticsTab] = useState(0);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [workLocationFilter, setWorkLocationFilter] = useState<'all' | 'office' | 'remote' | 'hybrid'>('all');
  const [selectedMemberForMessage, setSelectedMemberForMessage] = useState<TeamMember | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState<boolean>(false);
  const [selectedMemberForRecommendations, setSelectedMemberForRecommendations] = useState<TeamMember | null>(null);
  
  // Form state for new member
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    role: '',
    email: '',
    skills: ''
  });

  // Convert employees to team members
  useEffect(() => {
    const convertedTeamMembers: TeamMember[] = employees
      .filter(employee => employee.employmentType === 'permanent' || employee.employmentType === 'contract')
      .map((employee, index) => ({
        id: employee.id,
        name: employee.name,
        role: employee.position,
        avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
        email: employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        linkedIn: `https://linkedin.com/in/${employee.name.toLowerCase().replace(/\s+/g, '')}`,
        github: `https://github.com/${employee.name.toLowerCase().replace(/\s+/g, '')}`,
        skills: employee.benefits || [],
        projects: Math.floor(Math.random() * 5) + 1,
        tasksCompleted: Math.floor(Math.random() * 50) + 10,
        activeProjects: [`Project ${index + 1}`, `Project ${index + 2}`],
        availability: Math.floor(Math.random() * 30) + 70,
        workload: Math.floor(Math.random() * 40) + 60,
        overtime: Math.floor(Math.random() * 20),
        performance: Math.floor(Math.random() * 30) + 70,
        hoursWorked: Math.floor(Math.random() * 200) + 160,
        leaveTaken: Math.floor(Math.random() * 20),
        isOnline: Math.random() > 0.3,
        status: Math.random() > 0.3 ? 'available' : 'offline',
        lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        workLocation: ['office', 'remote', 'hybrid'][Math.floor(Math.random() * 3)] as 'office' | 'remote' | 'hybrid',
        yearStats: {
          projects: Math.floor(Math.random() * 10) + 5,
          tasksCompleted: Math.floor(Math.random() * 100) + 50,
          overtime: Math.floor(Math.random() * 100),
          performance: Math.floor(Math.random() * 30) + 70,
          hoursWorked: Math.floor(Math.random() * 2000) + 1600,
          leaveTaken: Math.floor(Math.random() * 160),
        },
      }));
    
    setTeamMembers(convertedTeamMembers);
  }, [employees]);

  const currentYearStats = yearlyStats.find(stat => stat.year === selectedYear) || {
    year: selectedYear,
    totalProjects: 0,
    completedTasks: 0,
    averageWorkload: 0,
    overworkedMembers: 0,
    teamPerformance: 0,
    newHires: 0,
    departures: 0,
    totalHoursWorked: 0,
    totalLeaveTaken: 0,
  };
  const previousYearStats = yearlyStats.find(stat => stat.year === selectedYear - 1) || {
    year: selectedYear - 1,
    totalProjects: 0,
    completedTasks: 0,
    averageWorkload: 0,
    overworkedMembers: 0,
    teamPerformance: 0,
    newHires: 0,
    departures: 0,
    totalHoursWorked: 0,
    totalLeaveTaken: 0,
  };

  const stats = {
    totalMembers: teamMembers.length,
    totalProjects: teamMembers.length > 0 ? teamMembers.reduce((acc, member) => acc + member.projects, 0) : 0,
    completedTasks: teamMembers.length > 0 ? teamMembers.reduce((acc, member) => acc + member.tasksCompleted, 0) : 0,
    averageAvailability: teamMembers.length > 0 ? Math.round(
      teamMembers.reduce((acc, member) => acc + member.availability, 0) / teamMembers.length
    ) : 0,
    averageWorkload: teamMembers.length > 0 ? Math.round(
      teamMembers.reduce((acc, member) => acc + member.workload, 0) / teamMembers.length
    ) : 0,
    overworkedMembers: teamMembers.filter(member => member.workload > 90).length,
    averagePerformance: teamMembers.length > 0 ? Math.round(
      teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length
    ) : 0,
    totalOvertimeHours: teamMembers.reduce((acc, member) => acc + member.overtime, 0),
    totalHoursWorked: teamMembers.reduce((acc, member) => acc + member.hoursWorked, 0),
    totalLeaveTaken: teamMembers.reduce((acc, member) => acc + member.leaveTaken, 0),
    skillDistribution: teamMembers.length > 0 ? teamMembers.reduce((acc, member) => {
      member.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>) : {},
  };

  const calculateYearOverYearChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const handleNewMember = () => {
    setNewMemberDialog(true);
  };

  const handleNewMemberFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddNewMember = () => {
    if (!newMemberForm.name || !newMemberForm.role || !newMemberForm.email) {
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberForm.name,
      role: newMemberForm.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMemberForm.name)}&background=random`,
      email: newMemberForm.email,
      skills: newMemberForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      projects: 0,
      tasksCompleted: 0,
      activeProjects: [],
      availability: 100,
      workload: 0,
      overtime: 0,
      performance: 85,
      hoursWorked: 0,
      leaveTaken: 0,
      isOnline: true,
      status: 'available',
      lastActive: new Date().toISOString(),
      workLocation: 'office',
      yearStats: {
        projects: 0,
        tasksCompleted: 0,
        overtime: 0,
        performance: 85,
        hoursWorked: 0,
        leaveTaken: 0
      }
    };

    setTeamMembers(prev => [...prev, newMember]);
    setNewMemberForm({ name: '', role: '', email: '', skills: '' });
    setNewMemberDialog(false);
  };

  const handleCloseNewMemberDialog = () => {
    setNewMemberDialog(false);
    setNewMemberForm({ name: '', role: '', email: '', skills: '' });
  };

  const handleMemberDetails = (member: TeamMember) => {
    setSelectedMember(member);
    setMemberDetailsDialog(true);
  };

  const handleCompareYears = () => {
    setIsComparing(!isComparing);
  };

  const handleToggleOnlineStatus = (memberId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setTeamMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId
          ? {
              ...member,
              isOnline: !member.isOnline,
              status: member.isOnline ? 'offline' : 'available',
              lastActive: new Date().toISOString()
            }
          : member
      )
    );
  };

  const handleUpdateWorkLocation = (memberId: string, location: 'office' | 'remote' | 'hybrid') => (event: React.MouseEvent) => {
    event.stopPropagation();
    setTeamMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId
          ? {
              ...member,
              workLocation: location,
              lastActive: new Date().toISOString()
            }
          : member
      )
    );
  };

  const handleOpenMessageDialog = (member: TeamMember) => {
    setSelectedMemberForMessage(member);
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setSelectedMemberForMessage(null);
    setMessageText('');
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedMemberForMessage) {
      // In a real app, this would send the message to the backend
      console.log(`Sending message to ${selectedMemberForMessage.name}: ${messageText}`);
      handleCloseMessageDialog();
    }
  };

  const handleOpenRecommendations = (member: TeamMember) => {
    setSelectedMemberForRecommendations(member);
    setRecommendationsDialogOpen(true);
  };

  const handleCloseRecommendations = () => {
    setRecommendationsDialogOpen(false);
    setSelectedMemberForRecommendations(null);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear];
    
    // Add years from when employees started working
    employeeStartYears.forEach(employee => {
      if (employee.startYear < currentYear && !years.includes(employee.startYear)) {
        years.push(employee.startYear);
      }
    });
    
    return years.sort((a, b) => b - a); // Sort in descending order
  };

  const getYearlyStats = (year: number) => {
    // In a real app, this would fetch data from the backend
    // For now, we'll generate some dummy data based on the year
    const baseValue = 100;
    const yearDiff = new Date().getFullYear() - year;
    const multiplier = 1 - (yearDiff * 0.1); // Decrease by 10% for each year in the past
    
    return {
      totalHoursWorked: Math.round(baseValue * 2080 * multiplier), // 2080 hours in a year (40h/week * 52 weeks)
      totalLeaveTaken: Math.round(baseValue * 160 * multiplier), // 160 hours of leave per year
      teamPerformance: Math.round(85 + (yearDiff * 2)), // Performance improves over time
      completedTasks: Math.round(baseValue * 500 * multiplier),
      averageWorkload: Math.round(75 + (yearDiff * 3)),
    };
  };

  const filteredMembers = teamMembers.filter(member => 
    workLocationFilter === 'all' || member.workLocation === workLocationFilter
  );

  const roleData = [
    { name: 'Project Manager', value: 1 },
    { name: 'Senior Developer', value: 1 },
    { name: 'UI/UX Designer', value: 1 },
  ];

  const projectData = [
    { name: 'Website Redesign', value: 3 },
    { name: 'Mobile App Development', value: 2 },
    { name: 'API Integration', value: 2 },
    { name: 'Performance Optimization', value: 1 },
  ];

  const workloadData = [
    { name: 'Low (< 50%)', value: teamMembers.filter(m => m.workload < 50).length },
    { name: 'Medium (50-75%)', value: teamMembers.filter(m => m.workload >= 50 && m.workload < 75).length },
    { name: 'High (75-90%)', value: teamMembers.filter(m => m.workload >= 75 && m.workload < 90).length },
    { name: 'Overloaded (> 90%)', value: teamMembers.filter(m => m.workload >= 90).length },
  ];

  const calculatePercentage = (data: { name: string; value: number }[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }));
  };

  const roleDataWithPercentages = calculatePercentage(roleData);
  const projectDataWithPercentages = calculatePercentage(projectData);
  const workloadDataWithPercentages = calculatePercentage(workloadData);

  const handleMessageClick = (member: TeamMember) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMemberForMessage(member);
    setMessageDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="team">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: 6,
            pb: 4,
          }}
        >
        <Container maxWidth="xl">
          <Box sx={{ color: 'white', mb: 6 }}>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
              Team Analytics
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.9 }}>
              Comprehensive team performance and workload analysis
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Groups sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Typography variant="h4" fontWeight="medium">
                      {stats.totalMembers}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Team Members
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={stats.totalMembers > previousYearStats.newHires ? 'success.main' : 'error.main'}
                    >
                      {stats.totalMembers > previousYearStats.newHires ? '+' : ''}
                      {stats.totalMembers - previousYearStats.newHires} vs last year
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Schedule sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Typography variant="h4" fontWeight="medium">
                      {stats.totalHoursWorked}h
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Hours Worked
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={stats.totalHoursWorked > previousYearStats.totalHoursWorked ? 'success.main' : 'error.main'}
                    >
                      {calculateYearOverYearChange(stats.totalHoursWorked, previousYearStats.totalHoursWorked).toFixed(1)}% vs last year
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <WorkOutline sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Typography variant="h4" fontWeight="medium">
                      {stats.totalLeaveTaken}d
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Leave Taken
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={stats.totalLeaveTaken < previousYearStats.totalLeaveTaken ? 'success.main' : 'error.main'}
                    >
                      {calculateYearOverYearChange(stats.totalLeaveTaken, previousYearStats.totalLeaveTaken).toFixed(1)}% vs last year
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Assessment sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Typography variant="h4" fontWeight="medium">
                      {stats.averagePerformance}%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Team Performance
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={stats.averagePerformance > previousYearStats.teamPerformance ? 'success.main' : 'error.main'}
                    >
                      {calculateYearOverYearChange(stats.averagePerformance, previousYearStats.teamPerformance).toFixed(1)}% vs last year
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', mb: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" fontWeight="medium">
                Analytics Dashboard
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  sx={{ borderRadius: 2 }}
                >
                  {getAvailableYears().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={isComparing ? "contained" : "outlined"}
                startIcon={<CompareArrows />}
                onClick={handleCompareYears}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {isComparing ? "Hide Comparison" : "Compare Years"}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleNewMember}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Add Member
              </Button>
            </Box>
          </Box>

          <Tabs
            value={analyticsTab}
            onChange={(e, newValue) => setAnalyticsTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab icon={<Timeline />} label="Performance" />
            <Tab icon={<BarChart />} label="Workload" />
            <Tab icon={<PieChart />} label="Distribution" />
          </Tabs>

          {analyticsTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={isComparing ? 6 : 12}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {isComparing ? `${selectedYear} Performance Trends` : 'Team Performance Trends'}
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Team Performance
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {currentYearStats.teamPerformance}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={currentYearStats.teamPerformance}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                          }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Hours Worked
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {currentYearStats.totalHoursWorked}h
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(currentYearStats.totalHoursWorked / 6000) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                          }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Leave Taken
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {currentYearStats.totalLeaveTaken}d
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(currentYearStats.totalLeaveTaken / 60) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              {isComparing && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {previousYearStats.year} Performance Trends
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Team Performance
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {previousYearStats.teamPerformance}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={previousYearStats.teamPerformance}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'action.hover',
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Hours Worked
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {previousYearStats.totalHoursWorked}h
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(previousYearStats.totalHoursWorked / 6000) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'action.hover',
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Leave Taken
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {previousYearStats.totalLeaveTaken}d
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(previousYearStats.totalLeaveTaken / 60) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'action.hover',
                            }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {analyticsTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workload Distribution
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={workloadData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {workloadData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [`${value} members`, name]}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overworked Team Members
                    </Typography>
                    <Stack spacing={2}>
                      {teamMembers
                        .filter(member => member.workload > 90)
                        .map(member => (
                          <Box key={member.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                {member.name}
                              </Typography>
                              <Typography variant="body2" color="error.main">
                                {member.workload}% workload
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={member.workload}
                              color="error"
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'action.hover',
                              }}
                            />
                          </Box>
                        ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {analyticsTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Role Distribution
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={roleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {roleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [`${value} members`, name]}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Project Allocation
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={projectData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {projectData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [`${value} members`, name]}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: '12px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="medium">
                Team Members
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={workLocationFilter}
                  onChange={(e) => setWorkLocationFilter(e.target.value as typeof workLocationFilter)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="office">Office</MenuItem>
                  <MenuItem value="remote">Remote</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={3}>
              {filteredMembers.length === 0 ? (
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      borderRadius: 4,
                      textAlign: 'center',
                      py: 8,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={3} alignItems="center">
                        <Group sx={{ fontSize: 80, color: 'text.secondary' }} />
                        <Typography variant="h5" color="text.secondary">
                          No Team Members Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                          Get started by adding your first team member. You can track their performance, workload, and collaboration all in one place.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          size="large"
                          onClick={handleNewMember}
                          sx={{ borderRadius: 2, mt: 2 }}
                        >
                          Add Your First Team Member
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                filteredMembers.map((member) => (
                <Grid item xs={12} md={6} lg={4} key={member.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: member.isOnline 
                          ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                          : 'linear-gradient(90deg, #9e9e9e, #bdbdbd)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: member.isOnline
                          ? 'linear-gradient(135deg, rgba(76,175,80,0.08), rgba(102,187,106,0.04))'
                          : 'linear-gradient(135deg, rgba(158,158,158,0.08), rgba(189,189,189,0.04))',
                        pointerEvents: 'none',
                        zIndex: 0
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        borderColor: member.isOnline ? 'rgba(76,175,80,0.3)' : 'rgba(158,158,158,0.3)',
                      }
                    }}
                    onClick={() => handleMemberDetails(member)}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ position: 'relative', mb: 1 }}>
                          <TeamMemberStatus 
                            status={member.status}
                            name={member.name}
                            avatar={member.avatar.length > 2 ? member.avatar : ''}
                            lastActiveTime={new Date(member.lastActive)}
                            showLastActive={false}
                          />
                          <IconButton
                            size="small"
                            onClick={handleToggleOnlineStatus(member.id)}
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'background.paper',
                              boxShadow: 1
                            }}
                          >
                            {member.isOnline ? <Wifi /> : <WifiOff />}
                          </IconButton>
                        </Box>
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                          <Typography variant="h6" fontWeight="medium" sx={{ mb: 0.5 }}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {member.role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.workLocation.charAt(0).toUpperCase() + member.workLocation.slice(1)} • 
                            Last active: {new Date(member.lastActive).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'center' }}>
                          <IconButton 
                            size="small" 
                            href={`mailto:${member.email}`}
                            onClick={handleMessageClick(member)}
                          >
                            <Email fontSize="small" />
                          </IconButton>
                          {member.linkedIn && (
                            <IconButton 
                              size="small" 
                              href={member.linkedIn} 
                              target="_blank"
                              onClick={handleMessageClick(member)}
                            >
                              <LinkedIn fontSize="small" />
                            </IconButton>
                          )}
                          {member.github && (
                            <IconButton 
                              size="small" 
                              href={member.github} 
                              target="_blank"
                              onClick={handleMessageClick(member)}
                            >
                              <GitHub fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                          {member.skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2, width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
                          Workload
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={member.workload}
                              color={member.workload > 90 ? 'error' : 'primary'}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color={member.workload > 90 ? 'error.main' : 'text.secondary'} sx={{ minWidth: 45, textAlign: 'right' }}>
                            {member.workload}%
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2, width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
                          Performance
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={member.performance}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45, textAlign: 'right' }}>
                            {member.performance}%
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2, width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
                          Hours Worked
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(member.hoursWorked / 2080) * 100}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 50, textAlign: 'right' }}>
                            {member.hoursWorked}h
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Button
                          startIcon={<Message />}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                          onClick={handleMessageClick(member)}
                        >
                          Message
                        </Button>
                        <Button
                          startIcon={<Edit />}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMemberDetails(member);
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* New Member Dialog */}
      <Dialog
        open={newMemberDialog}
        onClose={() => setNewMemberDialog(false)}
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
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))'
          }
        }}>
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
                Add New Team Member
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
              label="Name"
              fullWidth
              value={newMemberForm.name}
              onChange={handleNewMemberFormChange('name')}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Role"
              fullWidth
              value={newMemberForm.role}
              onChange={handleNewMemberFormChange('role')}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newMemberForm.email}
              onChange={handleNewMemberFormChange('email')}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Skills (comma separated)"
              fullWidth
              multiline
              rows={2}
              value={newMemberForm.skills}
              onChange={handleNewMemberFormChange('skills')}
              placeholder="e.g., React, TypeScript, Node.js"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
              onClick={handleCloseNewMemberDialog}
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
              onClick={handleAddNewMember}
              disabled={!newMemberForm.name || !newMemberForm.role || !newMemberForm.email}
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
              Add Member
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog
        open={memberDetailsDialog}
        onClose={() => {
          setMemberDetailsDialog(false);
          setSelectedMember(null);
        }}
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
        {selectedMember && (
          <>
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 3,
              px: 4,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <TeamMemberStatus 
                    status={selectedMember.status}
                    name={selectedMember.name}
                    avatar={selectedMember.avatar.length > 2 ? selectedMember.avatar : ''}
                    lastActiveTime={new Date(selectedMember.lastActive)}
                    size="medium"
                    showLastActive={false}
                  />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {selectedMember.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {selectedMember.role}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                    {selectedMember.workLocation.charAt(0).toUpperCase() + selectedMember.workLocation.slice(1)} • 
                    Last active: {new Date(selectedMember.lastActive).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Work Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      variant={selectedMember.isOnline ? "contained" : "outlined"}
                      startIcon={selectedMember.isOnline ? <Wifi /> : <WifiOff />}
                      onClick={handleToggleOnlineStatus(selectedMember.id)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      {selectedMember.isOnline ? 'Online' : 'Offline'}
                    </Button>
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={selectedMember.workLocation}
                        onChange={(e) => handleUpdateWorkLocation(selectedMember.id, e.target.value as typeof selectedMember.workLocation)(e as any)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="office">Office</MenuItem>
                        <MenuItem value="remote">Remote</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body1">{selectedMember.email}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {selectedMember.linkedIn && (
                      <Chip
                        icon={<LinkedIn />}
                        label="LinkedIn"
                        component="a"
                        href={selectedMember.linkedIn}
                        target="_blank"
                        clickable
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                    {selectedMember.github && (
                      <Chip
                        icon={<GitHub />}
                        label="GitHub"
                        component="a"
                        href={selectedMember.github}
                        target="_blank"
                        clickable
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMember.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Active Projects
                  </Typography>
                  <Stack spacing={1}>
                    {selectedMember.activeProjects.map((project) => (
                      <Chip
                        key={project}
                        label={project}
                        sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.projects}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Projects
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.tasksCompleted}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tasks Completed
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.hoursWorked}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hours Worked
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.leaveTaken}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Leave Days
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.workload}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Workload
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight="medium">
                          {selectedMember.performance}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Performance
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Year-over-Year Comparison
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Projects
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedMember.projects} vs {selectedMember.yearStats.projects}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedMember.projects / selectedMember.yearStats.projects) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Tasks Completed
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedMember.tasksCompleted} vs {selectedMember.yearStats.tasksCompleted}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedMember.tasksCompleted / selectedMember.yearStats.tasksCompleted) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Hours Worked
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedMember.hoursWorked} vs {selectedMember.yearStats.hoursWorked}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedMember.hoursWorked / selectedMember.yearStats.hoursWorked) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Leave Taken
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedMember.leaveTaken} vs {selectedMember.yearStats.leaveTaken}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedMember.leaveTaken / selectedMember.yearStats.leaveTaken) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.02), transparent)',
              borderTop: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Button
                onClick={() => {
                  setMemberDetailsDialog(false);
                  setSelectedMember(null);
                }}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  px: 3,
                  '&:hover': {
                    background: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Message />}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Send Message to {selectedMemberForMessage?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work-Life Balance Recommendations Dialog */}
      <Dialog 
        open={recommendationsDialogOpen} 
        onClose={handleCloseRecommendations}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Work-Life Balance Recommendations for {selectedMemberForRecommendations?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {workLifeBalanceRecommendations.map((recommendation) => (
              <Grid item xs={12} sm={6} key={recommendation.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {recommendation.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recommendation.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecommendations}>Close</Button>
        </DialogActions>
      </Dialog>
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default Team; 