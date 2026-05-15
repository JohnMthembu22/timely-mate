import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  Save,
  Restore,
  Clear,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import sessionPersistence from '../../services/sessionPersistence';
import { useArrayPersistence, usePrimitivePersistence } from '../../hooks/usePersistence';

const SessionPersistenceTest: React.FC = () => {
  // Test data that will persist across sessions
  const [testCounter, setTestCounter] = usePrimitivePersistence('test_counter', 0);
  const [testMessages, setTestMessages] = useArrayPersistence<string>('test_messages', []);
  const [testSettings, setTestSettings] = usePrimitivePersistence('test_settings', {
    theme: 'light',
    notifications: true,
    language: 'en'
  });

  const [lastAction, setLastAction] = useState<string>('');

  const handleIncrementCounter = () => {
    setTestCounter(testCounter + 1);
    setLastAction('Counter incremented');
  };

  const handleAddMessage = () => {
    const newMessage = `Test message ${testMessages.length + 1} - ${new Date().toLocaleTimeString()}`;
    setTestMessages([...testMessages, newMessage]);
    setLastAction('Message added');
  };

  const handleClearMessages = () => {
    setTestMessages([]);
    setLastAction('Messages cleared');
  };

  const handleSaveSession = () => {
    sessionPersistence.saveSessionData();
    setLastAction('Session data saved manually');
  };

  const handleRestoreSession = () => {
    const restored = sessionPersistence.restoreSessionData();
    setLastAction(restored ? 'Session data restored' : 'No session data to restore');
  };

  const handleClearSession = () => {
    sessionPersistence.clearSessionData();
    setLastAction('Session data cleared');
  };

  const getSessionSummary = () => {
    return sessionPersistence.getSessionSummary();
  };

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
            Session Persistence Test
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              This page demonstrates the session persistence functionality. 
              All data below will be automatically saved and restored across browser sessions.
            </Typography>
          </Alert>

          <Grid container spacing={4}>
            {/* Test Counter */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Counter
                  </Typography>
                  <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                    {testCounter}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleIncrementCounter}
                    fullWidth
                  >
                    Increment Counter
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Test Messages */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Messages ({testMessages.length})
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                    {testMessages.map((message, index) => (
                      <Chip
                        key={index}
                        label={message}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleAddMessage}
                      size="small"
                    >
                      Add Message
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleClearMessages}
                      size="small"
                    >
                      Clear
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Test Settings */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test Settings
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Theme: {testSettings.theme}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Notifications: {testSettings.notifications ? 'On' : 'Off'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Language: {testSettings.language}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Session Management */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Management
                  </Typography>
                  
                  {lastAction && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <CheckCircle sx={{ mr: 1 }} />
                      {lastAction}
                    </Alert>
                  )}

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveSession}
                    >
                      Save Session Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Restore />}
                      onClick={handleRestoreSession}
                    >
                      Restore Session Data
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Clear />}
                      onClick={handleClearSession}
                    >
                      Clear Session Data
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Session Summary
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 2,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    <pre style={{ margin: 0, fontSize: '12px' }}>
                      {JSON.stringify(getSessionSummary(), null, 2)}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Instructions */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Info sx={{ mr: 1 }} />
                    How to Test Persistence
                  </Typography>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      1. <strong>Increment the counter</strong> and add some messages
                    </Typography>
                    <Typography variant="body2">
                      2. <strong>Close your browser</strong> or refresh the page
                    </Typography>
                    <Typography variant="body2">
                      3. <strong>Reopen the app</strong> - your data should be restored automatically
                    </Typography>
                    <Typography variant="body2">
                      4. <strong>Check the session summary</strong> to see what data is being persisted
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default SessionPersistenceTest;
