import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  Upgrade as UpgradeIcon,
  Check as CheckIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlanFeatures, getRecommendedUpgradePlan } from '../types/subscription';
import { useNotifications, createNotification } from '../contexts/NotificationContext';

interface FeatureGuardProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  /** When false, hides upgrade UI (rare). Defaults to true. */
  allowUpgradePrompt?: boolean;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback,
  allowUpgradePrompt = true,
}) => {
  const navigate = useNavigate();
  const { hasFeature, currentPlan, updateSubscription } = useSubscription();
  const { addNotification } = useNotifications();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const recommendedPlan = getRecommendedUpgradePlan(currentPlan?.id, feature);

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const goToPricing = () => {
    setUpgradeDialogOpen(false);
    navigate('/pricing', { state: { highlightPlan: recommendedPlan.id } });
  };

  const handleUpgradeClick = () => {
    if (!allowUpgradePrompt) return;
    (document.activeElement as HTMLElement | null)?.blur();
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    setUpgrading(true);
    try {
      const success = await updateSubscription(recommendedPlan.id);
      if (success) {
        addNotification(
          createNotification.system(
            'Plan upgraded',
            `You are now on the ${recommendedPlan.name} plan.`,
            'low'
          )
        );
        setUpgradeDialogOpen(false);
      } else {
        addNotification(
          createNotification.system(
            'Upgrade failed',
            'Could not update your plan. Try again from the pricing page.',
            'high'
          )
        );
      }
    } finally {
      setUpgrading(false);
    }
  };

  const getFeatureName = (f: keyof PlanFeatures): string => {
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
      offsiteWork: 'Field Operations',
      industryModules: 'Industry Modules',
      expenseTracking: 'Expense Tracking',
      procurement: 'Procurement',
      learningPortal: 'Learning Portal',
      storageGB: 'Storage',
      monthlyReports: 'Monthly Reports',
      integrationLimit: 'Integration Limit',
    };
    return featureNames[f] || f;
  };

  const defaultFallback = (
    <Card
      sx={{
        border: '2px dashed',
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <LockIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {getFeatureName(feature)} Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This feature requires the <strong>{recommendedPlan.name}</strong> plan or higher.
        </Typography>
        {allowUpgradePrompt && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<UpgradeIcon />}
              onClick={handleUpgradeClick}
            >
              Upgrade Plan
            </Button>
            <Button variant="outlined" onClick={goToPricing}>
              View Plans
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {fallback || defaultFallback}

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
            <AlertTitle>Feature not available</AlertTitle>
            <strong>{getFeatureName(feature)}</strong> is not included in your current{' '}
            <strong>{currentPlan?.name ?? 'plan'}</strong>.
          </Alert>

          <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <StarIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Recommended: {recommendedPlan.name}
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {recommendedPlan.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                What you&apos;ll get:
              </Typography>

              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`${getFeatureName(feature)}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="All features from your current plan" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Higher limits and storage" />
                </ListItem>
              </List>

              <Box mt={2}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {recommendedPlan.price === 0 ? 'Free' : `R${recommendedPlan.price}`}
                  <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                    {recommendedPlan.price === 0 ? ' forever' : ' per person / month'}
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ p: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setUpgradeDialogOpen(false)} disabled={upgrading}>
            Maybe Later
          </Button>
          <Button variant="outlined" onClick={goToPricing} disabled={upgrading}>
            Compare Plans
          </Button>
          <Button
            variant="contained"
            onClick={handleUpgradeConfirm}
            startIcon={upgrading ? <CircularProgress size={18} color="inherit" /> : <UpgradeIcon />}
            size="large"
            disabled={upgrading || currentPlan?.id === recommendedPlan.id}
          >
            {upgrading ? 'Upgrading…' : 'Upgrade Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeatureGuard;
