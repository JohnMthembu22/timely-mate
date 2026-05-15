import React from 'react';
import { Avatar, Box, Tooltip, Typography, styled } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { UserStatus } from '../../contexts/UserStatusContext';

interface TeamMemberStatusProps {
  status: UserStatus;
  name: string;
  avatar: string;
  lastActiveTime?: Date;
  size?: 'small' | 'medium' | 'large';
  showLastActive?: boolean;
}

// Status colors mapping
const statusColors: Record<UserStatus, string> = {
  available: '#44b700',
  busy: '#ff3d00',
  away: '#ffb400',
  offline: '#bdbdbd',
  doNotDisturb: '#f44336',
  inMeeting: '#9c27b0'
};

// Status labels mapping
const statusLabels: Record<UserStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline',
  doNotDisturb: 'Do Not Disturb',
  inMeeting: 'In a Meeting'
};

const StyledBadge = styled(Box)<{ statuscolor: string, size: string }>(({ statuscolor, size }) => ({
  position: 'relative',
  display: 'inline-flex',
  '& .MuiAvatar-root': {
    width: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
    height: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: size === 'small' ? 10 : size === 'medium' ? 12 : 14,
    height: size === 'small' ? 10 : size === 'medium' ? 12 : 14,
    backgroundColor: statuscolor,
    border: '2px solid #fff',
    borderRadius: '50%',
  },
}));

const formatLastActive = (date?: Date): string => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  
  return date.toLocaleDateString();
};

const TeamMemberStatus: React.FC<TeamMemberStatusProps> = ({
  status,
  name,
  avatar,
  lastActiveTime,
  size = 'medium',
  showLastActive = true
}) => {
  const statusColor = statusColors[status] || statusColors.offline;
  const statusLabel = statusLabels[status] || statusLabels.offline;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={statusLabel} placement="top">
        <StyledBadge statuscolor={statusColor} size={size}>
          <Avatar alt={name} src={avatar} />
        </StyledBadge>
      </Tooltip>
      
      <Box sx={{ ml: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {name}
        </Typography>
        
        {showLastActive && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <FiberManualRecordIcon 
              sx={{ fontSize: 10, color: statusColor }} 
            />
            {statusLabel}
            {status !== 'available' && lastActiveTime && (
              <>
                <Box component="span" sx={{ mx: 0.5 }}>•</Box>
                <AccessTimeIcon sx={{ fontSize: 12 }} />
                <Box component="span">
                  {formatLastActive(lastActiveTime)}
                </Box>
              </>
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TeamMemberStatus; 