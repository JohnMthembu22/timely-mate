# 💬 Real-Time Messaging Setup with Supabase

This guide will help you set up real-time messaging in your Timely Mate app using Supabase.

## ✅ What's Already Set Up

Your app already has:
- ✅ `messagingService.ts` - Complete Supabase messaging implementation
- ✅ `messages` table schema in `SUPABASE_DATABASE_SETUP.sql`
- ✅ Real-time subscription hooks
- ✅ Message components ready to use

## 📋 Setup Steps

### Step 1: Ensure Database Table Exists

The `messages` table should already be created by the database setup script. If not, run this SQL in your Supabase SQL Editor:

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  project_id UUID REFERENCES projects(id),
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can send messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Policy: Users can update their own messages (for read receipts)
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());
```

### Step 2: Enable Realtime for Messages Table

1. **Via Supabase Dashboard** (Recommended):
   - Go to your Supabase Dashboard
   - Navigate to **Database** → **Replication**
   - Find the `messages` table
   - Toggle **Enable Replication** ✅

2. **Via SQL** (Alternative):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```

### Step 3: Verify Supabase Configuration

Make sure your `.env` file has Supabase credentials:

```env
VITE_SUPABASE_URL=https://dczhtdvbvnxlzcjqxowm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Test the Connection

Run the setup check:

```bash
cd frontend/web
npm run supabase:check
```

## 🚀 Using Real-Time Messaging

### Basic Usage Example

Here's how to use the messaging service in your components:

```typescript
import { messagingService } from '../services/messagingService';
import { useEffect, useState } from 'react';

function ChatComponent({ recipientId }: { recipientId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load initial messages
  useEffect(() => {
    messagingService.getMessages(recipientId).then(setMessages);
  }, [recipientId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = messagingService.subscribeToMessages(
      recipientId,
      (message) => {
        // New message received in real-time!
        setMessages(prev => [...prev, message]);
      }
    );

    return unsubscribe; // Cleanup on unmount
  }, [recipientId]);

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await messagingService.sendMessage(recipientId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mark messages as read
  useEffect(() => {
    messagingService.markAsRead(recipientId);
  }, [recipientId, messages]);

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.sender_name}:</strong> {msg.content}
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### Conversation List Example

```typescript
import { messagingService } from '../services/messagingService';
import { useEffect, useState } from 'react';

function ConversationsList() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Load and subscribe to conversations
  useEffect(() => {
    // Load initial conversations
    messagingService.getConversations().then(setConversations);

    // Subscribe to real-time updates
    const unsubscribe = messagingService.subscribeToConversations(
      (updatedConversations) => {
        setConversations(updatedConversations);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id}>
          <h3>{conv.participant_name}</h3>
          <p>{conv.last_message?.content}</p>
          {conv.unread_count > 0 && (
            <span className="badge">{conv.unread_count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 📱 Complete Chat Component Example

Here's a complete, production-ready chat component:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { messagingService, ChatMessage } from '../services/messagingService';
import { Box, TextField, Button, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    messagingService.getMessages(recipientId).then(setMessages);
  }, [recipientId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = messagingService.subscribeToMessages(
      recipientId,
      (message) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    );

    return unsubscribe;
  }, [recipientId]);

  // Mark messages as read when viewing
  useEffect(() => {
    messagingService.markAsRead(recipientId);
  }, [recipientId, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await messagingService.sendMessage(recipientId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={recipientAvatar}>{recipientName[0]}</Avatar>
        <Typography variant="h6">{recipientName}</Typography>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender_id !== recipientId;
          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: isOwn ? 'primary.main' : 'grey.200',
                  color: isOwn ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}
                >
                  {new Date(msg.created_at).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            startIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
```

## 🔄 Real-Time Features

### 1. Instant Message Delivery

Messages appear instantly for all connected users:

```typescript
// When User A sends a message
await messagingService.sendMessage(recipientId, 'Hello!');

// User B receives it immediately via real-time subscription
messagingService.subscribeToMessages(recipientId, (message) => {
  console.log('New message:', message.content); // "Hello!"
});
```

### 2. Read Receipts

Track when messages are read:

```typescript
// Automatically mark as read when viewing
messagingService.markAsRead(recipientId);

// Check read status
const messages = await messagingService.getMessages(recipientId);
messages.forEach(msg => {
  if (msg.read_at) {
    console.log('Message read at:', msg.read_at);
  }
});
```

### 3. Typing Indicators (Optional)

You can add typing indicators using Supabase presence:

```typescript
import { supabase } from '../lib/supabase';

// Set typing status
const channel = supabase.channel(`typing:${recipientId}`);
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { isTyping: true, userId: currentUserId },
});

// Listen for typing status
channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
  if (payload.userId !== currentUserId) {
    setTypingStatus(payload.isTyping);
  }
});
```

### 4. Online/Offline Status

Track user presence:

```typescript
import { useRealtimePresence } from '../hooks/useRealtime';

function UserStatus({ userId }: { userId: string }) {
  const [isOnline, setIsOnline] = useState(false);

  useRealtimePresence(
    'user-presence',
    userId,
    { status: 'online' },
    {
      onJoin: () => setIsOnline(true),
      onLeave: () => setIsOnline(false),
    }
  );

  return <span>{isOnline ? '🟢 Online' : '⚫ Offline'}</span>;
}
```

## 🎯 Advanced Features

### Group Chat (Team/Project Messages)

The messages table supports team and project-based chats:

```typescript
// Send message to a team
await supabase.from('messages').insert({
  sender_id: userId,
  team_id: teamId,
  content: 'Hello team!',
});

// Send message to a project
await supabase.from('messages').insert({
  sender_id: userId,
  project_id: projectId,
  content: 'Project update!',
});
```

### Message Search

```typescript
// Search messages
const { data } = await supabase
  .from('messages')
  .select('*')
  .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
  .ilike('content', `%${searchTerm}%`)
  .order('created_at', { ascending: false });
```

### Message History Pagination

```typescript
// Load messages with pagination
const PAGE_SIZE = 50;

const loadMessages = async (page: number) => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  
  return data;
};
```

## 🧪 Testing Real-Time Messaging

### Test Setup

1. **Open two browser windows** (or use incognito mode)
2. **Log in as different users** in each window
3. **Open the chat component** in both windows
4. **Send a message** from one window
5. **Verify** it appears instantly in the other window

### Debugging

Enable debug logging:

```typescript
// In your component
useEffect(() => {
  const unsubscribe = messagingService.subscribeToMessages(
    recipientId,
    (message) => {
      console.log('📨 Real-time message received:', message);
      setMessages(prev => [...prev, message]);
    }
  );

  return unsubscribe;
}, [recipientId]);
```

Check Supabase Dashboard:
- Go to **Database** → **Replication** → Verify `messages` is enabled
- Go to **Logs** → Check for any errors

## 🔐 Security Considerations

1. **Row Level Security (RLS)** is enabled - users can only see their own messages
2. **Anon Key** is safe to use in frontend
3. **Never expose** service_role key
4. **Validate** message content on the client side
5. **Rate limiting** - Supabase has built-in rate limits

## 📊 Database Schema Reference

```sql
messages
├── id (UUID, Primary Key)
├── sender_id (UUID, References auth.users)
├── recipient_id (UUID, References auth.users, nullable)
├── team_id (UUID, References teams, nullable)
├── project_id (UUID, References projects, nullable)
├── content (TEXT, NOT NULL)
├── read_at (TIMESTAMP, nullable)
└── created_at (TIMESTAMP, DEFAULT NOW())
```

## 🚨 Troubleshooting

### Messages not appearing in real-time

1. **Check Realtime is enabled**:
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
   Should include `messages`

2. **Check subscription**:
   ```typescript
   const unsubscribe = messagingService.subscribeToMessages(
     recipientId,
     (msg) => console.log('Received:', msg)
   );
   // Make sure you're not calling unsubscribe() immediately
   ```

3. **Check browser console** for errors

### Messages not saving

1. **Check RLS policies** - user must be authenticated
2. **Verify sender_id** matches authenticated user
3. **Check Supabase logs** for errors

### Read receipts not working

1. **Verify UPDATE policy** exists on messages table
2. **Check recipient_id** matches current user
3. **Verify read_at** field is being updated

## 📚 Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Messaging Service Code](../frontend/web/src/services/messagingService.ts)
- [Realtime Hooks](../frontend/web/src/hooks/useRealtime.ts)

## ✅ Checklist

- [ ] Messages table created
- [ ] Realtime enabled for messages table
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] Tested with two users
- [ ] Read receipts working
- [ ] Real-time updates working
- [ ] Error handling implemented

---

**Your real-time messaging is now ready! 🎉**

The messaging service handles all the complexity - just use it in your components and enjoy instant, real-time messaging powered by Supabase!

