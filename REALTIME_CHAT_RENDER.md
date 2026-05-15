# Real-time Chat with Socket.IO on Render

This document explains how the real-time chat functionality is implemented and deployed on Render.

## Architecture Overview

The real-time chat system uses Socket.IO for bidirectional communication between clients and the server, providing instant messaging capabilities across the application.

### Components

1. **Frontend (React + Socket.IO Client)**
   - `chatService.ts` - Service for managing Socket.IO connections and chat state
   - `Chat` component - UI for displaying and sending messages
   - `ChatPage` - Demo page showcasing chat functionality

2. **Backend (FastAPI + Socket.IO Server)**
   - Socket.IO server integrated with FastAPI
   - Event handlers for connection, messaging, and room management
   - WebSocket health monitoring endpoints

## Environment Configuration

### Frontend Environment Variables

```bash
# Required for real-time chat
VITE_ENABLE_REAL_TIME_CHAT=true
VITE_SOCKET_URL=https://your-backend-url.onrender.com

# Standard API configuration
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend Environment Variables

```bash
# WebSocket configuration
ENABLE_WEBSOCKETS=true
CORS_ORIGINS=https://your-frontend-url.onrender.com
```

## Render Deployment Configuration

The `render.yaml` file includes Socket.IO specific configuration:

```yaml
services:
  - type: web
    name: timely-mate-backend
    runtime: python
    envVars:
      - key: ENABLE_WEBSOCKETS
        value: "true"
      - key: CORS_ORIGINS
        value: "https://timely-mate-frontend.onrender.com"
        
  - type: web
    name: timely-mate-frontend
    runtime: static
    envVars:
      - key: VITE_ENABLE_REAL_TIME_CHAT
        value: "true"
      - key: VITE_SOCKET_URL
        value: "https://timely-mate-backend.onrender.com"
```

## Features

### ✅ Real-time Messaging
- Instant message delivery to all connected users
- Support for multiple chat rooms
- Message persistence during session

### ✅ Connection Management
- Automatic reconnection on network issues
- Connection status indicators
- Graceful fallback to polling if WebSocket fails

### ✅ Room Management
- Create and join chat rooms
- User presence tracking
- Room-specific message broadcasting

### ✅ Message Types
- User messages with timestamps
- System notifications
- Message history

## Usage

### Basic Chat Implementation

```typescript
import Chat from './components/Chat';

// Simple chat room
<Chat 
  roomId="general" 
  roomName="General Discussion" 
  height={400}
/>
```

### Custom Chat Service Usage

```typescript
import chatService from './services/chatService';

// Subscribe to messages
const unsubscribe = chatService.subscribeToMessages('room-id', (messages) => {
  console.log('New messages:', messages);
});

// Send a message
chatService.sendMessage('room-id', 'Hello world!', 'user@example.com');

// Clean up
unsubscribe();
```

## Development

### Local Development Setup

1. **Start Backend with WebSocket support:**
   ```bash
   cd backend
   pip install python-socketio python-engineio
   python -m uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend with Socket.IO client:**
   ```bash
   cd frontend/web
   npm install socket.io-client
   npm run dev
   ```

3. **Environment Configuration:**
   ```bash
   # .env.development
   VITE_ENABLE_REAL_TIME_CHAT=true
   VITE_SOCKET_URL=http://localhost:8000
   VITE_API_URL=http://localhost:8000
   ```

### Testing the Connection

1. Open the application in multiple browser tabs
2. Navigate to the Chat page (`/chat`)
3. Send messages and verify they appear in real-time across all tabs
4. Check the connection status indicator

## Production Considerations

### Performance
- Socket.IO automatically handles scaling with multiple server instances
- Consider using Redis adapter for multi-server deployments
- Monitor connection counts and message throughput

### Security
- Implement authentication for Socket.IO connections
- Validate message content and rate limiting
- Use proper CORS configuration

### Monitoring
- Monitor WebSocket connection health via `/api/websocket/info`
- Track message delivery rates and connection stability
- Set up alerts for connection failures

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if `VITE_SOCKET_URL` matches your backend URL
   - Verify backend is running with WebSocket support
   - Check CORS configuration

2. **Messages Not Syncing**
   - Ensure users are in the same room
   - Check browser console for Socket.IO errors
   - Verify network connectivity

3. **Deployment Issues**
   - Confirm Render environment variables are set
   - Check build logs for Socket.IO installation
   - Verify health check endpoints

### Debug Commands

```bash
# Check Socket.IO connection
curl https://your-backend-url.onrender.com/api/websocket/info

# Health check
curl https://your-backend-url.onrender.com/health
```

## Benefits of Socket.IO on Render

1. **Simplified Deployment** - No additional infrastructure required
2. **Auto-scaling** - Handles traffic spikes automatically
3. **SSL/TLS** - Secure WebSocket connections out of the box
4. **Global CDN** - Low-latency connections worldwide
5. **Health Monitoring** - Built-in uptime monitoring

## Next Steps

1. **Enhanced Authentication** - Integrate user authentication with Socket.IO
2. **Message Persistence** - Store chat history in database
3. **File Sharing** - Add support for file uploads in chat
4. **Push Notifications** - Notify users of new messages when offline
5. **Moderation Tools** - Admin controls for message management

---

For more information about Socket.IO deployment on Render, see the [official documentation](https://render.com/docs). 