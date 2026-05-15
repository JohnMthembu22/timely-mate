import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  AlertTitle,
  Stack,
  Fade,
  useMediaQuery
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  RocketLaunch as RocketLaunchIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Diamond as DiamondIcon
} from '@mui/icons-material';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { currentPlan, updateSubscription, companyProfile } = useSubscription();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check if user came from landing page
  useEffect(() => {
    const fromLandingPage = location.state?.fromLandingPage;
    
    // If no state indicating they came from landing page, redirect
    if (!fromLandingPage) {
      navigate('/', { replace: true });
    }
  }, [navigate, location.state]);

  const handlePlanSelect = async (planId: string) => {
    const success = await updateSubscription(planId);
    if (success) {
      // Handle successful subscription update
      console.log('Subscription updated successfully');
    }
  };

  const getFeatureIcon = (hasFeature: boolean) => {
    return hasFeature ? (
      <CheckIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
    ) : (
      <CloseIcon sx={{ color: '#BDBDBD', fontSize: 20 }} />
    );
  };

  const formatPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'Free';
    const price = isAnnual ? plan.price * 12 * 0.85 : plan.price; // 15% discount for annual
    return `R${price.toFixed(0)}`;
  };

  const getBillingText = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'Forever';
    return isAnnual ? '/user/year' : '/user/month';
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'enterprise':
        return <DiamondIcon sx={{ fontSize: 40 }} />;
      case 'professional':
        return <WorkspacePremiumIcon sx={{ fontSize: 40 }} />;
      case 'starter':
        return <RocketLaunchIcon sx={{ fontSize: 40 }} />;
      default:
        return <PeopleIcon sx={{ fontSize: 40 }} />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
        {/* Back Button */}
        <Fade in={isVisible} timeout={500}>
          <Box mb={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'primary.main'
                }
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Fade>

        {/* Hero Header */}
        <Fade in={isVisible} timeout={800}>
          <Box textAlign="center" mb={6}>
            <Chip
              label="Simple, Transparent Pricing"
              color="primary"
              sx={{ mb: 2, px: 1 }}
            />
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              fontWeight={800}
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Choose Your Perfect Plan
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Scale with confidence. All plans include a 30-day free trial. No credit card required.
            </Typography>
            
            {/* Billing Toggle */}
            <Paper
              elevation={0}
              sx={{
                display: 'inline-flex',
                p: 1,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: !isAnnual ? 600 : 400,
                    color: !isAnnual ? 'primary.main' : 'text.secondary',
                    px: 2
                  }}
                >
                  Monthly
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAnnual}
                      onChange={(e) => setIsAnnual(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label=""
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: isAnnual ? 600 : 400,
                      color: isAnnual ? 'primary.main' : 'text.secondary',
                      px: 2
                    }}
                  >
                    Annual
                  </Typography>
                  <Chip 
                    label="Save 15%" 
                    size="small" 
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      fontWeight: 600,
                      height: '24px'
                    }}
                  />
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Fade>

        {/* Current Plan Alert */}
        {currentPlan && (
          <Fade in={isVisible} timeout={1000}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                bgcolor: 'info.light',
                border: '1px solid',
                borderColor: 'info.main'
              }}
            >
              <AlertTitle>Current Plan</AlertTitle>
              You're currently on the <strong>{currentPlan.name}</strong> plan for {companyProfile?.employeeCount || 0} employees.
            </Alert>
          </Fade>
        )}

        {/* Pricing Cards */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 8 }}>
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <Grid item xs={12} sm={6} lg={3} key={plan.id}>
              <Fade in={isVisible} timeout={1000 + (index * 200)}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'visible',
                    border: plan.isPopular ? '2px solid' : '1px solid',
                    borderColor: plan.isPopular ? theme.palette.primary.main : 'divider',
                    boxShadow: plan.isPopular 
                      ? `0 20px 60px -12px ${theme.palette.primary.main}40`
                      : '0 4px 20px rgba(0,0,0,0.08)',
                    transform: plan.isPopular ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      transform: plan.isPopular ? 'scale(1.05)' : 'scale(1.02)',
                      boxShadow: plan.isPopular
                        ? `0 24px 80px -12px ${theme.palette.primary.main}50`
                        : '0 8px 30px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        px: 3,
                        py: 0.75,
                        borderRadius: 3,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        zIndex: 1
                      }}
                    >
                      <StarIcon sx={{ fontSize: 18 }} />
                      MOST POPULAR
                    </Box>
                  )}

                  {/* Plan Icon Header */}
                  <Box
                    sx={{
                      pt: plan.isPopular ? 4 : 3,
                      pb: 2,
                      px: 3,
                      textAlign: 'center',
                      background: plan.isPopular
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`
                        : 'transparent',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: plan.isPopular ? 'primary.main' : 'action.hover',
                        color: plan.isPopular ? 'white' : 'primary.main',
                        mb: 2
                      }}
                    >
                      {getPlanIcon(plan.id)}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight={700}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                      {plan.description}
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Price */}
                    <Box textAlign="center" mb={3}>
                      <Typography 
                        variant="h3" 
                        component="div" 
                        fontWeight={800}
                        sx={{
                          background: plan.isPopular
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            : 'none',
                          WebkitBackgroundClip: plan.isPopular ? 'text' : 'none',
                          WebkitTextFillColor: plan.isPopular ? 'transparent' : 'inherit',
                          color: plan.isPopular ? 'inherit' : 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {formatPrice(plan)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {getBillingText(plan)}
                      </Typography>
                      {isAnnual && plan.price > 0 && (
                        <Chip 
                          label={`Save R${(plan.price * 12 * 0.15).toFixed(0)}/year`}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>

                    <Chip 
                      label={plan.targetAudience} 
                      size="small" 
                      sx={{ 
                        mb: 3,
                        width: '100%',
                        bgcolor: 'action.hover',
                        fontWeight: 500
                      }}
                    />

                    <Divider sx={{ my: 3 }} />

                    {/* Features List */}
                    <List dense sx={{ mb: 2 }}>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.timeTracking)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Time Tracking" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.teamManagement)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Team Management" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.projectTracking)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Project Tracking" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.advancedReporting)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Advanced Reports" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.mobileApp)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Mobile & Web Apps" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.apiAccess)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="API Access" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(plan.features.prioritySupport)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Priority Support" 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>

                    {/* Limits */}
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Up to {plan.maxEmployees === -1 ? 'Unlimited' : plan.maxEmployees} employees
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {plan.features.storageGB === -1 ? 'Unlimited' : `${plan.features.storageGB} GB`} storage
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={plan.isPopular ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={currentPlan?.id === plan.id}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: plan.isPopular ? `0 4px 20px ${theme.palette.primary.main}30` : 'none',
                        '&:hover': {
                          boxShadow: plan.isPopular 
                            ? `0 6px 30px ${theme.palette.primary.main}40`
                            : '0 4px 15px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      startIcon={
                        plan.id === 'enterprise' ? <BusinessIcon /> :
                        plan.id === 'professional' ? <TrendingUpIcon /> :
                        plan.id === 'starter' ? <RocketLaunchIcon /> : 
                        <PeopleIcon />
                      }
                    >
                      {currentPlan?.id === plan.id ? 'Current Plan' : 
                       plan.price === 0 ? 'Start Free' : 'Get Started'}
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Company Size Guide */}
        <Fade in={isVisible} timeout={1200}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 4 }, 
              mb: 8, 
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight={700} textAlign="center" mb={3}>
              📊 Pricing Based on Company Size
            </Typography>
            <Grid container spacing={3}>
              {[
                { range: '0-5 Employees', plan: 'Startup Free', price: 'R0' },
                { range: '5-25 Employees', plan: 'Basic', price: 'R59/user' },
                { range: '25-100 Employees', plan: 'Professional', price: 'R199/user' },
                { range: '100+ Employees', plan: 'Enterprise', price: 'R499/user' },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    textAlign="center"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.range}
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600} gutterBottom>
                      {item.plan}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.price}/month
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Fade>

        {/* FAQ Section */}
        <Fade in={isVisible} timeout={1400}>
          <Box>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              textAlign="center"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              textAlign="center"
              sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
            >
              Everything you need to know about our pricing
            </Typography>
            
            <Grid container spacing={4}>
              {[
                {
                  question: 'What happens if my team grows?',
                  answer: 'Your plan automatically adjusts based on your employee count. If you exceed your current plan limits, you\'ll be prompted to upgrade to the appropriate tier.'
                },
                {
                  question: 'Can I change plans anytime?',
                  answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated accordingly.'
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'The Startup Free plan is always free for up to 5 employees. Paid plans include a 30-day free trial so you can explore all features risk-free.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, EFT, and South African bank transfers. International payments are processed securely through our payment partners.'
                },
                {
                  question: 'Do you offer discounts for annual plans?',
                  answer: 'Yes! Annual plans save you 15% compared to monthly billing. You\'ll pay for the full year upfront and save significantly.'
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Absolutely! You can cancel your subscription at any time. There are no cancellation fees, and you\'ll continue to have access until the end of your billing period.'
                }
              ].map((faq, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                      {faq.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* CTA Section */}
        <Fade in={isVisible} timeout={1600}>
          <Box
            sx={{
              mt: 10,
              textAlign: 'center',
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              boxShadow: `0 20px 60px -12px ${theme.palette.primary.main}40`
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today. No credit card required.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default PricingPage;
