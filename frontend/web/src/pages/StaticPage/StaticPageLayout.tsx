import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Fade,
  Grid,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircleOutline as CheckIcon,
  Code as CodeIcon,
  Forum as ForumIcon,
  Gavel as GavelIcon,
  Groups as GroupsIcon,
  HelpOutline as HelpIcon,
  Hub as HubIcon,
  InfoOutlined as InfoIcon,
  MailOutline as MailIcon,
  MenuBook as MenuBookIcon,
  NewReleases as NewReleasesIcon,
  Payments as PaymentsIcon,
  PrivacyTip as PrivacyIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon,
  WorkOutline as WorkIcon,
} from '@mui/icons-material';
import LandingLayout from '../../components/LandingLayout';
import { tmColors, tmGradients } from '../../theme/designTokens';
import {
  CATEGORY_NAV,
  StaticCategory,
  StaticPageContent,
  StaticPageKey,
} from './staticPageContent';

const PAGE_ICONS: Record<StaticPageKey, React.ReactElement> = {
  features: <AutoAwesomeIcon />,
  integrations: <HubIcon />,
  updates: <NewReleasesIcon />,
  about: <GroupsIcon />,
  careers: <WorkIcon />,
  contact: <MailIcon />,
  documentation: <MenuBookIcon />,
  'help-center': <HelpIcon />,
  api: <CodeIcon />,
  community: <ForumIcon />,
  privacy: <PrivacyIcon />,
  terms: <GavelIcon />,
  security: <SecurityIcon />,
  compliance: <VerifiedIcon />,
};

const NAV_LINK_ICONS: Record<string, React.ReactElement> = {
  Features: <AutoAwesomeIcon fontSize="small" />,
  Pricing: <PaymentsIcon fontSize="small" />,
  Integrations: <HubIcon fontSize="small" />,
  Updates: <NewReleasesIcon fontSize="small" />,
  About: <GroupsIcon fontSize="small" />,
  Careers: <WorkIcon fontSize="small" />,
  Contact: <MailIcon fontSize="small" />,
  Documentation: <MenuBookIcon fontSize="small" />,
  'Help Center': <HelpIcon fontSize="small" />,
  API: <CodeIcon fontSize="small" />,
  Community: <ForumIcon fontSize="small" />,
  Privacy: <PrivacyIcon fontSize="small" />,
  Terms: <GavelIcon fontSize="small" />,
  Security: <SecurityIcon fontSize="small" />,
  Compliance: <VerifiedIcon fontSize="small" />,
};

const CATEGORY_THEME: Record<
  StaticCategory,
  { gradient: string; accent: string; glow: string; orb: string }
> = {
  Product: {
    gradient: tmGradients.heroDark,
    accent: tmColors.neonBlue,
    glow: tmColors.neonBlueGlow,
    orb: alpha(tmColors.neonBlue, 0.25),
  },
  Company: {
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 45%, #34d399 100%)',
    accent: tmColors.emeraldBright,
    glow: tmColors.emeraldGlow,
    orb: alpha(tmColors.emerald, 0.22),
  },
  Resources: {
    gradient: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #818cf8 100%)',
    accent: '#a5b4fc',
    glow: 'rgba(129, 140, 248, 0.4)',
    orb: alpha('#818cf8', 0.22),
  },
  Legal: {
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #64748b 100%)',
    accent: '#cbd5e1',
    glow: 'rgba(148, 163, 184, 0.3)',
    orb: alpha('#94a3b8', 0.18),
  },
};

type StaticPageLayoutProps = {
  content: StaticPageContent;
};

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ content }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const categoryTheme = CATEGORY_THEME[content.eyebrow];
  const categoryNav = CATEGORY_NAV[content.eyebrow];
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <LandingLayout showFooter navVariant="marketing">
      {/* Hero */}
      <Box
        component="section"
        aria-label={`${content.title} hero`}
        sx={{
          position: 'relative',
          background: categoryTheme.gradient,
          color: '#fff',
          pt: { xs: 10, sm: 12, md: 14 },
          pb: { xs: 8, sm: 10, md: 12 },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: { xs: 160, md: 260 },
                height: { xs: 160, md: 260 },
                borderRadius: '50%',
                background: alpha('#fff', 0.04),
                top: `${10 + i * 20}%`,
                left: `${8 + i * 24}%`,
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              right: '-8%',
              width: '45%',
              height: '75%',
              background: `radial-gradient(circle, ${categoryTheme.orb} 0%, transparent 70%)`,
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={visible} timeout={600}>
            <Stack spacing={2.5}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  color: alpha('#fff', 0.85),
                  '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.1) },
                }}
              >
                Back to home
              </Button>

              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                  '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' },
                  '& a': {
                    color: alpha('#fff', 0.75),
                    textDecoration: 'none',
                    '&:hover': { color: '#fff' },
                  },
                  '& .MuiTypography-root': { color: alpha('#fff', 0.9) },
                }}
              >
                <Link component={RouterLink} to="/" color="inherit">
                  Home
                </Link>
                <Typography>{content.eyebrow}</Typography>
                <Typography fontWeight={600}>{content.title}</Typography>
              </Breadcrumbs>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#fff', 0.14),
                    border: `1px solid ${alpha('#fff', 0.28)}`,
                    boxShadow: `0 12px 40px ${categoryTheme.glow}`,
                    '& .MuiSvgIcon-root': { fontSize: 32 },
                  }}
                >
                  {PAGE_ICONS[content.key]}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={content.eyebrow}
                    size="small"
                    sx={{
                      mb: 1.25,
                      fontWeight: 700,
                      color: '#fff',
                      bgcolor: alpha('#fff', 0.12),
                      border: `1px solid ${alpha('#fff', 0.25)}`,
                    }}
                  />
                  <Typography
                    variant="h1"
                    component="h1"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                      letterSpacing: '-0.04em',
                      lineHeight: 1.08,
                      background: 'linear-gradient(to right, #ffffff 0%, #cbd5e1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {content.title}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="h6"
                component="p"
                sx={{
                  maxWidth: 720,
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  lineHeight: 1.65,
                  opacity: 0.92,
                  fontWeight: 400,
                }}
              >
                {content.summary}
              </Typography>
            </Stack>
          </Fade>
        </Container>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, transform: 'translateY(1px)' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }} aria-hidden>
            <path
              fill={isDark ? tmColors.charcoal950 : tmColors.lightBg}
              d="M0,32 C360,80 720,0 1080,32 C1260,48 1380,56 1440,48 L1440,80 L0,80 Z"
            />
          </svg>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ bgcolor: isDark ? tmColors.charcoal950 : tmColors.lightBg, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={8}>
              <Fade in={visible} timeout={800}>
                <Stack spacing={2.5}>
                  {content.sections.map((section, index) => (
                    <Paper
                      key={section.title}
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        bgcolor: isDark ? alpha(tmColors.charcoal850, 0.85) : '#fff',
                        border: '1px solid',
                        borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
                        boxShadow: isDark
                          ? '0 16px 48px rgba(0,0,0,0.3)'
                          : '0 16px 48px rgba(15, 23, 42, 0.06)',
                        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                        '&:hover': {
                          borderColor: alpha(categoryTheme.accent, isDark ? 0.45 : 0.35),
                          boxShadow: isDark
                            ? `0 20px 56px rgba(0,0,0,0.4), 0 0 0 1px ${alpha(categoryTheme.accent, 0.12)}`
                            : `0 20px 56px rgba(15, 23, 42, 0.1), 0 0 0 1px ${alpha(categoryTheme.accent, 0.15)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 4,
                          background: `linear-gradient(90deg, ${categoryTheme.accent}, transparent)`,
                          opacity: index === 0 ? 1 : 0.65,
                        }}
                      />
                      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              background: index === 0 ? categoryTheme.gradient : alpha(categoryTheme.accent, isDark ? 0.18 : 0.12),
                              color: index === 0 ? '#fff' : categoryTheme.accent,
                            }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </Box>
                          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                            {section.title}
                          </Typography>
                        </Stack>

                        {section.body ? (
                          <Typography color="text.secondary" sx={{ mb: section.bullets?.length || section.highlight ? 2 : 0, lineHeight: 1.75, pl: { sm: 5.5 } }}>
                            {section.body}
                          </Typography>
                        ) : null}

                        {section.highlight ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              mb: section.bullets?.length ? 2 : 0,
                              ml: { sm: 5.5 },
                              borderRadius: 2.5,
                              bgcolor: alpha(categoryTheme.accent, isDark ? 0.1 : 0.06),
                              border: '1px solid',
                              borderColor: alpha(categoryTheme.accent, 0.28),
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'flex-start',
                            }}
                          >
                            <InfoIcon sx={{ color: categoryTheme.accent, mt: 0.25, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                              {section.highlight}
                            </Typography>
                          </Paper>
                        ) : null}

                        {section.bullets?.length ? (
                          <Stack spacing={1.25} sx={{ pl: { sm: 5.5 } }}>
                            {section.bullets.map((bullet) => (
                              <Stack key={bullet} direction="row" spacing={1.5} alignItems="flex-start">
                                <CheckIcon
                                  sx={{
                                    fontSize: 22,
                                    color: categoryTheme.accent,
                                    mt: 0.15,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                  {bullet}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        ) : null}
                      </Box>
                    </Paper>
                  ))}

                  {content.cta ? (
                    <Box
                      sx={{
                        mt: 1,
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        background: categoryTheme.gradient,
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 24px 64px -16px ${categoryTheme.glow}`,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: `radial-gradient(circle at 20% 50%, ${alpha('#fff', 0.12)}, transparent 55%)`,
                          pointerEvents: 'none',
                        }}
                      />
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        justifyContent="space-between"
                        sx={{ position: 'relative', zIndex: 1 }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Ready to go further?
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.65 }}>
                            Continue exploring {content.eyebrow.toLowerCase()} resources or start using Timely Mate.
                          </Typography>
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(content.cta!.to)}
                            sx={{
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: 2.5,
                              bgcolor: '#fff',
                              color: isDark ? tmColors.neonBlueDeep : theme.palette.primary.dark,
                              '&:hover': { bgcolor: alpha('#fff', 0.92) },
                            }}
                          >
                            {content.cta.label}
                          </Button>
                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/signup')}
                            sx={{
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 2.5,
                              borderColor: alpha('#fff', 0.5),
                              color: '#fff',
                              '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) },
                            }}
                          >
                            Get started
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </Fade>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Fade in={visible} timeout={1000}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
                  <Box
                    sx={{
                      borderRadius: 4,
                      p: '1px',
                      mb: 2,
                      background: `linear-gradient(145deg, ${alpha(categoryTheme.accent, 0.5)}, ${alpha(categoryTheme.accent, 0.08)})`,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3.75,
                        bgcolor: isDark ? alpha(tmColors.charcoal850, 0.95) : '#fff',
                      }}
                    >
                      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.12em', fontWeight: 700 }}>
                        {content.eyebrow}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
                        In this section
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                        {categoryNav.description}
                      </Typography>
                      <List dense disablePadding>
                        {categoryNav.links.map((link) => {
                          const isActive =
                            link.pageKey === content.key ||
                            (link.path === location.pathname && !link.pageKey);
                          return (
                            <ListItemButton
                              key={link.path}
                              component={RouterLink}
                              to={link.path}
                              selected={isActive}
                              sx={{
                                borderRadius: 2.5,
                                mb: 0.5,
                                '&.Mui-selected': {
                                  bgcolor: alpha(categoryTheme.accent, isDark ? 0.16 : 0.1),
                                  borderLeft: '3px solid',
                                  borderColor: categoryTheme.accent,
                                  '&:hover': { bgcolor: alpha(categoryTheme.accent, isDark ? 0.22 : 0.14) },
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36, color: isActive ? categoryTheme.accent : 'text.secondary' }}>
                                {NAV_LINK_ICONS[link.label] ?? <AutoAwesomeIcon fontSize="small" />}
                              </ListItemIcon>
                              <ListItemText
                                primary={link.label}
                                primaryTypographyProps={{
                                  fontWeight: isActive ? 700 : 500,
                                  fontSize: '0.9rem',
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Paper>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
                      bgcolor: isDark ? alpha(tmColors.charcoal850, 0.75) : '#fff',
                      boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.25)' : '0 16px 48px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: tmGradients.buttonPrimary,
                          color: '#fff',
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        Timely Mate
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                      Time tracking, projects, HR, and workforce ops in one platform.
                    </Typography>
                    <Stack spacing={1}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate('/signup')}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          background: tmGradients.buttonPrimary,
                          '&:hover': { background: tmGradients.buttonPrimaryHover },
                        }}
                      >
                        Start free trial
                      </Button>
                      <Button fullWidth variant="text" onClick={() => navigate('/pricing')} sx={{ fontWeight: 600, textTransform: 'none' }}>
                        View pricing
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </LandingLayout>
  );
};

export default StaticPageLayout;
