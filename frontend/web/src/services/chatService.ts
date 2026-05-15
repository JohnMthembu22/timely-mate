/**
 * Chat Service
 * Handles real-time messaging functionality using Socket.IO
 */

import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'system';
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
  lastActivity: Date;
}

class ChatService {
  private socket: Socket | null = null;
  private chatRooms: Map<string, ChatRoom> = new Map();
  private listeners: Map<string, Set<(messages: Message[]) => void>> = new Map();
  private isConnected: boolean = false;
  private mockMode: boolean = false;

  constructor() {
    this.initializeSocket();
  }

  /**
   * Initialize Socket.IO connection
   */
  private initializeSocket(): void {
    if (typeof window === 'undefined') return; // SSR safety

    const socketUrl = (window as any).ENV?.VITE_SOCKET_URL || 
                     import.meta.env.VITE_SOCKET_URL || 
                     (window as any).ENV?.VITE_API_URL ||
                     import.meta.env.VITE_API_URL || 
                     'http://localhost:3000';
    
    this.socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Socket.IO connected');
      this.isConnected = true;
      this.mockMode = false;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO connection error:', error);
      this.isConnected = false;
      this.mockMode = true; // Enable mock mode when server is not available
      console.log('🎭 Switching to mock mode for chat functionality');
    });

    this.socket.on('message', (message: Message) => {
      this.handleIncomingMessage(message);
    });

    this.socket.on('room-created', (room: ChatRoom) => {
      this.chatRooms.set(room.id, room);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket.IO error:', error);
    });

    // Auto-connect if real-time chat is enabled
    if (import.meta.env.VITE_ENABLE_REAL_TIME_CHAT === 'true') {
      this.connect();
    }
  }

  /**
   * Connect to Socket.IO server
   */
  connect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Handle incoming messages from Socket.IO
   */
  private handleIncomingMessage(message: Message): void {
    const room = this.chatRooms.get(message.roomId);
    if (room) {
      room.messages.push(message);
      room.lastActivity = new Date();

      // Notify listeners
      const roomListeners = this.listeners.get(message.roomId);
      if (roomListeners) {
        roomListeners.forEach(listener => listener(room.messages));
      }
    }
  }

  /**
   * Create a new chat room
   */
  createChatRoom(roomId: string, name: string, participants: string[]): ChatRoom {
    const chatRoom: ChatRoom = {
      id: roomId,
      name,
      participants,
      messages: [],
      lastActivity: new Date(),
    };

    this.chatRooms.set(roomId, chatRoom);
    this.listeners.set(roomId, new Set());

    // Emit to server if connected
    if (this.socket && this.isConnected) {
      this.socket.emit('create-room', chatRoom);
    }

    return chatRoom;
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', roomId);
    }
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', roomId);
    }
  }

  /**
   * Send a message to a chat room
   */
  sendMessage(roomId: string, content: string, sender: string): Message {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender,
      timestamp: new Date(),
      type: 'text',
      roomId,
    };

    // Add to local storage immediately for optimistic updates
    const room = this.chatRooms.get(roomId);
    if (room) {
      room.messages.push(message);
      room.lastActivity = new Date();

      // Notify local listeners immediately
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.forEach(listener => listener(room.messages));
      }
    }

    // Emit to server if connected
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', message);
    } else if (this.mockMode) {
      // Mock mode: simulate message delivery
      console.log('🎭 Mock mode: Message sent locally');
      // Simulate receiving the message back after a short delay
      setTimeout(() => {
        this.handleIncomingMessage(message);
      }, 100);
    } else {
      // Fallback: store message locally if not connected
      console.warn('Socket not connected, message stored locally only');
    }

    return message;
  }

  /**
   * Get messages for a chat room
   */
  getMessages(roomId: string): Message[] {
    const room = this.chatRooms.get(roomId);
    return room ? room.messages : [];
  }

  /**
   * Subscribe to messages in a chat room
   */
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
    let roomListeners = this.listeners.get(roomId);
    if (!roomListeners) {
      roomListeners = new Set();
      this.listeners.set(roomId, roomListeners);
    }

    roomListeners.add(callback);

    // Join the room if connected
    this.joinRoom(roomId);

    // Return unsubscribe function
    return () => {
      roomListeners?.delete(callback);
      if (roomListeners?.size === 0) {
        this.leaveRoom(roomId);
      }
    };
  }

  /**
   * Get all chat rooms for a user
   */
  getUserChatRooms(userId: string): ChatRoom[] {
    return Array.from(this.chatRooms.values()).filter(room =>
      room.participants.includes(userId)
    );
  }

  /**
   * Add a system message
   */
  addSystemMessage(roomId: string, content: string): Message {
    const message: Message = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: 'system',
      timestamp: new Date(),
      type: 'system',
      roomId,
    };

    const room = this.chatRooms.get(roomId);
    if (room) {
      room.messages.push(message);
      room.lastActivity = new Date();

      // Notify listeners
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.forEach(listener => listener(room.messages));
      }
    }

    return message;
  }

  /**
   * Clear all messages in a chat room
   */
  clearMessages(roomId: string): void {
    const room = this.chatRooms.get(roomId);
    if (room) {
      room.messages = [];
      room.lastActivity = new Date();

      // Notify listeners
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.forEach(listener => listener([]));
      }
    }

    // Emit to server if connected
    if (this.socket && this.isConnected) {
      this.socket.emit('clear-messages', roomId);
    }
  }

  /**
   * Delete a chat room
   */
  deleteChatRoom(roomId: string): void {
    this.leaveRoom(roomId);
    this.chatRooms.delete(roomId);
    this.listeners.delete(roomId);

    // Emit to server if connected
    if (this.socket && this.isConnected) {
      this.socket.emit('delete-room', roomId);
    }
  }

  /**
   * Check if the chat service is connected
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' | 'mock' {
    if (this.mockMode) return 'mock';
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService; 