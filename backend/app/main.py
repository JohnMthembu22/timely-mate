from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import socketio
import uvicorn
import os
from typing import Dict, List

from .routers import auth
from .core.config import settings

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi'
)

# Create FastAPI app
app = FastAPI(
    title="Timely Mate API",
    description="Employee time tracking and management system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

# Socket.IO event handlers
connected_users: Dict[str, str] = {}  # sid -> user_id mapping
user_rooms: Dict[str, List[str]] = {}  # user_id -> [room_ids]

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client {sid} connected")
    await sio.emit('connect_response', {'status': 'connected'}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client {sid} disconnected")
    
    # Clean up user data
    if sid in connected_users:
        user_id = connected_users[sid]
        del connected_users[sid]
        
        # Leave all rooms
        if user_id in user_rooms:
            for room_id in user_rooms[user_id]:
                await sio.leave_room(sid, room_id)
            del user_rooms[user_id]

@sio.event
async def join_room(sid, room_id):
    """Handle joining a chat room"""
    await sio.enter_room(sid, room_id)
    
    # Track user rooms
    if sid in connected_users:
        user_id = connected_users[sid]
        if user_id not in user_rooms:
            user_rooms[user_id] = []
        if room_id not in user_rooms[user_id]:
            user_rooms[user_id].append(room_id)
    
    print(f"Client {sid} joined room {room_id}")
    await sio.emit('room_joined', {'room_id': room_id}, room=sid)

@sio.event
async def leave_room(sid, room_id):
    """Handle leaving a chat room"""
    await sio.leave_room(sid, room_id)
    
    # Update user rooms
    if sid in connected_users:
        user_id = connected_users[sid]
        if user_id in user_rooms and room_id in user_rooms[user_id]:
            user_rooms[user_id].remove(room_id)
    
    print(f"Client {sid} left room {room_id}")
    await sio.emit('room_left', {'room_id': room_id}, room=sid)

@sio.event
async def send_message(sid, message_data):
    """Handle sending a message to a room"""
    room_id = message_data.get('roomId')
    if not room_id:
        return
    
    # Broadcast message to all users in the room
    await sio.emit('message', message_data, room=room_id)
    print(f"Message sent to room {room_id}: {message_data.get('content', '')[:50]}...")

@sio.event
async def create_room(sid, room_data):
    """Handle creating a new chat room"""
    room_id = room_data.get('id')
    if room_id:
        await sio.emit('room_created', room_data, room=sid)
        print(f"Room created: {room_id}")

@sio.event
async def clear_messages(sid, room_id):
    """Handle clearing messages in a room"""
    await sio.emit('messages_cleared', {'room_id': room_id}, room=room_id)
    print(f"Messages cleared in room: {room_id}")

@sio.event
async def delete_room(sid, room_id):
    """Handle deleting a chat room"""
    await sio.emit('room_deleted', {'room_id': room_id}, room=room_id)
    print(f"Room deleted: {room_id}")

# Combine Socket.IO with FastAPI
socket_app = socketio.ASGIApp(sio, app)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "timely-mate-api",
        "features": {
            "websockets": True,
            "real_time_chat": True
        }
    }

# WebSocket info endpoint
@app.get("/api/websocket/info")
async def websocket_info():
    """Get WebSocket connection information"""
    return {
        "connected_users": len(connected_users),
        "active_rooms": len(set().union(*user_rooms.values()) if user_rooms else set()),
        "websocket_enabled": True
    }

if __name__ == "__main__":
    # For development
    uvicorn.run(
        "main:socket_app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
