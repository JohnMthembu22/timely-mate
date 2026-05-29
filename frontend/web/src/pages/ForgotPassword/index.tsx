import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import authServiceSupabase from '../../services/authSupabase';
import { getPasswordResetRedirectUrl, isSupabaseAuthEnabled } from '../../utils/authConfig';

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (!isSupabaseAuthEnabled()) {
      setError('Password reset requires Supabase to be configured.');
      return;
    }

    setLoading(true);
    try {
      await authServiceSupabase.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
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
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                Reset your password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We will email you a link to choose a new password.
              </Typography>
            </Box>

            {sent ? (
              <Alert severity="success">
                If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
                Check spam. The link opens{' '}
                <Typography component="span" variant="body2" fontFamily="monospace">
                  {getPasswordResetRedirectUrl()}
                </Typography>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Send reset link'}
                  </Button>
                </Stack>
              </form>
            )}

            <Button component={RouterLink} to="/login" fullWidth variant="text">
              Back to sign in
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
