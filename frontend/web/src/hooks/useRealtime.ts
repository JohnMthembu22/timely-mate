import { useEffect, useRef } from 'react';
import { RealtimeService, RealtimeSubscription } from '../services/realtimeService';

/**
 * Hook for subscribing to real-time table changes
 * @param tableName - Name of the table to subscribe to
 * @param callback - Callback function called when data changes
 * @param filter - Optional filter (e.g., { column: 'id', value: '123' })
 * @param enabled - Whether the subscription is enabled (default: true)
 */
export function useRealtimeTable<T = any>(
  tableName: string,
  callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void,
  filter?: { column: string; value: any },
  enabled: boolean = true
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = RealtimeService.subscribeToTable<T>(tableName, callback, filter);
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [tableName, enabled, filter?.column, filter?.value]);

  return subscriptionRef.current;
}

/**
 * Hook for subscribing to presence (user online/offline status)
 */
export function useRealtimePresence(
  room: string,
  userId: string,
  userData: any,
  callbacks?: {
    onJoin?: (userId: string, presence: any) => void;
    onLeave?: (userId: string, presence: any) => void;
    onSync?: () => void;
  },
  enabled: boolean = true
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const subscription = RealtimeService.subscribeToPresence(
      room,
      userId,
      userData,
      callbacks?.onJoin,
      callbacks?.onLeave,
      callbacks?.onSync
    );
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [room, userId, enabled]);

  return subscriptionRef.current;
}

/**
 * Hook for subscribing to broadcast messages
 */
export function useRealtimeBroadcast(
  channelName: string,
  callback: (payload: { event: string; payload: any }) => void,
  enabled: boolean = true
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = RealtimeService.subscribeToBroadcast(channelName, callback);
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [channelName, enabled]);

  return subscriptionRef.current;
}

