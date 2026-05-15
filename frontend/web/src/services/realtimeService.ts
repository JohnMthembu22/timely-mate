import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Real-time Service for Supabase
 * Provides real-time subscriptions for database changes
 */

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export class RealtimeService {
  /**
   * Subscribe to changes in a table
   * @param tableName - Name of the table to subscribe to
   * @param callback - Callback function called when data changes
   * @param filter - Optional filter (e.g., { column: 'id', value: '123' })
   */
  static subscribeToTable<T = any>(
    tableName: string,
    callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new?: T; old?: T }) => void,
    filter?: { column: string; value: any }
  ): RealtimeSubscription | null {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Real-time features disabled.');
      return null;
    }

    const channelName = filter
      ? `${tableName}:${filter.column}=${filter.value}`
      : `${tableName}:*`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  /**
   * Subscribe to presence changes (user online/offline status)
   * @param room - Room/channel name
   * @param userId - Current user ID
   * @param userData - User data to broadcast
   * @param onJoin - Callback when user joins
   * @param onLeave - Callback when user leaves
   * @param onSync - Callback when presence syncs
   */
  static subscribeToPresence(
    room: string,
    userId: string,
    userData: any,
    onJoin?: (userId: string, presence: any) => void,
    onLeave?: (userId: string, presence: any) => void,
    onSync?: () => void
  ): RealtimeSubscription | null {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Real-time features disabled.');
      return null;
    }

    const channel = supabase.channel(room, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (onJoin && key !== userId) {
          onJoin(key, newPresences[0]);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (onLeave) {
          onLeave(key, leftPresences[0]);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        if (onSync) {
          onSync();
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userData);
        }
      });

    return {
      channel,
      unsubscribe: () => {
        channel.untrack();
        supabase.removeChannel(channel);
      },
    };
  }

  /**
   * Subscribe to broadcast messages
   * @param channelName - Channel name
   * @param callback - Callback when message is received
   */
  static subscribeToBroadcast(
    channelName: string,
    callback: (payload: { event: string; payload: any }) => void
  ): RealtimeSubscription | null {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Real-time features disabled.');
      return null;
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, (payload) => {
        callback(payload);
      })
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  /**
   * Send a broadcast message
   * @param channelName - Channel name
   * @param event - Event name
   * @param payload - Message payload
   */
  static async sendBroadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Real-time features disabled.');
      return false;
    }

    const channel = supabase.channel(channelName);
    await channel.subscribe();
    const status = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    return status === 'ok';
  }
}

