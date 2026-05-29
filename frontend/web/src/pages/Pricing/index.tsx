import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Fade,
  Grid,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LandingLayout from '../../components/LandingLayout';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { TESTING_MODE_UNLOCK_ALL } from '../../config/testingMode';
import { useAppSelector } from '../../store';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { useAppAction } from '../../hooks/useAppAction';
import { tmColors, tmGradients } from '../../theme/designTokens';
import { PricingFAQ } from './components/PricingFAQ';
import { PricingSizeGuide } from './components/PricingSizeGuide';
import { PricingPlanCard } from './components/PricingPlanCard';
import { PricingHero } from './components/PricingHero';
import { PricingCurrentSubscription } from './components/PricingCurrentSubscription';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isAnnual, setIsAnnual] = useState(false);
  const [visible, setVisible] = useState(false);
  const { currentPlan, updateSubscription, companyProfile, refreshSubscriptionFromStorage } =
    useSubscription();
  const highlightPlanId = (location.state as { highlightPlan?: string } | null)?.highlightPlan;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { addNotification } = useNotifications();
  const { loading: selectingPlan, run: runSelectPlan } = useAppAction();

  useEffect(() => {
    setVisible(true);
    refreshSubscriptionFromStorage();
  }, [refreshSubscriptionFromStorage]);

  const formatPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'Free';
    const price = isAnnual ? plan.price * 12 * 0.85 : plan.price;
    return `R${price.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
  };

  const billingSuffix = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'Forever · up to 5 employees';
    return isAnnual ? 'per user / year (billed annually)' : 'per user / month';
  };

  const getPlanButtonLabel = (plan: SubscriptionPlan) => {
    if (currentPlan?.id === plan.id) return 'Current plan';
    if (selectingPlan) return 'Updating…';
    const currentIdx = SUBSCRIPTION_PLANS.findIndex((p) => p.id === currentPlan?.id);
    const planIdx = SUBSCRIPTION_PLANS.findIndex((p) => p.id === plan.id);
    if (plan.price === 0) return 'Start free';
    if (currentIdx >= 0 && planIdx > currentIdx) return 'Upgrade';
    if (currentIdx >= 0 && planIdx < currentIdx) return 'Switch plan';
    return 'Get started';
  };

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { selectedPlan: planId, fromPricing: true } });
      return;
    }

    await runSelectPlan(async () => {
      const success = await updateSubscription(planId);
      if (success) {
        const label = SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name ?? 'selected plan';
        addNotification(createNotification.system('Plan updated', `Now on ${label}.`, 'low'));
      } else {
        addNotification(
          createNotification.system(
            'Update failed',
            'We could not update your subscription. Please try again.',
            'high'
          )
        );
      }
    });
  };

  if (TESTING_MODE_UNLOCK_ALL) {
    return (
      <LandingLayout showFooter navVariant="marketing">
        <Box sx={{ minHeight: '60vh', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="md">
            <Alert severity="info">
              <AlertTitle>Pricing tiers are off during testing</AlertTitle>
              All workspace pages are available after you sign in.
            </Alert>
          </Container>
        </Box>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout showFooter navVariant="marketing">
      <PricingHero
        visible={visible}
        isAnnual={isAnnual}
        onBillingChange={setIsAnnual}
        isAuthenticated={isAuthenticated}
        currentPlanName={currentPlan?.name}
      />

      <Box
        sx={{
          position: 'relative',
          bgcolor: isDark ? tmColors.charcoal950 : tmColors.lightBg,
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
          {!isAuthenticated && (
            <Fade in={visible} timeout={800}>
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  maxWidth: 640,
                  mx: 'auto',
                  mb: 4,
                  borderRadius: 3,
                  bgcolor: isDark ? alpha(tmColors.charcoal850, 0.8) : undefined,
                }}
              >
                Select a plan to continue to sign-up. You can change tiers anytime in Settings.
              </Alert>
            </Fade>
          )}

          {currentPlan && isAuthenticated && (
            <PricingCurrentSubscription
              plan={currentPlan}
              employeeCount={companyProfile?.employeeCount ?? 0}
              companyName={companyProfile?.name}
              isAnnual={isAnnual}
              visible={visible}
            />
          )}

          {/* Plan cards */}
          <Box id="pricing-plans" component="section" aria-label="Pricing plans">
          <Grid
            container
            spacing={{ xs: 3, md: 3 }}
            sx={{ mb: { xs: 8, md: 10 }, alignItems: 'stretch' }}
          >
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                key={plan.id}
                sx={{
                  display: 'flex',
                  pt: plan.isPopular && !isMobile ? 2 : 0,
                }}
              >
                <Fade in={visible} timeout={800 + index * 120} style={{ width: '100%' }}>
                  <Box sx={{ width: '100%' }}>
                    <PricingPlanCard
                      plan={plan}
                      isAnnual={isAnnual}
                      isCurrent={currentPlan?.id === plan.id}
                      isHighlighted={highlightPlanId === plan.id}
                      isSelecting={selectingPlan}
                      buttonLabel={getPlanButtonLabel(plan)}
                      onSelect={() => handlePlanSelect(plan.id)}
                      formatPrice={formatPrice}
                      billingSuffix={billingSuffix}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
          </Box>

          {/* Size guide */}
          <Fade in={visible} timeout={1100}>
            <Box sx={{ mb: { xs: 8, md: 10 } }}>
              <PricingSizeGuide />
            </Box>
          </Fade>

          <Fade in={visible} timeout={1300}>
            <Box sx={{ mb: { xs: 8, md: 10 } }}>
              <PricingFAQ />
            </Box>
          </Fade>

          {/* CTA */}
          <Fade in={visible} timeout={1500}>
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 4, md: 6 },
                borderRadius: 4,
                background: tmGradients.heroDark,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 32px 80px -20px ${alpha(tmColors.neonBlueDeep, 0.5)}`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 30% 50%, ${alpha('#fff', 0.12)}, transparent 50%)`,
                  pointerEvents: 'none',
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                  Ready to run operations smarter?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 480, mx: 'auto' }}>
                  Join teams using Timely Mate for time, projects, and workforce intelligence — start
                  free in under two minutes.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/signup')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: '#fff',
                      color: tmColors.neonBlueDeep,
                      '&:hover': { bgcolor: alpha('#fff', 0.92), transform: 'translateY(-2px)' },
                    }}
                  >
                    Start free trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/contact')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: alpha('#fff', 0.5),
                      color: '#fff',
                      '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) },
                    }}
                  >
                    Talk to sales
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </LandingLayout>
  );
};

export default PricingPage;
