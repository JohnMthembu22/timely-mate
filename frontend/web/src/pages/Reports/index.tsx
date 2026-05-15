import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  People,
  Work,
  AttachMoney,
  Schedule,
  BarChart,
  PieChart,
  Download,
  Print,
  Share,
  CalendarToday,
  Business,
  Group,
  Timer,
  CheckCircle,
  Warning,
  ArrowUpward,
  ArrowDownward,
  Psychology,
  Lightbulb,
  Insights,
  Recommend,
  PriorityHigh,
  Info,
  CheckCircleOutline,
  Email,
} from '@mui/icons-material';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAppSelector } from '../../store';
import { useTheme } from '@mui/material/styles';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';

interface ReportTab {
  label: string;
  value: number;
}

const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

const Reports: React.FC = () => {
  const theme = useTheme();
  const { employees } = useEmployees();
  const { formatAmount } = useCurrency();
  const { addNotification } = useNotifications();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'excel' | 'csv' | null>(null);
  const [exporting, setExporting] = useState(false);

  // Calculate company overview metrics
  const companyMetrics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;
    
    const departments = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employmentTypes = {
      permanent: employees.filter(emp => emp.employmentType === 'permanent').length,
      contract: employees.filter(emp => emp.employmentType === 'contract').length,
      freelancer: employees.filter(emp => emp.employmentType === 'freelancer').length,
    };

    const seniorityLevels = {
      junior: employees.filter(emp => emp.level === 'junior').length,
      mid: employees.filter(emp => emp.level === 'mid').length,
      senior: employees.filter(emp => emp.level === 'senior').length,
      lead: employees.filter(emp => emp.level === 'lead').length,
    };

    return {
      totalEmployees,
      activeEmployees,
      totalSalary,
      avgSalary,
      departments,
      employmentTypes,
      seniorityLevels,
      departmentCount: Object.keys(departments).length,
    };
  }, [employees]);

  // Calculate team performance metrics
  const teamPerformance = useMemo(() => {
    // Mock performance data - in real app, this would come from time tracking, projects, etc.
    const avgPerformance = 85;
    const avgProductivity = 78;
    const avgAttendance = 92;
    const avgSatisfaction = 88;

    const departmentPerformance = Object.keys(companyMetrics.departments || {}).map(dept => ({
      department: dept,
      employees: companyMetrics.departments?.[dept] || 0,
      avgPerformance: 70 + Math.random() * 30,
      avgProductivity: 65 + Math.random() * 30,
      projectsCompleted: Math.floor(Math.random() * 20) + 5,
      hoursWorked: Math.floor(Math.random() * 1000) + 500,
    }));

    return {
      avgPerformance,
      avgProductivity,
      avgAttendance,
      avgSatisfaction,
      departmentPerformance,
      topPerformers: employees.slice(0, 5).map(emp => ({
        name: emp.name,
        department: emp.department,
        performance: 80 + Math.random() * 20,
        projects: Math.floor(Math.random() * 10) + 1,
      })),
    };
  }, [employees, companyMetrics.departments]);

  // Financial overview
  const financialOverview = useMemo(() => {
    const totalPayroll = companyMetrics.totalSalary || 0;
    const avgCostPerEmployee = companyMetrics.totalEmployees > 0 
      ? Math.round(totalPayroll / companyMetrics.totalEmployees) 
      : 0;
    
    // Mock additional financial data
    const revenue = totalPayroll * 3.5; // Estimated revenue
    const expenses = totalPayroll * 1.2; // Estimated expenses
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

    return {
      totalPayroll,
      avgCostPerEmployee,
      revenue,
      expenses,
      profit,
      profitMargin,
    };
  }, [companyMetrics]);

  // Time tracking analytics
  const timeAnalytics = useMemo(() => {
    const totalHours = employees.length * 160; // Estimated monthly hours
    const billableHours = Math.floor(totalHours * 0.75);
    const nonBillableHours = totalHours - billableHours;
    const utilizationRate = 78; // Percentage
    const avgHoursPerEmployee = companyMetrics.totalEmployees > 0 
      ? Math.round(totalHours / companyMetrics.totalEmployees) 
      : 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      hours: Math.floor(Math.random() * 500) + 1000,
      billable: Math.floor(Math.random() * 400) + 750,
      revenue: Math.floor(Math.random() * 50000) + 100000,
    }));

    return {
      totalHours,
      billableHours,
      nonBillableHours,
      utilizationRate,
      avgHoursPerEmployee,
      monthlyData,
    };
  }, [employees, companyMetrics.totalEmployees]);

  // Department breakdown data for charts
  const departmentChartData = Object.entries(companyMetrics.departments).map(([name, value]) => ({
    name,
    value,
    employees: value,
  }));

  const seniorityChartData = [
    { name: 'Junior', value: companyMetrics.seniorityLevels.junior },
    { name: 'Mid', value: companyMetrics.seniorityLevels.mid },
    { name: 'Senior', value: companyMetrics.seniorityLevels.senior },
    { name: 'Lead', value: companyMetrics.seniorityLevels.lead },
  ];

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleExportFormatSelect = (format: 'pdf' | 'excel' | 'csv') => {
    setSelectedExportFormat(format);
  };

  const handleExportConfirm = async () => {
    if (!selectedExportFormat) {
      addNotification(createNotification.system('Export Error', 'Please select an export format.'));
      return;
    }

    setExporting(true);
    try {
      // Prepare export data based on current tab
      let exportData: any = {};
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = `company_reports_${timestamp}`;

      // Collect data based on current tab
      switch (selectedTab) {
        case 0: // Company Overview
          exportData = {
            type: 'Company Overview',
            dateRange,
            metrics: companyMetrics,
            timestamp: new Date().toISOString(),
          };
          break;
        case 1: // Team Performance
          exportData = {
            type: 'Team Performance',
            dateRange,
            performance: teamPerformance,
            timestamp: new Date().toISOString(),
          };
          break;
        case 2: // Financial Overview
          exportData = {
            type: 'Financial Overview',
            dateRange,
            financial: financialOverview,
            timestamp: new Date().toISOString(),
          };
          break;
        case 3: // Time Analytics
          exportData = {
            type: 'Time Analytics',
            dateRange,
            analytics: timeAnalytics,
            timestamp: new Date().toISOString(),
          };
          break;
        case 4: // AI Suggestions
          exportData = {
            type: 'AI Suggestions',
            dateRange,
            suggestions: aiSuggestions,
            timestamp: new Date().toISOString(),
          };
          break;
      }

      let content = '';
      let mimeType = 'text/plain';

      if (selectedExportFormat === 'csv') {
        // Convert to CSV
        const flattenObject = (obj: any, prefix = ''): string[][] => {
          const rows: string[][] = [];
          for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
              rows.push(...flattenObject(value, newKey));
            } else {
              rows.push([newKey, String(value)]);
            }
          }
          return rows;
        };

        const rows = flattenObject(exportData);
        content = 'Key,Value\n' + rows.map(row => `"${row[0]}","${row[1]}"`).join('\n');
        filename += '.csv';
        mimeType = 'text/csv';
      } else if (selectedExportFormat === 'excel') {
        // Convert to TSV (Excel-compatible)
        const flattenObject = (obj: any, prefix = ''): string[][] => {
          const rows: string[][] = [];
          for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
              rows.push(...flattenObject(value, newKey));
            } else {
              rows.push([newKey, String(value)]);
            }
          }
          return rows;
        };

        const rows = flattenObject(exportData);
        content = 'Key\tValue\n' + rows.map(row => `${row[0]}\t${row[1]}`).join('\n');
        filename += '.xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (selectedExportFormat === 'pdf') {
        // For PDF, create a formatted text representation
        const formatForPDF = (obj: any, indent = 0): string => {
          let text = '';
          const indentStr = '  '.repeat(indent);
          for (const key in obj) {
            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
              text += `${indentStr}${key}:\n${formatForPDF(value, indent + 1)}`;
            } else {
              text += `${indentStr}${key}: ${value}\n`;
            }
          }
          return text;
        };

        content = `Company Reports - ${exportData.type}\n`;
        content += `Generated: ${new Date().toLocaleString()}\n`;
        content += `Date Range: ${dateRange}\n\n`;
        content += formatForPDF(exportData);
        filename += '.txt'; // PDF generation would require jsPDF library
        mimeType = 'text/plain';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification(createNotification.system('Export Successful', `Report exported successfully as ${selectedExportFormat.toUpperCase()}.`));
      setExportDialogOpen(false);
      setSelectedExportFormat(null);
    } catch (error) {
      console.error('Export error:', error);
      addNotification(createNotification.system('Export Failed', 'An error occurred during export. Please try again.'));
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    // Hide elements that shouldn't be printed
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
        body {
          background: white !important;
        }
        .MuiContainer-root {
          max-width: 100% !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Trigger print
    window.print();

    // Clean up after a delay
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Company Reports & Analytics');
    const body = encodeURIComponent(
      `Please find attached the company reports for ${dateRange}.\n\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `View online: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareDialogOpen(false);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      addNotification(createNotification.system('Link Copied', 'Report link copied to clipboard!'));
      setShareDialogOpen(false);
    }).catch(() => {
      addNotification(createNotification.system('Copy Failed', 'Failed to copy link. Please try again.'));
    });
  };

  // AI Suggestions based on all metrics
  const aiSuggestions = useMemo(() => {
    const suggestions: Array<{
      id: string;
      category: 'company' | 'team' | 'financial' | 'time' | 'optimization';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      actionItems: string[];
      estimatedSavings?: number;
      confidence: number;
      icon: React.ReactNode;
    }> = [];

    // Company Structure Analysis
    if (companyMetrics.departmentCount > 10) {
      suggestions.push({
        id: 'dept-consolidation',
        category: 'company',
        priority: 'medium',
        title: 'Department Consolidation Opportunity',
        description: `Your organization has ${companyMetrics.departmentCount} departments. Consider consolidating smaller departments to improve communication and reduce overhead costs.`,
        impact: 'Medium impact on operational efficiency',
        actionItems: [
          'Review department sizes and identify consolidation opportunities',
          'Assess cross-department collaboration needs',
          'Plan gradual consolidation to minimize disruption',
        ],
        estimatedSavings: companyMetrics.totalSalary * 0.05,
        confidence: 75,
        icon: <Business color="primary" />,
      });
    }

    // Payroll Optimization
    const payrollRatio = financialOverview.revenue > 0 
      ? companyMetrics.totalSalary / financialOverview.revenue 
      : 0;
    if (payrollRatio > 0.4) {
      suggestions.push({
        id: 'payroll-optimization',
        category: 'financial',
        priority: 'high',
        title: 'High Payroll-to-Revenue Ratio',
        description: `Your payroll represents ${(payrollRatio * 100).toFixed(1)}% of revenue, which is above the recommended 30-35% range. Consider optimizing workforce allocation.`,
        impact: 'High impact on profitability',
        actionItems: [
          'Review employee productivity metrics',
          'Consider outsourcing non-core functions',
          'Implement performance-based compensation',
          'Evaluate automation opportunities',
        ],
        estimatedSavings: companyMetrics.totalSalary * 0.1,
        confidence: 85,
        icon: <AttachMoney color="error" />,
      });
    }

    // Team Performance Issues
    if (teamPerformance.avgPerformance < 75) {
      suggestions.push({
        id: 'performance-improvement',
        category: 'team',
        priority: 'high',
        title: 'Team Performance Below Target',
        description: `Average team performance is ${teamPerformance.avgPerformance}%, below the optimal 80% threshold. Focus on performance improvement initiatives.`,
        impact: 'High impact on productivity',
        actionItems: [
          'Conduct performance reviews with underperforming teams',
          'Provide targeted training and development programs',
          'Review workload distribution',
          'Implement performance incentives',
        ],
        estimatedSavings: 0,
        confidence: 90,
        icon: <TrendingDown color="warning" />,
      });
    }

    // Utilization Rate Optimization
    if (timeAnalytics.utilizationRate < 70) {
      suggestions.push({
        id: 'utilization-improvement',
        category: 'time',
        priority: 'medium',
        title: 'Low Time Utilization Rate',
        description: `Current utilization rate is ${timeAnalytics.utilizationRate}%. Improving to 80%+ could increase billable hours and revenue.`,
        impact: 'Medium impact on revenue',
        actionItems: [
          'Identify non-billable time patterns',
          'Optimize project allocation',
          'Reduce administrative overhead',
          'Implement time tracking best practices',
        ],
        estimatedSavings: timeAnalytics.billableHours > 0 && financialOverview.revenue > 0
          ? (timeAnalytics.billableHours * 0.1) * (financialOverview.revenue / timeAnalytics.billableHours)
          : 0,
        confidence: 80,
        icon: <Timer color="info" />,
      });
    }

    // Seniority Balance
    const juniorRatio = companyMetrics.totalEmployees > 0
      ? companyMetrics.seniorityLevels.junior / companyMetrics.totalEmployees
      : 0;
    if (juniorRatio > 0.5) {
      suggestions.push({
        id: 'seniority-balance',
        category: 'team',
        priority: 'medium',
        title: 'Junior-Heavy Workforce',
        description: `${(juniorRatio * 100).toFixed(0)}% of your workforce is junior level. Consider hiring more senior talent for mentorship and complex projects.`,
        impact: 'Medium impact on quality and efficiency',
        actionItems: [
          'Develop mentorship programs',
          'Hire senior talent for key positions',
          'Invest in junior employee training',
          'Create clear career progression paths',
        ],
        estimatedSavings: 0,
        confidence: 70,
        icon: <People color="secondary" />,
      });
    }

    // Financial Health
    const profitMargin = parseFloat(financialOverview.profitMargin);
    if (profitMargin < 10) {
      suggestions.push({
        id: 'profit-margin',
        category: 'financial',
        priority: 'high',
        title: 'Low Profit Margin',
        description: `Current profit margin is ${profitMargin}%, which is below the healthy 15%+ threshold. Focus on cost optimization and revenue growth.`,
        impact: 'High impact on financial sustainability',
        actionItems: [
          'Review and reduce operational expenses',
          'Increase pricing where market allows',
          'Focus on high-margin services/products',
          'Optimize resource allocation',
        ],
        estimatedSavings: financialOverview.revenue * 0.05,
        confidence: 85,
        icon: <TrendingDown color="error" />,
      });
    }

    // Department Performance Gaps
    const underperformingDepts = (teamPerformance.departmentPerformance || []).filter(
      dept => dept && typeof dept.avgPerformance === 'number' && dept.avgPerformance < 70
    );
    if (underperformingDepts.length > 0) {
      const deptNames = underperformingDepts
        .map(d => d?.department)
        .filter(Boolean)
        .join(', ');
      suggestions.push({
        id: 'dept-performance',
        category: 'team',
        priority: 'high',
        title: 'Underperforming Departments Identified',
        description: `${underperformingDepts.length} department(s) are performing below 70%. Immediate attention required.`,
        impact: 'High impact on overall performance',
        actionItems: [
          deptNames ? `Review ${deptNames} departments` : 'Review underperforming departments',
          'Conduct root cause analysis',
          'Develop department-specific improvement plans',
          'Provide additional resources or training',
        ],
        estimatedSavings: 0,
        confidence: 95,
        icon: <Warning color="error" />,
      });
    }

    // Time Analytics Optimization
    const billableRatio = timeAnalytics.totalHours > 0
      ? timeAnalytics.billableHours / timeAnalytics.totalHours
      : 0;
    if (billableRatio < 0.7 && timeAnalytics.totalHours > 0) {
      suggestions.push({
        id: 'billable-optimization',
        category: 'time',
        priority: 'medium',
        title: 'Low Billable Hours Ratio',
        description: `Only ${(billableRatio * 100).toFixed(0)}% of total hours are billable. Improving this ratio can significantly increase revenue.`,
        impact: 'Medium impact on revenue',
        actionItems: [
          'Review non-billable activities',
          'Optimize project scoping and planning',
          'Reduce administrative time',
          'Improve project management efficiency',
        ],
        estimatedSavings: timeAnalytics.billableHours > 0 && financialOverview.revenue > 0
          ? (timeAnalytics.nonBillableHours * 0.3) * (financialOverview.revenue / timeAnalytics.billableHours)
          : 0,
        confidence: 75,
        icon: <Schedule color="warning" />,
      });
    }

    // Employee Distribution
    try {
      const departmentEntries = Object.entries(companyMetrics.departments || {});
      if (departmentEntries.length > 0 && companyMetrics.totalEmployees > 0) {
        const sortedDepts = departmentEntries.sort((a, b) => {
          const aVal = typeof a[1] === 'number' ? a[1] : 0;
          const bVal = typeof b[1] === 'number' ? b[1] : 0;
          return bVal - aVal;
        });
        const largestDept = sortedDepts[0];
        if (largestDept && largestDept.length >= 2 && typeof largestDept[1] === 'number') {
          const largestDeptRatio = largestDept[1] / companyMetrics.totalEmployees;
          if (largestDeptRatio > 0.4) {
            suggestions.push({
              id: 'dept-distribution',
              category: 'company',
              priority: 'low',
              title: 'Department Size Imbalance',
              description: `${largestDept[0] || 'Unknown'} department represents ${(largestDeptRatio * 100).toFixed(0)}% of your workforce. Consider rebalancing for better organizational structure.`,
              impact: 'Low impact on operations',
              actionItems: [
                'Assess if current distribution aligns with business needs',
                'Consider splitting large departments',
                'Redistribute resources if needed',
              ],
              estimatedSavings: 0,
              confidence: 60,
              icon: <Group color="info" />,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating department distribution:', error);
    }

    // Return sorted by priority and confidence
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }, [companyMetrics, teamPerformance, financialOverview, timeAnalytics]);

  const renderAISuggestions = () => (
    <Grid container spacing={3}>
      {/* Summary Card */}
      <Grid item xs={12}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Psychology sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  AI-Powered Insights & Recommendations
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {aiSuggestions.length} intelligent suggestions based on your company data
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {aiSuggestions.filter(s => s.priority === 'high').length}
                  </Typography>
                  <Typography variant="body2">High Priority</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {aiSuggestions.filter(s => s.estimatedSavings && s.estimatedSavings > 0).length}
                  </Typography>
                  <Typography variant="body2">Cost Optimization</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {formatAmount(
                      aiSuggestions.reduce((sum, s) => sum + (s.estimatedSavings || 0), 0)
                    )}
                  </Typography>
                  <Typography variant="body2">Potential Savings</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Suggestions List */}
      {aiSuggestions.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Excellent Performance!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All metrics are within optimal ranges. Continue monitoring and maintain current practices.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        aiSuggestions.map((suggestion) => (
          <Grid item xs={12} md={6} key={suggestion.id}>
            <Card
              sx={{
                height: '100%',
                borderLeft: `4px solid ${
                  suggestion.priority === 'high'
                    ? theme.palette.error.main
                    : suggestion.priority === 'medium'
                    ? theme.palette.warning.main
                    : theme.palette.info.main
                }`,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {suggestion.icon}
                    <Typography variant="h6" fontWeight="bold">
                      {suggestion.title}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={suggestion.priority.toUpperCase()}
                      size="small"
                      color={
                        suggestion.priority === 'high'
                          ? 'error'
                          : suggestion.priority === 'medium'
                          ? 'warning'
                          : 'info'
                      }
                    />
                    <Chip
                      label={`${suggestion.confidence}%`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {suggestion.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Info fontSize="small" color="primary" />
                    Impact: {suggestion.impact}
                  </Typography>
                </Box>

                {suggestion.estimatedSavings && suggestion.estimatedSavings > 0 && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                      Potential Savings: {formatAmount(suggestion.estimatedSavings)}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Lightbulb fontSize="small" color="warning" />
                  Recommended Actions:
                </Typography>
                <List dense>
                  {suggestion.actionItems.map((action, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutline fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={action}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Category Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Suggestions by Category
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {['company', 'team', 'financial', 'time', 'optimization'].map((category) => {
                const categorySuggestions = aiSuggestions.filter(s => s.category === category);
                if (categorySuggestions.length === 0) return null;
                return (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {categorySuggestions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {category} Suggestions
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCompanyOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <People sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold">
              {companyMetrics.totalEmployees}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Employees
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              {companyMetrics.activeEmployees} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Business sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold">
              {companyMetrics.departmentCount}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Departments
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              Across organization
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <AttachMoney sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold">
              {formatAmount(companyMetrics.totalSalary)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Payroll
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              {formatAmount(companyMetrics.avgSalary)} avg/employee
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold">
              {teamPerformance.avgPerformance}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Avg Performance
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              Company-wide
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Breakdown */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Seniority Levels */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Seniority Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={seniorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2196F3" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Employment Types */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Employment Type Breakdown
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {companyMetrics.employmentTypes.permanent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permanent Employees
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {companyMetrics.employmentTypes.contract}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contract Workers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {companyMetrics.employmentTypes.freelancer}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Freelancers
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTeamPerformance = () => (
    <Grid container spacing={3}>
      {/* Performance Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="success" />
              <Typography variant="h6">Performance</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {teamPerformance.avgPerformance}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={teamPerformance.avgPerformance} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Work color="primary" />
              <Typography variant="h6">Productivity</Typography>
            </Box>
            <Typography variant="h3" color="primary.main">
              {teamPerformance.avgProductivity}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={teamPerformance.avgProductivity} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
              color="primary"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Schedule color="info" />
              <Typography variant="h6">Attendance</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {teamPerformance.avgAttendance}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={teamPerformance.avgAttendance} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
              color="info"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CheckCircle color="warning" />
              <Typography variant="h6">Satisfaction</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {teamPerformance.avgSatisfaction}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={teamPerformance.avgSatisfaction} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
              color="warning"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Department Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Department</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Employees</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Avg Performance</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Avg Productivity</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Projects Completed</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Hours Worked</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamPerformance.departmentPerformance.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Chip label={dept.department} size="small" />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{dept.employees}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {dept.avgPerformance.toFixed(1)}%
                          {dept.avgPerformance > 80 ? (
                            <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{dept.avgProductivity.toFixed(1)}%</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{dept.projectsCompleted}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{dept.hoursWorked.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Performers */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performers
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {teamPerformance.topPerformers.map((performer, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {performer.name.charAt(0)}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {performer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {performer.department}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Typography variant="body2" color="success.main">
                            {performer.performance.toFixed(0)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {performer.projects} projects
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFinancialOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Total Revenue
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {formatAmount(financialOverview.revenue)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              Estimated monthly revenue
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Total Expenses
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {formatAmount(financialOverview.expenses)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              Including payroll & operations
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Net Profit
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {formatAmount(financialOverview.profit)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              {financialOverview.profitMargin}% profit margin
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payroll Breakdown
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Payroll</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatAmount(financialOverview.totalPayroll)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Avg Cost per Employee</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatAmount(financialOverview.avgCostPerEmployee)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ height: 8, borderRadius: 4 }}
                color="secondary"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Financial Health
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Revenue Growth</Typography>
                  <Chip label="+12.5%" color="success" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Expense Control</Typography>
                  <Chip label="Good" color="success" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={65} sx={{ height: 6, borderRadius: 3 }} color="success" />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Profit Margin</Typography>
                  <Chip label={`${financialOverview.profitMargin}%`} color="primary" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={parseFloat(financialOverview.profitMargin)} sx={{ height: 6, borderRadius: 3 }} color="primary" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTimeAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Timer color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {timeAnalytics.totalHours.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {timeAnalytics.billableHours.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billable Hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {timeAnalytics.utilizationRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utilization Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <People color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {timeAnalytics.avgHoursPerEmployee}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Hours/Employee
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Time & Revenue Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={timeAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hours" fill="#2196F3" name="Total Hours" />
                <Bar yAxisId="left" dataKey="billable" fill="#4CAF50" name="Billable Hours" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF9800" 
                  strokeWidth={3}
                  name="Revenue"
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <DashboardLayout>
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'flex-start' }, 
              mb: 2,
              gap: { xs: 3, md: 0 }
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  Company Reports & Analytics
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
                  Comprehensive insights into company performance, team metrics, and financial overview
                </Typography>
              </Box>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  mt: { xs: 2, md: 15 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: { xs: '100%', sm: 150 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Date Range"
                    onChange={(e) => setDateRange(e.target.value as any)}
                    sx={{
                      color: 'white',
                      '& .MuiMenuItem-root': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Share
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>

          {/* Tabs */}
          <Paper sx={{ mb: 3, mt: { xs: 2, md: -4 } }}>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: { xs: 'auto', sm: 120 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  padding: { xs: '12px 8px', sm: '12px 16px' },
                },
              }}
            >
              <Tab icon={<Business />} iconPosition="start" label="Company Overview" />
              <Tab icon={<Group />} iconPosition="start" label="Team Performance" />
              <Tab icon={<AttachMoney />} iconPosition="start" label="Financial Overview" />
              <Tab icon={<Timer />} iconPosition="start" label="Time Analytics" />
              <Tab icon={<Psychology />} iconPosition="start" label="AI Suggestions" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ mt: 3 }}>
            {selectedTab === 0 && renderCompanyOverview()}
            {selectedTab === 1 && renderTeamPerformance()}
            {selectedTab === 2 && renderFinancialOverview()}
            {selectedTab === 3 && renderTimeAnalytics()}
            {selectedTab === 4 && renderAISuggestions()}
          </Box>

          {/* Export Dialog */}
          <Dialog open={exportDialogOpen} onClose={() => {
            setExportDialogOpen(false);
            setSelectedExportFormat(null);
          }}>
            <DialogTitle>Export Report</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose export format for {selectedTab === 0 ? 'Company Overview' : selectedTab === 1 ? 'Team Performance' : selectedTab === 2 ? 'Financial Overview' : selectedTab === 3 ? 'Time Analytics' : 'AI Suggestions'}:
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant={selectedExportFormat === 'pdf' ? 'contained' : 'outlined'}
                  startIcon={<Download />}
                  onClick={() => handleExportFormatSelect('pdf')}
                  disabled={exporting}
                >
                  Export as PDF
                </Button>
                <Button
                  variant={selectedExportFormat === 'excel' ? 'contained' : 'outlined'}
                  startIcon={<Download />}
                  onClick={() => handleExportFormatSelect('excel')}
                  disabled={exporting}
                >
                  Export as Excel
                </Button>
                <Button
                  variant={selectedExportFormat === 'csv' ? 'contained' : 'outlined'}
                  startIcon={<Download />}
                  onClick={() => handleExportFormatSelect('csv')}
                  disabled={exporting}
                >
                  Export as CSV
                </Button>
              </Stack>
              {exporting && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Exporting...
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setExportDialogOpen(false);
                  setSelectedExportFormat(null);
                }}
                disabled={exporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportConfirm}
                variant="contained"
                disabled={!selectedExportFormat || exporting}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Share Dialog */}
          <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
            <DialogTitle>Share Report</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Share this report with your team:
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShareLink}
                  fullWidth
                >
                  Copy Link
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleShareEmail}
                  fullWidth
                >
                  Share via Email
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default Reports;

