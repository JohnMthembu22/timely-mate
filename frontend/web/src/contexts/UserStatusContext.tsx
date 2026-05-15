import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define available user statuses
export type UserStatus = 'available' | 'busy' | 'inMeeting' | 'away' | 'doNotDisturb' | 'offline';

// Status color mapping
export const statusColors: Record<UserStatus, string> = {
  available: '#4caf50',
  busy: '#f44336',
  inMeeting: '#9c27b0',
  away: '#ff9800',
  doNotDisturb: '#e91e63',
  offline: '#bdbdbd'
};

// Status label mapping
export const statusLabels: Record<UserStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  inMeeting: 'In a Meeting',
  away: 'Away',
  doNotDisturb: 'Do Not Disturb',
  offline: 'Offline'
};

// Define context type
interface UserStatusContextType {
  status: UserStatus;
  setStatus: (status: UserStatus) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  statusColor: string;
  statusLabel: string;
  awayCountdown: number | null;
  isAutoAwayEnabled: boolean;
  setIsAutoAwayEnabled: (enabled: boolean) => void;
}

// Create context with default values
const UserStatusContext = createContext<UserStatusContextType>({
  status: 'available',
  setStatus: () => {},
  statusMessage: '',
  setStatusMessage: () => {},
  statusColor: statusColors.available,
  statusLabel: statusLabels.available,
  awayCountdown: null,
  isAutoAwayEnabled: true,
  setIsAutoAwayEnabled: () => {},
});

// Provider props type
interface UserStatusProviderProps {
  children: ReactNode;
}

// Provider component
export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ children }) => {
  // State for user status and message
  const [status, setStatus] = useState<UserStatus>('available');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [awayCountdown, setAwayCountdown] = useState<number | null>(null);
  const [isAutoAwayEnabled, setIsAutoAwayEnabled] = useState<boolean>(true);
  
  // Load status from localStorage on mount if available
  useEffect(() => {
    const savedStatus = localStorage.getItem('userStatus');
    const savedMessage = localStorage.getItem('statusMessage');
    const savedAutoAway = localStorage.getItem('isAutoAwayEnabled');
    
    if (savedStatus && isValidStatus(savedStatus)) {
      setStatus(savedStatus as UserStatus);
    }
    
    if (savedMessage) {
      setStatusMessage(savedMessage);
    }
    
    if (savedAutoAway !== null) {
      setIsAutoAwayEnabled(savedAutoAway === 'true');
    }
  }, []);
  
  // Save status changes to localStorage
  useEffect(() => {
    localStorage.setItem('userStatus', status);
  }, [status]);
  
  // Save message changes to localStorage
  useEffect(() => {
    localStorage.setItem('statusMessage', statusMessage);
  }, [statusMessage]);
  
  // Save auto-away setting to localStorage
  useEffect(() => {
    localStorage.setItem('isAutoAwayEnabled', isAutoAwayEnabled.toString());
  }, [isAutoAwayEnabled]);
  
  // Helper function to validate status
  function isValidStatus(status: string): status is UserStatus {
    return ['available', 'busy', 'inMeeting', 'away', 'doNotDisturb', 'offline'].includes(status);
  }
  
  // Compute derived values
  const statusColor = statusColors[status];
  const statusLabel = statusLabels[status];
  
  // Value object for the provider
  const value = {
    status,
    setStatus,
    statusMessage,
    setStatusMessage,
    statusColor,
    statusLabel,
    awayCountdown,
    isAutoAwayEnabled,
    setIsAutoAwayEnabled,
  };
  
  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
};

// Custom hook for using the context
export const useUserStatus = (): UserStatusContextType => useContext(UserStatusContext);

export default UserStatusProvider; 