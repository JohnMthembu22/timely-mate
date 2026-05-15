/**
 * Real-time Chat Component
 * Uses Socket.IO for real-time messaging on Render
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Avatar,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import chatService, { Message } from '../../services/chatService';

interface ChatProps {
  roomId?: string;
  roomName?: string;
  height?: number;
}

const Chat: React.FC<ChatProps> = ({ 
  roomId = 'general', 
  roomName = 'General Chat',
  height = 400 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Check if real-time chat is enabled
    if (import.meta.env.VITE_ENABLE_REAL_TIME_CHAT !== 'true') {
      return;
    }

    // Create or join chat room
    if (!chatService.getUserChatRooms(user?.id || 'anonymous').find(room => room.id === roomId)) {
      chatService.createChatRoom(roomId, roomName, [user?.id || 'anonymous']);
    }

    // Subscribe to messages
    const unsubscribe = chatService.subscribeToMessages(roomId, (roomMessages) => {
      setMessages(roomMessages);
    });

    // Check connection status
    const checkConnection = () => {
      setIsConnected(chatService.isOnline());
    };

    // Initial status check
    checkConnection();

    // Poll connection status
    const statusInterval = setInterval(checkConnection, 1000);

    // Load existing messages
    setMessages(chatService.getMessages(roomId));

    // Add welcome message if it's a new room
    if (chatService.getMessages(roomId).length === 0) {
      setTimeout(() => {
        chatService.addSystemMessage(roomId, `Welcome to ${roomName}! 👋`);
      }, 500);
    }

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [roomId, roomName, user?.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const senderName = user?.email || 'Anonymous';
    chatService.sendMessage(roomId, newMessage.trim(), senderName);
    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarColor = (sender: string) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b'];
    const index = sender.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Don't render if real-time chat is disabled
  const isRealTimeChatEnabled = import.meta.env.VITE_ENABLE_REAL_TIME_CHAT === 'true' || 
                                (window as any).ENV?.VITE_ENABLE_REAL_TIME_CHAT === 'true';
  
  if (!isRealTimeChatEnabled) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="info">
          Real-time chat is disabled. Enable it by setting VITE_ENABLE_REAL_TIME_CHAT=true
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        color: 'white'
      }}>
        <ChatIcon />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {roomName}
        </Typography>
              <Chip 
          icon={<CircleIcon sx={{ fontSize: 12 }} />}
          label={isConnected ? 'Online' : 'Offline'}
                size="small" 
          color={isConnected ? 'success' : 'default'}
          sx={{
            backgroundColor: isConnected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
          }}
        />
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        maxHeight: height - 140,
      }}>
        <List sx={{ p: 1 }}>
          {messages.map((message, index) => (
            <ListItem 
              key={message.id} 
              sx={{ 
                flexDirection: 'column',
                alignItems: message.type === 'system' ? 'center' : 'flex-start',
                py: 0.5,
              }}
            >
              {message.type === 'system' ? (
                <Chip
                  label={message.content}
                  size="small"
                  sx={{
                    bgcolor: 'grey.100',
                    fontSize: '0.75rem',
                    my: 0.5,
                  }}
                />
              ) : (
                <Box sx={{ 
                      display: 'flex',
                  alignItems: 'flex-start', 
                      gap: 1,
                  width: '100%',
                  mb: index === messages.length - 1 ? 0 : 1,
                }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: getAvatarColor(message.sender),
                      fontSize: '0.875rem',
                    }}
                  >
                    {message.sender.charAt(0).toUpperCase()}
                      </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {message.sender}
                        </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                        </Typography>
                    </Box>
                        <Typography 
                      variant="body2" 
                          sx={{ 
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {message.content}
                  </Typography>
                  </Box>
                </Box>
              )}
              </ListItem>
          ))}
            <div ref={messagesEndRef} />
          </List>
      </Box>

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
            multiline
            maxRows={3}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
          <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
            color="primary"
          >
            <SendIcon />
          </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {!isConnected && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Attempting to connect to real-time chat server...
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Chat; 