import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Check as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { 
  getRequiredPlanForEmployeeCount, 
  getCompanyTier, 
  SubscriptionPlan,
  CompanyProfile,
  SUBSCRIPTION_PLANS,
} from '../types/subscription';
import { TESTING_MODE_UNLOCK_ALL } from '../config/testingMode';

interface ConditionalRegistrationProps {
  open: boolean;
  onClose: () => void;
  onComplete: (companyProfile: CompanyProfile, selectedPlan: SubscriptionPlan) => void;
}

const steps = ['Company Info', 'Plan Selection', 'Confirmation'];

const ConditionalRegistration: React.FC<ConditionalRegistrationProps> = ({
  open,
  onClose,
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    employeeCount: 1,
    country: 'South Africa',
    currency: 'ZAR' as const
  });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === 0) {
        // Auto-select required plan based on employee count
        const requiredPlan = getRequiredPlanForEmployeeCount(companyData.employeeCount);
        const enterprisePlan =
          SUBSCRIPTION_PLANS.find((p) => p.id === 'enterprise') ?? requiredPlan;
        setSelectedPlan(TESTING_MODE_UNLOCK_ALL ? enterprisePlan : requiredPlan);
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    if (selectedPlan) {
      const companyProfile: CompanyProfile = {
        id: Date.now().toString(),
        name: companyData.name,
        industry: companyData.industry,
        employeeCount: companyData.employeeCount,
        country: companyData.country,
        currency: companyData.currency,
        registrationDate: new Date().toISOString(),
        verificationStatus: 'pending'
      };
      
      onComplete(companyProfile, selectedPlan);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeStep === 0) {
      if (!companyData.name.trim()) {
        newErrors.name = 'Company name is required';
      }
      if (!companyData.industry.trim()) {
        newErrors.industry = 'Industry is required';
      }
      if (companyData.employeeCount < 1) {
        newErrors.employeeCount = 'Employee count must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (event: any) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about your company
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This helps us recommend the right plan for your team size and needs.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.industry}>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={companyData.industry}
                    label="Industry"
                    onChange={handleInputChange('industry')}
                  >
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                    <MenuItem value="Retail">Retail</MenuItem>
                    <MenuItem value="Construction">Construction</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Legal">Legal</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Consulting">Consulting</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Employees"
                  type="number"
                  value={companyData.employeeCount}
                  onChange={handleInputChange('employeeCount')}
                  error={!!errors.employeeCount}
                  helperText={errors.employeeCount || 'Include all full-time and part-time employees'}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={companyData.country}
                    label="Country"
                    onChange={handleInputChange('country')}
                  >
                    <MenuItem value="South Africa">South Africa</MenuItem>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={companyData.currency}
                    label="Currency"
                    onChange={handleInputChange('currency')}
                  >
                    <MenuItem value="ZAR">South African Rand (ZAR)</MenuItem>
                    <MenuItem value="USD">US Dollar (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Live Preview */}
            {companyData.employeeCount > 0 && !TESTING_MODE_UNLOCK_ALL && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <AlertTitle>Plan Recommendation</AlertTitle>
                Based on {companyData.employeeCount} employees, we recommend the{' '}
                <strong>{getRequiredPlanForEmployeeCount(companyData.employeeCount).name}</strong> plan.
              </Alert>
            )}
            {companyData.employeeCount > 0 && TESTING_MODE_UNLOCK_ALL && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <AlertTitle>Testing mode</AlertTitle>
                Subscription tiers are off — your workspace will have full access after signup.
              </Alert>
            )}
          </Box>
        );

      case 1:
        if (TESTING_MODE_UNLOCK_ALL) {
          return (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirm workspace setup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Pricing tiers are disabled while you&apos;re testing the app. Continue to finish registration — every page stays unlocked.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Enterprise-equivalent access is applied automatically during testing.
              </Alert>
            </Box>
          );
        }
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Recommended Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Based on your company size of {companyData.employeeCount} employees.
            </Typography>

            {selectedPlan && (
              <Card sx={{ mt: 3, border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <StarIcon color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                      {selectedPlan.name}
                    </Typography>
                    {selectedPlan.isPopular && (
                      <Chip label="Recommended" color="primary" size="small" />
                    )}
                  </Box>

                  <Typography variant="body1" color="text.secondary" paragraph>
                    {selectedPlan.description}
                  </Typography>

                  <Box my={2}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {selectedPlan.price === 0 ? 'Free' : `R${selectedPlan.price}`}
                      <Typography variant="body2" component="span" color="text.secondary">
                        {selectedPlan.price === 0 ? ' Forever' : ' per person per month'}
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    What's included:
                  </Typography>
                  
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Time Tracking & Attendance" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Mobile & Web Applications" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary={`Up to ${selectedPlan.maxEmployees === -1 ? 'Unlimited' : selectedPlan.maxEmployees} employees`} />
                    </ListItem>
                    {selectedPlan.features.teamManagement && (
                      <ListItem disablePadding>
                        <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Team Management & User Roles" />
                      </ListItem>
                    )}
                    {selectedPlan.features.advancedReporting && (
                      <ListItem disablePadding>
                        <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Advanced Reporting & Analytics" />
                      </ListItem>
                    )}
                    {selectedPlan.features.projectTracking && (
                      <ListItem disablePadding>
                        <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Project Tracking & Invoicing" />
                      </ListItem>
                    )}
                    {selectedPlan.features.prioritySupport && (
                      <ListItem disablePadding>
                        <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Priority Customer Support" />
                      </ListItem>
                    )}
                  </List>

                  {selectedPlan.price === 0 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <AlertTitle>Great News!</AlertTitle>
                      Your company qualifies for our free plan. You can upgrade anytime as you grow.
                    </Alert>
                  )}

                  {selectedPlan.price > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>30-Day Free Trial</AlertTitle>
                      Start your free trial today. No credit card required to get started.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {!TESTING_MODE_UNLOCK_ALL && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Company Tier: <strong>{getCompanyTier(companyData.employeeCount).toUpperCase()}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  As your team grows, you can easily upgrade to access more features and higher limits.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to Timely Mate!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You're all set to start with the <strong>{selectedPlan?.name}</strong> plan.
            </Typography>

            <Card sx={{ mt: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Registration Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Company:</Typography>
                    <Typography variant="body1">{companyData.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Industry:</Typography>
                    <Typography variant="body1">{companyData.industry}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Employees:</Typography>
                    <Typography variant="body1">{companyData.employeeCount}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Plan:</Typography>
                    <Typography variant="body1">{selectedPlan?.name}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="success" sx={{ mt: 3 }}>
              <AlertTitle>Next Steps</AlertTitle>
              Click "Complete Registration" to create your account and start using Timely Mate immediately.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <BusinessIcon color="primary" />
          <Typography variant="h6">Company Registration</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleComplete}
            size="large"
            startIcon={<CheckIcon />}
          >
            Complete Registration
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            size="large"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConditionalRegistration; 