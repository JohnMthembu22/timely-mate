import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useAppSelector } from '../store';
import { getManagerRecipientId } from '../utils/managerReview';
import {
  MAX_STORED_NOTIFICATIONS,
  normalizeLoadedNotifications,
  sanitizeNotifications,
} from '../utils/notificationStorage';

// Notification type definition
export interface NotificationItem {
  id: number;
  type: 'message' | 'task' | 'calendar' | 'timesheet' | 'procurement' | 'hr' | 'system' | 'employee' | 'job' | 'meeting' | 'freelancer' | 'leave' | 'team' | 'project';
  title: string;
  description: string;
  time: string;
  /** Epoch ms — used for sorting (locale time strings are not sortable). */
  createdAt: number;
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
const PERSIST_DEBOUNCE_MS = 400;

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void;
  addNotificationForRecipient: (
    recipientId: string,
    notification: Omit<NotificationItem, 'id' | 'read' | 'recipientId' | 'createdAt'>
  ) => void;
  markAsRead: (id: number) => void;
  markManyAsRead: (ids: number[]) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  removeManyNotifications: (ids: number[]) => void;
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
    return normalizeLoadedNotifications(JSON.parse(raw));
  } catch {
    return [];
  }
};

const persistNotifications = (items: NotificationItem[]) => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(sanitizeNotifications(items))
    );
  } catch {
    /* ignore quota errors */
  }
};

function computeNextId(items: NotificationItem[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((n) => n.id), 0) + 1;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const initial = useMemo(() => loadStoredNotifications(), []);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(initial);
  const [nextId, setNextId] = useState(() => computeNextId(initial));
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRecipientId = useMemo(() => {
    if (!user) return null;
    const id = getManagerRecipientId(user);
    return id || null;
  }, [user]);

  const notifications = useMemo(
    () =>
      allNotifications.filter(
        (n) => !n.recipientId || (currentRecipientId && n.recipientId === currentRecipientId)
      ),
    [allNotifications, currentRecipientId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      persistNotifications(allNotifications);
      persistTimerRef.current = null;
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [allNotifications]);

  const trimAndPrepend = useCallback(
    (item: NotificationItem, prev: NotificationItem[]) =>
      [item, ...prev].slice(0, MAX_STORED_NOTIFICATIONS),
    []
  );

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
      const createdAt = Date.now();
      const newNotification: NotificationItem = {
        ...notification,
        id: nextId,
        read: false,
        createdAt,
        time: notification.time || new Date(createdAt).toLocaleTimeString(),
      };

      setAllNotifications((prev) => trimAndPrepend(newNotification, prev));
      setNextId((prev) => prev + 1);
    },
    [nextId, trimAndPrepend]
  );

  const addNotificationForRecipient = useCallback(
    (
      recipientId: string,
      notification: Omit<NotificationItem, 'id' | 'read' | 'recipientId' | 'createdAt'>
    ) => {
      const createdAt = Date.now();
      const newNotification: NotificationItem = {
        ...notification,
        recipientId,
        id: nextId,
        read: false,
        createdAt,
        time: notification.time || new Date(createdAt).toLocaleTimeString(),
      };

      setAllNotifications((prev) => trimAndPrepend(newNotification, prev));
      setNextId((prev) => prev + 1);
    },
    [nextId, trimAndPrepend]
  );

  const markAsRead = useCallback((id: number) => {
    setAllNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markManyAsRead = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setAllNotifications((prev) =>
      prev.map((notification) =>
        idSet.has(notification.id) ? { ...notification, read: true } : notification
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

  const removeManyNotifications = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setAllNotifications((prev) => prev.filter((notification) => !idSet.has(notification.id)));
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

  const getUnreadCountByType = useCallback(
    (type: NotificationItem['type']) => notifications.filter((n) => !n.read && n.type === type).length,
    [notifications]
  );

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      addNotificationForRecipient,
      markAsRead,
      markManyAsRead,
      markAllAsRead,
      removeNotification,
      removeManyNotifications,
      clearAllNotifications,
      getUnreadCountByType,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      addNotificationForRecipient,
      markAsRead,
      markManyAsRead,
      markAllAsRead,
      removeNotification,
      removeManyNotifications,
      clearAllNotifications,
      getUnreadCountByType,
    ]
  );

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
