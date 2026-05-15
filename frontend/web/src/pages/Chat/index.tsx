/**
 * Chat Page
 * Showcases real-time messaging functionality with Socket.IO on Render
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import Chat from '../../components/Chat';
import chatService from '../../services/chatService';

const ChatPage: React.FC = () => {
  const isRealTimeChatEnabled = import.meta.env.VITE_ENABLE_REAL_TIME_CHAT === 'true' || 
                                (window as any).ENV?.VITE_ENABLE_REAL_TIME_CHAT === 'true';
  const connectionStatus = chatService.getStatus();

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ChatIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Real-time Chat
            </Typography>
            <Chip
              icon={connectionStatus === 'connected' ? <WifiIcon /> : connectionStatus === 'mock' ? <WifiIcon /> : <WifiOffIcon />}
              label={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'mock' ? 'Mock Mode' : 'Disconnected'}
              color={connectionStatus === 'connected' ? 'success' : connectionStatus === 'mock' ? 'warning' : 'default'}
              variant="outlined"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Experience seamless real-time communication powered by Socket.IO on Render
          </Typography>
        </Box>

        {/* Chat Status */}
        {!isRealTimeChatEnabled && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Real-time chat is currently disabled. To enable it, set <code>VITE_ENABLE_REAL_TIME_CHAT=true</code> in your environment variables.
            </Typography>
          </Alert>
        )}

        {isRealTimeChatEnabled && connectionStatus === 'mock' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Running in mock mode - chat functionality works locally but messages won't sync across devices. 
              Start the backend server to enable real-time communication.
            </Typography>
          </Alert>
        )}

        {isRealTimeChatEnabled && connectionStatus !== 'connected' && connectionStatus !== 'mock' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Connecting to real-time chat server... Make sure your backend is running with WebSocket support.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Chat Room */}
          <Grid item xs={12} md={8}>
            <Chat 
              roomId="general" 
              roomName="General Discussion" 
              height={500}
            />
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon />
                Chat Features
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  ✅ Real-time messaging
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Messages appear instantly for all connected users
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  ✅ Connection status
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  See when you're online or offline
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  ✅ Message history
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Previous messages are saved and synchronized
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  ✅ System messages
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Welcome messages and notifications
                </Typography>
              </Box>
            </Paper>

            {/* Technical Info */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Technical Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Transport: Socket.IO
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  WebSocket with polling fallback
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Deployment: Render
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Optimized for cloud deployment
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Status: {connectionStatus}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current connection state
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Server: {import.meta.env.VITE_SOCKET_URL || 'Not configured'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Real-time server endpoint
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Chat Rooms */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Chat 
              roomId="team" 
              roomName="Team Updates" 
              height={300}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Chat 
              roomId="support" 
              roomName="Support Chat" 
              height={300}
            />
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default ChatPage; 