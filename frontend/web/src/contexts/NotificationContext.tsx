import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Notification type definition
export interface NotificationItem {
  id: number;
  type: 'message' | 'task' | 'calendar' | 'timesheet' | 'procurement' | 'hr' | 'system' | 'employee' | 'job' | 'meeting' | 'freelancer' | 'leave' | 'team' | 'project';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  icon?: React.ReactNode;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
  getUnreadCountByType: (type: NotificationItem['type']) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: nextId,
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCountByType = useCallback((type: NotificationItem['type']) => {
    return notifications.filter(n => !n.read && n.type === type).length;
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCountByType,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Utility functions for creating notifications
export const createNotification = {
  message: (title: string, description: string) => ({
    type: 'message' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/messages',
  }),

  task: (title: string, description: string) => ({
    type: 'task' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/projects',
  }),

  calendar: (title: string, description: string) => ({
    type: 'calendar' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/calendar',
  }),

  timesheet: (title: string, description: string) => ({
    type: 'timesheet' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/time-tracking',
  }),

  procurement: (title: string, description: string) => ({
    type: 'procurement' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/procurement',
  }),

  hr: (title: string, description: string) => ({
    type: 'hr' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/hr',
  }),

  system: (title: string, description: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => ({
    type: 'system' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    priority,
  }),

  employee: (title: string, description: string) => ({
    type: 'employee' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/hr',
  }),

  job: (title: string, description: string) => ({
    type: 'job' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/time-tracking',
  }),

  meeting: (title: string, description: string) => ({
    type: 'meeting' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/calendar',
  }),

  freelancer: (title: string, description: string) => ({
    type: 'freelancer' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/freelancers',
  }),

  leave: (title: string, description: string) => ({
    type: 'leave' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/hr',
  }),

  team: (title: string, description: string) => ({
    type: 'team' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/teams',
  }),

  project: (title: string, description: string) => ({
    type: 'project' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/projects',
  }),
}; 