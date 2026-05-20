import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Menu,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Receipt,
  AttachMoney,
  CloudUpload,
  Download,
  AccountBalance,
  TrendingUp,
  Edit,
  Delete,
  FileDownload,
  Assessment,
  Visibility,
  CheckCircle,
  Search,
  CameraAlt,
  LocalGasStation,
  UploadFile,
  TableChart,
  PictureAsPdf,
  Description,
  GetApp,
  ArrowUpward,
  ArrowDownward,
  BookOnline,
  AddCircle,
  RemoveCircle,
  Save,
  ReceiptLong,
  Send,
  Print,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { tabA11yProps, tabPanelA11yProps } from '../../utils/tabA11y';
import FeatureGuard from '../../components/FeatureGuard';
import { formatZAR } from '../../utils/currency';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { invoiceTemplates, quoteTemplates, getDefaultCompanyInfo, TemplateData } from '../../utils/invoiceTemplates';
import { downloadPDF, previewHTML } from '../../utils/pdfGenerator';
import {
  buildAutoHeaderMapping,
  detectCsvDelimiter,
  getMissingRequiredMappings,
  mapImportRows,
  parseCsvLine,
  stripBom,
} from '../../utils/expenseImport';
// No longer need mock data utilities

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  project: string;
  description: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  mileage?: number;
  liters?: number;
  pricePerLiter?: number;
  location?: string;
  imported?: boolean;
}

interface Budget {
  project: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'good' | 'warning' | 'critical';
}

interface ExpenseStats {
  totalExpenses: number;
  pendingApproval: number;
  thisMonth: number;
  lastMonth: number;
}

interface ImportData {
  type: 'expenses';
  data: any[];
  headers: string[];
  mappedHeaders: Record<string, string>;
}

interface ImportStep {
  label: string;
  description: string;
  completed: boolean;
}

interface CashbookEntry {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  reference?: string;
  balance?: number;
  receiptUrl?: string;
}

interface CashbookStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  entriesCount: number;
}

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  expiryDate: string;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  terms?: string;
  convertedToInvoice?: boolean;
  invoiceId?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed';
  paymentDate?: string;
  amountPaid: number;
  notes?: string;
  terms?: string;
  quoteId?: string;
}

interface InvoicingStats {
  totalQuotes: number;
  totalInvoices: number;
  pendingPayments: number;
  totalRevenue: number;
  overdueInvoices: number;
}

// Custom TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const EXPENSE_TAB_PREFIX = 'expense';

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...tabPanelA11yProps(index, EXPENSE_TAB_PREFIX)}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return tabA11yProps(index, EXPENSE_TAB_PREFIX);
}

const ExpenseTracking: React.FC = () => {
  const { addNotification } = useNotifications();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Existing expense tracking state
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [budgetsList, setBudgetsList] = useState<Budget[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    pendingApproval: 0,
    thisMonth: 0,
    lastMonth: 0
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Materials',
    project: '',
    receiptFile: null as File | null,
  });
  const [viewExpenseOpen, setViewExpenseOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  // @ts-ignore - Used via setter functions
  const [importPreview, setImportPreview] = useState<any[]>([]);
  // @ts-ignore - Used via setter functions
  const [importComplete, setImportComplete] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'project'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Import state
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [importStep, setImportStep] = useState(0);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [batchSize] = useState(50);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [validationResults, setValidationResults] = useState<{ valid: any[], invalid: any[], errors: string[] } | null>(null);

  // Export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exportProgress, setExportProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Cashbook state
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [cashbookStats, setCashbookStats] = useState<CashbookStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    entriesCount: 0
  });
  const [addCashbookEntryOpen, setAddCashbookEntryOpen] = useState(false);
  const [newCashbookEntry, setNewCashbookEntry] = useState({
    description: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General',
    reference: '',
    receiptFile: null as File | null,
  });
  const [selectedCashbookEntry, setSelectedCashbookEntry] = useState<CashbookEntry | null>(null);
  const [viewCashbookEntryOpen, setViewCashbookEntryOpen] = useState(false);
  const [editCashbookMode, setEditCashbookMode] = useState(false);
  const [editedCashbookEntry, setEditedCashbookEntry] = useState<CashbookEntry | null>(null);

  // Cashbook import state
  const [cashbookImportDialogOpen, setCashbookImportDialogOpen] = useState(false);
  const [cashbookImportFile, setCashbookImportFile] = useState<File | null>(null);
  const [cashbookImportData, setCashbookImportData] = useState<ImportData | null>(null);
  const [cashbookImportStep, setCashbookImportStep] = useState(0);
  const [cashbookHeaderMapping, setCashbookHeaderMapping] = useState<Record<string, string>>({});
  const [cashbookImporting, setCashbookImporting] = useState(false);
  const [cashbookPreviewData, setCashbookPreviewData] = useState<any[]>([]);
  const [cashbookImportProgress, setCashbookImportProgress] = useState(0);
  const [cashbookImportError, setCashbookImportError] = useState<string | null>(null);
  const [cashbookValidationResults, setCashbookValidationResults] = useState<{ valid: any[], invalid: any[], errors: string[] } | null>(null);

  // Invoicing state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicingStats, setInvoicingStats] = useState<InvoicingStats>({
    totalQuotes: 0,
    totalInvoices: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    overdueInvoices: 0,
  });
  
  // Quote form state
  const [addQuoteOpen, setAddQuoteOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    terms: 'Payment due within 30 days of acceptance.',
    vatRate: 15,
  });
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  
  // Invoice form state
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    terms: 'Payment due within 30 days.',
    vatRate: 15,
  });
  const [invoiceItems, setInvoiceItems] = useState<QuoteItem[]>([]);
  
  // View/Edit state for quotes and invoices
  // @ts-ignore - Used via setter functions
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  // @ts-ignore - Used via setter functions
  const [viewQuoteOpen, setViewQuoteOpen] = useState(false);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  // @ts-ignore - Used via setter functions
  const [editQuoteMode, setEditQuoteMode] = useState(false);
  const [editInvoiceMode, setEditInvoiceMode] = useState(false);
  // @ts-ignore - Used via setter functions
  const [editedQuote, setEditedQuote] = useState<Quote | null>(null);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  
  // Convert quote to invoice state
  const [convertQuoteOpen, setConvertQuoteOpen] = useState(false);
  const [quoteToConvert, setQuoteToConvert] = useState<Quote | null>(null);

  // Template selection state
  const [selectedQuoteTemplate, setSelectedQuoteTemplate] = useState('modern-blue');
  const [selectedInvoiceTemplate, setSelectedInvoiceTemplate] = useState('modern-blue');

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Cashbook handlers
  const handleAddCashbookEntry = () => {
    setAddCashbookEntryOpen(true);
  };

  const handleCashbookInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any) => {
    setNewCashbookEntry(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCashbookFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewCashbookEntry(prev => ({
        ...prev,
        receiptFile: event.target.files![0]
      }));
    }
  };

  const handleSaveCashbookEntry = () => {
    // Validate required fields
    if (!newCashbookEntry.description || !newCashbookEntry.amount) {
      addNotification(createNotification.system('Validation Error', 'Please fill in all required fields', 'medium'));
      return;
    }

    const amount = parseFloat(newCashbookEntry.amount);
    const runningBalance = cashbookStats.netBalance + (newCashbookEntry.type === 'income' ? amount : -amount);

    // Create new cashbook entry
    const entry: CashbookEntry = {
      id: Date.now().toString(),
      date: newCashbookEntry.date,
      description: newCashbookEntry.description,
      type: newCashbookEntry.type,
      amount: amount,
      category: newCashbookEntry.category,
      reference: newCashbookEntry.reference,
      balance: runningBalance,
      receiptUrl: newCashbookEntry.receiptFile ? URL.createObjectURL(newCashbookEntry.receiptFile) : undefined,
    };

    // Update cashbook entries
    setCashbookEntries(prev => [entry, ...prev]);

    // Update cashbook stats
    setCashbookStats(prev => ({
      totalIncome: prev.totalIncome + (entry.type === 'income' ? amount : 0),
      totalExpenses: prev.totalExpenses + (entry.type === 'expense' ? amount : 0),
      netBalance: runningBalance,
      entriesCount: prev.entriesCount + 1,
    }));

    // Reset form and close dialog
    setNewCashbookEntry({
      description: '',
      type: 'expense',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      reference: '',
      receiptFile: null,
    });
    setAddCashbookEntryOpen(false);
    
    addNotification(createNotification.system('Entry Added', 'Cashbook entry added successfully', 'medium'));
  };

  const handleViewCashbookEntry = (entry: CashbookEntry) => {
    setSelectedCashbookEntry(entry);
    setEditedCashbookEntry({ ...entry });
    setEditCashbookMode(false);
    setViewCashbookEntryOpen(true);
  };

  const handleEditCashbookEntry = () => {
    setEditCashbookMode(true);
  };

  const handleUpdateCashbookEntry = () => {
    if (!editedCashbookEntry || !selectedCashbookEntry) return;

    // Update cashbook entries list
    setCashbookEntries(prev => prev.map(entry => 
      entry.id === selectedCashbookEntry.id ? editedCashbookEntry : entry
    ));

    // Recalculate stats if amount or type changed
    if (editedCashbookEntry.amount !== selectedCashbookEntry.amount || 
        editedCashbookEntry.type !== selectedCashbookEntry.type) {
      
      // Remove old entry impact
      const oldAmount = selectedCashbookEntry.amount;
      const newAmount = editedCashbookEntry.amount;
      
      setCashbookStats(prev => {
        let newStats = { ...prev };
        
        // Remove old entry
        if (selectedCashbookEntry.type === 'income') {
          newStats.totalIncome -= oldAmount;
        } else {
          newStats.totalExpenses -= oldAmount;
        }
        
        // Add new entry
        if (editedCashbookEntry.type === 'income') {
          newStats.totalIncome += newAmount;
        } else {
          newStats.totalExpenses += newAmount;
        }
        
        newStats.netBalance = newStats.totalIncome - newStats.totalExpenses;
        
        return newStats;
      });
    }

    setEditCashbookMode(false);
    setViewCashbookEntryOpen(false);
    setSelectedCashbookEntry(null);
    setEditedCashbookEntry(null);
    
    addNotification(createNotification.system('Entry Updated', 'Cashbook entry updated successfully', 'medium'));
  };

  // Import steps
  const importSteps: ImportStep[] = [
    { label: 'Select File', description: 'Choose your Excel, CSV, or PDF file', completed: false },
    { label: 'Map Headers', description: 'Map your file headers to system fields', completed: false },
    { label: 'Preview & Validate', description: 'Review and validate your data', completed: false },
    { label: 'Import Data', description: 'Import the expenses into the system', completed: false },
  ];

  const handleAddExpense = () => {
    setAddExpenseOpen(true);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const getBudgetStatus = (budget: Budget): 'good' | 'warning' | 'critical' => {
    const percentageUsed = (budget.spent / budget.allocated) * 100;
    if (percentageUsed >= 90) return 'critical';
    if (percentageUsed >= 75) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getBudgetStatusColor = (status: string): 'success' | 'warning' | 'error' | 'primary' => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'primary';
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any) => {
    setNewExpense(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewExpense(prev => ({
        ...prev,
        receiptFile: event.target.files![0]
      }));
    }
  };

  const handleSaveExpense = () => {
    // Validate required fields
    if (!newExpense.description || !newExpense.amount || !newExpense.project) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new expense object
    const expense: Expense = {
      id: Date.now().toString(), // In production, this would come from the backend
      date: newExpense.date,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      project: newExpense.project,
      description: newExpense.description,
      status: 'pending',
      receiptUrl: newExpense.receiptFile ? URL.createObjectURL(newExpense.receiptFile) : undefined,
    };

    // Update expenses state
    setExpensesList(prev => [expense, ...prev]);

    // Update budget
    const updatedBudgets = budgetsList.map(budget => {
      if (budget.project === expense.project) {
        return {
          ...budget,
          spent: budget.spent + expense.amount,
          remaining: budget.allocated - (budget.spent + expense.amount),
          status: getBudgetStatus({ ...budget, spent: budget.spent + expense.amount })
        };
      }
      return budget;
    });
    setBudgetsList(updatedBudgets);

    // Update stats
    const updatedStats = {
      ...stats,
      totalExpenses: stats.totalExpenses + expense.amount,
      pendingApproval: stats.pendingApproval + expense.amount,
      thisMonth: stats.thisMonth + expense.amount,
    };
    setStats(updatedStats);

    // Reset form and close dialog
    setNewExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Materials',
      project: budgetsList[0]?.project || '',
      receiptFile: null,
    });
    setAddExpenseOpen(false);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditedExpense({ ...expense });
    setEditMode(false);
    setViewExpenseOpen(true);
  };

  const handleEditExpense = () => {
    if (!selectedExpense || selectedExpense.status !== 'pending') return;
    setEditMode(true);
  };

  const handleUpdateExpense = () => {
    if (!editedExpense || !selectedExpense) return;

    // Update expenses list
    setExpensesList(prev => prev.map(exp => 
      exp.id === selectedExpense.id ? editedExpense : exp
    ));

    // Update budgets if amount changed
    if (editedExpense.amount !== selectedExpense.amount) {
      const amountDiff = editedExpense.amount - selectedExpense.amount;
      setBudgetsList(prev => prev.map(budget => {
        if (budget.project === editedExpense?.project) {
          const newSpent = budget.spent + amountDiff;
          return {
            ...budget,
            spent: newSpent,
            remaining: budget.allocated - newSpent,
            status: getBudgetStatus({ ...budget, spent: newSpent })
          };
        }
        return budget;
      }));
    }

    setEditMode(false);
    setViewExpenseOpen(false);
    setSelectedExpense(null);
    setEditedExpense(null);
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
    setImportFile(null);
    setImportPreview([]);
    setImportProgress(0);
    setImportComplete(false);
    setImportError(null);
    setImportStep(0);
    setImportData(null);
    setHeaderMapping({});
    setPreviewData([]);
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImportFile(file);
      setImportError(null);
      
      try {
        let parsedData: any[] = [];
        let headers: string[] = [];

        if (file.name.endsWith('.csv')) {
          const text = stripBom(await file.text());
          const lines = text.split(/\r?\n/).filter((line) => line.trim());
          if (lines.length < 2) {
            setImportError('CSV file must include a header row and at least one data row.');
            return;
          }
          const delimiter = detectCsvDelimiter(lines[0]);
          headers = parseCsvLine(lines[0], delimiter);
          parsedData = lines.slice(1).map((line) => {
            const values = parseCsvLine(line, delimiter);
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] ?? '';
            });
            return row;
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Mock Excel parsing - in real implementation, use xlsx library
          // Generate larger dataset for testing
          const mockData = [];
          for (let i = 0; i < 150; i++) {
            mockData.push({
              date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              amount: (Math.random() * 5000 + 100).toFixed(2),
              category: ['Petrol', 'Materials', 'Equipment', 'Labor', 'Other'][Math.floor(Math.random() * 5)],
              description: `Expense item ${i + 1} - ${['Fuel', 'Office supplies', 'Tools', 'Services', 'Misc'][Math.floor(Math.random() * 5)]}`,
              mileage: Math.floor(Math.random() * 1000),
              liters: (Math.random() * 100).toFixed(2),
              pricePerLiter: (Math.random() * 20 + 10).toFixed(2),
              location: `Location ${i + 1}`,
              project: ['Downtown Project', 'Harbor Site', 'City Center', 'Suburban Development'][Math.floor(Math.random() * 4)]
            });
          }
          headers = Object.keys(mockData[0]);
          parsedData = mockData;
        } else if (file.name.endsWith('.pdf')) {
          // Mock PDF parsing - in real implementation, use pdf-parse library
          const mockData = [];
          for (let i = 0; i < 120; i++) {
            mockData.push({
              date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              amount: (Math.random() * 3000 + 200).toFixed(2),
              category: ['Petrol', 'Materials', 'Equipment', 'Labor', 'Other'][Math.floor(Math.random() * 5)],
              description: `PDF Expense ${i + 1} - ${['Fuel', 'Office supplies', 'Tools', 'Services', 'Misc'][Math.floor(Math.random() * 5)]}`,
              mileage: Math.floor(Math.random() * 800),
              liters: (Math.random() * 80).toFixed(2),
              pricePerLiter: (Math.random() * 18 + 12).toFixed(2),
              location: `PDF Location ${i + 1}`,
              project: ['Downtown Project', 'Harbor Site', 'City Center', 'Suburban Development'][Math.floor(Math.random() * 4)]
            });
          }
          headers = Object.keys(mockData[0]);
          parsedData = mockData;
        } else {
          setImportError('Unsupported file format. Please upload a CSV, Excel (.xlsx/.xls), or PDF file.');
          return;
        }

        // Set data statistics
        setTotalRecords(parsedData.length);
        setTotalBatches(Math.ceil(parsedData.length / batchSize));
        setCurrentBatch(0);
        setImportedCount(0);

        const autoMapping = buildAutoHeaderMapping(headers);

        setImportData({
          type: 'expenses',
          data: parsedData,
          headers,
          mappedHeaders: autoMapping
        });
        setHeaderMapping(autoMapping);
        setPreviewData(parsedData.slice(0, 5)); // Show first 5 rows for preview
        setImportStep(1);
        
        addNotification(createNotification.system('File uploaded successfully', `File contains ${parsedData.length} records. Headers have been auto-mapped.`));
      } catch (error) {
        setImportError('Error parsing file. Please ensure the file format is correct.');
        console.error('Import error:', error);
      }
    }
  };

  const validateExpenseData = (data: any[]): { valid: any[], invalid: any[], errors: string[] } => {
    const valid: any[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Required fields validation
      if (!row.date) rowErrors.push('Date is required');
      if (!row.amount || isNaN(parseFloat(row.amount))) rowErrors.push('Valid amount is required');
      if (!row.description) rowErrors.push('Description is required');
      
      if (row.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(row.date))) {
        rowErrors.push('Date must be YYYY-MM-DD (or use a recognizable date format in your file)');
      }
      
      // Amount validation
      if (row.amount && parseFloat(row.amount) <= 0) {
        rowErrors.push('Amount must be greater than 0');
      }

      if (rowErrors.length > 0) {
        invalid.push({ ...row, rowIndex: index + 1, errors: rowErrors });
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      } else {
        valid.push(row);
      }
    });

    return { valid, invalid, errors };
  };

  const processBatch = async (data: any[], startIndex: number, endIndex: number): Promise<Expense[]> => {
    const batch = data.slice(startIndex, endIndex);
    const expenses: Expense[] = [];

    for (const expenseData of batch) {
      // Simulate processing delay for large datasets
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const newExpense: Expense = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        date: expenseData.date,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category || 'Other',
        project: expenseData.project || '',
        description: expenseData.description,
        status: 'pending',
        mileage: expenseData.mileage ? parseFloat(expenseData.mileage) : undefined,
        liters: expenseData.liters ? parseFloat(expenseData.liters) : undefined,
        pricePerLiter: expenseData.pricePerLiter ? parseFloat(expenseData.pricePerLiter) : undefined,
        location: expenseData.location,
        imported: true,
      };

      expenses.push(newExpense);
    }

    return expenses;
  };

  const handleImportExpenses = async () => {
    if (!importData) return;
    
    setImporting(true);
    setImportProgress(0);
    setCurrentBatch(0);
    setImportedCount(0);
    
    try {
      const missingMaps = getMissingRequiredMappings(headerMapping);
      if (missingMaps.length > 0) {
        setImportError(
          `Please map these required columns before importing: ${missingMaps.join(', ')}.`
        );
        setImporting(false);
        return;
      }

      const mappedData = mapImportRows(importData.data, headerMapping);

      const validation = validateExpenseData(mappedData);
      setValidationResults(validation);
      
      if (validation.invalid.length > 0) {
        const unmappedHint =
          missingMaps.length === 0 && validation.invalid.length === importData.data.length
            ? ' Check that your column headers match Date, Amount, and Description (or map them in Field Mapping).'
            : '';
        setImportError(
          `Validation failed: ${validation.errors.slice(0, 3).join('; ')}${
            validation.errors.length > 3 ? '...' : ''
          }${unmappedHint}`
        );
        setImporting(false);
        return;
      }

      // Process data in batches
      const validData = validation.valid;
      const totalValidRecords = validData.length;
      const totalBatchesToProcess = Math.ceil(totalValidRecords / batchSize);
      let totalImported = 0;

      for (let batchIndex = 0; batchIndex < totalBatchesToProcess; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalValidRecords);
        
        setCurrentBatch(batchIndex + 1);
        
        // Process current batch
        const batchExpenses = await processBatch(validData, startIndex, endIndex);
        
        // Add batch to expenses list
        setExpensesList(prev => [...batchExpenses, ...prev]);
        
        totalImported += batchExpenses.length;
        setImportedCount(totalImported);
        
        // Update progress
        const progress = ((batchIndex + 1) / totalBatchesToProcess) * 100;
        setImportProgress(progress);
        
        // Small delay between batches to prevent UI blocking
        if (batchIndex < totalBatchesToProcess - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setImportComplete(true);
      setImportStep(3);
      
      addNotification(createNotification.system('Import completed', `Successfully imported ${totalImported} expenses in ${totalBatchesToProcess} batches.`));
      
      // Close dialog after delay
      setTimeout(() => {
        setImportDialogOpen(false);
        setImporting(false);
        setImportComplete(false);
        setImportStep(0);
        setValidationResults(null);
      }, 3000);
      
    } catch (error) {
      setImportError('Error during import. Please try again.');
      setImporting(false);
      console.error('Import error:', error);
    }
  };

  const handleExportFormatSelect = (format: 'excel' | 'csv' | 'pdf') => {
    setExportFormat(format);
    setExportMenuAnchor(null);
    setExportDialogOpen(true);
  };

  const handleExportExpenses = async () => {
    if (expensesList.length === 0) {
      addNotification(createNotification.system('No data to export', 'There are no expenses to export.'));
      return;
    }

    setExporting(true);
    setExportProgress(0);

    try {
      // Prepare data for export
      const exportData = expensesList.map(expense => ({
        'Date': expense.date,
        'Amount': expense.amount,
        'Category': expense.category,
        'Project': expense.project,
        'Description': expense.description,
        'Status': expense.status,
        'Mileage': expense.mileage || '',
        'Liters': expense.liters || '',
        'Price per Liter': expense.pricePerLiter || '',
        'Location': expense.location || '',
        'Imported': expense.imported ? 'Yes' : 'No',
      }));

      // Simulate export process
      const totalSteps = 3;
      for (let i = 0; i < totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress(((i + 1) / totalSteps) * 100);
      }

      // Create and download file
      let content = '';
      let filename = `expenses_${new Date().toISOString().split('T')[0]}`;

      if (exportFormat === 'csv') {
        const headers = Object.keys(exportData[0]);
        content = headers.join(',') + '\n';
        content += exportData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        ).join('\n');
        filename += '.csv';
      } else if (exportFormat === 'excel') {
        // In real implementation, use xlsx library
        const headers = Object.keys(exportData[0]);
        content = headers.join('\t') + '\n';
        content += exportData.map(row => 
          headers.map(header => row[header as keyof typeof row]).join('\t')
        ).join('\n');
        filename += '.xlsx';
      } else if (exportFormat === 'pdf') {
        // In real implementation, use jsPDF library
        content = 'PDF content would be generated here';
        filename += '.pdf';
      }

      // Create download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExporting(false);
      setExportDialogOpen(false);
      
      addNotification(createNotification.system('Export completed', `Expenses exported successfully as ${exportFormat.toUpperCase()}.`));
      
    } catch (error) {
      setExporting(false);
      addNotification(createNotification.system('Export failed', 'Error occurred during export.'));
      console.error('Export error:', error);
    }
  };

  const downloadTemplate = (format: 'excel' | 'csv' | 'pdf') => {
    // Cashbook template data with dummy content
    const cashbookTemplateData = [
      {
        date: '2024-01-15',
        description: 'Office supplies purchase',
        type: 'expense',
        amount: '250.00',
        category: 'Office Supplies',
        reference: 'INV-001'
      },
      {
        date: '2024-01-16',
        description: 'Client payment received',
        type: 'income',
        amount: '5000.00',
        category: 'Sales',
        reference: 'PAY-001'
      },
      {
        date: '2024-01-17',
        description: 'Internet bill payment',
        type: 'expense',
        amount: '450.00',
        category: 'Utilities',
        reference: 'UTIL-001'
      },
      {
        date: '2024-01-18',
        description: 'Consulting fee received',
        type: 'income',
        amount: '3000.00',
        category: 'Services',
        reference: 'CON-001'
      },
      {
        date: '2024-01-19',
        description: 'Marketing materials',
        type: 'expense',
        amount: '800.00',
        category: 'Marketing',
        reference: 'MKT-001'
      },
      {
        date: '2024-01-20',
        description: 'Equipment maintenance',
        type: 'expense',
        amount: '1200.00',
        category: 'Maintenance',
        reference: 'MAINT-001'
      },
      {
        date: '2024-01-21',
        description: 'Service fee received',
        type: 'income',
        amount: '1500.00',
        category: 'Services',
        reference: 'SRV-001'
      },
      {
        date: '2024-01-22',
        description: 'Travel expenses',
        type: 'expense',
        amount: '750.00',
        category: 'Travel',
        reference: 'TRV-001'
      }
    ];

    const templateData = {
      excel: 'cashbook-template.xlsx',
      csv: 'cashbook-template.csv',
      pdf: 'cashbook-template.pdf'
    };
    
    if (format === 'csv') {
      // Generate CSV content with field requirements header
      const headers = ['date', 'description', 'type', 'amount', 'category', 'reference'];
      const csvContent = [
        '# CASHBOOK TEMPLATE - IMPORT FORMAT',
        '# Required Fields: Date, Description, Amount, and Type must be mapped to proceed',
        '# Category and Reference are optional',
        '#',
        '# Field Descriptions:',
        '# - date: Format YYYY-MM-DD (e.g., 2024-01-15)',
        '# - description: Transaction description',
        '# - type: Must be either "income" or "expense"',
        '# - amount: Numeric value (e.g., 250.00)',
        '# - category: Transaction category (optional)',
        '# - reference: Reference number or code (optional)',
        '#',
        headers.join(','),
        ...cashbookTemplateData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n');
      
    const link = document.createElement('a');
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    link.download = templateData[format];
    link.click();
    } else if (format === 'excel') {
      // For Excel, we'll create a CSV that can be opened in Excel
      const headers = ['date', 'description', 'type', 'amount', 'category', 'reference'];
      const csvContent = [
        '# CASHBOOK TEMPLATE - IMPORT FORMAT',
        '# Required Fields: Date, Description, Amount, and Type must be mapped to proceed',
        '# Category and Reference are optional',
        '#',
        '# Field Descriptions:',
        '# - date: Format YYYY-MM-DD (e.g., 2024-01-15)',
        '# - description: Transaction description',
        '# - type: Must be either "income" or "expense"',
        '# - amount: Numeric value (e.g., 250.00)',
        '# - category: Transaction category (optional)',
        '# - reference: Reference number or code (optional)',
        '#',
        headers.join(','),
        ...cashbookTemplateData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n');
      
      const link = document.createElement('a');
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
      link.download = templateData[format].replace('.xlsx', '.csv');
      link.click();
    } else if (format === 'pdf') {
      // For PDF, create a simple text representation
      const pdfContent = `CASHBOOK TEMPLATE - IMPORT FORMAT

This template shows the correct format for importing cashbook entries.

FIELD REQUIREMENTS:
==================

REQUIRED FIELDS (must be mapped to proceed):
- Date: Format YYYY-MM-DD (e.g., 2024-01-15)
- Description: Transaction description
- Amount: Numeric value (e.g., 250.00)
- Type: Must be either 'income' or 'expense'

OPTIONAL FIELDS:
- Category: Transaction category
- Reference: Reference number or code

SAMPLE DATA:
============
${cashbookTemplateData.map((row, index) => 
  `${index + 1}. Date: ${row.date}, Description: ${row.description}, Type: ${row.type}, Amount: ${row.amount}, Category: ${row.category}, Reference: ${row.reference}`
).join('\n')}

IMPORT INSTRUCTIONS:
===================
1. Replace the sample data with your actual transactions
2. Ensure dates are in YYYY-MM-DD format
3. Type must be exactly 'income' or 'expense'
4. Amounts should be numeric values
5. Required fields (Date, Description, Amount, Type) must be mapped to proceed
6. Category and Reference are optional but recommended
7. Save as CSV format for import
8. Upload the file using the Import Cashbook Entries feature

For best results, use the CSV template format.`;
      
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(pdfContent)}`;
      link.download = templateData[format].replace('.pdf', '.txt');
      link.click();
    }
    
    addNotification(createNotification.system('Template downloaded', `${format.toUpperCase()} cashbook template downloaded successfully.`));
  };

  const handleSortChange = (newSortBy: 'date' | 'amount' | 'category' | 'project') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default order
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'amount' ? 'desc' : 'asc'); // Amount defaults to desc (highest first)
    }
  };

  const filteredExpenses = expensesList
    .filter(expense => {
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesSearch = searchQuery === '' || 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.project.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'project':
          aValue = a.project.toLowerCase();
          bValue = b.project.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Cashbook import handlers
  const handleCashbookImportClick = () => {
    setCashbookImportDialogOpen(true);
    setCashbookImportFile(null);
    setCashbookImportStep(0);
    setCashbookImportData(null);
    setCashbookHeaderMapping({});
    setCashbookImporting(false);
    setCashbookPreviewData([]);
    setCashbookImportProgress(0);
    setCashbookImportError(null);
    setCashbookValidationResults(null);
  };

  const handleCashbookImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCashbookImportFile(file);
      setCashbookImportError(null);
      
      try {
        let parsedData: any[] = [];
        let headers: string[] = [];

        if (file.name.endsWith('.csv')) {
          const text = stripBom(await file.text());
          const lines = text.split(/\r?\n/).filter((line) => line.trim());
          if (lines.length < 2) {
            setCashbookImportError('CSV file must include a header row and at least one data row.');
            return;
          }
          const delimiter = detectCsvDelimiter(lines[0]);
          headers = parseCsvLine(lines[0], delimiter);
          parsedData = lines.slice(1).map((line) => {
            const values = parseCsvLine(line, delimiter);
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] ?? '';
            });
            return row;
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const mockData = [];
          for (let i = 0; i < 100; i++) {
            mockData.push({
              date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              description: `Transaction ${i + 1} - ${['Payment received', 'Office supplies', 'Utilities', 'Service fee', 'Equipment purchase'][Math.floor(Math.random() * 5)]}`,
              type: ['income', 'expense'][Math.floor(Math.random() * 2)],
              amount: (Math.random() * 2000 + 50).toFixed(2),
              category: ['General', 'Sales', 'Services', 'Office', 'Marketing', 'Travel', 'Utilities'][Math.floor(Math.random() * 7)],
              reference: `REF${String(i + 1).padStart(4, '0')}`,
            });
          }
          headers = Object.keys(mockData[0]);
          parsedData = mockData;
        } else if (file.name.endsWith('.pdf')) {
          // Mock PDF parsing - in real implementation, use pdf-parse library
          const mockData = [];
          for (let i = 0; i < 80; i++) {
            mockData.push({
              date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              description: `PDF Entry ${i + 1} - ${['Invoice payment', 'Receipt', 'Bank transfer', 'Cash deposit'][Math.floor(Math.random() * 4)]}`,
              type: ['income', 'expense'][Math.floor(Math.random() * 2)],
              amount: (Math.random() * 1500 + 25).toFixed(2),
              category: ['General', 'Sales', 'Office', 'Other'][Math.floor(Math.random() * 4)],
              reference: `PDF${String(i + 1).padStart(3, '0')}`,
            });
          }
          headers = Object.keys(mockData[0]);
          parsedData = mockData;
        }

        const cashbookAutoMapping = buildAutoHeaderMapping(headers);

        setCashbookImportData({
          type: 'expenses',
          data: parsedData,
          headers: headers,
          mappedHeaders: cashbookAutoMapping,
        });
        setCashbookHeaderMapping(cashbookAutoMapping);

        setCashbookImportStep(1);
      } catch (error) {
        setCashbookImportError('Failed to parse file. Please check the file format and try again.');
      }
    }
  };

  const handleCashbookPreviewData = () => {
    if (!cashbookImportData) return;

    const allMappedData = mapImportRows(cashbookImportData.data, cashbookHeaderMapping);

    // Get first 5 rows for preview display
    const previewData = allMappedData.slice(0, 5);
    setCashbookPreviewData(previewData);

    // Validate all mapped data
    const validation = validateCashbookData(allMappedData);
    setCashbookValidationResults(validation);

    // Move to preview step
    setCashbookImportStep(2);
  };

  const validateCashbookData = (data: any[]): { valid: any[], invalid: any[], errors: string[] } => {
    const valid: any[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];

      // Validate required fields
      if (!row.description || row.description.trim() === '') {
        rowErrors.push(`Row ${index + 1}: Description is required`);
      }
      if (!row.amount || isNaN(parseFloat(row.amount))) {
        rowErrors.push(`Row ${index + 1}: Valid amount is required`);
      }
      if (!row.type || !['income', 'expense'].includes(row.type.toLowerCase())) {
        rowErrors.push(`Row ${index + 1}: Type must be 'income' or 'expense'`);
      }
      if (!row.date || isNaN(Date.parse(row.date))) {
        rowErrors.push(`Row ${index + 1}: Valid date is required`);
      }

      if (rowErrors.length > 0) {
        invalid.push({ ...row, rowIndex: index + 1, errors: rowErrors });
        errors.push(...rowErrors);
      } else {
        valid.push(row);
      }
    });

    return { valid, invalid, errors };
  };

  const processCashbookBatch = async (data: any[], startIndex: number, endIndex: number): Promise<CashbookEntry[]> => {
    const batch = data.slice(startIndex, endIndex);
    const entries: CashbookEntry[] = [];

    batch.forEach((row, index) => {
      const amount = parseFloat(row.amount);
      const currentBalance = cashbookStats.netBalance + (row.type.toLowerCase() === 'income' ? amount : -amount);
      
      const entry: CashbookEntry = {
        id: `import_${Date.now()}_${startIndex + index}`,
        date: row.date,
        description: row.description,
        type: row.type.toLowerCase() as 'income' | 'expense',
        amount: amount,
        category: row.category || 'General',
        reference: row.reference || '',
        balance: currentBalance,
      };
      entries.push(entry);
    });

    return entries;
  };

  const handleCashbookImportEntries = async () => {
    console.log('handleCashbookImportEntries called');
    console.log('cashbookImportData:', cashbookImportData);
    console.log('cashbookValidationResults:', cashbookValidationResults);
    
    if (!cashbookImportData || !cashbookValidationResults) {
      console.log('Missing required data for import');
      return;
    }

    setCashbookImporting(true);
    setCashbookImportProgress(0);
    setCashbookImportStep(3);

    try {
      // Use already validated data from preview step
      if (cashbookValidationResults.valid.length === 0) {
        console.log('No valid entries found to import');
        setCashbookImportError('No valid entries found to import.');
        setCashbookImporting(false);
        return;
      }
      
      console.log(`Starting import of ${cashbookValidationResults.valid.length} valid entries`);

      // Process in batches
      const batchSize = 20;
      const totalBatches = Math.ceil(cashbookValidationResults.valid.length / batchSize);
      let allEntries: CashbookEntry[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min(startIndex + batchSize, cashbookValidationResults.valid.length);
        
        const batchEntries = await processCashbookBatch(cashbookValidationResults.valid, startIndex, endIndex);
        allEntries = [...allEntries, ...batchEntries];
        
        setCashbookImportProgress(((i + 1) / totalBatches) * 100);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update cashbook entries and stats
      setCashbookEntries(prev => [...allEntries.reverse(), ...prev]);
      
      // Recalculate stats
      const newTotalIncome = allEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
      const newTotalExpenses = allEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      
      setCashbookStats(prev => ({
        totalIncome: prev.totalIncome + newTotalIncome,
        totalExpenses: prev.totalExpenses + newTotalExpenses,
        netBalance: prev.netBalance + (newTotalIncome - newTotalExpenses),
        entriesCount: prev.entriesCount + allEntries.length,
      }));

      addNotification(createNotification.system('Import Complete', `Successfully imported ${allEntries.length} cashbook entries`, 'medium'));
      setCashbookImportStep(4);
      
    } catch (error) {
      setCashbookImportError('Failed to import entries. Please try again.');
    } finally {
      setCashbookImporting(false);
    }
  };

  // Invoicing handlers
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const count = quotes.length + 1;
    return `QUO-${year}-${count.toString().padStart(4, '0')}`;
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(4, '0')}`;
  };

  const handleAddQuote = () => {
    setAddQuoteOpen(true);
  };

  const handleQuoteInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any) => {
    setNewQuote(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setQuoteItems(prev => [...prev, newItem]);
  };

  const handleQuoteItemChange = (id: string, field: string, value: any) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveQuoteItem = (id: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateQuoteTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (newQuote.vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const handleSaveQuote = () => {
    if (!newQuote.clientName || quoteItems.length === 0) {
      addNotification(createNotification.system('Validation Error', 'Please fill in client name and add at least one item', 'medium'));
      return;
    }

    const { subtotal, vatAmount, total } = calculateQuoteTotals();
    
    const quote: Quote = {
      id: Date.now().toString(),
      quoteNumber: generateQuoteNumber(),
      clientName: newQuote.clientName,
      clientEmail: newQuote.clientEmail,
      clientAddress: newQuote.clientAddress,
      date: newQuote.date,
      expiryDate: newQuote.expiryDate,
      items: [...quoteItems],
      subtotal,
      vatRate: newQuote.vatRate,
      vatAmount,
      total,
      status: 'draft',
      notes: newQuote.notes,
      terms: newQuote.terms,
    };

    setQuotes(prev => [quote, ...prev]);
    setInvoicingStats(prev => ({
      ...prev,
      totalQuotes: prev.totalQuotes + 1,
    }));

    // Reset form
    setNewQuote({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: 'Payment due within 30 days of acceptance.',
      vatRate: 15,
    });
    setQuoteItems([]);
    setAddQuoteOpen(false);
    
    addNotification(createNotification.system('Quote Created', 'Quote created successfully', 'medium'));
  };

  const handleAddInvoice = () => {
    setAddInvoiceOpen(true);
  };

  const handleInvoiceInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any) => {
    setNewInvoice(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddInvoiceItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoiceItems(prev => [...prev, newItem]);
  };

  const handleInvoiceItemChange = (id: string, field: string, value: any) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (newInvoice.vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const handleSaveInvoice = () => {
    if (!newInvoice.clientName || invoiceItems.length === 0) {
      addNotification(createNotification.system('Validation Error', 'Please fill in client name and add at least one item', 'medium'));
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals();
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      clientName: newInvoice.clientName,
      clientEmail: newInvoice.clientEmail,
      clientAddress: newInvoice.clientAddress,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      items: [...invoiceItems],
      subtotal,
      vatRate: newInvoice.vatRate,
      vatAmount,
      total,
      status: 'draft',
      paymentStatus: 'pending',
      amountPaid: 0,
      notes: newInvoice.notes,
      terms: newInvoice.terms,
    };

    setInvoices(prev => [invoice, ...prev]);
    setInvoicingStats(prev => ({
      ...prev,
      totalInvoices: prev.totalInvoices + 1,
      pendingPayments: prev.pendingPayments + total,
    }));

    // Reset form
    setNewInvoice({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: 'Payment due within 30 days.',
      vatRate: 15,
    });
    setInvoiceItems([]);
    setAddInvoiceOpen(false);
    
    addNotification(createNotification.system('Invoice Created', 'Invoice created successfully', 'medium'));
  };

  const handleConvertQuoteToInvoice = (quote: Quote) => {
    setQuoteToConvert(quote);
    setConvertQuoteOpen(true);
  };

  const handleConfirmConvertQuote = () => {
    if (!quoteToConvert) return;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      clientName: quoteToConvert.clientName,
      clientEmail: quoteToConvert.clientEmail,
      clientAddress: quoteToConvert.clientAddress,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [...quoteToConvert.items],
      subtotal: quoteToConvert.subtotal,
      vatRate: quoteToConvert.vatRate,
      vatAmount: quoteToConvert.vatAmount,
      total: quoteToConvert.total,
      status: 'draft',
      paymentStatus: 'pending',
      amountPaid: 0,
      notes: quoteToConvert.notes,
      terms: quoteToConvert.terms,
      quoteId: quoteToConvert.id,
    };

    // Update quote to mark as converted
    setQuotes(prev => prev.map(q => 
      q.id === quoteToConvert.id 
        ? { ...q, convertedToInvoice: true, invoiceId: invoice.id, status: 'accepted' as const }
        : q
    ));

    setInvoices(prev => [invoice, ...prev]);
    setInvoicingStats(prev => ({
      ...prev,
      totalInvoices: prev.totalInvoices + 1,
      pendingPayments: prev.pendingPayments + invoice.total,
    }));

    setConvertQuoteOpen(false);
    setQuoteToConvert(null);
    
    addNotification(createNotification.system('Quote Converted', 'Quote converted to invoice successfully', 'medium'));
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setEditedQuote({ ...quote });
    setEditQuoteMode(false);
    setViewQuoteOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditedInvoice({ ...invoice });
    setEditInvoiceMode(false);
    setViewInvoiceOpen(true);
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const handlePrintQuote = (quote: Quote) => {
    // Create a printable version of the quote
    const printContent = `
      <html>
        <head>
          <title>Quote ${quote.quoteNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .quote-details { margin-bottom: 20px; }
            .client-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .notes { margin-top: 30px; }
            .expiry-notice { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QUOTATION</h1>
            <h2>${quote.quoteNumber}</h2>
          </div>
          
          <div class="quote-details">
            <p><strong>Quote Date:</strong> ${new Date(quote.date).toLocaleDateString()}</p>
            <p><strong>Expiry Date:</strong> ${new Date(quote.expiryDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${quote.status.toUpperCase()}</p>
          </div>
          
          <div class="client-info">
            <h3>Quote For:</h3>
            <p><strong>${quote.clientName}</strong></p>
            ${quote.clientEmail ? `<p>${quote.clientEmail}</p>` : ''}
            ${quote.clientAddress ? `<p>${quote.clientAddress.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatZAR(item.unitPrice)}</td>
                  <td>${formatZAR(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal: ${formatZAR(quote.subtotal)}</strong></p>
            <p><strong>VAT (${quote.vatRate}%): ${formatZAR(quote.vatAmount)}</strong></p>
            <p style="font-size: 1.2em;"><strong>Total: ${formatZAR(quote.total)}</strong></p>
          </div>
          
          <div class="expiry-notice">
            <p><strong>Important:</strong> This quote is valid until ${new Date(quote.expiryDate).toLocaleDateString()}</p>
          </div>
          
          ${quote.notes ? `
            <div class="notes">
              <h4>Notes:</h4>
              <p>${quote.notes}</p>
            </div>
          ` : ''}
          
          ${quote.terms ? `
            <div class="notes">
              <h4>Terms & Conditions:</h4>
              <p>${quote.terms}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    addNotification(createNotification.system('Print Quote', 'Quote sent to printer', 'medium'));
  };

  const handleExportQuotePDF = async (quote: Quote) => {
    try {
      // Convert quote to template data format
      const companyInfo = getDefaultCompanyInfo();
      const templateData: TemplateData = {
        documentNumber: quote.quoteNumber,
        documentType: 'Quote',
        issueDate: quote.date,
        expiryDate: quote.expiryDate,
        status: quote.status,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        companyWebsite: companyInfo.companyWebsite,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientAddress: quote.clientAddress,
        items: quote.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        total: quote.total,
        notes: quote.notes,
        terms: quote.terms
      };

      // Generate and download PDF using selected template
      await downloadPDF(selectedQuoteTemplate, templateData, {
        filename: `quote-${quote.quoteNumber}.pdf`
      });
      
      addNotification(createNotification.system('PDF Export', 'Quote PDF exported successfully', 'medium'));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      addNotification(createNotification.system('Export Error', 'Failed to export quote PDF', 'high'));
    }
  };

  const handleSendQuote = (quote: Quote) => {
    setQuotes(prev => prev.map(q => 
      q.id === quote.id ? { ...q, status: 'sent' as const } : q
    ));
    addNotification(createNotification.system('Quote Sent', 'Quote sent to client successfully', 'medium'));
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(i => 
      i.id === invoice.id ? { ...i, status: 'sent' as const } : i
    ));
    addNotification(createNotification.system('Invoice Sent', 'Invoice sent to client successfully', 'medium'));
  };

  const handleEditInvoice = () => {
    setEditInvoiceMode(true);
  };

  const handleUpdateInvoice = () => {
    if (!editedInvoice || !selectedInvoice) return;

    setInvoices(prev => prev.map(invoice => 
      invoice.id === selectedInvoice.id ? editedInvoice : invoice
    ));

    setEditInvoiceMode(false);
    setViewInvoiceOpen(false);
    setSelectedInvoice(null);
    setEditedInvoice(null);
    
    addNotification(createNotification.system('Invoice Updated', 'Invoice updated successfully', 'medium'));
  };

  const handleExportInvoicePDF = async (invoice: Invoice) => {
    try {
      // Convert invoice to template data format
      const companyInfo = getDefaultCompanyInfo();
      const templateData: TemplateData = {
        documentNumber: invoice.invoiceNumber,
        documentType: 'Invoice',
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        companyWebsite: companyInfo.companyWebsite,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientAddress: invoice.clientAddress,
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        notes: invoice.notes,
        terms: invoice.terms
      };

      // Generate and download PDF using selected template
      await downloadPDF(selectedInvoiceTemplate, templateData, {
        filename: `invoice-${invoice.invoiceNumber}.pdf`
      });
      
      addNotification(createNotification.system('PDF Export', 'Invoice PDF exported successfully', 'medium'));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      addNotification(createNotification.system('Export Error', 'Failed to export invoice PDF', 'high'));
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Use template to generate printable content
    try {
      const companyInfo = getDefaultCompanyInfo();
      const templateData: TemplateData = {
        documentNumber: invoice.invoiceNumber,
        documentType: 'Invoice',
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        companyWebsite: companyInfo.companyWebsite,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientAddress: invoice.clientAddress,
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        notes: invoice.notes,
        terms: invoice.terms
      };

      // Use template to generate HTML and print
      previewHTML(selectedInvoiceTemplate, templateData);
      
      addNotification(createNotification.system('Print Invoice', 'Invoice sent to printer', 'medium'));
    } catch (error) {
      console.error('Error printing invoice:', error);
      addNotification(createNotification.system('Print Error', 'Failed to print invoice', 'high'));
    }
  };

  // Template selection handlers
  const handleTemplateChange = (type: 'quote' | 'invoice', templateId: string) => {
    if (type === 'quote') {
      setSelectedQuoteTemplate(templateId);
    } else {
      setSelectedInvoiceTemplate(templateId);
    }
  };

  const handlePreviewTemplate = (type: 'quote' | 'invoice', data: Quote | Invoice) => {
    const companyInfo = getDefaultCompanyInfo();
    
    const templateData: TemplateData = {
      documentNumber: type === 'quote' ? (data as Quote).quoteNumber : (data as Invoice).invoiceNumber,
      documentType: type === 'quote' ? 'Quote' : 'Invoice',
      issueDate: type === 'quote' ? (data as Quote).date : (data as Invoice).issueDate,
      dueDate: type === 'invoice' ? (data as Invoice).dueDate : undefined,
      expiryDate: type === 'quote' ? (data as Quote).expiryDate : undefined,
      status: data.status,
      companyName: companyInfo.companyName,
      companyAddress: companyInfo.companyAddress,
      companyEmail: companyInfo.companyEmail,
      companyPhone: companyInfo.companyPhone,
      companyWebsite: companyInfo.companyWebsite,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientAddress: data.clientAddress,
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal: data.subtotal,
      vatRate: data.vatRate,
      vatAmount: data.vatAmount,
      total: data.total,
      notes: data.notes,
      terms: data.terms
    };

    const templateId = type === 'quote' ? selectedQuoteTemplate : selectedInvoiceTemplate;
    previewHTML(templateId, templateData);
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="expenseTracking">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            color: 'white',
            pt: 4,
            pb: 6,
            px: 3,
            mb: 4,
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 700, mb: 1 }}>
              Financial Management
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Manage your expenses, track financial progress, and capture cashbook entries
            </Typography>

            {/* Dynamic Stats based on current tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#2196f3', mb: 1 }}>
                      <AccountBalance sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(stats.totalExpenses)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#2196f3', mb: 1 }}>
                      <Receipt sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {expensesList.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Receipts
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#2196f3', mb: 1 }}>
                      <TrendingUp sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {expensesList.filter(e => e.status === 'approved').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved Expenses
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#2196f3', mb: 1 }}>
                      <Assessment sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {expensesList.length > 0 ? ((expensesList.filter(e => e.status === 'approved').length / expensesList.length) * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approval Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Cashbook Stats */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#4caf50', mb: 1 }}>
                      <AddCircle sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(cashbookStats.totalIncome)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Income
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#f44336', mb: 1 }}>
                      <RemoveCircle sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(cashbookStats.totalExpenses)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: cashbookStats.netBalance >= 0 ? '#4caf50' : '#f44336', mb: 1 }}>
                      <AccountBalance sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(cashbookStats.netBalance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net Balance
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#2196f3', mb: 1 }}>
                      <BookOnline sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {cashbookStats.entriesCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Entries
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Invoicing Stats */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#9c27b0', mb: 1 }}>
                      <ReceiptLong sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {invoicingStats.totalQuotes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Quotes
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#3f51b5', mb: 1 }}>
                      <Receipt sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {invoicingStats.totalInvoices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Invoices
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#ff9800', mb: 1 }}>
                      <AttachMoney sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(invoicingStats.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Payments
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: '#4caf50', mb: 1 }}>
                      <TrendingUp sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                      {formatZAR(invoicingStats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: -4 }}>
          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="financial management tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2196f3',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  minHeight: 64,
                },
              }}
            >
              <Tab 
                label="Expense Tracking" 
                icon={<Receipt />} 
                iconPosition="start"
                {...a11yProps(0)}
                sx={{ 
                  '&.Mui-selected': {
                    color: '#2196f3',
                  },
                }}
              />
              <Tab 
                label="Capture Cashbook" 
                icon={<BookOnline />} 
                iconPosition="start"
                {...a11yProps(1)}
                sx={{ 
                  '&.Mui-selected': {
                    color: '#2196f3',
                  },
                }}
              />
              <Tab 
                label="Invoicing" 
                icon={<ReceiptLong />} 
                iconPosition="start"
                {...a11yProps(2)}
                sx={{ 
                  '&.Mui-selected': {
                    color: '#2196f3',
                  },
                }}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <CustomTabPanel value={tabValue} index={0}>
            {/* Expense Tracking Content */}
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<Receipt />}
                onClick={handleAddExpense}
                sx={{ borderRadius: 2 }}
              >
                Add Expense
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                onClick={handleImportClick}
                sx={{ borderRadius: 2 }}
              >
                Import Expenses
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportClick}
                sx={{ borderRadius: 2 }}
              >
                Export
              </Button>
            </Box>

          {/* Export Menu */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleExportClose}
            PaperProps={{
              sx: { borderRadius: 2, minWidth: 200 }
            }}
          >
            <MenuItem onClick={() => handleExportFormatSelect('excel')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChart color="primary" />
                <Box>
                  <Typography variant="body2">Export as Excel</Typography>
                  <Typography variant="caption" color="text.secondary">
                    .xlsx format
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleExportFormatSelect('csv')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Box>
                  <Typography variant="body2">Export as CSV</Typography>
                  <Typography variant="caption" color="text.secondary">
                    .csv format
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleExportFormatSelect('pdf')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PictureAsPdf color="primary" />
                <Box>
                  <Typography variant="body2">Export as PDF</Typography>
                  <Typography variant="caption" color="text.secondary">
                    .pdf format
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Menu>

          {/* Budget Overview Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {budgetsList.map((budget) => (
              <Grid item xs={12} md={6} key={budget.project}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{budget.project}</Typography>
                    <Chip
                      label={budget.status.toUpperCase()}
                      color={getBudgetStatusColor(budget.status)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(budget.spent / budget.allocated) * 100}
                      color={getBudgetStatusColor(budget.status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Allocated</Typography>
                      <Typography variant="h6">{formatZAR(budget.allocated)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Spent</Typography>
                      <Typography variant="h6">{formatZAR(budget.spent)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Remaining</Typography>
                      <Typography variant="h6">{formatZAR(budget.remaining)}</Typography>
                    </Grid>
                  </Grid>
                  {budget.status === 'warning' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Budget is 75% utilized. Consider reviewing expenses.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recent Expenses Section */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">Recent Expenses</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  sx={{ width: 200 }}
                />
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Filter by Project</InputLabel>
                  <Select label="Filter by Project" defaultValue="all">
                    <MenuItem value="all">All Projects</MenuItem>
                    {budgetsList.map((budget) => (
                      <MenuItem key={budget.project} value={budget.project}>
                        {budget.project}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select 
                    label="Filter by Category" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as string)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Materials">Materials</MenuItem>
                    <MenuItem value="Equipment">Equipment</MenuItem>
                    <MenuItem value="Labor">Labor</MenuItem>
                    <MenuItem value="Petrol">Petrol</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select 
                    label="Sort By" 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'date' | 'amount' | 'category' | 'project')}
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  startIcon={sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                </Button>
              </Box>
            </Box>
            <List>
              {filteredExpenses.map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ListItem
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {expense.category === 'Petrol' ? (
                        <LocalGasStation color="primary" />
                      ) : (
                        <Receipt color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{expense.description}</Typography>
                          <Chip
                            label={expense.category}
                            size="small"
                            sx={{ 
                              bgcolor: expense.category === 'Petrol' ? '#ff9800' : 'primary.main', 
                              color: 'white' 
                            }}
                          />
                          {expense.imported && (
                            <Chip
                              label="Imported"
                              size="small"
                              sx={{ bgcolor: 'info.main', color: 'white' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="body2">{expense.project}</Typography>
                          <Typography variant="body2">•</Typography>
                          <Typography variant="body2">{expense.date}</Typography>
                          {expense.category === 'Petrol' && expense.location && (
                            <>
                              <Typography variant="body2">•</Typography>
                              <Typography variant="body2">{expense.location}</Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" color="primary">
                          {formatZAR(expense.amount)}
                        </Typography>
                        <Chip
                          label={expense.status}
                          size="small"
                          color={getStatusColor(expense.status)}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleViewExpense(expense)}
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredExpenses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Add Expense Dialog */}
          <Dialog
            open={addExpenseOpen}
            onClose={() => setAddExpenseOpen(false)}
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
                  <Receipt sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Add New Expense
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Track and manage business expenses
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Description"
                    variant="outlined"
                    value={newExpense.description}
                    onChange={handleInputChange('description')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Amount"
                    type="number"
                    variant="outlined"
                    value={newExpense.amount}
                    onChange={handleInputChange('amount')}
                    InputProps={{
                      startAdornment: 'R',
                    }}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date"
                    type="date"
                    variant="outlined"
                    value={newExpense.date}
                    onChange={handleInputChange('date')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={newExpense.category}
                      onChange={handleInputChange('category')}
                    >
                      <MenuItem value="Materials">Materials</MenuItem>
                      <MenuItem value="Equipment">Equipment</MenuItem>
                      <MenuItem value="Labor">Labor</MenuItem>
                      <MenuItem value="Petrol">Petrol</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Project</InputLabel>
                    <Select
                      label="Project"
                      value={newExpense.project}
                      onChange={handleInputChange('project')}
                    >
                      {budgetsList.map((budget) => (
                        <MenuItem key={budget.project} value={budget.project}>
                          {budget.project}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Petrol-specific fields */}
                {newExpense.category === 'Petrol' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mileage (km)"
                        type="number"
                        variant="outlined"
                        placeholder="0"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Liters"
                        type="number"
                        variant="outlined"
                        placeholder="0.00"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price per Liter"
                        type="number"
                        variant="outlined"
                        InputProps={{
                          startAdornment: 'R',
                        }}
                        placeholder="0.00"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        variant="outlined"
                        placeholder="Gas station name and location"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderStyle: 'dashed',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="receipt-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="receipt-upload">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <CameraAlt sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {newExpense.receiptFile ? newExpense.receiptFile.name : 'Drop receipt photo here or click to upload'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports: JPG, PNG, PDF (max 10MB)
                        </Typography>
                      </Box>
                    </label>
                  </Paper>
                </Grid>
              </Grid>
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
                  onClick={() => setAddExpenseOpen(false)}
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
                startIcon={<CheckCircle />}
                onClick={handleSaveExpense}
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
                Save Expense
              </Button>
              </Box>
            </DialogActions>
          </Dialog>

          {/* Import Expenses Dialog */}
          <Dialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            maxWidth="lg"
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
                  <UploadFile sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Import Expenses
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Bulk import expense data from files
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stepper activeStep={importStep} orientation="vertical" sx={{ mb: 3 }}>
                {importSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={
                        index === 2 ? (
                          <Typography variant="caption" color="text.secondary">
                            {previewData.length} rows preview
                          </Typography>
                        ) : null
                      }
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      {index === 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Upload Expense File
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Upload a CSV, Excel (.xlsx/.xls), or PDF file containing expense data. 
                            The system can handle large datasets with up to 10,000+ records efficiently.
                          </Typography>
                          
                          <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls,.pdf"
                              onChange={handleImportFileChange}
                              style={{ display: 'none' }}
                              id="import-file-input"
                            />
                            <label htmlFor="import-file-input">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                sx={{ mb: 2 }}
                              >
                                Choose File
                              </Button>
                            </label>
                            {importFile && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Selected: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {importError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                              {importError}
                            </Alert>
                          )}

                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={() => downloadTemplate('csv')}
                              startIcon={<Download />}
                              sx={{ mr: 1 }}
                            >
                              Download Template
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => downloadTemplate('excel')}
                              startIcon={<Download />}
                            >
                              Download Excel Template
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {index === 1 && importData && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Data Preview & Mapping
                          </Typography>
                          
                          {/* Data Statistics */}
                          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              File Statistics
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Total Records:</strong> {totalRecords.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Batches:</strong> {totalBatches} (50 records per batch)
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Estimated Time:</strong> {Math.ceil(totalRecords / 100)} seconds
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>File Size:</strong> {importFile ? (importFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Review the data preview and adjust field mappings if needed. The system will process {totalRecords.toLocaleString()} records in {totalBatches} batches.
                          </Typography>

                          {/* Header Mapping */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Field Mapping
                            </Typography>
                            <Grid container spacing={2}>
                              {importData.headers.map((header) => (
                                <Grid item xs={12} sm={6} key={header}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>{header}</InputLabel>
                                    <Select
                                      value={headerMapping[header] || ''}
                                      onChange={(e) => setHeaderMapping(prev => ({
                                        ...prev,
                                        [header]: e.target.value
                                      }))}
                                      label={header}
                                    >
                                      <MenuItem value="">Skip this field</MenuItem>
                                      <MenuItem value="date">Date</MenuItem>
                                      <MenuItem value="amount">Amount</MenuItem>
                                      <MenuItem value="category">Category</MenuItem>
                                      <MenuItem value="description">Description</MenuItem>
                                      <MenuItem value="project">Project</MenuItem>
                                      <MenuItem value="mileage">Mileage</MenuItem>
                                      <MenuItem value="liters">Liters</MenuItem>
                                      <MenuItem value="pricePerLiter">Price per Liter</MenuItem>
                                      <MenuItem value="location">Location</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>

                          {/* Data Preview */}
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Data Preview (First 5 records)
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    {importData.headers.map((header) => (
                                      <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                                        {header}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {previewData.map((row, index) => (
                                    <TableRow key={index}>
                                      {importData.headers.map((header) => (
                                        <TableCell key={header}>
                                          {row[header] || '-'}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button onClick={() => setImportStep(0)}>
                              Back
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleImportExpenses}
                              disabled={
                                importing ||
                                getMissingRequiredMappings(headerMapping).length > 0
                              }
                            >
                              Start Import ({totalRecords.toLocaleString()} records)
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {index === 2 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Importing Expenses
                          </Typography>
                          
                          {/* Progress Information */}
                          <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Progress:</strong> {Math.round(importProgress)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Batch:</strong> {currentBatch} / {totalBatches}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Imported:</strong> {importedCount.toLocaleString()} / {totalRecords.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Remaining:</strong> {(totalRecords - importedCount).toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Progress Bar */}
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={importProgress} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>

                          {/* Batch Progress */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Processing batch {currentBatch} of {totalBatches}...
                            </Typography>
                            <LinearProgress 
                              variant="indeterminate" 
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>

                          <Typography variant="body2" color="textSecondary">
                            Please don't close this dialog. The import will continue in the background.
                            Large datasets may take several minutes to process completely.
                          </Typography>
                        </Box>
                      )}

                      {index === 3 && (
                        <Box>
                          <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Import Completed Successfully!
                            </Typography>
                          </Box>

                          {/* Import Summary */}
                          <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Import Summary
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Total Processed:</strong> {totalRecords.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Successfully Imported:</strong> {importedCount.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Batches Processed:</strong> {totalBatches}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Processing Time:</strong> ~{Math.ceil(totalRecords / 100)} seconds
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {validationResults && validationResults.invalid.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              {validationResults.invalid.length} records had validation errors and were skipped.
                            </Alert>
                          )}

                          <Typography variant="body2" color="textSecondary">
                            All expenses have been imported and are now available in your expense list.
                            You can view and manage them in the main expense tracking interface.
                          </Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {importError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {importError}
                </Alert>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Need help with the import format?
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    size="small"
                    startIcon={<Description />}
                    onClick={() => downloadTemplate('csv')}
                  >
                    Download CSV Template
                  </Button>
                  <Button
                    size="small"
                    startIcon={<TableChart />}
                    onClick={() => downloadTemplate('excel')}
                  >
                    Download Excel Template
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PictureAsPdf />}
                    onClick={() => downloadTemplate('pdf')}
                  >
                    Download PDF Template
                  </Button>
                </Stack>
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
                  onClick={() => setImportDialogOpen(false)}
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

          {/* Export Dialog */}
          <Dialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GetApp color="primary" />
                <Typography variant="h6">Export Expenses</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the format and export your expense data:
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'pdf')}
                >
                  <FormControlLabel
                    value="excel"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableChart color="primary" />
                        <Box>
                          <Typography variant="body2">Excel (.xlsx)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Best for data analysis and calculations
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description color="primary" />
                        <Box>
                          <Typography variant="body2">CSV (.csv)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Universal format, compatible with most applications
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PictureAsPdf color="primary" />
                        <Box>
                          <Typography variant="body2">PDF (.pdf)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Best for printing and sharing reports
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {exporting && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Exporting expenses...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={exportProgress} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(exportProgress)}% complete
                  </Typography>
                </Box>
              )}

              {expensesList.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    No expenses to export. Add some expenses first.
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportExpenses}
                disabled={exporting || expensesList.length === 0}
              >
                Export Expenses
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add View/Edit Expense Dialog */}
          <Dialog
            open={viewExpenseOpen}
            onClose={() => {
              setViewExpenseOpen(false);
              setEditMode(false);
              setSelectedExpense(null);
              setEditedExpense(null);
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
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {selectedExpense?.category === 'Petrol' ? (
                  <LocalGasStation sx={{ fontSize: 28 }} />
                  ) : (
                  <Receipt sx={{ fontSize: 28 }} />
                  )}
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {editMode ? 'Edit Expense' : 'View Expense'}
                  </Typography>
                </Box>
                {selectedExpense?.status === 'pending' && !editMode && (
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEditExpense}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  variant="outlined"
                  >
                    Edit
                  </Button>
                )}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Description"
                    variant="outlined"
                    value={editedExpense?.description || ''}
                    onChange={(e) => setEditedExpense(prev => prev ? { ...prev, description: e.target.value } : null)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Amount"
                    type="number"
                    variant="outlined"
                    value={editedExpense?.amount || ''}
                    onChange={(e) => setEditedExpense(prev => prev ? { ...prev, amount: parseFloat(e.target.value) } : null)}
                    InputProps={{
                      startAdornment: 'R',
                    }}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date"
                    type="date"
                    variant="outlined"
                    value={editedExpense?.date || ''}
                    onChange={(e) => setEditedExpense(prev => prev ? { ...prev, date: e.target.value } : null)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={editedExpense?.category || ''}
                      onChange={(e) => setEditedExpense(prev => prev ? { ...prev, category: e.target.value as string } : null)}
                      disabled={!editMode}
                    >
                      <MenuItem value="Materials">Materials</MenuItem>
                      <MenuItem value="Equipment">Equipment</MenuItem>
                      <MenuItem value="Labor">Labor</MenuItem>
                      <MenuItem value="Petrol">Petrol</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Project</InputLabel>
                    <Select
                      label="Project"
                      value={editedExpense?.project || ''}
                      onChange={(e) => setEditedExpense(prev => prev ? { ...prev, project: e.target.value as string } : null)}
                      disabled={!editMode}
                    >
                      {budgetsList.map((budget) => (
                        <MenuItem key={budget.project} value={budget.project}>
                          {budget.project}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Petrol-specific fields */}
                {selectedExpense?.category === 'Petrol' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mileage (km)"
                        type="number"
                        variant="outlined"
                        value={editedExpense?.mileage || ''}
                        onChange={(e) => setEditedExpense(prev => prev ? { ...prev, mileage: parseFloat(e.target.value) } : null)}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Liters"
                        type="number"
                        variant="outlined"
                        value={editedExpense?.liters || ''}
                        onChange={(e) => setEditedExpense(prev => prev ? { ...prev, liters: parseFloat(e.target.value) } : null)}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price per Liter"
                        type="number"
                        variant="outlined"
                        value={editedExpense?.pricePerLiter || ''}
                        onChange={(e) => setEditedExpense(prev => prev ? { ...prev, pricePerLiter: parseFloat(e.target.value) } : null)}
                        InputProps={{
                          startAdornment: 'R',
                        }}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        variant="outlined"
                        value={editedExpense?.location || ''}
                        onChange={(e) => setEditedExpense(prev => prev ? { ...prev, location: e.target.value } : null)}
                        disabled={!editMode}
                      />
                    </Grid>
                  </>
                )}
                
                {selectedExpense?.receiptUrl && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        textAlign: 'center',
                      }}
                    >
                      <img
                        src={selectedExpense.receiptUrl}
                        alt="Receipt"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                        }}
                      />
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={selectedExpense?.status.toUpperCase()}
                      size="small"
                      color={
                        selectedExpense?.status === 'approved'
                          ? 'success'
                          : selectedExpense?.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
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
                onClick={() => {
                  setViewExpenseOpen(false);
                  setEditMode(false);
                  setSelectedExpense(null);
                  setEditedExpense(null);
                }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                }}
              >
                {editMode ? 'Cancel' : 'Close'}
              </Button>
              {editMode && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={handleUpdateExpense}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                >
                  Save Changes
                </Button>
              )}
              </Box>
            </DialogActions>
          </Dialog>
        </CustomTabPanel>

        {/* Cashbook Tab Content */}
        <CustomTabPanel value={tabValue} index={1}>
          {/* Cashbook Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              onClick={handleAddCashbookEntry}
              sx={{ borderRadius: 2 }}
            >
              Add Entry
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{ borderRadius: 2 }}
            >
              Export Cashbook
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={handleCashbookImportClick}
              sx={{ borderRadius: 2 }}
            >
              Import Cashbook
            </Button>
          </Box>

          {/* Cashbook Entries Section */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Cashbook Entries</Typography>
            
            {cashbookEntries.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BookOnline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No cashbook entries yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by adding your first income or expense entry
                </Typography>
              </Box>
            ) : (
              <List>
                {cashbookEntries.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {entry.type === 'income' ? (
                          <AddCircle sx={{ color: '#4caf50' }} />
                        ) : (
                          <RemoveCircle sx={{ color: '#f44336' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{entry.description}</Typography>
                            <Chip
                              label={entry.type.toUpperCase()}
                              size="small"
                              sx={{ 
                                bgcolor: entry.type === 'income' ? '#4caf50' : '#f44336', 
                                color: 'white' 
                              }}
                            />
                            <Chip
                              label={entry.category}
                              size="small"
                              variant="outlined"
                            />
                            {entry.receiptUrl && (
                              <Chip
                                icon={<CameraAlt />}
                                label="Receipt"
                                size="small"
                                sx={{ bgcolor: 'info.main', color: 'white' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="body2">{entry.date}</Typography>
                            {entry.reference && (
                              <>
                                <Typography variant="body2">•</Typography>
                                <Typography variant="body2">Ref: {entry.reference}</Typography>
                              </>
                            )}
                            <Typography variant="body2">•</Typography>
                            <Typography variant="body2">Balance: {formatZAR(entry.balance || 0)}</Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: entry.type === 'income' ? '#4caf50' : '#f44336',
                              fontWeight: 'bold'
                            }}
                          >
                            {entry.type === 'income' ? '+' : '-'}{formatZAR(entry.amount)}
                          </Typography>
                          <IconButton
                            edge="end"
                            onClick={() => handleViewCashbookEntry(entry)}
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < cashbookEntries.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {/* Add Cashbook Entry Dialog */}
          <Dialog
            open={addCashbookEntryOpen}
            onClose={() => setAddCashbookEntryOpen(false)}
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
                  <BookOnline sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Add Cashbook Entry
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Record income and expense transactions
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Description"
                    variant="outlined"
                    value={newCashbookEntry.description}
                    onChange={handleCashbookInputChange('description')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={newCashbookEntry.type}
                      onChange={handleCashbookInputChange('type')}
                    >
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Amount"
                    type="number"
                    variant="outlined"
                    value={newCashbookEntry.amount}
                    onChange={handleCashbookInputChange('amount')}
                    InputProps={{
                      startAdornment: 'R',
                    }}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date"
                    type="date"
                    variant="outlined"
                    value={newCashbookEntry.date}
                    onChange={handleCashbookInputChange('date')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={newCashbookEntry.category}
                      onChange={handleCashbookInputChange('category')}
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Services">Services</MenuItem>
                      <MenuItem value="Office">Office</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Travel">Travel</MenuItem>
                      <MenuItem value="Utilities">Utilities</MenuItem>
                      <MenuItem value="Supplies">Supplies</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference"
                    variant="outlined"
                    value={newCashbookEntry.reference}
                    onChange={handleCashbookInputChange('reference')}
                    placeholder="Invoice number, receipt number, etc."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Receipt/Document (Optional)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderStyle: 'dashed',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="cashbook-receipt-upload"
                      onChange={handleCashbookFileChange}
                    />
                    <label htmlFor="cashbook-receipt-upload">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <CameraAlt sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {newCashbookEntry.receiptFile ? newCashbookEntry.receiptFile.name : 'Scan or upload receipt/document'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports: JPG, PNG, PDF (max 10MB)
                        </Typography>
                      </Box>
                    </label>
                  </Paper>
                </Grid>
              </Grid>
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
                  onClick={() => setAddCashbookEntryOpen(false)}
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
                startIcon={<Save />}
                onClick={handleSaveCashbookEntry}
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
                Save Entry
              </Button>
              </Box>
            </DialogActions>
          </Dialog>

          {/* View/Edit Cashbook Entry Dialog */}
          <Dialog
            open={viewCashbookEntryOpen}
            onClose={() => setViewCashbookEntryOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOnline color="primary" />
                <Typography variant="h6">
                  {editCashbookMode ? 'Edit Cashbook Entry' : 'View Cashbook Entry'}
                </Typography>
                {!editCashbookMode && selectedCashbookEntry && (
                  <IconButton onClick={handleEditCashbookEntry} sx={{ ml: 'auto' }}>
                    <Edit />
                  </IconButton>
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Description"
                    variant="outlined"
                    value={editedCashbookEntry?.description || ''}
                    onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, description: e.target.value } : null)}
                    disabled={!editCashbookMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={editedCashbookEntry?.type || ''}
                      onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, type: e.target.value as 'income' | 'expense' } : null)}
                      disabled={!editCashbookMode}
                    >
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Amount"
                    type="number"
                    variant="outlined"
                    value={editedCashbookEntry?.amount || ''}
                    onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, amount: parseFloat(e.target.value) } : null)}
                    InputProps={{
                      startAdornment: 'R',
                    }}
                    disabled={!editCashbookMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date"
                    type="date"
                    variant="outlined"
                    value={editedCashbookEntry?.date || ''}
                    onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, date: e.target.value } : null)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!editCashbookMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={editedCashbookEntry?.category || ''}
                      onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, category: e.target.value as string } : null)}
                      disabled={!editCashbookMode}
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Services">Services</MenuItem>
                      <MenuItem value="Office">Office</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Travel">Travel</MenuItem>
                      <MenuItem value="Utilities">Utilities</MenuItem>
                      <MenuItem value="Supplies">Supplies</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference"
                    variant="outlined"
                    value={editedCashbookEntry?.reference || ''}
                    onChange={(e) => setEditedCashbookEntry(prev => prev ? { ...prev, reference: e.target.value } : null)}
                    disabled={!editCashbookMode}
                  />
                </Grid>
                
                {selectedCashbookEntry?.receiptUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Receipt/Document
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        textAlign: 'center',
                      }}
                    >
                      <img
                        src={selectedCashbookEntry.receiptUrl}
                        alt="Receipt"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                        }}
                      />
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Running Balance:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatZAR(selectedCashbookEntry?.balance || 0)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button
                onClick={() => {
                  setViewCashbookEntryOpen(false);
                  setEditCashbookMode(false);
                  setSelectedCashbookEntry(null);
                  setEditedCashbookEntry(null);
                }}
              >
                {editCashbookMode ? 'Cancel' : 'Close'}
              </Button>
              {editCashbookMode && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateCashbookEntry}
                  sx={{ borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Cashbook Import Dialog */}
          <Dialog
            open={cashbookImportDialogOpen}
            onClose={() => setCashbookImportDialogOpen(false)}
            maxWidth="lg"
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
                  <UploadFile sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Import Cashbook Entries
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Bulk import cashbook data from files
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stepper activeStep={cashbookImportStep} orientation="vertical" sx={{ mb: 3 }}>
                {importSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={
                        index === 2 ? (
                          <Typography variant="caption" color="text.secondary">
                            {cashbookPreviewData.length} rows preview
                          </Typography>
                        ) : null
                      }
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      {index === 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Upload Cashbook File
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Upload a CSV, Excel (.xlsx/.xls), or PDF file containing cashbook data. 
                            The system can handle large datasets with up to 10,000+ records efficiently.
                          </Typography>
                          
                          <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls,.pdf"
                              onChange={handleCashbookImportFileChange}
                              style={{ display: 'none' }}
                              id="import-cashbook-file-input"
                            />
                            <label htmlFor="import-cashbook-file-input">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                sx={{ mb: 2 }}
                              >
                                Choose File
                              </Button>
                            </label>
                            {cashbookImportFile && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Selected: {cashbookImportFile.name} ({(cashbookImportFile.size / 1024 / 1024).toFixed(2)} MB)
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {cashbookImportError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                              {cashbookImportError}
                            </Alert>
                          )}

                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={() => downloadTemplate('csv')}
                              startIcon={<Download />}
                              sx={{ mr: 1 }}
                            >
                              Download Template
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => downloadTemplate('excel')}
                              startIcon={<Download />}
                            >
                              Download Excel Template
                            </Button>
                          </Box>

                          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                              variant="contained"
                              onClick={() => setCashbookImportStep(1)}
                              disabled={!cashbookImportFile}
                              startIcon={<CloudUpload />}
                              sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                                }
                              }}
                            >
                              Next: Map Headers
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {index === 1 && cashbookImportData && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Data Preview & Mapping
                          </Typography>
                          
                          {/* Data Statistics */}
                          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              File Statistics
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Total Records:</strong> {cashbookImportData.data.length}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Batches:</strong> {Math.ceil(cashbookImportData.data.length / 20)} (20 records per batch)
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Estimated Time:</strong> {Math.ceil(cashbookImportData.data.length / 100)} seconds
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>File Size:</strong> {cashbookImportFile ? (cashbookImportFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Review the data preview and adjust field mappings if needed. The system will process {cashbookImportData.data.length} records in {Math.ceil(cashbookImportData.data.length / 20)} batches.
                          </Typography>
                          
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Required Fields:</strong> Date, Description, Amount, and Type must be mapped to proceed. 
                              Category and Reference are optional.
                            </Typography>
                          </Alert>

                          {/* Header Mapping */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Field Mapping
                            </Typography>
                            <Grid container spacing={2}>
                              {cashbookImportData.headers.map((header) => (
                                <Grid item xs={12} sm={6} key={header}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>{header}</InputLabel>
                                    <Select
                                      value={cashbookHeaderMapping[header] || ''}
                                      onChange={(e) => setCashbookHeaderMapping(prev => ({
                                        ...prev,
                                        [header]: e.target.value
                                      }))}
                                      label={header}
                                    >
                                      <MenuItem value="">Skip this field</MenuItem>
                                      <MenuItem value="date">Date</MenuItem>
                                      <MenuItem value="amount">Amount</MenuItem>
                                      <MenuItem value="category">Category</MenuItem>
                                      <MenuItem value="description">Description</MenuItem>
                                      <MenuItem value="type">Type</MenuItem>
                                      <MenuItem value="reference">Reference</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>

                          {/* Data Preview */}
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Data Preview (First 5 records)
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    {cashbookImportData.headers.map((header) => (
                                      <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                                        {header}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cashbookPreviewData.map((row, index) => (
                                    <TableRow key={index}>
                                      {cashbookImportData.headers.map((header) => (
                                        <TableCell key={header}>
                                          {row[header] || '-'}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button onClick={() => setCashbookImportStep(0)}>
                              Back
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleCashbookPreviewData}
                              disabled={
                                cashbookImporting ||
                                getMissingRequiredMappings(cashbookHeaderMapping, [
                                  'date',
                                  'amount',
                                  'description',
                                  'type',
                                ]).length > 0
                              }
                            >
                              Preview Data
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {index === 2 && cashbookImportData && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Preview & Validate Data
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Review the mapped data below. Make sure all required fields are properly mapped before importing.
                          </Typography>

                          {/* Validation Results */}
                          {cashbookValidationResults && (
                          <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="h6" color="success.dark">
                                      {cashbookValidationResults.valid.length}
                                </Typography>
                                    <Typography variant="body2" color="success.dark">
                                      Valid Records
                                </Typography>
                                  </Box>
                              </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="h6" color="error.dark">
                                      {cashbookValidationResults.invalid.length}
                                </Typography>
                                    <Typography variant="body2" color="error.dark">
                                      Invalid Records
                                    </Typography>
                                  </Box>
                              </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="h6" color="info.dark">
                                      {cashbookImportData.data.length}
                                </Typography>
                                    <Typography variant="body2" color="info.dark">
                                      Total Records
                                    </Typography>
                                  </Box>
                              </Grid>
                            </Grid>
                          </Box>
                          )}

                          {/* Data Preview */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Mapped Data Preview (First 5 records)
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cashbookPreviewData.map((row, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{row.date || '-'}</TableCell>
                                      <TableCell>{row.description || '-'}</TableCell>
                                      <TableCell>{row.type || '-'}</TableCell>
                                      <TableCell>{row.amount || '-'}</TableCell>
                                      <TableCell>{row.category || '-'}</TableCell>
                                      <TableCell>{row.reference || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>

                          {/* Validation Errors */}
                          {cashbookValidationResults && cashbookValidationResults.errors.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" gutterBottom color="error">
                                Validation Errors
                            </Typography>
                              <Alert severity="warning" sx={{ mb: 2 }}>
                                {cashbookValidationResults.errors.length} validation errors found. Please review the field mappings.
                              </Alert>
                              <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                                {cashbookValidationResults.errors.slice(0, 10).map((error, index) => (
                                  <Typography key={index} variant="caption" color="error" display="block">
                                    {error}
                                  </Typography>
                                ))}
                                {cashbookValidationResults.errors.length > 10 && (
                                  <Typography variant="caption" color="textSecondary">
                                    ... and {cashbookValidationResults.errors.length - 10} more errors
                                  </Typography>
                                )}
                          </Box>
                            </Box>
                          )}

                          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button onClick={() => setCashbookImportStep(1)}>
                              Back to Mapping
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => {
                                console.log('Import Data button clicked');
                                console.log('cashbookImporting:', cashbookImporting);
                                console.log('cashbookValidationResults?.valid.length:', cashbookValidationResults?.valid.length);
                                console.log('Button disabled:', cashbookImporting || (cashbookValidationResults?.valid.length === 0));
                                handleCashbookImportEntries();
                              }}
                              disabled={cashbookImporting || (cashbookValidationResults?.valid.length === 0)}
                              startIcon={<CloudUpload />}
                            >
                              {cashbookValidationResults && cashbookValidationResults.valid.length === 0 
                                ? 'No Valid Data to Import' 
                                : `Import ${cashbookValidationResults ? cashbookValidationResults.valid.length : cashbookImportData.data.length} Records`
                              }
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {index === 3 && cashbookImportData && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Importing Cashbook Entries
                          </Typography>
                          
                          {/* Progress Information */}
                          <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Progress:</strong> {Math.round(cashbookImportProgress)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Batch:</strong> {cashbookImportStep} / {Math.ceil(cashbookImportData.data.length / 20)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Imported:</strong> {cashbookImportStep * 20} / {cashbookImportData.data.length}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Remaining:</strong> {(cashbookImportData.data.length - cashbookImportStep * 20).toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Progress Bar */}
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={cashbookImportProgress} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>

                          {/* Batch Progress */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Processing batch {cashbookImportStep} of {Math.ceil(cashbookImportData.data.length / 20)}...
                            </Typography>
                            <LinearProgress 
                              variant="indeterminate" 
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>

                          <Typography variant="body2" color="textSecondary">
                            Please don't close this dialog. The import will continue in the background.
                            Large datasets may take several minutes to process completely.
                          </Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Completion Step */}
              {cashbookImportStep === 4 && cashbookImportData && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
                          <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Import Completed Successfully!
                            </Typography>
                          </Box>

                          {/* Import Summary */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Import Summary
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Total Processed:</strong> {cashbookImportData.data.length}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                          <strong>Successfully Imported:</strong> {cashbookValidationResults ? cashbookValidationResults.valid.length : 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                          <strong>Batches Processed:</strong> {Math.ceil(cashbookImportData.data.length / 20)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  <strong>Processing Time:</strong> ~{Math.ceil(cashbookImportData.data.length / 100)} seconds
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {cashbookValidationResults && cashbookValidationResults.invalid.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              {cashbookValidationResults.invalid.length} records had validation errors and were skipped.
                            </Alert>
                          )}

                          <Typography variant="body2" color="textSecondary">
                            All cashbook entries have been imported and are now available in your cashbook.
                            You can view and manage them in the main cashbook interface.
                          </Typography>
                        </Box>
                      )}

              {cashbookImportError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {cashbookImportError}
                </Alert>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Need help with the import format?
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    size="small"
                    startIcon={<Description />}
                    onClick={() => downloadTemplate('csv')}
                  >
                    Download CSV Template
                  </Button>
                  <Button
                    size="small"
                    startIcon={<TableChart />}
                    onClick={() => downloadTemplate('excel')}
                  >
                    Download Excel Template
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PictureAsPdf />}
                    onClick={() => downloadTemplate('pdf')}
                  >
                    Download PDF Template
                  </Button>
                </Stack>
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
                  onClick={() => setCashbookImportDialogOpen(false)}
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
                {cashbookImportStep === 2 && cashbookValidationResults && cashbookValidationResults.valid.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      console.log('Submit button clicked');
                      handleCashbookImportEntries();
                    }}
                    disabled={cashbookImporting}
                    startIcon={<CloudUpload />}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    {cashbookImporting ? 'Importing...' : `Import ${cashbookValidationResults.valid.length} Records`}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </Dialog>
        </CustomTabPanel>

        {/* Invoicing Tab Content */}
        <CustomTabPanel value={tabValue} index={2}>
          {/* Invoicing Content */}
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<ReceiptLong />}
              onClick={handleAddQuote}
              sx={{ borderRadius: 2 }}
            >
              Create Quote
            </Button>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={handleAddInvoice}
              sx={{ borderRadius: 2 }}
            >
              Create Invoice
            </Button>
          </Box>

          {/* Quotes and Invoices Grid */}
          <Grid container spacing={3}>
            {/* Quotes Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Recent Quotes</Typography>
                
                {quotes.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptLong sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No quotes created yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start by creating your first quote
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {quotes.map((quote) => (
                      <Card key={quote.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {quote.quoteNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {quote.clientName}
                              </Typography>
                            </Box>
                            <Chip
                              label={quote.status.toUpperCase()}
                              color={getQuoteStatusColor(quote.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total: {formatZAR(quote.total)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires: {new Date(quote.expiryDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewQuote(quote)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Assessment />}
                              onClick={() => handlePreviewTemplate('quote', quote)}
                              color="info"
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Send />}
                              onClick={() => handleSendQuote(quote)}
                              disabled={quote.status === 'sent'}
                            >
                              Send
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Print />}
                              onClick={() => handlePrintQuote(quote)}
                            >
                              Print
                            </Button>
                            <Button
                              size="small"
                              startIcon={<FileDownload />}
                              onClick={() => handleExportQuotePDF(quote)}
                            >
                              Export PDF
                            </Button>
                            {!quote.convertedToInvoice && quote.status === 'accepted' && (
                              <Button
                                size="small"
                                startIcon={<Receipt />}
                                onClick={() => handleConvertQuoteToInvoice(quote)}
                                color="success"
                              >
                                Convert
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Invoices Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Recent Invoices</Typography>
                
                {invoices.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No invoices created yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create an invoice or convert a quote
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {invoices.map((invoice) => (
                      <Card key={invoice.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {invoice.invoiceNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {invoice.clientName}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip
                                label={invoice.status.toUpperCase()}
                                color={getInvoiceStatusColor(invoice.status)}
                                size="small"
                                sx={{ mb: 0.5 }}
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                {invoice.paymentStatus}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total: {formatZAR(invoice.total)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Assessment />}
                              onClick={() => handlePreviewTemplate('invoice', invoice)}
                              color="info"
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Send />}
                              onClick={() => handleSendInvoice(invoice)}
                              disabled={invoice.status === 'sent'}
                            >
                              Send
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Print />}
                              onClick={() => handlePrintInvoice(invoice)}
                            >
                              Print
                            </Button>
                            <Button
                              size="small"
                              startIcon={<FileDownload />}
                              onClick={() => handleExportInvoicePDF(invoice)}
                            >
                              Export PDF
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Add Quote Dialog */}
          <Dialog
            open={addQuoteOpen}
            onClose={() => setAddQuoteOpen(false)}
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
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <ReceiptLong sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create New Quote
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Client Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Client Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Name *"
                    value={newQuote.clientName}
                    onChange={handleQuoteInputChange('clientName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Email"
                    type="email"
                    value={newQuote.clientEmail}
                    onChange={handleQuoteInputChange('clientEmail')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Address"
                    multiline
                    rows={2}
                    value={newQuote.clientAddress}
                    onChange={handleQuoteInputChange('clientAddress')}
                  />
                </Grid>

                {/* Quote Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Quote Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quote Date"
                    type="date"
                    value={newQuote.date}
                    onChange={handleQuoteInputChange('date')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    type="date"
                    value={newQuote.expiryDate}
                    onChange={handleQuoteInputChange('expiryDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="VAT Rate (%)"
                    type="number"
                    value={newQuote.vatRate}
                    onChange={handleQuoteInputChange('vatRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Template Design</InputLabel>
                    <Select
                      value={selectedQuoteTemplate}
                      onChange={(e) => handleTemplateChange('quote', e.target.value)}
                      label="Template Design"
                    >
                      {quoteTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%',
                                bgcolor: template.id === 'modern-blue' ? '#2196f3' :
                                        template.id === 'classic' ? '#000' :
                                        template.id === 'minimalist' ? '#666' :
                                        '#4caf50'
                              }} 
                            />
                            {template.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Quote Items */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Quote Items
                    </Typography>
                    <Button
                      startIcon={<AddCircle />}
                      onClick={handleAddQuoteItem}
                      size="small"
                    >
                      Add Item
                    </Button>
                  </Box>
                  
                  {quoteItems.map((item, _index) => (
                    <Card key={item.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={item.description}
                              onChange={(e) => handleQuoteItemChange(item.id, 'description', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Quantity"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuoteItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Unit Price"
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleQuoteItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Total"
                              value={formatZAR(item.total)}
                              InputProps={{ readOnly: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveQuoteItem(item.id)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>

                {/* Quote Totals */}
                {quoteItems.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Subtotal: {formatZAR(calculateQuoteTotals().subtotal)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            VAT ({newQuote.vatRate}%): {formatZAR(calculateQuoteTotals().vatAmount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            Total: {formatZAR(calculateQuoteTotals().total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Additional Information */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={newQuote.notes}
                    onChange={handleQuoteInputChange('notes')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terms & Conditions"
                    multiline
                    rows={3}
                    value={newQuote.terms}
                    onChange={handleQuoteInputChange('terms')}
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
              flexDirection: 'column',
              alignItems: 'stretch'
            }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setAddQuoteOpen(false)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveQuote}
                disabled={!newQuote.clientName || quoteItems.length === 0}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                    }
                  }}
              >
                Create Quote
              </Button>
              </Box>
            </DialogActions>
          </Dialog>

          {/* Add Invoice Dialog */}
          <Dialog
            open={addInvoiceOpen}
            onClose={() => setAddInvoiceOpen(false)}
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
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <Receipt sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create New Invoice
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Client Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Client Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Name *"
                    value={newInvoice.clientName}
                    onChange={handleInvoiceInputChange('clientName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Email"
                    type="email"
                    value={newInvoice.clientEmail}
                    onChange={handleInvoiceInputChange('clientEmail')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Address"
                    multiline
                    rows={2}
                    value={newInvoice.clientAddress}
                    onChange={handleInvoiceInputChange('clientAddress')}
                  />
                </Grid>

                {/* Invoice Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Invoice Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Issue Date"
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={handleInvoiceInputChange('issueDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={handleInvoiceInputChange('dueDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="VAT Rate (%)"
                    type="number"
                    value={newInvoice.vatRate}
                    onChange={handleInvoiceInputChange('vatRate')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Template Design</InputLabel>
                    <Select
                      value={selectedInvoiceTemplate}
                      onChange={(e) => handleTemplateChange('invoice', e.target.value)}
                      label="Template Design"
                    >
                      {invoiceTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%',
                                bgcolor: template.id === 'modern-blue' ? '#2196f3' :
                                        template.id === 'classic' ? '#000' :
                                        template.id === 'minimalist' ? '#666' :
                                        '#4caf50'
                              }} 
                            />
                            {template.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Invoice Items */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Invoice Items
                    </Typography>
                    <Button
                      startIcon={<AddCircle />}
                      onClick={handleAddInvoiceItem}
                      size="small"
                    >
                      Add Item
                    </Button>
                  </Box>
                  
                  {invoiceItems.map((item, _index) => (
                    <Card key={item.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={item.description}
                              onChange={(e) => handleInvoiceItemChange(item.id, 'description', e.target.value)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Quantity"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Unit Price"
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleInvoiceItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              label="Total"
                              value={formatZAR(item.total)}
                              InputProps={{ readOnly: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveInvoiceItem(item.id)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>

                {/* Invoice Totals */}
                {invoiceItems.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Subtotal: {formatZAR(calculateInvoiceTotals().subtotal)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            VAT ({newInvoice.vatRate}%): {formatZAR(calculateInvoiceTotals().vatAmount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            Total: {formatZAR(calculateInvoiceTotals().total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Additional Information */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={newInvoice.notes}
                    onChange={handleInvoiceInputChange('notes')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terms & Conditions"
                    multiline
                    rows={3}
                    value={newInvoice.terms}
                    onChange={handleInvoiceInputChange('terms')}
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
              flexDirection: 'column',
              alignItems: 'stretch'
            }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setAddInvoiceOpen(false)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveInvoice}
                disabled={!newInvoice.clientName || invoiceItems.length === 0}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                    }
                  }}
              >
                Create Invoice
              </Button>
              </Box>
            </DialogActions>
          </Dialog>

          {/* Convert Quote to Invoice Dialog */}
          <Dialog
            open={convertQuoteOpen}
            onClose={() => setConvertQuoteOpen(false)}
            maxWidth="sm"
          >
            <DialogTitle>Convert Quote to Invoice</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to convert this quote to an invoice?
              </Typography>
              {quoteToConvert && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Quote: {quoteToConvert.quoteNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client: {quoteToConvert.clientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total: {formatZAR(quoteToConvert.total)}
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This will create a new invoice with the same details and mark the quote as converted.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConvertQuoteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmConvertQuote}
                color="success"
              >
                Convert to Invoice
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Invoice Dialog */}
          <Dialog
            open={viewInvoiceOpen}
            onClose={() => setViewInvoiceOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {editInvoiceMode ? 'Edit Invoice' : 'View Invoice'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!editInvoiceMode && selectedInvoice && (
                  <>
                    <IconButton
                      onClick={() => handlePrintInvoice(selectedInvoice)}
                      size="small"
                      title="Print Invoice"
                    >
                      <Print />
                    </IconButton>
                    <IconButton
                      onClick={() => handleExportInvoicePDF(selectedInvoice)}
                      size="small"
                      title="Export PDF"
                    >
                      <FileDownload />
                    </IconButton>
                    <IconButton
                      onClick={() => handleSendInvoice(selectedInvoice)}
                      size="small"
                      title="Send Invoice"
                      disabled={selectedInvoice.status === 'sent'}
                    >
                      <Send />
                    </IconButton>
                    <IconButton
                      onClick={handleEditInvoice}
                      size="small"
                      title="Edit Invoice"
                    >
                      <Edit />
                    </IconButton>
                  </>
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedInvoice && editedInvoice && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {/* Invoice Header Info */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Invoice Number
                          </Typography>
                          <Typography variant="h6">
                            {selectedInvoice.invoiceNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={selectedInvoice.status.toUpperCase()}
                            color={getInvoiceStatusColor(selectedInvoice.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Status
                          </Typography>
                          <Typography variant="body1">
                            {selectedInvoice.paymentStatus}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Amount Paid
                          </Typography>
                          <Typography variant="body1">
                            {formatZAR(selectedInvoice.amountPaid)} / {formatZAR(selectedInvoice.total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Client Information */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Client Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={editedInvoice.clientName}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, clientName: e.target.value } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Client Email"
                      type="email"
                      value={editedInvoice.clientEmail}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, clientEmail: e.target.value } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Client Address"
                      multiline
                      rows={2}
                      value={editedInvoice.clientAddress}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, clientAddress: e.target.value } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>

                  {/* Invoice Details */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Invoice Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Issue Date"
                      type="date"
                      value={editedInvoice.issueDate}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, issueDate: e.target.value } : null)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={editedInvoice.dueDate}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="VAT Rate (%)"
                      type="number"
                      value={editedInvoice.vatRate}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, vatRate: parseFloat(e.target.value) || 0 } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>

                  {/* Invoice Items */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Invoice Items
                    </Typography>
                    
                    {editedInvoice.items.map((item) => (
                      <Card key={item.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Description"
                                value={item.description}
                                InputProps={{ readOnly: !editInvoiceMode }}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                fullWidth
                                label="Quantity"
                                type="number"
                                value={item.quantity}
                                InputProps={{ readOnly: !editInvoiceMode }}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                fullWidth
                                label="Unit Price"
                                value={formatZAR(item.unitPrice)}
                                InputProps={{ readOnly: true }}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Total"
                                value={formatZAR(item.total)}
                                InputProps={{ readOnly: true }}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Grid>

                  {/* Invoice Totals */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Subtotal: {formatZAR(editedInvoice.subtotal)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            VAT ({editedInvoice.vatRate}%): {formatZAR(editedInvoice.vatAmount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            Total: {formatZAR(editedInvoice.total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Additional Information */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={editedInvoice.notes || ''}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, notes: e.target.value } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Terms & Conditions"
                      multiline
                      rows={3}
                      value={editedInvoice.terms || ''}
                      onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, terms: e.target.value } : null)}
                      InputProps={{ readOnly: !editInvoiceMode }}
                    />
                  </Grid>

                  {/* Payment Information */}
                  {editInvoiceMode && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Payment Information
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Payment Status</InputLabel>
                          <Select
                            value={editedInvoice.paymentStatus}
                            label="Payment Status"
                            onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, paymentStatus: e.target.value as any } : null)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="partial">Partial</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="failed">Failed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Amount Paid"
                          type="number"
                          value={editedInvoice.amountPaid}
                          onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, amountPaid: parseFloat(e.target.value) || 0 } : null)}
                        />
                      </Grid>
                      {editedInvoice.paymentStatus === 'paid' && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Payment Date"
                            type="date"
                            value={editedInvoice.paymentDate || ''}
                            onChange={(e) => setEditedInvoice(prev => prev ? { ...prev, paymentDate: e.target.value } : null)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewInvoiceOpen(false)}>
                Close
              </Button>
              {editInvoiceMode ? (
                <>
                  <Button onClick={() => setEditInvoiceMode(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateInvoice}
                  >
                    Save Changes
                  </Button>
                </>
              ) : selectedInvoice && (
                <>
                  <Button
                    startIcon={<Send />}
                    onClick={() => handleSendInvoice(selectedInvoice)}
                    disabled={selectedInvoice.status === 'sent'}
                  >
                    Send Invoice
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={() => handleExportInvoicePDF(selectedInvoice)}
                  >
                    Export PDF
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </CustomTabPanel>
      </Container>
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default ExpenseTracking; 