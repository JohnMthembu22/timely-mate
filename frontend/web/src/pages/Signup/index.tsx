import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Face as FaceIcon,
  Email,
  Lock,
  Business,
  Work,
} from '@mui/icons-material';
import { useAppDispatch } from '../../store';
import { signup } from '../../store/slices/authSlice';
import { isSupabaseAuthEnabled } from '../../utils/authConfig';
import ConditionalRegistration from '../../components/ConditionalRegistration';
import { CompanyProfile, SubscriptionPlan } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Department } from '../../types/auth';

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  department: Department;
}

const Signup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { updateCompanyProfile, updateSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConditionalReg, setShowConditionalReg] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState<string | null>(null);

  // Check for invitation email in URL
  const inviteEmail = searchParams.get('invite');

  const [formData, setFormData] = useState<SignupForm>({
    email: inviteEmail || '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    department: 'other',
  });

  // Update email if invite parameter changes
  useEffect(() => {
    if (inviteEmail) {
      setFormData(prev => ({
        ...prev,
        email: inviteEmail,
      }));
    }
  }, [inviteEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.organizationName) {
      setError('All fields are required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Show conditional registration to determine company size and plan
    setShowConditionalReg(true);
  };

  const handleConditionalRegistrationComplete = async (
    companyProfile: CompanyProfile, 
    selectedPlan: SubscriptionPlan
  ) => {
    setLoading(true);
    try {
      // Update company profile with form data
      const updatedProfile = {
        ...companyProfile,
        name: formData.organizationName
      };

      // Perform actual signup
      const { confirmPassword, ...signupData } = formData;
      await dispatch(signup({
        ...signupData,
        department: formData.department,
        companyProfile: updatedProfile,
        selectedPlan: selectedPlan.id
      })).unwrap();

      // Update subscription context
      updateCompanyProfile(updatedProfile);
      await updateSubscription(selectedPlan.id);

      setShowConditionalReg(false);
      navigate('/dashboard', { 
        state: { 
          welcomeMessage: `Welcome to Timely Mate! You're on the ${selectedPlan.name} plan.`,
          newUser: true 
        }
      });
    } catch (err: unknown) {
      const payload = err as { code?: string; email?: string; message?: string } | string | undefined;
      if (typeof payload === 'object' && payload?.code === 'EMAIL_CONFIRMATION') {
        setShowConditionalReg(false);
        setEmailConfirmationSent(payload.email ?? formData.email);
        setError(null);
        return;
      }
      const message =
        typeof payload === 'object' && payload?.message
          ? payload.message
          : typeof err === 'string'
            ? err
            : 'An error occurred during signup. Please try again.';
      if (message.includes('already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(message);
      }
      setShowConditionalReg(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              <Box textAlign="center">
                <Typography variant="h4" gutterBottom fontWeight={600}>
                  Join Timely Mate
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start your journey to smarter project management
                </Typography>
              </Box>

              {emailConfirmationSent ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Check your email
                  </Typography>
                  <Typography variant="body2">
                    We sent a confirmation link to <strong>{emailConfirmationSent}</strong> from Timely Mate.
                    Open it to activate your account, then sign in.
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Go to sign in
                  </Button>
                </Alert>
              ) : (
              <>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    id="signup-organization"
                    fullWidth
                    label="Organization Name"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    autoComplete="organization"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    id="signup-email"
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    id="signup-password"
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    id="signup-confirm-password"
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="signup-department-label">Department</InputLabel>
                    <Select
                      id="signup-department"
                      name="department"
                      labelId="signup-department-label"
                      value={formData.department}
                      onChange={handleChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <Work />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="executive">Executive</MenuItem>
                      <MenuItem value="hr">Human Resources</MenuItem>
                      <MenuItem value="finance">Finance</MenuItem>
                      <MenuItem value="marketing">Marketing</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="engineering">Engineering</MenuItem>
                      <MenuItem value="design">Design</MenuItem>
                      <MenuItem value="operations">Operations</MenuItem>
                      <MenuItem value="customer_success">Customer Success</MenuItem>
                      <MenuItem value="legal">Legal</MenuItem>
                      <MenuItem value="it">IT</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? 'Creating Account...' : 'Continue to Plan Selection'}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{ textDecoration: 'none', fontWeight: 500 }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Want to see our pricing first?{' '}
                  <Link
                    component="button"
                    onClick={() => navigate('/pricing', { state: { fromLandingPage: true } })}
                    sx={{ 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    View Plans
                  </Link>
                </Typography>
              </Box>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Smart Pricing:</strong> We'll recommend the perfect plan based on your company size. 
                  Small teams (1-5 employees) get free access forever!
                </Typography>
              </Alert>
              </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* Conditional Registration Dialog */}
      <ConditionalRegistration
        open={showConditionalReg}
        onClose={() => setShowConditionalReg(false)}
        onComplete={handleConditionalRegistrationComplete}
      />
    </Box>
  );
};

export default Signup;
