const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Store active rooms and their participants
const rooms = new Map();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WebRTC server is running' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);
    
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    // Add user to room
    rooms.get(roomId).add(socket.id);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', socket.id, `User ${socket.id.slice(0, 8)}`);
    
    // Send list of existing users to the new user
    const roomUsers = Array.from(rooms.get(roomId)).filter(id => id !== socket.id);
    socket.emit('room-users', roomUsers);
    
    console.log(`Room ${roomId} now has ${rooms.get(roomId).size} users`);
  });

  // Handle WebRTC signaling
  socket.on('offer', (offer, targetUserId) => {
    console.log(`Offer from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, targetUserId) => {
    console.log(`Answer from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (candidate, targetUserId) => {
    console.log(`ICE candidate from ${socket.id} to ${targetUserId}`);
    socket.to(targetUserId).emit('ice-candidate', candidate, socket.id);
  });

  // Handle chat messages
  socket.on('chat-message', (message, roomId) => {
    console.log(`Chat message in room ${roomId} from ${socket.id}: ${message.message}`);
    socket.to(roomId).emit('chat-message', {
      ...message,
      sender: `User ${socket.id.slice(0, 8)}`,
      timestamp: new Date()
    });
  });

  // Handle user video/audio toggle
  socket.on('user-video-toggle', (enabled) => {
    socket.to(socket.rooms).emit('user-video-toggle', socket.id, enabled);
  });

  socket.on('user-audio-toggle', (enabled) => {
    socket.to(socket.rooms).emit('user-audio-toggle', socket.id, enabled);
  });

  // Handle hand raise
  socket.on('raise-hand', (roomId) => {
    socket.to(roomId).emit('hand-raised', socket.id);
  });
  socket.on('lower-hand', (roomId) => {
    socket.to(roomId).emit('hand-lowered', socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        
        // Remove room if empty
        if (users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          console.log(`Room ${roomId} now has ${users.size} users`);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebRTC server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
}); 