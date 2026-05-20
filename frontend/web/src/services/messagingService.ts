/**
 * Messaging Service
 * Handles two-way messaging with Supabase persistence and real-time updates
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
  // Extended fields from joins
  sender_name?: string;
  sender_email?: string;
  sender_avatar?: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_avatar?: string;
}

export interface ChatConversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_avatar?: string;
  last_message?: ChatMessage;
  unread_count: number;
  last_activity: string;
}

class MessagingService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private messageListeners: Map<string, Set<(message: ChatMessage) => void>> = new Map();
  private conversationListeners: Set<(conversations: ChatConversation[]) => void> = new Set();

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('timelymate_user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<ChatConversation[]> {
    if (!isSupabaseConfigured()) {
      return this.getLocalConversations();
    }

    const userId = this.getCurrentUserId();
    if (!userId) return [];

    try {
      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return this.getLocalConversations();
      }

      // Group messages by conversation partner
      const conversationMap = new Map<string, ChatConversation>();

      messages?.forEach((msg: any) => {
        const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        if (!partnerId) return;

        const partner = msg.sender;
        const partnerName = partner?.full_name || partner?.email || 'Unknown User';
        const partnerEmail = partner?.email || '';
        const partnerAvatar = partner?.avatar_url || '';

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: `conv-${partnerId}`,
            participant_id: partnerId,
            participant_name: partnerName,
            participant_email: partnerEmail,
            participant_avatar: partnerAvatar,
            unread_count: 0,
            last_activity: msg.created_at,
          });
        }

        const conv = conversationMap.get(partnerId)!;
        if (!conv.last_message || new Date(msg.created_at) > new Date(conv.last_message.created_at)) {
          conv.last_message = {
            id: msg.id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            content: msg.content,
            created_at: msg.created_at,
            read_at: msg.read_at,
            sender_name: msg.sender?.full_name || msg.sender?.email,
            sender_email: msg.sender?.email,
            recipient_name: msg.recipient?.full_name || msg.recipient?.email,
            recipient_email: msg.recipient?.email,
          };
          conv.last_activity = msg.created_at;
        }

        // Count unread messages (messages sent to current user that aren't read)
        if (msg.recipient_id === userId && !msg.read_at) {
          conv.unread_count++;
        }
      });

      return Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      );
    } catch (error) {
      console.error('Error in getConversations:', error);
      return this.getLocalConversations();
    }
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(recipientId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) {
      return this.getLocalMessages(recipientId);
    }

    const userId = this.getCurrentUserId();
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return this.getLocalMessages(recipientId);
      }

      return (data || []).map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        created_at: msg.created_at,
        read_at: msg.read_at,
        sender_name: msg.sender?.full_name || msg.sender?.email,
        sender_email: msg.sender?.email,
        sender_avatar: msg.sender?.avatar_url,
        recipient_name: undefined,
        recipient_email: undefined,
        recipient_avatar: undefined,
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      return this.getLocalMessages(recipientId);
    }
  }

  /**
   * Send a message
   */
  async sendMessage(recipientId: string, content: string): Promise<ChatMessage | null> {
    if (!isSupabaseConfigured()) {
      return this.sendLocalMessage(recipientId, content);
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      const message: ChatMessage = {
        id: data.id,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        content: data.content,
        created_at: data.created_at,
        read_at: data.read_at,
        sender_name: data.sender?.full_name || data.sender?.email,
        sender_email: data.sender?.email,
        sender_avatar: data.sender?.avatar_url,
        recipient_name: undefined,
        recipient_email: undefined,
        recipient_avatar: undefined,
      };

      // Store locally as backup
      this.storeLocalMessage(message);

      return message;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return this.sendLocalMessage(recipientId, content);
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(recipientId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const userId = this.getCurrentUserId();
      if (!userId) return;
      const messages = this.getLocalMessages(recipientId).map((m) =>
        m.recipient_id === userId && !m.read_at
          ? { ...m, read_at: new Date().toISOString() }
          : m
      );
      const key = this.conversationStorageKey(userId, recipientId);
      localStorage.setItem(key, JSON.stringify(messages));
      const convs = this.getLocalConversations().map((c) =>
        c.participant_id === recipientId ? { ...c, unread_count: 0 } : c
      );
      localStorage.setItem('timelymate_conversations', JSON.stringify(convs));
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('sender_id', recipientId)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Subscribe to real-time messages for a conversation
   */
  subscribeToMessages(recipientId: string, callback: (message: ChatMessage) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const userId = this.getCurrentUserId();
    if (!userId) return () => {};

    const channelId = `messages:${userId}:${recipientId}`;
    
    // Create a unique channel for this conversation
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId}))`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            // Fetch full message with profile data
            const { data: messageData } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(id, email, full_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (messageData) {
              const message: ChatMessage = {
                id: messageData.id,
                sender_id: messageData.sender_id,
                recipient_id: messageData.recipient_id,
                content: messageData.content,
                created_at: messageData.created_at,
                read_at: messageData.read_at,
                sender_name: messageData.sender?.full_name || messageData.sender?.email,
                sender_email: messageData.sender?.email,
                sender_avatar: messageData.sender?.avatar_url,
                recipient_name: undefined,
                recipient_email: undefined,
                recipient_avatar: undefined,
              };

              callback(message);
              this.storeLocalMessage(message);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            // Handle read receipts
            if (payload.new.read_at) {
              callback(payload.new as Message);
            }
          }
        }
      )
      .subscribe();

    this.channels.set(channelId, channel);

    // Store listener for cleanup
    if (!this.messageListeners.has(recipientId)) {
      this.messageListeners.set(recipientId, new Set());
    }
    this.messageListeners.get(recipientId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.messageListeners.get(recipientId)?.delete(callback);
      if (this.messageListeners.get(recipientId)?.size === 0) {
        channel.unsubscribe();
        this.channels.delete(channelId);
      }
    };
  }

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversations(callback: (conversations: ChatConversation[]) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    this.conversationListeners.add(callback);

    // Load initial conversations
    this.getConversations().then(callback);

    // Subscribe to all messages for the current user
    const userId = this.getCurrentUserId();
    if (!userId) return () => {};

    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},recipient_id.eq.${userId})`,
        },
        async () => {
          // Reload conversations when any message changes
          const conversations = await this.getConversations();
          this.conversationListeners.forEach(cb => cb(conversations));
        }
      )
      .subscribe();

    return () => {
      this.conversationListeners.delete(callback);
      if (this.conversationListeners.size === 0) {
        channel.unsubscribe();
      }
    };
  }

  /**
   * Local storage fallback methods
   */
  private conversationStorageKey(userId: string, recipientId: string): string {
    return `timelymate_messages_${[userId, recipientId].sort().join('__')}`;
  }

  private getLocalUserDisplayName(): string {
    try {
      const userStr = localStorage.getItem('timelymate_user');
      if (!userStr) return 'You';
      const user = JSON.parse(userStr);
      return user.name || user.email?.split('@')[0] || 'You';
    } catch {
      return 'You';
    }
  }

  private lookupParticipantMeta(participantId: string): {
    name: string;
    email: string;
    avatar?: string;
  } {
    try {
      const employees = JSON.parse(localStorage.getItem('timelymate_employees') || '[]');
      const match = employees.find((e: { id: string }) => e.id === participantId);
      if (match) {
        return {
          name: match.name,
          email: match.email || `${match.name.toLowerCase().replace(/\s+/g, '.')}@timelymate.app`,
          avatar: match.avatar,
        };
      }
    } catch {
      /* ignore */
    }
    return {
      name: 'Team member',
      email: `${participantId}@timelymate.app`,
    };
  }

  private getLocalConversations(): ChatConversation[] {
    try {
      const stored = localStorage.getItem('timelymate_conversations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalMessages(recipientId: string): ChatMessage[] {
    const userId = this.getCurrentUserId();
    if (!userId) return [];
    try {
      const key = this.conversationStorageKey(userId, recipientId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private sendLocalMessage(recipientId: string, content: string): ChatMessage {
    const userId = this.getCurrentUserId() || 'local-user';
    const senderName = this.getLocalUserDisplayName();
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      sender_id: userId,
      recipient_id: recipientId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
      sender_name: senderName,
    };

    this.storeLocalMessage(message);
    return message;
  }

  private upsertLocalConversation(partnerId: string, message: ChatMessage): void {
    const meta = this.lookupParticipantMeta(partnerId);
    const convs = this.getLocalConversations();
    const existing = convs.find((c) => c.participant_id === partnerId);
    const updated: ChatConversation = {
      id: existing?.id || `conv-${partnerId}`,
      participant_id: partnerId,
      participant_name: meta.name,
      participant_email: meta.email,
      participant_avatar: meta.avatar,
      last_message: message,
      unread_count: existing?.unread_count ?? 0,
      last_activity: message.created_at,
    };

    const next = [updated, ...convs.filter((c) => c.participant_id !== partnerId)];
    localStorage.setItem('timelymate_conversations', JSON.stringify(next));
  }

  private storeLocalMessage(message: ChatMessage): void {
    const userId = this.getCurrentUserId();
    if (!userId || !message.recipient_id) return;

    try {
      const partnerId =
        message.sender_id === userId ? message.recipient_id : message.sender_id;
      const key = this.conversationStorageKey(userId, partnerId);
      const existing = this.getLocalMessages(partnerId);
      existing.push(message);
      localStorage.setItem(key, JSON.stringify(existing));
      this.upsertLocalConversation(partnerId, message);
    } catch (error) {
      console.error('Error storing local message:', error);
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
    this.messageListeners.clear();
    this.conversationListeners.clear();
  }
}

export const messagingService = new MessagingService();

