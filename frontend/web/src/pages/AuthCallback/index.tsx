import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { CheckCircleOutline as CheckIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAppDispatch } from '../../store';
import { setSession } from '../../store/slices/authSlice';
import authServiceSupabase from '../../services/authSupabase';
import { isSupabaseAuthEnabled } from '../../utils/authConfig';
import { persistAuthSnapshot } from '../../utils/authSession';
import { tmGradients } from '../../theme/designTokens';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    if (!isSupabaseAuthEnabled()) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;

    const finish = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const authCode = queryParams.get('code');

        let session = null;

        if (authCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (error) throw error;
          session = data.session;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          session = data.session;
        }

        if (session) {
          const response = await authServiceSupabase.buildAuthResponseFromSession(session);
          persistAuthSnapshot(response);
          dispatch(setSession({ user: response.user, token: response.token }));
          if (!cancelled) {
            setStatus('success');
            setMessage('Signed in successfully. Taking you to your dashboard…');
            setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
          }
          return;
        }

        if (!cancelled) {
          setStatus('error');
          setMessage('We could not verify your email link. It may have expired — try signing in or register again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (!cancelled) {
          setStatus('error');
          setMessage('Something went wrong confirming your account. Please try signing in.');
        }
      }
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tmGradients.heroDark,
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            textAlign: 'center',
            bgcolor: alpha('#fff', 0.98),
          }}
        >
          {status === 'loading' && (
            <Stack spacing={3} alignItems="center">
              <CircularProgress />
              <Typography variant="h6" fontWeight={700}>
                {message}
              </Typography>
            </Stack>
          )}

          {status === 'success' && (
            <Stack spacing={2} alignItems="center">
              <CheckIcon sx={{ fontSize: 56, color: theme.palette.success.main }} />
              <Typography variant="h5" fontWeight={800}>
                You're all set
              </Typography>
              <Typography color="text.secondary">{message}</Typography>
            </Stack>
          )}

          {status === 'error' && (
            <Stack spacing={3} alignItems="center">
              <Typography variant="h5" fontWeight={800}>
                Confirmation failed
              </Typography>
              <Typography color="text.secondary">{message}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" component={RouterLink} to="/login">
                  Sign in
                </Button>
                <Button variant="outlined" component={RouterLink} to="/signup">
                  Register
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthCallback;
