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
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tab,
  Tabs,
  Rating,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Construction,
  Code,
  Brush,
  LocalHospital,
  VrpanoOutlined,
  Extension,
  CloudDownload,
  Star,
  CheckCircle,
  Security,
  Speed,
  Build,
  AddCircle,
  PlayArrow,
  Settings,
  Cloud,
  Watch,
  Groups,
  Api,
  Visibility,
  VisibilityOff,
  Link,
  Check,
  Error,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import FeatureGuard from '../../components/FeatureGuard';

interface IndustryTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  rating: number;
  downloads: number;
  status: 'installed' | 'available';
}

interface VRTutorial {
  id: string;
  title: string;
  industry: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'oauth' | 'api_key' | 'webhook';
  requiredFields: string[];
  optionalFields?: string[];
  description: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
}

const industryTemplates: IndustryTemplate[] = [
  {
    id: '1',
    name: 'Construction Suite',
    icon: <Construction fontSize="large" />,
    description: 'Complete toolkit for construction project management',
    features: [
      'Equipment tracking logs',
      'Site safety checklists',
      'Material inventory management',
      'Contractor scheduling',
      'Building code compliance',
    ],
    rating: 4.8,
    downloads: 12500,
    status: 'available',
  },
  {
    id: '2',
    name: 'IT Bug Tracker Pro',
    icon: <Code fontSize="large" />,
    description: 'Advanced bug tracking and development workflow',
    features: [
      'Issue tracking system',
      'Git integration',
      'Sprint planning',
      'Release management',
      'API documentation',
    ],
    rating: 4.9,
    downloads: 28900,
    status: 'installed',
  },
  {
    id: '3',
    name: 'Creative Agency Hub',
    icon: <Brush fontSize="large" />,
    description: 'Client feedback and creative project management',
    features: [
      'Client feedback loops',
      'Asset management',
      'Project timelines',
      'Brand guidelines',
      'Design approval workflow',
    ],
    rating: 4.7,
    downloads: 8900,
    status: 'available',
  },
  {
    id: '4',
    name: 'Healthcare Compliance',
    icon: <LocalHospital fontSize="large" />,
    description: 'HIPAA-compliant healthcare team management',
    features: [
      'HIPAA compliance tools',
      'Patient data protection',
      'Audit logging',
      'Secure messaging',
      'Compliance reporting',
    ],
    rating: 4.9,
    downloads: 5600,
    status: 'available',
  },
];

const vrTutorials: VRTutorial[] = [
  {
    id: '1',
    title: 'Construction Site Safety',
    industry: 'Construction',
    duration: '45 mins',
    difficulty: 'Beginner',
    progress: 75,
  },
  {
    id: '2',
    title: 'Agile Development Workflow',
    industry: 'IT',
    duration: '60 mins',
    difficulty: 'Intermediate',
  },
  {
    id: '3',
    title: 'Client Presentation Skills',
    industry: 'Creative Agency',
    duration: '30 mins',
    difficulty: 'Advanced',
  },
  {
    id: '4',
    title: 'HIPAA Compliance Training',
    industry: 'Healthcare',
    duration: '90 mins',
    difficulty: 'Intermediate',
    progress: 25,
  },
];

const integrationConfigs: IntegrationConfig[] = [
  {
    id: 'teams',
    name: 'Microsoft Teams',
    type: 'oauth',
    requiredFields: ['client_id', 'client_secret', 'tenant_id'],
    description: 'Connect to Microsoft Teams for meeting integration and team collaboration',
    icon: 'MS',
    color: '#6264A7',
    status: 'disconnected',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    type: 'oauth',
    requiredFields: ['client_id', 'client_secret'],
    description: 'Integrate with Zoom for meeting detection and attendance tracking',
    icon: 'Z',
    color: '#2D8CFF',
    status: 'disconnected',
  },
  {
    id: 'google',
    name: 'Google Workspace',
    type: 'oauth',
    requiredFields: ['client_id', 'client_secret'],
    description: 'Sync with Google Calendar, Drive, and Meet',
    icon: 'G',
    color: '#4285F4',
    status: 'disconnected',
  },
  {
    id: 'slack',
    name: 'Slack',
    type: 'oauth',
    requiredFields: ['client_id', 'client_secret'],
    description: 'Get notifications and updates in Slack channels',
    icon: 'S',
    color: '#4A154B',
    status: 'disconnected',
  },
  {
    id: 'discord',
    name: 'Discord',
    type: 'webhook',
    requiredFields: ['webhook_url'],
    description: 'Integrate with Discord for team communication',
    icon: 'D',
    color: '#FF6B6B',
    status: 'disconnected',
  },
  {
    id: 'trello',
    name: 'Trello',
    type: 'api_key',
    requiredFields: ['api_key', 'token'],
    description: 'Sync tasks and projects with Trello boards',
    icon: 'T',
    color: '#00BFA6',
    status: 'disconnected',
  },
  {
    id: 'jira',
    name: 'Jira',
    type: 'api_key',
    requiredFields: ['base_url', 'email', 'api_token'],
    description: 'Connect with Jira for issue tracking',
    icon: 'J',
    color: '#0052CC',
    status: 'disconnected',
  },
];

const IndustryModules: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [tutorialDialogOpen, setTutorialDialogOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<VRTutorial | null>(null);
  
  // Integration states
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [integrationCredentials, setIntegrationCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [integrationStep, setIntegrationStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(integrationConfigs);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTemplateClick = (template: IndustryTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTutorialClick = (tutorial: VRTutorial) => {
    setSelectedTutorial(tutorial);
    setTutorialDialogOpen(true);
  };

  const handleIntegrationClick = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setIntegrationCredentials({});
    setShowPasswords({});
    setIntegrationStep(0);
    setConnectionError(null);
    setIntegrationDialogOpen(true);
  };

  const handleCredentialChange = (field: string, value: string) => {
    setIntegrationCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTogglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if all required fields are filled
      const missingFields = selectedIntegration.requiredFields.filter(
        field => !integrationCredentials[field]
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Simulate successful connection
      setIntegrationStep(2);
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
            : integration
        )
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveIntegration = () => {
    if (!selectedIntegration) return;
    
    // Here you would typically save the credentials securely
    console.log('Saving integration:', selectedIntegration.id, integrationCredentials);
    
    setIntegrationDialogOpen(false);
    setSelectedIntegration(null);
    setIntegrationCredentials({});
  };

  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'disconnected', lastSync: undefined }
          : integration
      )
    );
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'pending': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getIntegrationStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'pending': return 'Pending';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="industryModules">
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
              Industry Modules
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Specialized tools and templates for your industry
            </Typography>

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
                    <Extension sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                    {industryTemplates.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Templates
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
                    <VrpanoOutlined sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                    {vrTutorials.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    VR Tutorials
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
                    <CloudDownload sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                    {industryTemplates.reduce((acc, template) => acc + template.downloads, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Downloads
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
                    <Star sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary' }}>
                    4.8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: -4 }}>
          <Paper sx={{ borderRadius: 2, mb: 4 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Industry Templates" icon={<Extension />} iconPosition="start" />
              <Tab label="VR Training" icon={<VrpanoOutlined />} iconPosition="start" />
              <Tab label="Add-ons & Plugins" icon={<AddCircle />} iconPosition="start" />
            </Tabs>

            {/* Industry Templates Tab */}
            {currentTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {industryTemplates.map((template) => (
                    <Grid item xs={12} md={6} key={template.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => handleTemplateClick(template)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: 'primary.main', mr: 2 }}>
                              {template.icon}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {template.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {template.description}
                              </Typography>
                            </Box>
                            <Chip
                              label={template.status === 'installed' ? 'Installed' : 'Available'}
                              color={template.status === 'installed' ? 'success' : 'primary'}
                              size="small"
                            />
                          </Box>
                          <List dense>
                            {template.features.map((feature, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircle color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                              </ListItem>
                            ))}
                          </List>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={template.rating} precision={0.1} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({template.rating})
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {template.downloads.toLocaleString()} downloads
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* VR Training Tab */}
            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {vrTutorials.map((tutorial) => (
                    <Grid item xs={12} md={6} key={tutorial.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => handleTutorialClick(tutorial)}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={`/vr-tutorial-${tutorial.id}.jpg`}
                          alt={tutorial.title}
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {tutorial.title}
                            </Typography>
                            <Chip
                              label={tutorial.difficulty}
                              color={
                                tutorial.difficulty === 'Beginner'
                                  ? 'success'
                                  : tutorial.difficulty === 'Intermediate'
                                  ? 'primary'
                                  : 'error'
                              }
                              size="small"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Industry: {tutorial.industry}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {tutorial.duration}
                            </Typography>
                          </Box>
                          {tutorial.progress !== undefined && (
                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Progress
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {tutorial.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={tutorial.progress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Add-ons & Plugins Tab */}
            {currentTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Integration & Scalability
                </Typography>
                
                {/* API Integration Section */}
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  API Integration & Connectivity
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Api color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Typography variant="h6">
                            REST API Access
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Full REST API access with comprehensive documentation, SDKs, and webhook support for custom integrations.
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Features:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            • OAuth 2.0 Authentication<br/>
                            • Webhook notifications<br/>
                            • Rate limiting & quotas<br/>
                            • SDKs for Node.js, Python, Java<br/>
                            • Real-time data sync
                          </Typography>
                        </Box>
                        <Button variant="outlined" fullWidth>
                          View API Docs
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Cloud color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Typography variant="h6">
                            Webhook Management
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Configure webhooks to receive real-time notifications for events like time tracking, task completion, and meeting updates.
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Event Types:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            • Time tracking start/stop<br/>
                            • Task status changes<br/>
                            • Meeting reminders<br/>
                            • Project updates<br/>
                            • Team member activities
                          </Typography>
                        </Box>
                        <Button variant="outlined" fullWidth>
                          Configure Webhooks
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Communication Apps Integration */}
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Communication & Collaboration Apps
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {integrations.filter(integration => ['teams', 'zoom', 'google'].includes(integration.id)).map((integration) => (
                    <Grid item xs={12} md={4} key={integration.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 2, 
                              bgcolor: integration.color, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2 
                            }}>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {integration.icon}
                              </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6">
                                {integration.name}
                              </Typography>
                              <Chip
                                label={getIntegrationStatusText(integration.status)}
                                color={getIntegrationStatusColor(integration.status) as any}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {integration.description}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Features:</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {integration.id === 'teams' && (
                                <>• Auto-join meetings<br/>
                                • Meeting time tracking<br/>
                                • Team channel sync<br/>
                                • Status updates<br/>
                                • File sharing</>
                              )}
                              {integration.id === 'zoom' && (
                                <>• Meeting auto-detection<br/>
                                • Attendance tracking<br/>
                                • Meeting duration logs<br/>
                                • Recording management<br/>
                                • Calendar sync</>
                              )}
                              {integration.id === 'google' && (
                                <>• Calendar sync<br/>
                                • Drive file access<br/>
                                • Meet integration<br/>
                                • Gmail notifications<br/>
                                • Docs collaboration</>
                              )}
                            </Typography>
                          </Box>
                          {integration.status === 'connected' ? (
                            <Box>
                              <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                                Manage Integration
                              </Button>
                              <Button 
                                variant="text" 
                                color="error" 
                                fullWidth 
                                size="small"
                                onClick={() => handleDisconnectIntegration(integration.id)}
                              >
                                Disconnect
                              </Button>
                            </Box>
                          ) : (
                            <Box>
                              <Button 
                                variant="contained" 
                                fullWidth 
                                sx={{ mb: 1 }}
                                onClick={() => handleIntegrationClick(integration)}
                              >
                                Connect {integration.name}
                              </Button>
                              <Button variant="outlined" fullWidth size="small">
                                View Integration
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Additional Integrations */}
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Additional Integrations
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {integrations.filter(integration => ['slack', 'discord', 'trello', 'jira'].includes(integration.id)).map((integration) => (
                    <Grid item xs={12} md={3} key={integration.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 2, 
                              bgcolor: integration.color, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2 
                            }}>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {integration.icon}
                              </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6">
                                {integration.name}
                              </Typography>
                              <Chip
                                label={getIntegrationStatusText(integration.status)}
                                color={getIntegrationStatusColor(integration.status) as any}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {integration.description}
                          </Typography>
                          {integration.status === 'connected' ? (
                            <Button 
                              variant="text" 
                              color="error" 
                              fullWidth 
                              size="small"
                              onClick={() => handleDisconnectIntegration(integration.id)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button 
                              variant="outlined" 
                              fullWidth
                              onClick={() => handleIntegrationClick(integration)}
                            >
                              Connect {integration.name}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Enterprise Features */}
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Enterprise & Scalability
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Watch color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Typography variant="h6">
                            Smartwatch Companion
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Check tasks, log time, or join meetings from your wrist with Apple Watch and Wear OS support.
                        </Typography>
                        <Button variant="outlined" fullWidth>
                          Get App
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Groups color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Typography variant="h6">
                            Enterprise Scaling
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Scales effortlessly from startups to enterprises with tiered plans and unlimited users.
                        </Typography>
                        <Button variant="outlined" fullWidth>
                          View Plans
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Security color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Typography variant="h6">
                            Security & Compliance
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Enterprise-grade security with SOC 2, GDPR, and HIPAA compliance for sensitive data.
                        </Typography>
                        <Button variant="outlined" fullWidth>
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Container>

        {/* VR Tutorial Dialog */}
        <Dialog
          open={tutorialDialogOpen}
          onClose={() => setTutorialDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VrpanoOutlined color="primary" />
              <Typography variant="h6">
                Start VR Tutorial
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTutorial && (
              <Box>
                <CardMedia
                  component="img"
                  height="300"
                  image={`/vr-tutorial-${selectedTutorial.id}.jpg`}
                  alt={selectedTutorial.title}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {selectedTutorial.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={selectedTutorial.difficulty}
                    color={
                      selectedTutorial.difficulty === 'Beginner'
                        ? 'success'
                        : selectedTutorial.difficulty === 'Intermediate'
                        ? 'primary'
                        : 'error'
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {selectedTutorial.duration}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Get ready for an immersive learning experience in {selectedTutorial.industry}. 
                  Make sure your VR headset is connected and the area around you is clear.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Settings />
                  <Typography variant="body2" color="text.secondary">
                    Recommended: Oculus Quest 2 or compatible VR headset
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setTutorialDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              sx={{ borderRadius: 2 }}
            >
              Launch Tutorial
            </Button>
          </DialogActions>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog
          open={integrationDialogOpen}
          onClose={() => setIntegrationDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Extension />
              <Typography variant="h6">
                {selectedIntegration ? `Connect ${selectedIntegration.name}` : 'Add Integration'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedIntegration && (
              <Box>
                <Typography variant="body1" paragraph>
                  {selectedIntegration.description}
                </Typography>
                
                <Stepper activeStep={integrationStep} orientation="vertical" sx={{ mb: 3 }}>
                  <Step>
                    <StepLabel>Enter Credentials</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please provide the required credentials for {selectedIntegration.name}:
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {selectedIntegration.requiredFields.map((field) => (
                          <TextField
                            key={field}
                            label={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            type={field.includes('secret') || field.includes('token') || field.includes('password') 
                              ? (showPasswords[field] ? 'text' : 'password') 
                              : 'text'
                            }
                            value={integrationCredentials[field] || ''}
                            onChange={(e) => handleCredentialChange(field, e.target.value)}
                            fullWidth
                            margin="normal"
                            InputProps={{
                              endAdornment: (field.includes('secret') || field.includes('token') || field.includes('password')) ? (
                                <IconButton
                                  onClick={() => handleTogglePasswordVisibility(field)}
                                  edge="end"
                                >
                                  {showPasswords[field] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              ) : undefined
                            }}
                          />
                        ))}
                      </Box>
                      <Button
                        variant="contained"
                        onClick={handleTestConnection}
                        disabled={isConnecting}
                        startIcon={isConnecting ? <CircularProgress size={20} /> : <Link />}
                      >
                        {isConnecting ? 'Testing Connection...' : 'Test Connection'}
                      </Button>
                    </StepContent>
                  </Step>
                  
                  <Step>
                    <StepLabel>Verify Connection</StepLabel>
                    <StepContent>
                      {connectionError ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Connection Failed:</strong> {connectionError}
                          </Typography>
                        </Alert>
                      ) : (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Connection Successful!</strong> {selectedIntegration.name} is ready to use.
                          </Typography>
                        </Alert>
                      )}
                    </StepContent>
                  </Step>
                  
                  <Step>
                    <StepLabel>Complete Setup</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Your integration is ready! You can now use {selectedIntegration.name} features.
                      </Typography>
                    </StepContent>
                  </Step>
                </Stepper>
                
                {connectionError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Error:</strong> {connectionError}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIntegrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Check />}
              sx={{ borderRadius: 2 }}
              onClick={handleSaveIntegration}
              disabled={!selectedIntegration || integrationStep < 2}
            >
              Save Integration
            </Button>
          </DialogActions>
        </Dialog>
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default IndustryModules; 