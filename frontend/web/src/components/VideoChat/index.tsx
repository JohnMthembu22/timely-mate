/**
 * Enhanced Video Chat Component
 * Professional video conferencing with advanced features
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  useTheme,
  Alert,
  Snackbar,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  VideoCall,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  Close,
  ContentCopy,
  Share,
  MoreVert,
  Person,
  Group,
  Cameraswitch,
  ArrowDropDown,
  PanTool,
  Settings,
  BlurOn,
  BlurOff,
  CallEnd,
  ExitToApp,
} from '@mui/icons-material';
import io, { Socket } from 'socket.io-client';
import 'webrtc-adapter';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';
import ChatComponent from '../Chat'; // Import the ChatComponent

interface VideoChatProps {
  roomId: string;
  onClose: () => void;
  isOpen: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

interface Participant {
  id: string;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  handRaised?: boolean;
}

type BackgroundMode = 'none' | 'blur';

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}

const VideoChat: React.FC<VideoChatProps> = ({ roomId, onClose, isOpen }) => {
  const theme = useTheme();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('none');
  const [bodyPixNet, setBodyPixNet] = useState<bodyPix.BodyPix | null>(null);
  
  // Camera selection state
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraMenuAnchor, setCameraMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEnumeratingDevices, setIsEnumeratingDevices] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  // Initialize WebRTC configuration with optimized settings
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };

  // High-quality media constraints
  const getOptimalMediaConstraints = () => {
    return {
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user',
        aspectRatio: 16/9,
        // Advanced constraints for better quality
        advanced: [
          { width: 1920, height: 1080 },
          { width: 1280, height: 720 },
          { frameRate: 30 },
          { frameRate: 60 }
        ]
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2,
        sampleSize: 16,
        // Advanced audio constraints
        advanced: [
          { echoCancellation: { exact: true } },
          { noiseSuppression: { exact: true } },
          { autoGainControl: { exact: true } }
        ]
      },
    };
  };

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen) return;

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('user-joined', (userId: string, userName: string) => {
      console.log('User joined:', userId, userName);
      setParticipants(prev => [...prev, {
        id: userId,
        name: userName,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false,
      }]);
    });

    newSocket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      setParticipants(prev => prev.filter(p => p.id !== userId));
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      peerConnectionsRef.current.delete(userId);
    });

    newSocket.on('offer', async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
      console.log('Received offer from:', fromUserId);
      await handleOffer(offer, fromUserId);
    });

    newSocket.on('answer', async (answer: RTCSessionDescriptionInit, fromUserId: string) => {
      console.log('Received answer from:', fromUserId);
      await handleAnswer(answer, fromUserId);
    });

    newSocket.on('ice-candidate', async (candidate: RTCIceCandidateInit, fromUserId: string) => {
      console.log('Received ICE candidate from:', fromUserId);
      await handleIceCandidate(candidate, fromUserId);
    });

    newSocket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('user-video-toggle', (userId: string, enabled: boolean) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, isVideoEnabled: enabled } : p
      ));
    });

    newSocket.on('user-audio-toggle', (userId: string, enabled: boolean) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, isAudioEnabled: enabled } : p
      ));
    });

    newSocket.on('hand-raised', (userId: string) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, handRaised: true } : p));
    });

    newSocket.on('hand-lowered', (userId: string) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, handRaised: false } : p));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, roomId]);

  // Enumerate available cameras
  const enumerateDevices = useCallback(async () => {
    try {
      setIsEnumeratingDevices(true);
      
      // Request permissions first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      setAvailableCameras(videoDevices);
      
      // Set default camera if none selected
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
      
      console.log('Available cameras:', videoDevices);
    } catch (error) {
      console.error('Error enumerating devices:', error);
      setError('Unable to access media devices');
    } finally {
      setIsEnumeratingDevices(false);
    }
  }, [selectedCameraId]);

  // Switch to selected camera
  const switchCamera = useCallback(async (deviceId: string) => {
    try {
      console.log('Switching to camera:', deviceId);
      
      // Stop current video track
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      }

      // Get new stream with selected camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          aspectRatio: 16/9,
        },
        audio: localStream ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2,
        } : false,
      });

      // Replace video track in existing stream
      if (localStream && !isScreenSharing) {
        const newVideoTrack = newStream.getVideoTracks()[0];
        const audioTrack = localStream.getAudioTracks()[0];
        
        // Create new stream with new video track and existing audio track
        const updatedStream = new MediaStream();
        if (newVideoTrack) updatedStream.addTrack(newVideoTrack);
        if (audioTrack) updatedStream.addTrack(audioTrack);
        
        setLocalStream(updatedStream);
        
        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = updatedStream;
        }

        // Replace video track in all peer connections
        peerConnectionsRef.current.forEach(async (peerConnection) => {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender && newVideoTrack) {
            try {
              await sender.replaceTrack(newVideoTrack);
              console.log('Video track replaced in peer connection');
            } catch (error) {
              console.error('Error replacing video track:', error);
            }
          }
        });
      } else {
        // First time or no existing stream
        setLocalStream(newStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
      }

      setSelectedCameraId(deviceId);
      console.log('Camera switched successfully to:', deviceId);
      
    } catch (error) {
      console.error('Error switching camera:', error);
      setError('Failed to switch camera. Please try again.');
    }
  }, [localStream, isScreenSharing]);

  // Handle camera selection menu
  const handleCameraMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setCameraMenuAnchor(event.currentTarget);
  };

  const handleCameraMenuClose = () => {
    setCameraMenuAnchor(null);
  };

  const handleCameraSelect = (deviceId: string) => {
    switchCamera(deviceId);
    handleCameraMenuClose();
  };

  // Enumerate devices when component opens
  useEffect(() => {
    if (isOpen) {
      enumerateDevices();
    }
  }, [isOpen, enumerateDevices]);

  // Listen for device changes
  useEffect(() => {
    if (!isOpen) return;

    const handleDeviceChange = () => {
      console.log('Media devices changed, re-enumerating...');
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [isOpen, enumerateDevices]);

  // Modified initializeMedia to use selected camera
  useEffect(() => {
    if (!isOpen) return;

    const initializeMedia = async () => {
      try {
        const constraints = {
          video: selectedCameraId ? {
            deviceId: { exact: selectedCameraId },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
            aspectRatio: 16/9,
          } : {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: 'user',
            aspectRatio: 16/9,
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 2,
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        // Fallback to lower quality if high quality fails
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280, max: 1280 },
              height: { ideal: 720, max: 720 },
              frameRate: { ideal: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          setLocalStream(fallbackStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr) {
          console.error('Error with fallback media:', fallbackErr);
          setError('Unable to access camera and microphone');
        }
      }
    };

    // Only initialize if we have cameras available or it's the first load
    if (availableCameras.length > 0 || !localStream) {
      initializeMedia();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, selectedCameraId]); // Add selectedCameraId dependency

  // Handle incoming offer with quality optimization
  const handleOffer = async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionsRef.current.set(fromUserId, peerConnection);

    // Add local stream tracks to peer connection with bandwidth optimization
    if (localStream) {
      localStream.getTracks().forEach(async (track) => {
        const sender = peerConnection.addTrack(track, localStream);
        
        // Optimize video encoding parameters
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps for high quality
            params.encodings[0].maxFramerate = 30;
            params.encodings[0].scaleResolutionDownBy = 1;
            await sender.setParameters(params);
          }
        }
        
        // Optimize audio encoding parameters
        if (track.kind === 'audio') {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 128000; // 128 kbps for high quality audio
            await sender.setParameters(params);
          }
        }
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(fromUserId, event.streams[0]);
        return newMap;
      });
    };

    // Handle ICE candidates with faster processing
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', event.candidate, fromUserId);
      }
    };

    // Monitor connection quality
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        console.log('Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await peerConnection.setLocalDescription(answer);

    if (socket) {
      socket.emit('answer', answer, fromUserId);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromUserId: string) => {
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit, fromUserId: string) => {
    const peerConnection = peerConnectionsRef.current.get(fromUserId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        if (socket) {
          socket.emit('user-video-toggle', !videoTrack.enabled);
        }
      }
    }
  }, [localStream, socket]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        if (socket) {
          socket.emit('user-audio-toggle', !audioTrack.enabled);
        }
      }
    }
  }, [localStream, socket]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        screenStreamRef.current = screenStream;

        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(peerConnection => {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        // Handle screen share stop
        videoTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      setError('Unable to share screen');
    }
  }, [isScreenSharing]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Restore camera video track
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach(peerConnection => {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }

    setIsScreenSharing(false);
  }, [localStream]);

  // Send chat message
  const sendMessage = useCallback(() => {
    if (newMessage.trim() && socket) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, message]);
      socket.emit('chat-message', message, roomId);
      setNewMessage('');
    }
  }, [newMessage, socket, roomId]);

  // Receive chat messages
  useEffect(() => {
    if (!socket) return;
    const handler = (message: ChatMessage) => {
      // Ensure timestamp is a Date object
      let msg = { ...message };
      if (typeof msg.timestamp === 'string') {
        msg.timestamp = new Date(msg.timestamp);
      }
      setChatMessages(prev => [...prev, msg]);
    };
    socket.on('chat-message', handler);
    return () => { socket.off('chat-message', handler); };
  }, [socket]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  // Copy room link
  const copyRoomLink = useCallback(() => {
    const roomLink = `${window.location.origin}/meetings/join/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    setShowShareDialog(false);
  }, [roomId]);

  // Handle key press in chat
  const handleChatKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleRaiseHand = () => {
    if (socket) {
      if (!handRaised) {
        socket.emit('raise-hand', roomId);
      } else {
        socket.emit('lower-hand', roomId);
      }
      setHandRaised(v => !v);
      setParticipants(prev => prev.map(p => p.id === socket.id ? { ...p, handRaised: !handRaised } : p));
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onHandRaised = (userId: string) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, handRaised: true } : p));
    };
    const onHandLowered = (userId: string) => {
      setParticipants(prev => prev.map(p => p.id === userId ? { ...p, handRaised: false } : p));
    };
    socket.on('hand-raised', onHandRaised);
    socket.on('hand-lowered', onHandLowered);
    return () => {
      socket.off('hand-raised', onHandRaised);
      socket.off('hand-lowered', onHandLowered);
    };
  }, [socket]);

  // Load BodyPix model on mount
  useEffect(() => {
    if (backgroundMode === 'blur' && !bodyPixNet) {
      bodyPix.load().then(setBodyPixNet);
    }
  }, [backgroundMode, bodyPixNet]);

  // Real-time background blur processing
  useEffect(() => {
    let animationId: number;
    if (backgroundMode === 'blur' && bodyPixNet && localStream && localVideoRef.current && canvasRef.current) {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const processFrame = async () => {
        if (video.readyState === 4 && ctx) {
          const segmentation = await bodyPixNet.segmentPerson(video);
          // Blur background
          bodyPix.drawBokehEffect(
            canvas, video, segmentation,
            15, // backgroundBlurAmount
            3,  // edgeBlurAmount
            true // flipHorizontal
          );
        }
        animationId = requestAnimationFrame(processFrame);
      };
      processFrame();
      return () => cancelAnimationFrame(animationId);
    }
  }, [backgroundMode, bodyPixNet, localStream]);

  // Use canvas as video source for preview
  const displayVideoRef = backgroundMode === 'blur' ? canvasRef : localVideoRef;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '95vh',
          maxHeight: '95vh',
          borderRadius: 4,
          background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.90))',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 16px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
          }
        },
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 3,
        px: 4,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))'
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <VideoCall sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Video Meeting
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Room {roomId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setShowShareDialog(true)} 
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
            >
              <Share />
            </IconButton>
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255,0,0,0.3)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(255,0,0,0.2)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Participants Sidebar */}
          <Box sx={{ 
            width: 280, 
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            p: 3, 
            display: { xs: 'none', md: 'flex' }, 
            flexDirection: 'column', 
            minHeight: 0,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '1px',
              height: '100%',
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Group sx={{ fontSize: 20, color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                Participants ({participants.length + 1})
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '10px',
              }
            }}>
              <List dense sx={{ p: 0 }}>
                {participants.map((p) => (
                  <ListItem 
                    key={p.id} 
                    sx={{ 
                      px: 0, 
                      py: 1,
                      mb: 1,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {p.name?.[0] || '?'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {p.name || p.id.slice(0, 8)}
                          </Typography>
                          {p.handRaised && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              bgcolor: 'rgba(255,193,7,0.2)',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              border: '1px solid rgba(255,193,7,0.3)'
                            }}>
                              <span title="Hand Raised" style={{ fontSize: '12px' }}>✋</span>
                            </Box>
                          )}
                          {p.id === socket?.id && (
                            <Chip 
                              label="You" 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {!p.isVideoEnabled && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              bgcolor: 'rgba(239,68,68,0.2)',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              border: '1px solid rgba(239,68,68,0.3)'
                            }}>
                              <VideocamOff sx={{ fontSize: 12, color: '#ef4444' }} />
                              <Typography variant="caption" sx={{ color: '#ef4444' }}>Video Off</Typography>
                            </Box>
                          )}
                          {!p.isAudioEnabled && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              bgcolor: 'rgba(239,68,68,0.2)',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              border: '1px solid rgba(239,68,68,0.3)'
                            }}>
                              <MicOff sx={{ fontSize: 12, color: '#ef4444' }} />
                              <Typography variant="caption" sx={{ color: '#ef4444' }}>Muted</Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Button
              variant={handRaised ? 'contained' : 'outlined'}
              color={handRaised ? 'warning' : 'primary'}
              startIcon={<span>✋</span>}
              onClick={handleRaiseHand}
              sx={{ 
                mt: 3,
                py: 1.5,
                borderRadius: 3,
                background: handRaised 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                  : 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))',
                backdropFilter: 'blur(10px)',
                border: handRaised 
                  ? 'none' 
                  : '1px solid rgba(102,126,234,0.3)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: handRaised 
                    ? '0 12px 24px rgba(245,158,11,0.3)' 
                    : '0 12px 24px rgba(102,126,234,0.3)',
                  background: handRaised 
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))'
                }
              }}
              fullWidth
            >
              {handRaised ? 'Lower Hand' : 'Raise Hand'}
            </Button>
          </Box>

          {/* Video Area */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            p: 3,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))'
          }}>
            {/* Main Video Grid */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0 }}>
              {/* Local Video */}
              <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'black',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }
              }}>
                {backgroundMode === 'blur' ? (
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                      borderRadius: '16px'
                    }}
                  />
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                      borderRadius: '16px'
                    }}
                  />
                )}
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <Chip
                    icon={<Person />}
                    label="You"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.8)', 
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: 600
                    }}
                  />
                  {!isVideoEnabled && (
                    <Chip
                      icon={<VideocamOff />}
                      label="Video Off"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(239,68,68,0.9)', 
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(239,68,68,0.3)',
                        fontWeight: 600
                      }}
                    />
                  )}
                  {!isAudioEnabled && (
                    <Chip
                      icon={<MicOff />}
                      label="Muted"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(239,68,68,0.9)', 
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(239,68,68,0.3)',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                {/* Video quality indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#10b981',
                    boxShadow: '0 0 8px rgba(16,185,129,0.5)'
                  }} />
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    HD
                  </Typography>
                </Box>
              </Box>

              {/* Remote Videos */}
              {Array.from(remoteStreams.entries()).length > 0 && (
                <Grid container spacing={3}>
                  {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                    const participant = participants.find(p => p.id === userId);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={userId}>
                        <Box sx={{
                          position: 'relative',
                          height: '180px',
                          borderRadius: 3,
                          overflow: 'hidden',
                          background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                          border: '2px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                          }
                        }}>
                          <video
                            ref={(el) => {
                              if (el) remoteVideosRef.current.set(userId, el);
                            }}
                            autoPlay
                            playsInline
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '12px'
                            }}
                            onLoadedMetadata={() => {
                              const videoEl = remoteVideosRef.current.get(userId);
                              if (videoEl) videoEl.srcObject = stream;
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap'
                          }}>
                            <Chip
                              icon={<Person />}
                              label={participant?.name || 'Unknown'}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(0,0,0,0.8)', 
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                fontWeight: 600
                              }}
                            />
                            {participant && !participant.isVideoEnabled && (
                              <Chip
                                icon={<VideocamOff />}
                                label="Video Off"
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(239,68,68,0.9)', 
                                  backdropFilter: 'blur(10px)',
                                  color: 'white',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  fontWeight: 600
                                }}
                              />
                            )}
                            {participant && !participant.isAudioEnabled && (
                              <Chip
                                icon={<MicOff />}
                                label="Muted"
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(239,68,68,0.9)', 
                                  backdropFilter: 'blur(10px)',
                                  color: 'white',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>

            {/* Modern Control Bar */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              p: 3,
              mt: 2,
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }
            }}>
              {/* Camera Selection Button */}
              <Tooltip title="Select Camera">
                <IconButton
                  onClick={handleCameraMenuClick}
                  disabled={availableCameras.length <= 1}
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.05)',
                      boxShadow: '0 16px 32px rgba(99,102,241,0.4)',
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)'
                    },
                    '&:active': {
                      transform: 'translateY(-2px) scale(1.02)'
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      background: 'linear-gradient(135deg, #6b7280, #4b5563)'
                    }
                  }}
                >
                  <Cameraswitch sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={toggleVideo}
                sx={{
                  width: 56,
                  height: 56,
                  background: isVideoEnabled 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: isVideoEnabled 
                      ? '0 16px 32px rgba(16,185,129,0.4)' 
                      : '0 16px 32px rgba(239,68,68,0.4)',
                    background: isVideoEnabled 
                      ? 'linear-gradient(135deg, #059669, #047857)' 
                      : 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                {isVideoEnabled ? <Videocam sx={{ fontSize: 24 }} /> : <VideocamOff sx={{ fontSize: 24 }} />}
              </IconButton>

              <IconButton
                onClick={toggleAudio}
                sx={{
                  width: 56,
                  height: 56,
                  background: isAudioEnabled 
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: isAudioEnabled 
                      ? '0 16px 32px rgba(59,130,246,0.4)' 
                      : '0 16px 32px rgba(239,68,68,0.4)',
                    background: isAudioEnabled 
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                      : 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                {isAudioEnabled ? <Mic sx={{ fontSize: 24 }} /> : <MicOff sx={{ fontSize: 24 }} />}
              </IconButton>

              <IconButton
                onClick={toggleScreenShare}
                sx={{
                  width: 56,
                  height: 56,
                  background: isScreenSharing 
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: isScreenSharing 
                      ? '0 16px 32px rgba(245,158,11,0.4)' 
                      : '0 16px 32px rgba(139,92,246,0.4)',
                    background: isScreenSharing 
                      ? 'linear-gradient(135deg, #d97706, #b45309)' 
                      : 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                {isScreenSharing ? <StopScreenShare sx={{ fontSize: 24 }} /> : <ScreenShare sx={{ fontSize: 24 }} />}
              </IconButton>

              <IconButton
                onClick={() => setShowChat(!showChat)}
                sx={{
                  width: 56,
                  height: 56,
                  background: showChat 
                    ? 'linear-gradient(135deg, #ec4899, #db2777)' 
                    : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: showChat 
                      ? '0 16px 32px rgba(236,72,153,0.4)' 
                      : '0 16px 32px rgba(255,255,255,0.2)',
                    background: showChat 
                      ? 'linear-gradient(135deg, #db2777, #be185d)' 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                <Chat sx={{ fontSize: 24 }} />
              </IconButton>

              {/* End Meeting Button */}
              <IconButton
                onClick={() => {
                  // End meeting for all participants
                  if (socket) {
                    socket.emit('end-meeting', { roomId });
                  }
                  // Clean up local streams
                  if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                  }
                  if (screenStreamRef.current) {
                    screenStreamRef.current.getTracks().forEach(track => track.stop());
                  }
                  // Close peer connections
                  peerConnectionsRef.current.forEach(peerConnection => {
                    peerConnection.close();
                  });
                  // Close the video chat
                  onClose();
                }}
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 16px 32px rgba(239,68,68,0.4)',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                <CallEnd sx={{ fontSize: 24 }} />
              </IconButton>

              {/* Close Button */}
              <IconButton
                onClick={onClose}
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 16px 32px rgba(255,255,255,0.2)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))'
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.02)'
                  }
                }}
              >
                <ExitToApp sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Chat Sidebar with Real-time Messaging */}
          {showChat && (
            <Box sx={{
              width: 350,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <ChatComponent
                roomId={`meeting_${roomId}`}
                userId={`user_${Math.random().toString(36).substr(2, 9)}`}
                userName="Meeting Participant"
                userAvatar={undefined} // Use default avatar instead of external service
                height="100%"
                isVisible={showChat}
                onMessageCount={(count) => {
                  // Show unread message indicator if needed
                  console.log(`Chat has ${count} messages`);
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Modern Share Dialog */}
      <Dialog 
        open={showShareDialog} 
        onClose={() => setShowShareDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Share sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Share Meeting Link
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Share this link with others to join the meeting:
          </Typography>
          <TextField
            fullWidth
            value={`${window.location.origin}/meetings/join/${roomId}`}
            InputProps={{
              readOnly: true,
              sx: {
                borderRadius: 2,
                background: 'rgba(102,126,234,0.05)',
                '& fieldset': {
                  borderColor: 'rgba(102,126,234,0.2)'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={copyRoomLink} 
            startIcon={<ContentCopy />}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102,126,234,0.3)'
              }
            }}
          >
            Copy Link
          </Button>
          <Button 
            onClick={() => setShowShareDialog(false)}
            sx={{
              color: 'text.secondary',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camera Selection Menu */}
      <Menu
        anchorEl={cameraMenuAnchor}
        open={Boolean(cameraMenuAnchor)}
        onClose={handleCameraMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            minWidth: 250,
            maxHeight: 300,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Select Camera
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {availableCameras.length} camera{availableCameras.length !== 1 ? 's' : ''} available
          </Typography>
        </Box>
        
        {isEnumeratingDevices ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
              <Typography variant="body2">Loading cameras...</Typography>
            </Box>
          </MenuItem>
        ) : availableCameras.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No cameras found
            </Typography>
          </MenuItem>
        ) : (
          availableCameras.map((camera) => (
            <MenuItem
              key={camera.deviceId}
              onClick={() => handleCameraSelect(camera.deviceId)}
              selected={camera.deviceId === selectedCameraId}
              sx={{
                py: 1.5,
                px: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1))'
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.15))',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.2))'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Videocam 
                  sx={{ 
                    fontSize: 20, 
                    color: camera.deviceId === selectedCameraId ? 'primary.main' : 'text.secondary' 
                  }} 
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: camera.deviceId === selectedCameraId ? 600 : 400,
                      color: camera.deviceId === selectedCameraId ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {camera.label}
                  </Typography>
                  {camera.deviceId === selectedCameraId && (
                    <Typography variant="caption" color="primary.main">
                      Currently selected
                    </Typography>
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default VideoChat; 