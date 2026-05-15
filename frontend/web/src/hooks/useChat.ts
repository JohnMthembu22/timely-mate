/**
 * React Hook for Chat Functionality
 * Provides state management and real-time subscriptions for chat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, ChatMessage, TypingIndicator } from '../services/chatService';

interface UseChatOptions {
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  autoLoadMessages?: boolean;
  messageLimit?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  typing: TypingIndicator[];
  sendMessage: (content: string, messageType?: 'TEXT' | 'FILE' | 'IMAGE') => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  updateTyping: (isTyping: boolean) => void;
  isAppSyncAvailable: boolean;
  hasMore: boolean;
  reconnect: () => void;
}

export const useChat = (options: UseChatOptions): UseChatReturn => {
  const {
    roomId,
    userId,
    userName,
    userAvatar,
    autoLoadMessages = true,
    messageLimit = 50,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState<TypingIndicator[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();

  // Refs
  const subscriptionsRef = useRef<{
    messages?: () => void;
    typing?: () => void;
  }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if AppSync is available
  const isAppSyncAvailable = chatService.isAvailable();

  // Load messages
  const loadMessages = useCallback(async (loadMore: boolean = false) => {
    if (!isAppSyncAvailable) {
      setError('Real-time messaging not configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await chatService.getMessages(
        roomId,
        messageLimit,
        loadMore ? nextToken : undefined
      );

      if (loadMore) {
        setMessages((prev) => [...prev, ...result.items]);
      } else {
        setMessages(result.items.reverse()); // Reverse to show newest at bottom
      }

      setNextToken(result.nextToken);
      setHasMore(!!result.nextToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, messageLimit, nextToken, isAppSyncAvailable]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT'
  ) => {
    if (!isAppSyncAvailable) {
      throw new Error('Real-time messaging not configured');
    }

    if (!content.trim()) {
      return;
    }

    try {
      setError(null);

      await chatService.sendMessage({
        content: content.trim(),
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar,
        roomId,
        roomType: 'MEETING', // Default to meeting for video chat
        messageType,
      });

      // Message will be added via subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      throw err;
    }
  }, [roomId, userId, userName, userAvatar, isAppSyncAvailable]);

  // Update typing status
  const updateTyping = useCallback((isTyping: boolean) => {
    if (!isAppSyncAvailable) {
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    chatService.updateTypingStatus(roomId, userId, userName, isTyping);

    if (isTyping) {
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        chatService.updateTypingStatus(roomId, userId, userName, false);
      }, 3000);
    }
  }, [roomId, userId, userName, isAppSyncAvailable]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (hasMore && !loading) {
      await loadMessages(true);
    }
  }, [hasMore, loading, loadMessages]);

  // Reconnect subscriptions
  const reconnect = useCallback(() => {
    if (!isAppSyncAvailable) {
      return;
    }

    // Clean up existing subscriptions
    Object.values(subscriptionsRef.current).forEach((unsubscribe) => {
      unsubscribe?.();
    });

    // Re-establish subscriptions
    setupSubscriptions();
  }, [isAppSyncAvailable]);

  // Setup subscriptions
  const setupSubscriptions = useCallback(() => {
    if (!isAppSyncAvailable) {
      return;
    }

    // Subscribe to new messages
    subscriptionsRef.current.messages = chatService.subscribeToMessages(
      roomId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      },
      (err) => {
        console.error('Message subscription error:', err);
        setError('Connection lost. Attempting to reconnect...');
        
        // Retry connection after 5 seconds
        setTimeout(reconnect, 5000);
      }
    );

    // Subscribe to typing indicators
    subscriptionsRef.current.typing = chatService.subscribeToTyping(
      roomId,
      (typingIndicator) => {
        setTyping((prev) => {
          const filtered = prev.filter((t) => t.userId !== typingIndicator.userId);
          
          if (typingIndicator.isTyping && typingIndicator.userId !== userId) {
            return [...filtered, typingIndicator];
          }
          
          return filtered;
        });

        // Clear typing indicator after 5 seconds
        if (typingIndicator.isTyping) {
          setTimeout(() => {
            setTyping((prev) => prev.filter((t) => t.userId !== typingIndicator.userId));
          }, 5000);
        }
      },
      (err) => {
        console.error('Typing subscription error:', err);
      }
    );
  }, [roomId, userId, isAppSyncAvailable, reconnect]);

  // Effect to load messages and setup subscriptions
  useEffect(() => {
    if (!isAppSyncAvailable) {
      return;
    }

    if (autoLoadMessages) {
      loadMessages();
    }

    setupSubscriptions();

    // Cleanup function
    return () => {
      Object.values(subscriptionsRef.current).forEach((unsubscribe) => {
        unsubscribe?.();
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, autoLoadMessages, loadMessages, setupSubscriptions, isAppSyncAvailable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send final typing stop
      if (isAppSyncAvailable) {
        chatService.updateTypingStatus(roomId, userId, userName, false);
      }
    };
  }, [roomId, userId, userName, isAppSyncAvailable]);

  return {
    messages,
    loading,
    error,
    typing,
    sendMessage,
    loadMoreMessages,
    updateTyping,
    isAppSyncAvailable,
    hasMore,
    reconnect,
  };
}; 