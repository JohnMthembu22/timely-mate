import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  Stack,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Fade,
  Slide,
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Timer,
  Dashboard as DashboardIcon,
  People,
  Work,
  BusinessCenter,
  Receipt,
  School,
  Schedule,
  Security,
  Analytics,
  ArrowForward,
  Check,
  PlayArrow,
  Close,
} from '@mui/icons-material';
import LandingLayout from '../../components/LandingLayout';

// Animation delay utility
const ANIMATION_DELAY = 200;

const Landing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const videoId = 'm8mQGzvJA64';

  const features = [
    {
      icon: <Timer fontSize="large" color="primary" />,
      title: 'Smart Time Tracking',
      description: 'Track time with biometric precision and automated check-ins.',
    },
    {
      icon: <DashboardIcon fontSize="large" color="primary" />,
      title: 'Comprehensive Dashboard',
      description: 'Get a bird\'s eye view of all your projects, tasks, and team activities.',
    },
    {
      icon: <People fontSize="large" color="primary" />,
      title: 'Team Management',
      description: 'Manage your team efficiently with detailed analytics and role distribution.',
    },
    {
      icon: <Work fontSize="large" color="primary" />,
      title: 'Project Management',
      description: 'Create, assign, and track projects with advanced collaboration tools.',
    },
    {
      icon: <BusinessCenter fontSize="large" color="primary" />,
      title: 'Freelancer Management',
      description: 'Manage external contractors and freelancers with dedicated tools.',
    },
    {
      icon: <Receipt fontSize="large" color="primary" />,
      title: 'Expense Tracking',
      description: 'Track all business expenses and generate detailed reports.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      position: 'Project Manager, TechCorp',
      initials: 'SJ',
      text: 'Timely Mate has transformed how our team tracks time and manages projects. The productivity improvements have been incredible!',
    },
    {
      name: 'Michael Chen',
      position: 'CEO, StartupLabs',
      initials: 'MC',
      text: 'We\'ve reduced administrative overhead by 40% since implementing Timely Mate. The freelancer management module is a game-changer.',
    },
    {
      name: 'Jessica Williams',
      position: 'HR Director, Enterprise Solutions',
      initials: 'JW',
      text: 'The HR module has streamlined our entire process. Our team loves the user-friendly interface and comprehensive analytics.',
    },
  ];

  const pricingPlans = [
    {
      title: 'Basic',
      price: 'R59',
      period: 'per user/month',
      features: [
        'Time tracking',
        'Project management',
        'Team dashboard',
        'Mobile app access',
        'Email support',
      ],
      buttonText: 'Start Free Trial',
      highlighted: false,
    },
    {
      title: 'Professional',
      price: 'R199',
      period: 'per user/month',
      features: [
        'Everything in Basic',
        'Freelancer management',
        'Expense tracking',
        'Advanced analytics',
        'Priority support',
      ],
      buttonText: 'Start Free Trial',
      highlighted: true,
    },
    {
      title: 'Enterprise',
      price: 'R499',
      period: 'per user/month',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security features',
        '24/7 phone support',
      ],
      buttonText: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <LandingLayout>
      <Box sx={{ overflow: 'hidden' }}>
        {/* Modern Hero Section */}
      <Box
        sx={{
            position: 'relative',
            background: `linear-gradient(135deg, 
              ${theme.palette.primary.dark} 0%, 
              ${theme.palette.primary.main} 50%,
              ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            pt: { xs: 10, sm: 12, md: 16 },
            pb: { xs: 10, sm: 12, md: 16 },
            overflow: 'hidden',
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: { xs: '150px', md: '200px' },
                  height: { xs: '150px', md: '200px' },
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: `float ${5 + i}s ease-in-out infinite`,
                  '@keyframes float': {
                    '0%, 100%': {
                      transform: 'translate(-50%, -50%) translateY(0)',
                    },
                    '50%': {
                      transform: 'translate(-50%, -50%) translateY(-20px)',
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in={isVisible} timeout={1000}>
                  <Box>
          <Typography
                      variant="h1"
                  component="h1"
                      fontWeight={800}
            sx={{
                        mb: { xs: 2, md: 3 },
                        fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                        lineHeight: 1.1,
                        background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Transform Your Team's Productivity
          </Typography>
          <Typography
                  variant="h5" 
            sx={{
                        mb: { xs: 4, md: 5 },
              opacity: 0.9,
                        fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                        lineHeight: 1.5,
                        maxWidth: '600px',
            }}
          >
                      Empower your team with AI-driven time tracking, seamless project management, and intelligent collaboration tools.
          </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2}
                      sx={{ mb: { xs: 4, md: 5 } }}
                >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
                          py: { xs: 1.5, md: 2 },
                      px: { xs: 3, md: 4 },
                          fontSize: { xs: '1rem', md: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                          backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
                    }}
                  >
                        Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                        startIcon={<PlayArrow />}
                    onClick={() => setVideoDialogOpen(true)}
                    sx={{
                          py: { xs: 1.5, md: 2 },
                      px: { xs: 3, md: 4 },
                          fontSize: { xs: '1rem', md: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 2,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                        Watch Demo
          </Button>
                </Stack>
                    <Stack
                      direction="row"
                      spacing={3}
                      alignItems="center"
                      sx={{
                        opacity: 0.8,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Check sx={{ fontSize: '1.2rem' }} />
                        <Typography variant="body2">Free 14-day trial</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Check sx={{ fontSize: '1.2rem' }} />
                        <Typography variant="body2">No credit card required</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Fade>
              </Grid>
              <Grid item xs={12} md={6}>
                <Slide direction="left" in={isVisible} timeout={1000}>
                  <Box
                sx={{
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        right: '10%',
                        bottom: '10%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)',
                        borderRadius: '50%',
                      },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        p: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transform: 'perspective(1000px) rotateY(-10deg)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'perspective(1000px) rotateY(-5deg)',
                        },
                      }}
                    >
                      {/* Dashboard Preview Content */}
                  <Box
                    sx={{
                          height: { xs: 280, sm: 320, md: 400 },
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                          p: 2,
                      display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                    }}
                  >
                  <Box 
                    sx={{ 
                            height: '30px',
                      display: 'flex', 
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Box
                        sx={{ 
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#ff5f57',
                            }}
                          />
                    <Box 
                      sx={{ 
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#ffbd2e',
                            }}
                          />
                          <Box
                            sx={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#28c941',
                      }}
                    />
                  </Box>
                        <Grid container spacing={2}>
                          {[...Array(6)].map((_, i) => (
                            <Grid item xs={6} key={i}>
                              <Box
                                sx={{
                                  height: '60px',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: 1,
                                  animation: `pulse 2s ${i * 0.2}s infinite`,
                                  '@keyframes pulse': {
                                    '0%, 100%': {
                                      opacity: 0.5,
                                    },
                                    '50%': {
                                      opacity: 0.7,
                                    },
                                  },
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                </Box>
                    </Box>
                  </Box>
                </Slide>
              </Grid>
        </Grid>
      </Container>
        </Box>

        {/* Stats Section */}
          <Box
            sx={{
              bgcolor: 'background.paper',
            py: { xs: 4, md: 6 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={3} justifyContent="center">
              {[
                { number: '10K+', label: 'Active Users' },
                { number: '98%', label: 'Customer Satisfaction' },
                { number: '50M+', label: 'Hours Tracked' },
                { number: '150+', label: 'Countries' },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="div"
                      fontWeight={700}
                      sx={{
                        mb: 1,
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, sm: 10, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
              variant="overline"
              component="div"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: 1.5,
                mb: 2,
              }}
            >
              FEATURES
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              fontWeight={700}
              sx={{ 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Everything You Need
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              Powerful features to help your team work smarter, not harder.
          </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in={isVisible} timeout={1000} style={{ transitionDelay: `${index * ANIMATION_DELAY}ms` }}>
                <Card
                  sx={{
                    height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      background: 'transparent',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        borderColor: 'primary.main',
                        '& .feature-icon': {
                          transform: 'scale(1.1)',
                          color: 'primary.main',
                        },
                    },
                  }}
                >
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: '100%',
                      }}
                    >
                      <Box
                        className="feature-icon"
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          color: 'text.primary',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {feature.icon}
                      </Box>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      fontWeight={600} 
                      sx={{ 
                          mb: 2,
                          fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        endIcon={<ArrowForward />}
                        sx={{
                          mt: 3,
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        Learn More
                      </Button>
                  </CardContent>
                </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box
          id="how-it-works"
          sx={{
            bgcolor: 'background.default',
            py: { xs: 8, sm: 10, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '1px',
              bgcolor: 'divider',
              zIndex: 1,
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="overline"
                component="div"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  mb: 2,
                }}
              >
                HOW IT WORKS
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                fontWeight={700}
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Get Started in Minutes
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ 
                  maxWidth: '800px', 
                  mx: 'auto',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.6,
                }}
              >
                Follow these simple steps to transform your team's productivity
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
              {[
                {
                  step: 1,
                  title: 'Create Your Workspace',
                  description: 'Set up your organization\'s workspace in minutes. Add team members and customize settings to match your workflow.',
                  icon: <People sx={{ fontSize: '2rem' }} />,
                },
                {
                  step: 2,
                  title: 'Set Up Projects',
                  description: 'Create projects, assign team members, and set up deadlines. Our intuitive interface makes project management a breeze.',
                  icon: <Work sx={{ fontSize: '2rem' }} />,
                },
                {
                  step: 3,
                  title: 'Track Time & Progress',
                  description: 'Start tracking time with various check-in methods. Monitor project progress in real-time and generate insightful reports.',
                  icon: <Analytics sx={{ fontSize: '2rem' }} />,
                },
              ].map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Fade in={isVisible} timeout={1000} style={{ transitionDelay: `${index * ANIMATION_DELAY}ms` }}>
                    <Box
                sx={{
                        position: 'relative',
                        textAlign: 'center',
                        p: 3,
                }}
              >
                <Box
                  sx={{
                          position: 'relative',
                          display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          bgcolor: 'background.paper',
                          boxShadow: theme.shadows[4],
                          mb: 3,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            opacity: 0.2,
                          },
                        }}
                      >
                        {item.icon}
                </Box>
                    <Typography 
                        variant="overline"
                      sx={{ 
                          color: 'primary.main',
                          fontWeight: 600,
                        mb: 1,
                          display: 'block',
                      }}
                    >
                        Step {item.step}
                    </Typography>
                    <Typography 
                        variant="h5"
                      component="h3" 
                      fontWeight={600} 
                      sx={{ 
                          mb: 2,
                          fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
                      }}
                    >
                        {item.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.6,
                      }}
                    >
                        {item.description}
                    </Typography>
                  </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/signup')}
                    sx={{
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 4, md: 6 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                      borderRadius: 2,
                  boxShadow: theme.shadows[4],
                    }}
                  >
                    Get Started Now
                  </Button>
            </Box>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Container id="testimonials" maxWidth="lg" sx={{ py: { xs: 8, sm: 10, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="overline"
              component="div"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: 1.5,
                mb: 2,
              }}
            >
              TESTIMONIALS
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              fontWeight={700}
              sx={{ 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trusted by Teams Worldwide
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              See what our customers have to say about their experience with Timely Mate
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={isVisible} timeout={1000} style={{ transitionDelay: `${index * ANIMATION_DELAY}ms` }}>
                  <Card
                  sx={{
                    height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      background: 'transparent',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        borderColor: 'primary.main',
                        '& .quote-icon': {
                          transform: 'translateY(-5px)',
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      {/* Quote Icon */}
                      <Box
                        className="quote-icon"
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 24,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'background.paper',
                    display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: theme.shadows[2],
                          transition: 'all 0.3s ease',
                          color: 'text.secondary',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        "
                      </Box>

                  <Typography
                    variant="body1"
                    sx={{ 
                      mb: 3, 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.6,
                          fontStyle: 'italic',
                          color: 'text.secondary',
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{ 
                            bgcolor: 'primary.main',
                            width: 48,
                            height: 48,
                            fontSize: '1.25rem',
                            fontWeight: 600,
                      }}
                    >
                      {testimonial.initials}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        {testimonial.position}
                      </Typography>
                    </Box>
                  </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ 
          bgcolor: 'background.paper',
          py: { xs: 4, md: 6 }
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 3, md: 4 }}>
              <Grid item xs={12} md={4}>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }
                  }}
                >
                  Timely Mate
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                  }}
                >
                  The all-in-one platform for time tracking, project management, and team collaboration.
                </Typography>
                <Stack direction="row" spacing={1}>
                  {/* Social media icons would go here */}
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Features
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Pricing
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Integrations
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Updates
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    About
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Careers
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Blog
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Contact
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Resources
                </Typography>
                <Stack spacing={1}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Documentation
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Help Center
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    API
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Community
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Legal
                </Typography>
                <Stack spacing={1}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Privacy
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Terms
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Security
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' }
                    }}
                  >
                    Compliance
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: { xs: 2.5, md: 4 } }} />
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap' 
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2, sm: 0 },
                  textAlign: { xs: 'center', sm: 'left' },
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                }}
              >
                © {new Date().getFullYear()} Timely Mate. All rights reserved.
              </Typography>
              <Stack 
                direction="row" 
                spacing={{ xs: 2, md: 2 }}
                justifyContent={{ xs: 'center', sm: 'flex-end' }}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Terms of Service
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Cookies
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* Video Demo Dialog */}
        <Dialog
          open={videoDialogOpen}
          onClose={() => setVideoDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              position: 'relative',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <IconButton
              onClick={() => setVideoDialogOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <Close />
            </IconButton>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
              }}
            >
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Timely Mate Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </DialogContent>
        </Dialog>
    </Box>
    </LandingLayout>
  );
};

export default Landing;
