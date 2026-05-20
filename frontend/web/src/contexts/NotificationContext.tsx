import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { useAppSelector } from '../store';
import { getManagerRecipientId } from '../utils/managerReview';

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
  /** When set, only this recipient sees the notification */
  recipientId?: string;
  jobId?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'timelymate_notifications';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read'>) => void;
  addNotificationForRecipient: (
    recipientId: string,
    notification: Omit<NotificationItem, 'id' | 'read' | 'recipientId'>
  ) => void;
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

const loadStoredNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistNotifications = (items: NotificationItem[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(() => loadStoredNotifications());
  const [nextId, setNextId] = useState(() => {
    const stored = loadStoredNotifications();
    if (stored.length === 0) return 1;
    return Math.max(...stored.map((n) => n.id), 0) + 1;
  });

  const currentRecipientId = useMemo(() => {
    if (!user) return null;
    const id = getManagerRecipientId(user);
    return id || null;
  }, [user]);

  const notifications = useMemo(() => {
    return allNotifications.filter(
      (n) => !n.recipientId || (currentRecipientId && n.recipientId === currentRecipientId)
    );
  }, [allNotifications, currentRecipientId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    persistNotifications(allNotifications);
  }, [allNotifications]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: nextId,
      read: false,
    };

    setAllNotifications((prev) => [newNotification, ...prev]);
    setNextId((prev) => prev + 1);
  }, [nextId]);

  const addNotificationForRecipient = useCallback(
    (recipientId: string, notification: Omit<NotificationItem, 'id' | 'read' | 'recipientId'>) => {
      const newNotification: NotificationItem = {
        ...notification,
        recipientId,
        id: nextId,
        read: false,
      };

      setAllNotifications((prev) => [newNotification, ...prev]);
      setNextId((prev) => prev + 1);
    },
    [nextId]
  );

  const markAsRead = useCallback((id: number) => {
    setAllNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAllNotifications((prev) =>
      prev.map((notification) => {
        const isVisible =
          !notification.recipientId ||
          (currentRecipientId && notification.recipientId === currentRecipientId);
        return isVisible ? { ...notification, read: true } : notification;
      })
    );
  }, [currentRecipientId]);

  const removeNotification = useCallback((id: number) => {
    setAllNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    if (!currentRecipientId) {
      setAllNotifications([]);
      return;
    }
    setAllNotifications((prev) =>
      prev.filter((n) => n.recipientId && n.recipientId !== currentRecipientId)
    );
  }, [currentRecipientId]);

  const getUnreadCountByType = useCallback((type: NotificationItem['type']) => {
    return notifications.filter((n) => !n.read && n.type === type).length;
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    addNotificationForRecipient,
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

  job: (title: string, description: string, jobId?: string) => ({
    type: 'job' as const,
    title,
    description,
    time: new Date().toLocaleTimeString(),
    actionUrl: '/time-tracking?tab=jobs-to-review',
    jobId,
    priority: 'high' as const,
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