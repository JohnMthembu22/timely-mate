import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel as MuiFormControlLabel,
  Checkbox,
  FormGroup,
  FormHelperText,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Inventory,
  Assessment,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  FilterList,
  Search,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Business,
  Receipt,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Star,
  StarBorder,
  MoreVert,
  CalendarToday,
  LocationOn,
  Phone,
  Email,
  AccountBalance,
  Payment,
  Inventory2,
  QrCode,
  LocalOffer,
  Discount,
  Security,
  VerifiedUser,
  PendingActions,
  Assignment,
  Description,
  AttachFile,
  Send,
  Archive,
  RestoreFromTrash,
  Print,
  Share,
  Notifications,
  NotificationsActive,
  CloudUpload,
  FileDownload,
  TableChart,
  BusinessCenter,
  Category,
  Extension,
  Settings,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Interfaces
interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  vendorId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface PurchaseOrderItem {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  specifications?: string;
}

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  leadTime: number;
  lastOrderDate?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
}

interface ProcurementMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  pendingOrders: number;
  approvedOrders: number;
  receivedOrders: number;
  topVendors: Vendor[];
  lowStockItems: InventoryItem[];
  recentOrders: PurchaseOrder[];
}

// Import interfaces
interface ImportData {
  type: 'purchase-orders' | 'vendors' | 'inventory';
  data: any[];
  headers: string[];
  mappedHeaders: Record<string, string>;
}

interface ImportStep {
  label: string;
  description: string;
  completed: boolean;
}

interface Addon {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'integration' | 'automation' | 'analytics' | 'communication' | 'productivity' | 'security' | 'reporting';
  status: 'installed' | 'available' | 'updating' | 'error' | 'configuring';
  icon: string;
  features: string[];
  requirements: string[];
  price: number;
  rating: number;
  downloads: number;
  lastUpdated: string;
  isEnabled: boolean;
  settings?: Record<string, any>;
  // New fields for realistic add-ons
  apiKey?: string;
  webhookUrl?: string;
  credentials?: {
    username?: string;
    password?: string;
    apiToken?: string;
    clientId?: string;
    clientSecret?: string;
  };
  configuration?: {
    fields: AddonConfigField[];
    required: string[];
  };
  permissions: string[];
  dependencies: string[];
  compatibility: {
    minVersion: string;
    maxVersion?: string;
    platforms: string[];
  };
  installationSteps: string[];
  documentation: string;
  supportEmail: string;
  license: 'free' | 'premium' | 'enterprise';
  subscription?: {
    type: 'monthly' | 'yearly' | 'one-time';
    price: number;
    features: string[];
  };
}

interface AddonConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  helpText?: string;
}

const Procurement: React.FC = () => {
  const { formatAmount } = useCurrency();
  const { addNotification } = useNotifications();
  const [currentTab, setCurrentTab] = useState(0);
  const [openNewPO, setOpenNewPO] = useState(false);
  const [openNewVendor, setOpenNewVendor] = useState(false);
  const [openNewInventory, setOpenNewInventory] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // State for data management
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Import state
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importType, setImportType] = useState<'purchase-orders' | 'vendors' | 'inventory'>('vendors');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [importStep, setImportStep] = useState(0);
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Form states
  const [newPO, setNewPO] = useState({
    vendorId: '',
    items: [] as PurchaseOrderItem[],
    expectedDelivery: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    paymentTerms: 'Net 30',
    leadTime: 7,
  });

  const [newInventory, setNewInventory] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    unitPrice: 0,
    location: '',
    supplier: '',
  });

  // State for PO management
  const [openViewPO, setOpenViewPO] = useState(false);
  const [openEditPO, setOpenEditPO] = useState(false);
  const [openDeletePO, setOpenDeletePO] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  // State for vendor management
  const [openViewVendor, setOpenViewVendor] = useState(false);
  const [openEditVendor, setOpenEditVendor] = useState(false);
  const [openDeleteVendor, setOpenDeleteVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // State for inventory management
  const [openViewInventory, setOpenViewInventory] = useState(false);
  const [openEditInventory, setOpenEditInventory] = useState(false);
  const [openDeleteInventory, setOpenDeleteInventory] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

  // State for add-ons and plugins
  const [openAddonsDialog, setOpenAddonsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [installedAddons, setInstalledAddons] = useState<Addon[]>([]);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [openAddonConfig, setOpenAddonConfig] = useState(false);
  const [addonConfigData, setAddonConfigData] = useState<Record<string, any>>({});
  const [installingAddon, setInstallingAddon] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  // Calculate metrics
  const metrics: ProcurementMetrics = {
    totalOrders: purchaseOrders.length,
    totalSpent: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
    averageOrderValue: purchaseOrders.length > 0 
      ? purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0) / purchaseOrders.length 
      : 0,
    pendingOrders: purchaseOrders.filter(po => po.status === 'pending').length,
    approvedOrders: purchaseOrders.filter(po => po.status === 'approved').length,
    receivedOrders: purchaseOrders.filter(po => po.status === 'received').length,
    topVendors: vendors.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
    lowStockItems: inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock'),
    recentOrders: purchaseOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5),
  };

  // Import steps
  const importSteps: ImportStep[] = [
    { label: 'Select Data Type', description: 'Choose what type of data to import', completed: false },
    { label: 'Upload File', description: 'Upload your Excel, CSV, or PDF file', completed: false },
    { label: 'Map Headers', description: 'Map your file headers to system fields', completed: false },
    { label: 'Preview & Validate', description: 'Review and validate your data', completed: false },
    { label: 'Import Data', description: 'Import the data into the system', completed: false },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddonsTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'received':
      case 'active':
      case 'in-stock':
        return 'success';
      case 'pending':
      case 'ordered':
      case 'low-stock':
        return 'warning';
      case 'cancelled':
      case 'inactive':
      case 'out-of-stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // PO management functions
  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setOpenViewPO(true);
  };

  const handleEditPO = (po: PurchaseOrder) => {
    setEditingPO(po);
    setOpenEditPO(true);
  };

  const handleDeletePO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setOpenDeletePO(true);
  };

  const handleUpdatePO = () => {
    if (!editingPO) return;

    // Update the PO in state
    setPurchaseOrders(prevPOs => 
      prevPOs.map(po => 
        po.id === editingPO.id ? editingPO : po
      )
    );
    console.log('Updated POs:', editingPO);

    addNotification(createNotification.procurement(
      'Purchase Order Updated',
      `PO ${editingPO.poNumber} has been successfully updated`
    ));

    setOpenEditPO(false);
    setEditingPO(null);
  };

  const handleConfirmDeletePO = () => {
    if (!selectedPO) return;

    // Remove the PO from state
    setPurchaseOrders(prevPOs => 
      prevPOs.filter(po => po.id !== selectedPO.id)
    );
    console.log('PO deleted:', selectedPO.poNumber);

    addNotification(createNotification.procurement(
      'Purchase Order Deleted',
      `PO ${selectedPO.poNumber} has been successfully deleted`
    ));

    setOpenDeletePO(false);
    setSelectedPO(null);
  };

  const handleCreatePO = () => {
    // Create new purchase order logic
    const newPurchaseOrder: PurchaseOrder = {
      id: `po${Date.now()}`,
      poNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      vendor: vendors.find(v => v.id === newPO.vendorId)?.name || '',
      vendorId: newPO.vendorId,
      items: newPO.items,
      totalAmount: newPO.items.reduce((sum, item) => sum + item.totalPrice, 0),
      status: 'draft',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: newPO.expectedDelivery,
      createdBy: 'Current User',
      priority: newPO.priority,
      notes: newPO.notes,
    };

    // Add to mock data (in real app, this would be an API call)
    setPurchaseOrders([...purchaseOrders, newPurchaseOrder]);

    addNotification(createNotification.procurement(
      'Purchase Order Created',
      `New PO ${newPurchaseOrder.poNumber} has been created successfully`
    ));

    setOpenNewPO(false);
    setNewPO({
      vendorId: '',
      items: [],
      expectedDelivery: '',
      notes: '',
      priority: 'medium',
    });
  };

  const handleCreateVendor = () => {
    // Create new vendor logic
    const newVendorData: Vendor = {
      id: `vendor${Date.now()}`,
      name: newVendor.name,
      contactPerson: newVendor.contactPerson,
      email: newVendor.email,
      phone: newVendor.phone,
      address: newVendor.address,
      category: newVendor.category,
      rating: 0,
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      paymentTerms: newVendor.paymentTerms,
      leadTime: newVendor.leadTime,
    };

    setVendors(prevVendors => [...prevVendors, newVendorData]);

    addNotification(createNotification.procurement(
      'Vendor Created',
      `Vendor "${newVendor.name}" has been created successfully`
    ));

    setOpenNewVendor(false);
    setNewVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      paymentTerms: 'Net 30',
      leadTime: 7,
    });
  };

  const handleCreateInventory = () => {
    // Create new inventory item logic
    const newInventoryData: InventoryItem = {
      id: `inv${Date.now()}`,
      name: newInventory.name,
      sku: newInventory.sku,
      category: newInventory.category,
      quantity: newInventory.quantity,
      minQuantity: newInventory.minQuantity,
      maxQuantity: newInventory.maxQuantity,
      unitPrice: newInventory.unitPrice,
      totalValue: newInventory.quantity * newInventory.unitPrice,
      location: newInventory.location,
      supplier: newInventory.supplier,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: newInventory.quantity > 0 ? 'in-stock' : 'out-of-stock',
    };

    setInventory(prevInventory => [...prevInventory, newInventoryData]);

    addNotification(createNotification.procurement(
      'Inventory Item Created',
      `Item "${newInventory.name}" has been created successfully`
    ));

    setOpenNewInventory(false);
    setNewInventory({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      unitPrice: 0,
      location: '',
      supplier: '',
    });
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          po.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Import functions
  const handleImportClick = () => {
    setOpenImportDialog(true);
    setImportStep(0);
    setImportFile(null);
    setImportData(null);
    setHeaderMapping({});
    setPreviewData([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      parseFile(file);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setImportData({
        type: importType,
        data,
        headers,
        mappedHeaders: {}
      });

      // Auto-map headers
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader.includes('vendor')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('email')) {
          autoMapping[header] = 'email';
        } else if (lowerHeader.includes('phone')) {
          autoMapping[header] = 'phone';
        } else if (lowerHeader.includes('address')) {
          autoMapping[header] = 'address';
        } else if (lowerHeader.includes('category')) {
          autoMapping[header] = 'category';
        } else if (lowerHeader.includes('contact')) {
          autoMapping[header] = 'contactPerson';
        } else if (lowerHeader.includes('payment')) {
          autoMapping[header] = 'paymentTerms';
        } else if (lowerHeader.includes('lead')) {
          autoMapping[header] = 'leadTime';
        }
      });

      setHeaderMapping(autoMapping);
      setPreviewData(data.slice(0, 5));
      setImportStep(2);
    } catch (error) {
      console.error('Error parsing file:', error);
      addNotification(createNotification.system(
        'Import Error',
        'Failed to parse the uploaded file. Please check the file format.',
        'high'
      ));
    }
  };

  const handleHeaderMapping = (fileHeader: string, systemField: string) => {
    setHeaderMapping(prev => ({
      ...prev,
      [fileHeader]: systemField
    }));
  };

  const handleImportData = async () => {
    if (!importData) return;

    setImporting(true);
    setImportProgress(0);

    try {
      const mappedData = importData.data.map(row => {
        const mapped: any = {};
        Object.entries(headerMapping).forEach(([fileHeader, systemField]) => {
          mapped[systemField] = row[fileHeader];
        });
        return mapped;
      });

      // Simulate import process
      for (let i = 0; i < mappedData.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportProgress(((i + 1) / mappedData.length) * 100);
      }

      // Add imported data to state (in real app, this would go to backend)
      if (importType === 'vendors') {
        const newVendors = mappedData.map((row, index) => ({
          id: `imported-vendor-${Date.now()}-${index}`,
          name: row.name || `Vendor ${index + 1}`,
          contactPerson: row.contactPerson || '',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          category: row.category || 'General',
          rating: 0,
          status: 'active' as const,
          totalOrders: 0,
          totalSpent: 0,
          paymentTerms: row.paymentTerms || 'Net 30',
          leadTime: parseInt(row.leadTime) || 7,
        }));
        
        setVendors(prevVendors => [...prevVendors, ...newVendors]);
        console.log('Importing vendors:', newVendors);
        addNotification(createNotification.procurement(
          'Vendors Imported',
          `Successfully imported ${newVendors.length} vendors`
        ));
      } else if (importType === 'inventory') {
        const newInventory = mappedData.map((row, index) => ({
          id: `imported-inv-${Date.now()}-${index}`,
          name: row.name || `Item ${index + 1}`,
          sku: row.sku || `SKU-${index + 1}`,
          category: row.category || 'General',
          quantity: parseInt(row.quantity) || 0,
          minQuantity: parseInt(row.minQuantity) || 0,
          maxQuantity: parseInt(row.maxQuantity) || 100,
          unitPrice: parseFloat(row.unitPrice) || 0,
          totalValue: (parseInt(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0),
          location: row.location || 'Warehouse',
          supplier: row.supplier || '',
          lastUpdated: new Date().toISOString().split('T')[0],
          status: (parseInt(row.quantity) || 0) > 0 ? 'in-stock' as const : 'out-of-stock' as const,
        }));
        
        setInventory(prevInventory => [...prevInventory, ...newInventory]);
        console.log('Importing inventory:', newInventory);
        addNotification(createNotification.procurement(
          'Inventory Imported',
          `Successfully imported ${newInventory.length} inventory items`
        ));
      } else if (importType === 'purchase-orders') {
        const newPOs = mappedData.map((row, index) => ({
          id: `imported-po-${Date.now()}-${index}`,
          poNumber: row.poNumber || `PO-2024-${String(purchaseOrders.length + index + 1).padStart(3, '0')}`,
          vendor: row.vendor || `Vendor ${index + 1}`,
          vendorId: `vendor-${index + 1}`,
          items: [],
          totalAmount: parseFloat(row.totalAmount) || 0,
          status: 'draft' as const,
          orderDate: row.orderDate || new Date().toISOString().split('T')[0],
          expectedDelivery: row.expectedDelivery || '',
          createdBy: row.createdBy || 'Imported User',
          priority: (row.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
          notes: row.notes || '',
        }));
        
        setPurchaseOrders(prevPOs => [...prevPOs, ...newPOs]);
        console.log('Importing purchase orders:', newPOs);
        addNotification(createNotification.procurement(
          'Purchase Orders Imported',
          `Successfully imported ${newPOs.length} purchase orders`
        ));
      }

      setImportStep(4);
      setImporting(false);
      
      // Close dialog after a delay
      setTimeout(() => {
        setOpenImportDialog(false);
        setImportStep(0);
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      addNotification(createNotification.system(
        'Import Failed',
        'Failed to import data. Please try again.',
        'high'
      ));
      setImporting(false);
    }
  };

  const getSystemFields = () => {
    switch (importType) {
      case 'vendors':
        return [
          { value: 'name', label: 'Vendor Name' },
          { value: 'contactPerson', label: 'Contact Person' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'address', label: 'Address' },
          { value: 'category', label: 'Category' },
          { value: 'paymentTerms', label: 'Payment Terms' },
          { value: 'leadTime', label: 'Lead Time (days)' },
        ];
      case 'inventory':
        return [
          { value: 'name', label: 'Item Name' },
          { value: 'sku', label: 'SKU' },
          { value: 'category', label: 'Category' },
          { value: 'quantity', label: 'Quantity' },
          { value: 'minQuantity', label: 'Min Quantity' },
          { value: 'maxQuantity', label: 'Max Quantity' },
          { value: 'unitPrice', label: 'Unit Price' },
          { value: 'location', label: 'Location' },
          { value: 'supplier', label: 'Supplier' },
        ];
      case 'purchase-orders':
        return [
          { value: 'poNumber', label: 'PO Number' },
          { value: 'vendor', label: 'Vendor' },
          { value: 'totalAmount', label: 'Total Amount' },
          { value: 'status', label: 'Status' },
          { value: 'orderDate', label: 'Order Date' },
          { value: 'expectedDelivery', label: 'Expected Delivery' },
          { value: 'priority', label: 'Priority' },
          { value: 'notes', label: 'Notes' },
        ];
      default:
        return [];
    }
  };

  const downloadTemplate = () => {
    const systemFields = getSystemFields();
    const headers = systemFields.map(field => field.label).join(',');
    const sampleData = systemFields.map(field => {
      switch (field.value) {
        case 'name': return 'Sample Vendor Name';
        case 'email': return 'sample@email.com';
        case 'phone': return '+1-555-0123';
        case 'category': return 'Technology';
        case 'quantity': return '10';
        case 'unitPrice': return '100.00';
        case 'status': return 'pending';
        case 'priority': return 'medium';
        default: return 'Sample Data';
      }
    }).join(',');
    
    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Vendor management functions
  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setOpenViewVendor(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setOpenEditVendor(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setOpenDeleteVendor(true);
  };

  const handleUpdateVendor = () => {
    if (!editingVendor) return;

    setVendors(prevVendors => 
      prevVendors.map(vendor => 
        vendor.id === editingVendor.id ? editingVendor : vendor
      )
    );

    addNotification(createNotification.procurement(
      'Vendor Updated',
      `Vendor "${editingVendor.name}" has been successfully updated`
    ));

    setOpenEditVendor(false);
    setEditingVendor(null);
  };

  const handleConfirmDeleteVendor = () => {
    if (!selectedVendor) return;

    setVendors(prevVendors => 
      prevVendors.filter(vendor => vendor.id !== selectedVendor.id)
    );

    addNotification(createNotification.procurement(
      'Vendor Deleted',
      `Vendor "${selectedVendor.name}" has been successfully deleted`
    ));

    setOpenDeleteVendor(false);
    setSelectedVendor(null);
  };

  // Add-ons and plugins functions
  const handleOpenAddons = () => {
    setOpenAddonsDialog(true);
    // Initialize with all add-ons as available for integration
    setInstalledAddons([]); // Start with no installed add-ons

    setAvailableAddons([
      {
        id: 'addon1',
        name: 'QuickBooks Integration',
        description: 'Sync purchase orders and invoices with QuickBooks Online. Automatically create invoices, track payments, and maintain financial records.',
        version: '2.1.0',
        author: 'TimelyMate',
        category: 'integration',
        status: 'available',
        icon: '📊',
        features: ['Auto-sync POs', 'Invoice matching', 'Real-time updates', 'Payment tracking', 'Financial reporting'],
        requirements: ['QuickBooks Online account', 'API access enabled'],
        price: 29.99,
        rating: 4.8,
        downloads: 1250,
        lastUpdated: '2024-01-15',
        isEnabled: false,
        apiKey: 'qb_****_****_****',
        credentials: {
          clientId: 'qb_client_123',
          clientSecret: 'qb_secret_****'
        },
        permissions: ['read:invoices', 'write:purchases', 'read:payments'],
        dependencies: ['oauth2', 'quickbooks-api'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web', 'desktop']
        },
        installationSteps: [
          'Connect QuickBooks Online account',
          'Configure sync settings',
          'Set up webhook endpoints',
          'Test connection'
        ],
        documentation: 'https://docs.timelymate.com/quickbooks-integration',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 29.99,
          features: ['Unlimited sync', 'Priority support', 'Advanced reporting']
        }
      },
      {
        id: 'addon2',
        name: 'Email Automation',
        description: 'Automatically send PO confirmations, status updates, and notifications to vendors and team members.',
        version: '1.5.2',
        author: 'TimelyMate',
        category: 'automation',
        status: 'available',
        icon: '📧',
        features: ['Auto-email POs', 'Status updates', 'Custom templates', 'Scheduled notifications', 'Email tracking'],
        requirements: ['SMTP configuration', 'Email templates'],
        price: 19.99,
        rating: 4.6,
        downloads: 890,
        lastUpdated: '2024-01-10',
        isEnabled: false,
        webhookUrl: 'https://api.timelymate.com/webhooks/email',
        configuration: {
          fields: [
            {
              name: 'smtp_host',
              label: 'SMTP Host',
              type: 'text',
              required: true,
              placeholder: 'smtp.gmail.com',
              helpText: 'Your SMTP server hostname'
            },
            {
              name: 'smtp_port',
              label: 'SMTP Port',
              type: 'number',
              required: true,
              placeholder: '587',
              validation: { min: 1, max: 65535 }
            },
            {
              name: 'smtp_username',
              label: 'SMTP Username',
              type: 'email',
              required: true,
              placeholder: 'your-email@gmail.com'
            },
            {
              name: 'smtp_password',
              label: 'SMTP Password',
              type: 'password',
              required: true,
              helpText: 'Use app password for Gmail'
            }
          ],
          required: ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password']
        },
        permissions: ['send:emails', 'read:notifications'],
        dependencies: ['nodemailer', 'template-engine'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Configure SMTP settings',
          'Set up email templates',
          'Configure notification rules',
          'Test email delivery'
        ],
        documentation: 'https://docs.timelymate.com/email-automation',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 19.99,
          features: ['Unlimited emails', 'Custom templates', 'Email analytics']
        }
      },
      {
        id: 'addon3',
        name: 'Slack Notifications',
        description: 'Get real-time notifications in Slack channels for PO updates, approvals, and important events.',
        version: '1.2.0',
        author: 'TimelyMate',
        category: 'communication',
        status: 'available',
        icon: '💬',
        features: ['Channel notifications', 'Custom alerts', 'Team collaboration', 'Webhook integration', 'Message formatting'],
        requirements: ['Slack workspace', 'Admin permissions'],
        price: 15.99,
        rating: 4.7,
        downloads: 650,
        lastUpdated: '2024-01-12',
        isEnabled: false,
        configuration: {
          fields: [
            {
              name: 'webhook_url',
              label: 'Slack Webhook URL',
              type: 'url',
              required: true,
              placeholder: 'https://hooks.slack.com/services/...',
              helpText: 'Create a webhook in your Slack app settings'
            },
            {
              name: 'channel',
              label: 'Default Channel',
              type: 'text',
              required: true,
              placeholder: '#procurement',
              helpText: 'Channel to send notifications to'
            },
            {
              name: 'notifications',
              label: 'Notification Types',
              type: 'select',
              required: true,
              options: [
                { value: 'all', label: 'All notifications' },
                { value: 'important', label: 'Important only' },
                { value: 'custom', label: 'Custom selection' }
              ]
            }
          ],
          required: ['webhook_url', 'channel']
        },
        permissions: ['send:notifications', 'read:channels'],
        dependencies: ['slack-api', 'webhook-handler'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Create Slack app and webhook',
          'Configure notification channels',
          'Set up notification rules',
          'Test webhook connection'
        ],
        documentation: 'https://docs.timelymate.com/slack-integration',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 15.99,
          features: ['Unlimited notifications', 'Custom channels', 'Message templates']
        }
      },
      {
        id: 'addon4',
        name: 'Advanced Analytics',
        description: 'Deep insights into procurement performance with custom dashboards, predictive analytics, and cost optimization.',
        version: '3.0.1',
        author: 'TimelyMate',
        category: 'analytics',
        status: 'available',
        icon: '📈',
        features: ['Custom dashboards', 'Predictive analytics', 'Cost optimization', 'Trend analysis', 'Export reports'],
        requirements: ['Minimum 100 POs', 'Data export enabled'],
        price: 49.99,
        rating: 4.9,
        downloads: 320,
        lastUpdated: '2024-01-08',
        isEnabled: false,
        configuration: {
          fields: [
            {
              name: 'data_retention',
              label: 'Data Retention Period',
              type: 'select',
              required: true,
              options: [
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
                { value: '365', label: '1 year' },
                { value: 'unlimited', label: 'Unlimited' }
              ]
            },
            {
              name: 'export_format',
              label: 'Export Format',
              type: 'select',
              required: true,
              options: [
                { value: 'csv', label: 'CSV' },
                { value: 'excel', label: 'Excel' },
                { value: 'pdf', label: 'PDF' },
                { value: 'json', label: 'JSON' }
              ]
            },
            {
              name: 'auto_refresh',
              label: 'Auto-refresh Dashboards',
              type: 'checkbox',
              required: false
            }
          ],
          required: ['data_retention', 'export_format']
        },
        permissions: ['read:analytics', 'export:data', 'create:dashboards'],
        dependencies: ['chart.js', 'data-processor', 'export-service'],
        compatibility: {
          minVersion: '2.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Configure data retention settings',
          'Set up export preferences',
          'Create initial dashboards',
          'Configure auto-refresh'
        ],
        documentation: 'https://docs.timelymate.com/analytics',
        supportEmail: 'support@timelymate.com',
        license: 'enterprise',
        subscription: {
          type: 'yearly',
          price: 599.99,
          features: ['Unlimited analytics', 'Custom dashboards', 'Priority support', 'Data export']
        }
      },
      {
        id: 'addon5',
        name: 'Microsoft Teams Integration',
        description: 'Integrate with Microsoft Teams for notifications, approvals, and team collaboration.',
        version: '1.0.0',
        author: 'TimelyMate',
        category: 'communication',
        status: 'available',
        icon: '💼',
        features: ['Teams notifications', 'Approval workflows', 'Channel integration', 'Meeting scheduling', 'File sharing'],
        requirements: ['Microsoft Teams', 'Admin permissions'],
        price: 25.99,
        rating: 4.5,
        downloads: 180,
        lastUpdated: '2024-01-20',
        isEnabled: false,
        configuration: {
          fields: [
            {
              name: 'tenant_id',
              label: 'Tenant ID',
              type: 'text',
              required: true,
              placeholder: 'your-tenant-id',
              helpText: 'Your Microsoft 365 tenant ID'
            },
            {
              name: 'client_id',
              label: 'Client ID',
              type: 'text',
              required: true,
              placeholder: 'your-app-client-id'
            },
            {
              name: 'client_secret',
              label: 'Client Secret',
              type: 'password',
              required: true
            },
            {
              name: 'team_id',
              label: 'Default Team ID',
              type: 'text',
              required: true,
              placeholder: 'team-id'
            }
          ],
          required: ['tenant_id', 'client_id', 'client_secret', 'team_id']
        },
        permissions: ['read:teams', 'send:notifications', 'create:meetings'],
        dependencies: ['microsoft-graph', 'teams-api'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Register app in Azure AD',
          'Configure Microsoft Graph permissions',
          'Set up Teams integration',
          'Test notifications'
        ],
        documentation: 'https://docs.timelymate.com/teams-integration',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 25.99,
          features: ['Unlimited notifications', 'Team collaboration', 'Meeting integration']
        }
      },
      {
        id: 'addon6',
        name: 'Zapier Integration',
        description: 'Connect TimelyMate with 5000+ apps through Zapier. Automate workflows and sync data across platforms.',
        version: '1.3.0',
        author: 'TimelyMate',
        category: 'integration',
        status: 'available',
        icon: '🔗',
        features: ['5000+ app connections', 'Custom workflows', 'Data sync', 'Trigger automation', 'Webhook support'],
        requirements: ['Zapier account', 'API access'],
        price: 12.99,
        rating: 4.4,
        downloads: 420,
        lastUpdated: '2024-01-18',
        isEnabled: false,
        configuration: {
          fields: [
            {
              name: 'api_key',
              label: 'Zapier API Key',
              type: 'password',
              required: true,
              placeholder: 'zap_...',
              helpText: 'Your Zapier API key from account settings'
            },
            {
              name: 'webhook_url',
              label: 'Webhook URL',
              type: 'url',
              required: true,
              placeholder: 'https://hooks.zapier.com/...',
              helpText: 'Zapier webhook URL for data sync'
            },
            {
              name: 'sync_frequency',
              label: 'Sync Frequency',
              type: 'select',
              required: true,
              options: [
                { value: 'realtime', label: 'Real-time' },
                { value: '5min', label: 'Every 5 minutes' },
                { value: '15min', label: 'Every 15 minutes' },
                { value: '1hour', label: 'Every hour' }
              ]
            }
          ],
          required: ['api_key', 'webhook_url', 'sync_frequency']
        },
        permissions: ['read:data', 'write:data', 'webhook:access'],
        dependencies: ['zapier-api', 'webhook-handler'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Create Zapier account',
          'Generate API key',
          'Set up webhook endpoint',
          'Configure sync frequency',
          'Test connection'
        ],
        documentation: 'https://docs.timelymate.com/zapier-integration',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 12.99,
          features: ['Unlimited connections', 'Custom workflows', 'Priority support']
        }
      },
      {
        id: 'addon7',
        name: 'Google Workspace Integration',
        description: 'Integrate with Google Workspace for calendar sync, document sharing, and team collaboration.',
        version: '2.0.0',
        author: 'TimelyMate',
        category: 'productivity',
        status: 'available',
        icon: '📅',
        features: ['Calendar sync', 'Document sharing', 'Drive integration', 'Gmail notifications', 'Meet scheduling'],
        requirements: ['Google Workspace account', 'Admin permissions'],
        price: 22.99,
        rating: 4.6,
        downloads: 380,
        lastUpdated: '2024-01-14',
        isEnabled: false,
        configuration: {
          fields: [
            {
              name: 'client_id',
              label: 'Google Client ID',
              type: 'text',
              required: true,
              placeholder: 'your-client-id.apps.googleusercontent.com'
            },
            {
              name: 'client_secret',
              label: 'Google Client Secret',
              type: 'password',
              required: true
            },
            {
              name: 'calendar_id',
              label: 'Calendar ID',
              type: 'text',
              required: true,
              placeholder: 'primary',
              helpText: 'Calendar ID to sync with (use "primary" for main calendar)'
            },
            {
              name: 'drive_folder',
              label: 'Drive Folder ID',
              type: 'text',
              required: false,
              placeholder: 'folder-id',
              helpText: 'Google Drive folder for document storage (optional)'
            }
          ],
          required: ['client_id', 'client_secret', 'calendar_id']
        },
        permissions: ['read:calendar', 'write:calendar', 'read:drive', 'send:emails'],
        dependencies: ['google-api', 'oauth2'],
        compatibility: {
          minVersion: '1.0.0',
          platforms: ['web']
        },
        installationSteps: [
          'Create Google Cloud project',
          'Enable Google Workspace APIs',
          'Configure OAuth credentials',
          'Set up calendar sync',
          'Test integration'
        ],
        documentation: 'https://docs.timelymate.com/google-workspace',
        supportEmail: 'support@timelymate.com',
        license: 'premium',
        subscription: {
          type: 'monthly',
          price: 22.99,
          features: ['Unlimited sync', 'Document storage', 'Calendar integration']
        }
      }
    ]);
  };

  const handleInstallAddon = async (addon: Addon) => {
    setSelectedAddon(addon);
    setInstallingAddon(true);
    setInstallProgress(0);

    // Simulate installation process
    const steps = addon.installationSteps || ['Preparing installation...', 'Downloading files...', 'Installing dependencies...', 'Configuring...', 'Testing connection...'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setInstallProgress(((i + 1) / steps.length) * 100);
    }

    // Move to configuration if required
    if (addon.configuration) {
      setInstallingAddon(false);
      setOpenAddonConfig(true);
    } else {
      // Complete installation
      setInstalledAddons(prev => [...prev, { ...addon, status: 'installed' as const, isEnabled: true }]);
      setAvailableAddons(prev => prev.filter(a => a.id !== addon.id));
      setInstallingAddon(false);
      setInstallProgress(0);
      
      addNotification(createNotification.procurement(
        'Add-on Installed',
        `"${addon.name}" has been successfully installed`
      ));
    }
  };

  const handleConfigureAddon = () => {
    if (!selectedAddon) return;

    // Validate required fields
    const requiredFields = selectedAddon.configuration?.required || [];
    const missingFields = requiredFields.filter(field => !addonConfigData[field]);
    
    if (missingFields.length > 0) {
      addNotification(createNotification.system(
        'Configuration Required',
        `Please fill in all required fields: ${missingFields.join(', ')}`,
        'high'
      ));
      return;
    }

    // Complete installation with configuration
    setInstalledAddons(prev => [...prev, { 
      ...selectedAddon, 
      status: 'installed' as const, 
      isEnabled: true,
      settings: addonConfigData
    }]);
    setAvailableAddons(prev => prev.filter(a => a.id !== selectedAddon.id));
    setOpenAddonConfig(false);
    setSelectedAddon(null);
    setAddonConfigData({});
    
    addNotification(createNotification.procurement(
      'Add-on Configured',
      `"${selectedAddon.name}" has been successfully installed and configured`
    ));
  };

  const handleUninstallAddon = (addon: Addon) => {
    setInstalledAddons(prev => prev.filter(a => a.id !== addon.id));
    setAvailableAddons(prev => [...prev, { ...addon, status: 'available' as const, isEnabled: false }]);
    
    addNotification(createNotification.procurement(
      'Add-on Uninstalled',
      `"${addon.name}" has been successfully uninstalled`
    ));
  };

  const handleToggleAddon = (addonId: string, enabled: boolean) => {
    setInstalledAddons(prev => 
      prev.map(addon => 
        addon.id === addonId ? { ...addon, isEnabled: enabled } : addon
      )
    );
    
    addNotification(createNotification.procurement(
      'Add-on Updated',
      `Add-on has been ${enabled ? 'enabled' : 'disabled'}`
    ));
  };

  const handleOpenAddonSettings = (addon: Addon) => {
    setSelectedAddon(addon);
    setAddonConfigData(addon.settings || {});
    setOpenAddonConfig(true);
  };

  // Inventory management functions
  const handleViewInventory = (item: InventoryItem) => {
    setSelectedInventory(item);
    setOpenViewInventory(true);
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventory(item);
    setOpenEditInventory(true);
  };

  const handleDeleteInventory = (item: InventoryItem) => {
    setSelectedInventory(item);
    setOpenDeleteInventory(true);
  };

  const handleUpdateInventory = () => {
    if (!editingInventory) return;

    setInventory(prevInventory => 
      prevInventory.map(item => 
        item.id === editingInventory.id ? editingInventory : item
      )
    );

    addNotification(createNotification.procurement(
      'Inventory Item Updated',
      `Item "${editingInventory.name}" has been successfully updated`
    ));

    setOpenEditInventory(false);
    setEditingInventory(null);
  };

  const handleConfirmDeleteInventory = () => {
    if (!selectedInventory) return;

    setInventory(prevInventory => 
      prevInventory.filter(item => item.id !== selectedInventory.id)
    );

    addNotification(createNotification.procurement(
      'Inventory Item Deleted',
      `Item "${selectedInventory.name}" has been successfully deleted`
    ));

    setOpenDeleteInventory(false);
    setSelectedInventory(null);
  };

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            pt: 4,
            pb: 6,
            px: 3,
            mb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 500, mb: 1 }}>
              Procurement
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Manage purchase orders, vendors, and inventory
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenNewPO(true)}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
              >
                New Purchase Order
              </Button>
              <Button
                variant="outlined"
                startIcon={<Business />}
                onClick={() => setOpenNewVendor(true)}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }}
              >
                Add Vendor
              </Button>
              <Button
                variant="outlined"
                startIcon={<Inventory />}
                onClick={() => setOpenNewInventory(true)}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }}
              >
                Add Inventory
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={handleImportClick}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }}
              >
                Import Data
              </Button>
              <Button
                variant="outlined"
                startIcon={<Extension />}
                onClick={handleOpenAddons}
                sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }}
              >
                Integrations
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: -4 }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 4 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
              <Tab label="Purchase Orders" icon={<ShoppingCart />} iconPosition="start" />
              <Tab label="Vendors" icon={<Business />} iconPosition="start" />
              <Tab label="Inventory" icon={<Inventory />} iconPosition="start" />
            </Tabs>

            {/* Overview Tab */}
            {currentTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Recent Orders */}
                  <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Recent Purchase Orders</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => setOpenNewPO(true)}
                        >
                          New PO
                        </Button>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>PO Number</TableCell>
                              <TableCell>Vendor</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Expected Delivery</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {metrics.recentOrders.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      No purchase orders yet
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Add />}
                                      onClick={() => setOpenNewPO(true)}
                                    >
                                      Create First PO
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : (
                              metrics.recentOrders.map((po) => (
                                <TableRow key={po.id}>
                                  <TableCell>{po.poNumber}</TableCell>
                                  <TableCell>{po.vendor}</TableCell>
                                  <TableCell>{formatAmount(po.totalAmount)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={po.status}
                                      color={getStatusColor(po.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{new Date(po.expectedDelivery).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <IconButton size="small" onClick={() => handleViewPO(po)}>
                                      <Visibility />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>

                    {/* Top Vendors */}
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Top Vendors
                      </Typography>
                      <List>
                        {metrics.topVendors.length === 0 ? (
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    No vendors yet
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Business />}
                                    onClick={() => setOpenNewVendor(true)}
                                  >
                                    Add First Vendor
                                  </Button>
                                </Box>
                              }
                            />
                          </ListItem>
                        ) : (
                          metrics.topVendors.map((vendor, index) => (
                            <React.Fragment key={vendor.id}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {vendor.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={vendor.name}
                                  secondary={`${vendor.totalOrders} orders • ${formatAmount(vendor.totalSpent)} spent`}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ mr: 1 }}>
                                    {vendor.rating}
                                  </Typography>
                                  <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                                </Box>
                              </ListItem>
                              {index < metrics.topVendors.length - 1 && <Divider />}
                            </React.Fragment>
                          ))
                        )}
                      </List>
                    </Paper>
                  </Grid>

                  {/* Sidebar */}
                  <Grid item xs={12} md={4}>
                    {/* Low Stock Alert */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Low Stock Alerts
                      </Typography>
                      {metrics.lowStockItems.length === 0 ? (
                        <Alert severity="success">
                          All inventory items are well stocked!
                        </Alert>
                      ) : (
                        <List>
                          {metrics.lowStockItems.slice(0, 5).map((item) => (
                            <ListItem key={item.id} sx={{ px: 0 }}>
                              <ListItemIcon>
                                <Warning color="warning" />
                              </ListItemIcon>
                              <ListItemText
                                primary={item.name}
                                secondary={`${item.quantity} remaining (min: ${item.minQuantity})`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Paper>

                    {/* Quick Actions */}
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          fullWidth
                          onClick={() => setOpenNewPO(true)}
                        >
                          Create Purchase Order
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Business />}
                          fullWidth
                          onClick={() => setOpenNewVendor(true)}
                        >
                          Add New Vendor
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Inventory />}
                          fullWidth
                          onClick={() => setOpenNewInventory(true)}
                        >
                          Add Inventory Item
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Upload />}
                          fullWidth
                          onClick={handleImportClick}
                        >
                          Import Data
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Purchase Orders Tab */}
            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Purchase Orders
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenNewPO(true)}
                  >
                    New Purchase Order
                  </Button>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search PO number, vendor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filterStatus}
                          label="Status"
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <MenuItem value="all">All Statuses</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="ordered">Ordered</MenuItem>
                          <MenuItem value="received">Received</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<FilterList />}>
                          More Filters
                        </Button>
                        <Button variant="outlined" startIcon={<Download />}>
                          Export
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Purchase Orders Table */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>PO Number</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Order Date</TableCell>
                        <TableCell>Expected Delivery</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell>{po.poNumber}</TableCell>
                          <TableCell>{po.vendor}</TableCell>
                          <TableCell>{formatAmount(po.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={po.status}
                              color={getStatusColor(po.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={po.priority}
                              color={getPriorityColor(po.priority)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(po.expectedDelivery).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small" onClick={() => handleViewPO(po)}>
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleEditPO(po)}>
                                <Edit />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeletePO(po)}>
                                <Delete />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Vendors Tab */}
            {currentTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Vendors
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenNewVendor(true)}
                  >
                    Add Vendor
                  </Button>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search vendor name, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={filterCategory}
                          label="Category"
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <MenuItem value="all">All Categories</MenuItem>
                          <MenuItem value="Technology">Technology</MenuItem>
                          <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                          <MenuItem value="Industrial">Industrial</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<FilterList />}>
                          More Filters
                        </Button>
                        <Button variant="outlined" startIcon={<Download />}>
                          Export
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Vendors Grid */}
                <Grid container spacing={3}>
                  {filteredVendors.map((vendor) => (
                    <Grid item xs={12} md={6} lg={4} key={vendor.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                              {vendor.name.charAt(0)}
                            </Avatar>
                            <Chip
                              label={vendor.status}
                              color={getStatusColor(vendor.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {vendor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {vendor.category}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Contact:</strong> {vendor.contactPerson}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Email:</strong> {vendor.email}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phone:</strong> {vendor.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Rating
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    sx={{
                                      color: star <= vendor.rating ? 'warning.main' : 'grey.300',
                                      fontSize: 16,
                                    }}
                                  />
                                ))}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {vendor.rating}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="text.secondary">
                                Total Spent
                              </Typography>
                              <Typography variant="h6">
                                {formatAmount(vendor.totalSpent)}
                              </Typography>
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              onClick={() => handleViewVendor(vendor)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              startIcon={<Edit />}
                              onClick={() => handleEditVendor(vendor)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              startIcon={<Delete />}
                              color="error"
                              onClick={() => handleDeleteVendor(vendor)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Inventory Tab */}
            {currentTab === 3 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Inventory
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenNewInventory(true)}
                  >
                    Add Item
                  </Button>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search item name, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={filterCategory}
                          label="Category"
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <MenuItem value="all">All Categories</MenuItem>
                          <MenuItem value="Technology">Technology</MenuItem>
                          <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                          <MenuItem value="Industrial">Industrial</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<FilterList />}>
                          More Filters
                        </Button>
                        <Button variant="outlined" startIcon={<Download />}>
                          Export
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Inventory Table */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {item.quantity}
                              </Typography>
                              {item.quantity <= item.minQuantity && (
                                <Warning color="warning" sx={{ fontSize: 16 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{formatAmount(item.unitPrice)}</TableCell>
                          <TableCell>{formatAmount(item.totalValue)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewInventory(item)}
                                title="View Details"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditInventory(item)}
                                title="Edit Item"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteInventory(item)}
                                title="Delete Item"
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Container>

        {/* New Purchase Order Dialog */}
        <Dialog open={openNewPO} onClose={() => setOpenNewPO(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={newPO.vendorId}
                  label="Vendor"
                  onChange={(e) => setNewPO({ ...newPO, vendorId: e.target.value })}
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Expected Delivery"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPO.expectedDelivery}
                onChange={(e) => setNewPO({ ...newPO, expectedDelivery: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newPO.priority}
                  label="Priority"
                  onChange={(e) => setNewPO({ ...newPO, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={newPO.notes}
                onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewPO(false)}>Cancel</Button>
            <Button onClick={handleCreatePO} variant="contained">
              Create PO
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Vendor Dialog */}
        <Dialog open={openNewVendor} onClose={() => setOpenNewVendor(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Vendor Name"
                fullWidth
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />
              <TextField
                label="Contact Person"
                fullWidth
                value={newVendor.contactPerson}
                onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newVendor.category}
                  label="Category"
                  onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                >
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                  <MenuItem value="Industrial">Industrial</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Payment Terms"
                fullWidth
                value={newVendor.paymentTerms}
                onChange={(e) => setNewVendor({ ...newVendor, paymentTerms: e.target.value })}
              />
              <TextField
                label="Lead Time (days)"
                type="number"
                fullWidth
                value={newVendor.leadTime}
                onChange={(e) => setNewVendor({ ...newVendor, leadTime: parseInt(e.target.value) })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewVendor(false)}>Cancel</Button>
            <Button onClick={handleCreateVendor} variant="contained">
              Add Vendor
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Inventory Item Dialog */}
        <Dialog open={openNewInventory} onClose={() => setOpenNewInventory(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Item Name"
                fullWidth
                value={newInventory.name}
                onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
              />
              <TextField
                label="SKU"
                fullWidth
                value={newInventory.sku}
                onChange={(e) => setNewInventory({ ...newInventory, sku: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newInventory.category}
                  label="Category"
                  onChange={(e) => setNewInventory({ ...newInventory, category: e.target.value })}
                >
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                  <MenuItem value="Industrial">Industrial</MenuItem>
                </Select>
              </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={newInventory.quantity}
                    onChange={(e) => setNewInventory({ ...newInventory, quantity: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    fullWidth
                    value={newInventory.unitPrice}
                    onChange={(e) => setNewInventory({ ...newInventory, unitPrice: parseFloat(e.target.value) })}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Quantity"
                    type="number"
                    fullWidth
                    value={newInventory.minQuantity}
                    onChange={(e) => setNewInventory({ ...newInventory, minQuantity: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Quantity"
                    type="number"
                    fullWidth
                    value={newInventory.maxQuantity}
                    onChange={(e) => setNewInventory({ ...newInventory, maxQuantity: parseInt(e.target.value) })}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Location"
                fullWidth
                value={newInventory.location}
                onChange={(e) => setNewInventory({ ...newInventory, location: e.target.value })}
              />
              <TextField
                label="Supplier"
                fullWidth
                value={newInventory.supplier}
                onChange={(e) => setNewInventory({ ...newInventory, supplier: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewInventory(false)}>Cancel</Button>
            <Button onClick={handleCreateInventory} variant="contained">
              Add Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Dialog */}
        <Dialog 
          open={openImportDialog} 
          onClose={() => setOpenImportDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CloudUpload color="primary" />
              Import Data
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={importStep} orientation="vertical" sx={{ mt: 2 }}>
              {importSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    {index === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Select the type of data you want to import:
                        </Typography>
                        <RadioGroup
                          value={importType}
                          onChange={(e) => setImportType(e.target.value as any)}
                        >
                          <MuiFormControlLabel
                            value="vendors"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Business color="primary" />
                                <Typography>Vendors</Typography>
                              </Box>
                            }
                          />
                          <MuiFormControlLabel
                            value="inventory"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Inventory color="primary" />
                                <Typography>Inventory Items</Typography>
                              </Box>
                            }
                          />
                          <MuiFormControlLabel
                            value="purchase-orders"
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShoppingCart color="primary" />
                                <Typography>Purchase Orders</Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            onClick={downloadTemplate}
                            size="small"
                          >
                            Download Template
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {index === 1 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Upload your file (Excel, CSV, or PDF):
                        </Typography>
                        <Box
                          sx={{
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                          }}
                        >
                          <input
                            type="file"
                            accept=".csv,.xlsx,.xls,.pdf"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="file-upload"
                          />
                          <label htmlFor="file-upload">
                            <Button
                              component="span"
                              variant="outlined"
                              startIcon={<Upload />}
                              sx={{ cursor: 'pointer' }}
                            >
                              Choose File
                            </Button>
                          </label>
                          {importFile && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Selected: {importFile.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    {index === 2 && importData && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Map your file headers to system fields:
                        </Typography>
                        <Grid container spacing={2}>
                          {importData.headers.map((header) => (
                            <Grid item xs={12} sm={6} key={header}>
                              <FormControl fullWidth size="small">
                                <InputLabel>{header}</InputLabel>
                                <Select
                                  value={headerMapping[header] || ''}
                                  label={header}
                                  onChange={(e) => handleHeaderMapping(header, e.target.value)}
                                >
                                  <MenuItem value="">Skip this column</MenuItem>
                                  {getSystemFields().map((field) => (
                                    <MenuItem key={field.value} value={field.value}>
                                      {field.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {index === 3 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Preview of your data:
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {Object.values(headerMapping).filter(Boolean).map((field) => (
                                  <TableCell key={field}>{field}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {previewData.map((row, index) => (
                                <TableRow key={index}>
                                  {Object.values(headerMapping).filter(Boolean).map((field) => (
                                    <TableCell key={field}>{row[Object.keys(headerMapping).find(key => headerMapping[key] === field) || '']}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {index === 4 && (
                      <Box sx={{ mt: 2 }}>
                        {importing ? (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Importing data...
                            </Typography>
                            <LinearProgress variant="determinate" value={importProgress} sx={{ mt: 1 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {Math.round(importProgress)}% complete
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h6" color="success.main">
                              Import Complete!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Your data has been successfully imported.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      {index < importSteps.length - 1 && (
                        <Button
                          variant="contained"
                          onClick={() => setImportStep(importStep + 1)}
                          disabled={index === 1 && !importFile}
                        >
                          {index === importSteps.length - 2 ? 'Import Data' : 'Continue'}
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => setImportStep(importStep - 1)}
                        disabled={index === 0}
                        sx={{ ml: 1 }}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImportDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* View Purchase Order Dialog */}
        <Dialog open={openViewPO} onClose={() => setOpenViewPO(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Visibility color="primary" />
              Purchase Order Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedPO && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>PO Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">PO Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedPO.poNumber}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Vendor</Typography>
                      <Typography variant="body1">{selectedPO.vendor}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip label={selectedPO.status} color={getStatusColor(selectedPO.status)} size="small" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Priority</Typography>
                      <Chip label={selectedPO.priority} color={getPriorityColor(selectedPO.priority)} size="small" variant="outlined" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Dates & Amounts</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Order Date</Typography>
                      <Typography variant="body1">{new Date(selectedPO.orderDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Expected Delivery</Typography>
                      <Typography variant="body1">{new Date(selectedPO.expectedDelivery).toLocaleDateString()}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" color="primary.main">{formatAmount(selectedPO.totalAmount)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Items</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPO.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{formatAmount(item.unitPrice)}</TableCell>
                              <TableCell align="right">{formatAmount(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  {selectedPO.notes && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Typography variant="body2">{selectedPO.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewPO(false)}>Close</Button>
            <Button onClick={() => { setOpenViewPO(false); handleEditPO(selectedPO!); }} variant="outlined">
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Purchase Order Dialog */}
        <Dialog open={openEditPO} onClose={() => setOpenEditPO(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Edit color="primary" />
              Edit Purchase Order
            </Box>
          </DialogTitle>
          <DialogContent>
            {editingPO && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="PO Number"
                      fullWidth
                      value={editingPO.poNumber}
                      onChange={(e) => setEditingPO({ ...editingPO, poNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editingPO.status}
                        label="Status"
                        onChange={(e) => setEditingPO({ ...editingPO, status: e.target.value as any })}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="ordered">Ordered</MenuItem>
                        <MenuItem value="received">Received</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <FormControl fullWidth>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={editingPO.vendorId}
                    label="Vendor"
                    onChange={(e) => setEditingPO({ 
                      ...editingPO, 
                      vendorId: e.target.value,
                      vendor: vendors.find(v => v.id === e.target.value)?.name || ''
                    })}
                  >
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Order Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={editingPO.orderDate}
                      onChange={(e) => setEditingPO({ ...editingPO, orderDate: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Expected Delivery"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={editingPO.expectedDelivery}
                      onChange={(e) => setEditingPO({ ...editingPO, expectedDelivery: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editingPO.priority}
                    label="Priority"
                    onChange={(e) => setEditingPO({ ...editingPO, priority: e.target.value as any })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={editingPO.notes || ''}
                  onChange={(e) => setEditingPO({ ...editingPO, notes: e.target.value })}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditPO(false)}>Cancel</Button>
            <Button onClick={handleUpdatePO} variant="contained">
              Update PO
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Purchase Order Confirmation Dialog */}
        <Dialog open={openDeletePO} onClose={() => setOpenDeletePO(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete color="error" />
              Delete Purchase Order
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Are you sure you want to delete Purchase Order <strong>{selectedPO?.poNumber}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All associated data will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeletePO(false)}>Cancel</Button>
            <Button onClick={handleConfirmDeletePO} variant="contained" color="error">
              Delete PO
            </Button>
          </DialogActions>
        </Dialog>

        {/* Metrics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                  {metrics.totalOrders}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                  {formatAmount(metrics.totalSpent)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Spent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PendingActions sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                  {metrics.pendingOrders}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Warning sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
                  {metrics.lowStockItems.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Low Stock Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View Vendor Dialog */}
        <Dialog open={openViewVendor} onClose={() => setOpenViewVendor(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business color="primary" />
              Vendor Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedVendor && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      {selectedVendor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedVendor.category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">
                        {selectedVendor.rating} Rating
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedVendor.status}
                      color={getStatusColor(selectedVendor.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Contact:</strong> {selectedVendor.contactPerson}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Email:</strong> {selectedVendor.email}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Phone:</strong> {selectedVendor.phone}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Address:</strong> {selectedVendor.address}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Business Information
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Total Orders:</strong> {selectedVendor.totalOrders}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Total Spent:</strong> {formatAmount(selectedVendor.totalSpent)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Payment Terms:</strong> {selectedVendor.paymentTerms}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Lead Time:</strong> {selectedVendor.leadTime} days
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Activity
                    </Typography>
                    {selectedVendor.lastOrderDate ? (
                      <Typography variant="body2" color="text.secondary">
                        Last order: {new Date(selectedVendor.lastOrderDate).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent orders
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewVendor(false)}>Close</Button>
            <Button 
              onClick={() => {
                setOpenViewVendor(false);
                handleEditVendor(selectedVendor!);
              }} 
              variant="outlined"
              startIcon={<Edit />}
            >
              Edit Vendor
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Vendor Dialog */}
        <Dialog open={openEditVendor} onClose={() => setOpenEditVendor(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Edit color="primary" />
              Edit Vendor
            </Box>
          </DialogTitle>
          <DialogContent>
            {editingVendor && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Vendor Name"
                      fullWidth
                      value={editingVendor.name}
                      onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Category"
                      fullWidth
                      value={editingVendor.category}
                      onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Contact Person"
                      fullWidth
                      value={editingVendor.contactPerson}
                      onChange={(e) => setEditingVendor({ ...editingVendor, contactPerson: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={editingVendor.email}
                      onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone"
                      fullWidth
                      value={editingVendor.phone}
                      onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editingVendor.status}
                        label="Status"
                        onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value as any })}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={editingVendor.address}
                  onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Payment Terms"
                      fullWidth
                      value={editingVendor.paymentTerms}
                      onChange={(e) => setEditingVendor({ ...editingVendor, paymentTerms: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Lead Time (days)"
                      type="number"
                      fullWidth
                      value={editingVendor.leadTime}
                      onChange={(e) => setEditingVendor({ ...editingVendor, leadTime: parseInt(e.target.value) || 0 })}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditVendor(false)}>Cancel</Button>
            <Button onClick={handleUpdateVendor} variant="contained">
              Update Vendor
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Vendor Confirmation Dialog */}
        <Dialog open={openDeleteVendor} onClose={() => setOpenDeleteVendor(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete color="error" />
              Delete Vendor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Are you sure you want to delete vendor <strong>{selectedVendor?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All associated purchase orders and data will be permanently removed.
            </Typography>
            {selectedVendor && selectedVendor.totalOrders > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This vendor has {selectedVendor.totalOrders} orders and {formatAmount(selectedVendor.totalSpent)} in total spending.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteVendor(false)}>Cancel</Button>
            <Button onClick={handleConfirmDeleteVendor} variant="contained" color="error">
              Delete Vendor
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add-ons & Plugins Dialog */}
        <Dialog open={openAddonsDialog} onClose={() => setOpenAddonsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Extension color="primary" />
              Integrations & Add-ons
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={handleAddonsTabChange} sx={{ mb: 3 }}>
              <Tab label="Installed" />
              <Tab label="Available Integrations" />
            </Tabs>
            
            {/* Installed Add-ons */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Installed Add-ons ({installedAddons.length})
              </Typography>
              {installedAddons.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Extension sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Add-ons Installed
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Install add-ons from the available integrations below to enhance your procurement workflow.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => setTabValue(1)}
                  >
                    Browse Available Add-ons
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {installedAddons.map((addon) => (
                    <Grid item xs={12} md={6} key={addon.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h4" sx={{ mr: 1 }}>
                              {addon.icon}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{addon.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                v{addon.version} by {addon.author}
                              </Typography>
                            </Box>
                            <Switch
                              checked={addon.isEnabled}
                              onChange={(e) => handleToggleAddon(addon.id, e.target.checked)}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {addon.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {addon.features.map((feature, index) => (
                              <Chip key={index} label={feature} size="small" variant="outlined" />
                            ))}
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Settings />}
                              onClick={() => handleOpenAddonSettings(addon)}
                            >
                              Settings
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleUninstallAddon(addon)}
                            >
                              Uninstall
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Available Add-ons */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Available Integrations ({availableAddons.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enhance your procurement workflow by integrating with popular tools and services.
              </Typography>
              <Grid container spacing={2}>
                {availableAddons.map((addon) => (
                  <Grid item xs={12} md={6} key={addon.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" sx={{ mr: 1 }}>
                            {addon.icon}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{addon.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              v{addon.version} by {addon.author}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            ${addon.price}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {addon.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Star sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {addon.rating} ({addon.downloads} downloads)
                          </Typography>
                          <Chip label={addon.category} size="small" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          {addon.features.slice(0, 3).map((feature, index) => (
                            <Chip key={index} label={feature} size="small" variant="outlined" />
                          ))}
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleInstallAddon(addon)}
                        >
                          Install Integration
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddonsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* View Inventory Item Dialog */}
        <Dialog open={openViewInventory} onClose={() => setOpenViewInventory(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Inventory2 color="primary" />
              Inventory Item Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedInventory && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Item Information</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Item Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedInventory.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">SKU</Typography>
                      <Typography variant="body1">{selectedInventory.sku}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">{selectedInventory.category}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip label={selectedInventory.status} color={getStatusColor(selectedInventory.status)} size="small" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Quantity</Typography>
                      <Typography variant="body1">{selectedInventory.quantity}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                      <Typography variant="body1">{formatAmount(selectedInventory.unitPrice)}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Value</Typography>
                      <Typography variant="body1">{formatAmount(selectedInventory.totalValue)}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{selectedInventory.location}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Supplier</Typography>
                      <Typography variant="body1">{selectedInventory.supplier}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{new Date(selectedInventory.lastUpdated).toLocaleDateString()}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewInventory(false)}>Close</Button>
            <Button onClick={() => { setOpenViewInventory(false); handleEditInventory(selectedInventory!); }} variant="outlined">
              Edit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Inventory Item Dialog */}
        <Dialog open={openEditInventory} onClose={() => setOpenEditInventory(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Edit color="primary" />
              Edit Inventory Item
            </Box>
          </DialogTitle>
          <DialogContent>
            {editingInventory && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Item Name"
                      fullWidth
                      value={editingInventory.name}
                      onChange={(e) => setEditingInventory({ ...editingInventory, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Category"
                      fullWidth
                      value={editingInventory.category}
                      onChange={(e) => setEditingInventory({ ...editingInventory, category: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={editingInventory.quantity}
                      onChange={(e) => setEditingInventory({ ...editingInventory, quantity: parseInt(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Unit Price"
                      type="number"
                      fullWidth
                      value={editingInventory.unitPrice}
                      onChange={(e) => setEditingInventory({ ...editingInventory, unitPrice: parseFloat(e.target.value) })}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Min Quantity"
                      type="number"
                      fullWidth
                      value={editingInventory.minQuantity}
                      onChange={(e) => setEditingInventory({ ...editingInventory, minQuantity: parseInt(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Max Quantity"
                      type="number"
                      fullWidth
                      value={editingInventory.maxQuantity}
                      onChange={(e) => setEditingInventory({ ...editingInventory, maxQuantity: parseInt(e.target.value) })}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Location"
                  fullWidth
                  value={editingInventory.location}
                  onChange={(e) => setEditingInventory({ ...editingInventory, location: e.target.value })}
                />
                <TextField
                  label="Supplier"
                  fullWidth
                  value={editingInventory.supplier}
                  onChange={(e) => setEditingInventory({ ...editingInventory, supplier: e.target.value })}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditInventory(false)}>Cancel</Button>
            <Button onClick={handleUpdateInventory} variant="contained">
              Update Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Inventory Item Confirmation Dialog */}
        <Dialog open={openDeleteInventory} onClose={() => setOpenDeleteInventory(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete color="error" />
              Delete Inventory Item
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Are you sure you want to delete Inventory Item <strong>{selectedInventory?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All associated purchase orders and data will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteInventory(false)}>Cancel</Button>
            <Button onClick={handleConfirmDeleteInventory} variant="contained" color="error">
              Delete Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add-on Configuration Dialog */}
        <Dialog open={openAddonConfig} onClose={() => setOpenAddonConfig(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Settings color="primary" />
              Configure {selectedAddon?.name}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedAddon && (
              <Box sx={{ mt: 2 }}>
                {/* Installation Progress */}
                {installingAddon && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Installing {selectedAddon.name}...
                    </Typography>
                    <LinearProgress variant="determinate" value={installProgress} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(installProgress)}% Complete
                    </Typography>
                  </Box>
                )}

                {/* Add-on Information */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {selectedAddon.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h6">{selectedAddon.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        v{selectedAddon.version} by {selectedAddon.author}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedAddon.description}
                  </Typography>
                  
                  {/* Requirements */}
                  {selectedAddon.requirements.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Requirements:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedAddon.requirements.map((req, index) => (
                          <Chip key={index} label={req} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Permissions */}
                  {selectedAddon.permissions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Permissions:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedAddon.permissions.map((perm, index) => (
                          <Chip key={index} label={perm} size="small" color="primary" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>

                {/* Configuration Fields */}
                {selectedAddon.configuration && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Please provide the required information to complete the installation.
                    </Typography>
                    
                    <Stack spacing={3}>
                      {selectedAddon.configuration.fields.map((field) => (
                        <Box key={field.name}>
                          {field.type === 'text' && (
                            <TextField
                              label={field.label}
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                            />
                          )}
                          
                          {field.type === 'password' && (
                            <TextField
                              label={field.label}
                              type="password"
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                            />
                          )}
                          
                          {field.type === 'email' && (
                            <TextField
                              label={field.label}
                              type="email"
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                            />
                          )}
                          
                          {field.type === 'url' && (
                            <TextField
                              label={field.label}
                              type="url"
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                            />
                          )}
                          
                          {field.type === 'number' && (
                            <TextField
                              label={field.label}
                              type="number"
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                              inputProps={field.validation ? {
                                min: field.validation.min,
                                max: field.validation.max
                              } : undefined}
                            />
                          )}
                          
                          {field.type === 'select' && (
                            <FormControl fullWidth required={field.required}>
                              <InputLabel>{field.label}</InputLabel>
                              <Select
                                value={addonConfigData[field.name] || ''}
                                label={field.label}
                                onChange={(e) => setAddonConfigData({
                                  ...addonConfigData,
                                  [field.name]: e.target.value
                                })}
                              >
                                {field.options?.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {field.helpText && (
                                <FormHelperText>{field.helpText}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                          
                          {field.type === 'checkbox' && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={addonConfigData[field.name] || false}
                                  onChange={(e) => setAddonConfigData({
                                    ...addonConfigData,
                                    [field.name]: e.target.checked
                                  })}
                                />
                              }
                              label={field.label}
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <TextField
                              label={field.label}
                              multiline
                              rows={4}
                              fullWidth
                              required={field.required}
                              placeholder={field.placeholder}
                              value={addonConfigData[field.name] || ''}
                              onChange={(e) => setAddonConfigData({
                                ...addonConfigData,
                                [field.name]: e.target.value
                              })}
                              helperText={field.helpText}
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Installation Steps */}
                {selectedAddon.installationSteps && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Installation Steps
                    </Typography>
                    <List dense>
                      {selectedAddon.installationSteps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Typography variant="body2" color="primary">
                              {index + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Documentation Link */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Need help? Check out the{' '}
                    <a href={selectedAddon.documentation} target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>
                      documentation
                    </a>
                    {' '}or contact support at{' '}
                    <a href={`mailto:${selectedAddon.supportEmail}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      {selectedAddon.supportEmail}
                    </a>
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddonConfig(false)}>
              Cancel
            </Button>
            {selectedAddon?.configuration && (
              <Button 
                onClick={handleConfigureAddon} 
                variant="contained"
                disabled={installingAddon}
              >
                {installingAddon ? 'Installing...' : 'Complete Installation'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

      </Box>
    </DashboardLayout>
  );
};

export default Procurement; 