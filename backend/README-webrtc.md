# WebRTC Signaling Server for Video Chat

This Node.js server provides WebRTC signaling and real-time chat for the Timely Mate Meetings page using Socket.IO.

## Features
- WebRTC signaling for peer-to-peer video/audio/screen sharing
- Real-time chat during meetings
- Join meetings by link (room ID)
- Health check endpoint

## Prerequisites
- Node.js 16+
- npm

## Setup

1. **Install dependencies:**
   ```sh
   npm install express socket.io cors
   ```

2. **Run the server:**
   ```sh
   node webrtc-server.js
   ```
   The server will start on port 3001 by default.

3. **Health check:**
   Visit [http://localhost:3001/health](http://localhost:3001/health) to verify the server is running.

## Configuration
- The server allows CORS from `http://localhost:5173` (Vite dev server). Adjust the `origin` in `webrtc-server.js` if needed.
- The port can be changed by setting the `PORT` environment variable.

## Usage
- The React frontend connects to this server for all video meeting signaling and chat.
- Each meeting uses a unique room ID (the meeting ID).

## Production
- For production, use a process manager (e.g., pm2) and secure the server as needed. 