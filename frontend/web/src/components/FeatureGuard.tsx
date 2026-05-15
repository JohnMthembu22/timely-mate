import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  Upgrade as UpgradeIcon,
  Check as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlanFeatures, getRequiredPlanForEmployeeCount } from '../types/subscription';

interface FeatureGuardProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { 
    hasFeature, 
    currentPlan, 
    companyProfile, 
    showUpgradePrompt: showUpgrade,
    setShowUpgradePrompt,
    updateSubscription
  } = useSubscription();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);

  const canAccess = hasFeature(feature);

  if (canAccess) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    if (showUpgradePrompt) {
      setUpgradeDialogOpen(true);
    }
  };

  const handleUpgradeConfirm = async () => {
    if (companyProfile) {
      const requiredPlan = getRequiredPlanForEmployeeCount(companyProfile.employeeCount);
      const success = await updateSubscription(requiredPlan.id);
      if (success) {
        setUpgradeDialogOpen(false);
        setShowUpgradePrompt(false);
      }
    }
  };

  const getFeatureName = (feature: keyof PlanFeatures): string => {
    const featureNames: Record<keyof PlanFeatures, string> = {
      timeTracking: 'Time Tracking',
      basicReporting: 'Basic Reporting',
      mobileApp: 'Mobile App',
      webApp: 'Web App',
      teamManagement: 'Team Management',
      userRoles: 'User Roles & Permissions',
      attendance: 'Attendance Tracking',
      schedules: 'Employee Scheduling',
      advancedReporting: 'Advanced Reporting',
      projectTracking: 'Project Tracking',
      invoicing: 'Invoicing & Billing',
      integrations: 'Third-party Integrations',
      customFields: 'Custom Fields',
      advancedAnalytics: 'Advanced Analytics',
      apiAccess: 'API Access',
      whiteLabeling: 'White Labeling',
      ssoIntegration: 'Single Sign-On',
      prioritySupport: 'Priority Support',
      dedicatedAccountManager: 'Dedicated Account Manager',
      meetings: 'Meetings',
      team: 'Team Management',
      freelancers: 'Freelancers',
      messages: 'Messages',
      notifications: 'Notifications',
      offsiteWork: 'Offsite Work',
      industryModules: 'Industry Modules',
      expenseTracking: 'Expense Tracking',
      procurement: 'Procurement',
      learningPortal: 'Learning Portal',
      storageGB: 'Storage',
      monthlyReports: 'Monthly Reports',
      integrationLimit: 'Integration Limit'
    };
    return featureNames[feature] || feature;
  };

  const defaultFallback = (
    <Card 
      sx={{ 
        border: '2px dashed',
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
        cursor: showUpgradePrompt ? 'pointer' : 'default'
      }}
      onClick={handleUpgradeClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <LockIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {getFeatureName(feature)} Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This feature requires a higher subscription plan.
        </Typography>
        {showUpgradePrompt && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<UpgradeIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleUpgradeClick();
            }}
          >
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {fallback || defaultFallback}
      
      {/* Upgrade Dialog */}
      <Dialog 
        open={upgradeDialogOpen} 
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <UpgradeIcon color="primary" />
            <Typography variant="h6">Upgrade Required</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Feature Not Available</AlertTitle>
            <strong>{getFeatureName(feature)}</strong> is not included in your current{' '}
            <strong>{currentPlan?.name}</strong> plan.
          </Alert>

          {companyProfile && (
            <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <StarIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Recommended: {getRequiredPlanForEmployeeCount(companyProfile.employeeCount).name}
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                  Based on your company size of {companyProfile.employeeCount} employees.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  What you'll get:
                </Typography>
                
                <List dense>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={`${getFeatureName(feature)} feature`} />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="All current plan features" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Increased limits and storage" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Priority customer support" />
                  </ListItem>
                </List>

                <Box mt={2}>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {getRequiredPlanForEmployeeCount(companyProfile.employeeCount).price === 0 
                      ? 'Free' 
                      : `R${getRequiredPlanForEmployeeCount(companyProfile.employeeCount).price}`}
                    <Typography variant="body2" component="span" color="text.secondary">
                      {getRequiredPlanForEmployeeCount(companyProfile.employeeCount).price === 0 
                        ? ' Forever' 
                        : ' per person per month'}
                    </Typography>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Maybe Later
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpgradeConfirm}
            startIcon={<UpgradeIcon />}
            size="large"
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeatureGuard; 