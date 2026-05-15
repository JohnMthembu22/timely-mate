/**
 * Application Status Component
 * Shows the current state of integrations and features
 */

import React, { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Info,
  Settings,
  Chat,
  Cloud,
  Security,
} from '@mui/icons-material';
import { getEnvironmentInfo } from '../../utils/envValidation';

const AppStatus: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const envInfo = getEnvironmentInfo();

  const features = [
    {
      name: 'Real-time Chat',
      status: envInfo.config.enableRealTimeChat ? 'active' : 'inactive',
      icon: <Chat />,
      description: envInfo.config.enableRealTimeChat 
        ? 'Real-time messaging is enabled'
        : 'Real-time chat is disabled',
    },
    {
      name: 'Environment Configuration',
      status: envInfo.isValid ? 'active' : 'warning',
      icon: <Settings />,
      description: envInfo.isValid 
        ? 'All required environment variables are set'
        : `${envInfo.errors.length} configuration issues found`,
    },
    {
      name: 'Render Services',
      status: envInfo.config.apiUrl ? 'active' : 'inactive',
      icon: <Cloud />,
      description: envInfo.config.apiUrl 
        ? `API connected: ${envInfo.config.apiUrl}`
        : 'API URL not configured',
    },
    {
      name: 'Authentication',
      status: 'active',
      icon: <Security />,
      description: 'User authentication system is ready',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'inactive': return <Info color="disabled" />;
      default: return <Info />;
    }
  };

  // Only show in development mode
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: expanded ? 400 : 200,
        zIndex: 1300,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            App Status
          </Typography>
          <Chip
            label={envInfo.environment}
            size="small"
            sx={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🚀 Feature Status
          </Typography>

          <List dense>
            {features.map((feature) => (
              <ListItem key={feature.name} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getStatusIcon(feature.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {feature.name}
                      </Typography>
                      <Chip
                        label={feature.status}
                        size="small"
                        color={getStatusColor(feature.status)}
                        sx={{ height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {feature.description}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          {envInfo.errors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚠️ Configuration Issues
              </Typography>
              {envInfo.errors.slice(0, 2).map((error, index) => (
                <Typography key={index} variant="caption" display="block">
                  • {error}
                </Typography>
              ))}
            </Alert>
          )}

          {envInfo.warnings.length > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                💡 Recommendations
              </Typography>
              {envInfo.warnings.slice(0, 2).map((warning, index) => (
                <Typography key={index} variant="caption" display="block">
                  • {warning}
                </Typography>
              ))}
            </Alert>
          )}

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              🎉 Deployed on Render
            </Typography>
            <Typography variant="caption">
              This application is optimized for Render deployment with automatic scaling and zero configuration.
            </Typography>
          </Alert>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AppStatus; 