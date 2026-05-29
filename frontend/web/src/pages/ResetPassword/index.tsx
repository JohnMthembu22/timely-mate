import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import authServiceSupabase from '../../services/authSupabase';
import { isSupabaseAuthEnabled } from '../../utils/authConfig';
import { clearAuthStorage } from '../../utils/authSession';
import { clearSession } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store';

const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isSupabaseAuthEnabled()) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;

    const hash = window.location.hash;
    const hashParams = hash ? new URLSearchParams(hash.slice(1)) : null;
    if (hashParams?.get('error') || hashParams?.get('error_description')) {
      const description = hashParams.get('error_description');
      const code = hashParams.get('error_code');
      setInvalidLink(true);
      setError(
        description
          ? decodeURIComponent(description.replace(/\+/g, ' '))
          : code === 'otp_expired'
            ? 'This reset link has expired. Request a new one below.'
            : 'Invalid or expired reset link.'
      );
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setReady(true);
        setInvalidLink(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (cancelled) return;
      if (sessionError) {
        setInvalidLink(true);
        setError(sessionError.message);
        return;
      }
      if (data.session) {
        setReady(true);
        return;
      }
      if (!hash || hash === '#' || !hash.includes('access_token')) {
        setInvalidLink(true);
        setError('This reset link is invalid or has expired. Request a new one from the sign-in page.');
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authServiceSupabase.updatePassword(password);
      await authServiceSupabase.logout();
      clearAuthStorage();
      dispatch(clearSession());
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
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
                Set a new password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Choose a strong password for your Timely Mate account.
              </Typography>
            </Box>

            {!ready && !invalidLink && (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography color="text.secondary">Verifying your reset link…</Typography>
              </Stack>
            )}

            {invalidLink && (
              <Alert severity="error">
                {error}
                <Button component={RouterLink} to="/forgot-password" size="small" sx={{ mt: 1 }}>
                  Request a new reset link
                </Button>
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                Password updated. Redirecting you to sign in…
              </Alert>
            )}

            {ready && !success && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Update password'}
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

export default ResetPassword;
