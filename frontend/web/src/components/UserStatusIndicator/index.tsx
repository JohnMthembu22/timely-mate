import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
  IconButton,
  TextField,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { styled } from '@mui/material/styles';
import { UserStatus, useUserStatus, statusColors, statusLabels } from '../../contexts/UserStatusContext';

// Styled components
const StatusAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'statusColor'
})<{ statusColor: string }>(({ statusColor }) => ({
  backgroundColor: statusColor,
  color: '#FFFFFF',
  fontWeight: 'bold'
}));

interface UserStatusIndicatorProps {
  avatarUrl?: string;
  size?: number;
  showMenu?: boolean;
  userName?: string;
  showBackground?: boolean;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  avatarUrl,
  size = 40,
  showMenu = true,
  userName,
  showBackground = true,
}) => {
  const { 
    status, 
    setStatus, 
    statusMessage, 
    setStatusMessage,
    statusColor,
  } = useUserStatus();
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customMessage, setCustomMessage] = useState(statusMessage);
  const open = Boolean(anchorEl);
  
  // Menu handlers
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showMenu) {
      setAnchorEl(event.currentTarget);
      setCustomMessage(statusMessage);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleStatusChange = (newStatus: UserStatus) => {
    setStatus(newStatus);
    handleClose();
  };
  
  const handleMessageSave = () => {
    setStatusMessage(customMessage);
    handleClose();
  };

  return (
    <>
      <StatusAvatar
        statusColor={showBackground ? statusColor : 'transparent'}
        src={avatarUrl} 
        alt={userName || 'User'}
        sx={{ 
          width: size, 
          height: size,
          cursor: showMenu ? 'pointer' : 'default',
          color: !showBackground ? statusColor : '#FFFFFF',
          border: !showBackground ? `2px solid ${statusColor}` : 'none',
          backgroundColor: showBackground ? statusColor : 'transparent',
          boxShadow: showBackground 
            ? `0 8px 24px ${statusColor}33, 0 2px 8px rgba(0,0,0,0.15)`
            : `0 0 0 3px ${statusColor}22`,
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: showMenu ? 'translateY(-1px)' : 'none',
            boxShadow: showBackground 
              ? `0 12px 28px ${statusColor}44, 0 4px 10px rgba(0,0,0,0.18)`
              : `0 0 0 4px ${statusColor}33`,
          },
          ...(showBackground ? {} : {
            '&.MuiAvatar-root': {
              background: 'none'
            }
          })
        }}
        onClick={handleClick}
      >
        {!avatarUrl && userName ? userName.charAt(0).toUpperCase() : ''}
      </StatusAvatar>
      
      {showMenu && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          {/* Status options */}
          {Object.entries(statusLabels).map(([key, label]) => (
            <MenuItem 
              key={key} 
              onClick={() => handleStatusChange(key as UserStatus)}
              selected={status === key}
            >
              <ListItemIcon>
                <Box 
                  sx={{ 
                    backgroundColor: statusColors[key as UserStatus],
                    height: 10,
                    width: 10,
                    borderRadius: '50%'
                  }} 
                />
              </ListItemIcon>
              <Typography>{label}</Typography>
              {status === key && (
                <CheckIcon fontSize="small" sx={{ ml: 1 }} />
              )}
            </MenuItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Custom status message */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="What's your status?"
              variant="outlined"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              margin="dense"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={handleMessageSave}
                color="primary"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Menu>
      )}
    </>
  );
};

export default UserStatusIndicator; 