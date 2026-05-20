import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isDirect: boolean;
  recipient?: string;
}

interface JobChatProps {
  isOpen: boolean;
  onClose: () => void;
  jobName: string;
  jobId?: string;
  teamMembers: Array<{ id: string; name: string; avatar: string }>;
}

function chatStorageKey(jobId: string): string {
  return `timelymate_job_chat_${jobId}`;
}

const JobChat: React.FC<JobChatProps> = ({ isOpen, onClose, jobName, jobId, teamMembers }) => {
  const { user } = useAppSelector((state) => state.auth);
  const storageKey = chatStorageKey(jobId || jobName.replace(/\s+/g, '-').toLowerCase());
  const senderName = user?.name || user?.email?.split('@')[0] || 'You';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      setMessages([]);
    }
  }, [isOpen, storageKey]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* ignore quota errors */
    }
  }, [messages, isOpen, storageKey]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: senderName,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
      isDirect: !!selectedRecipient,
      recipient: selectedRecipient || undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setSelectedRecipient(null);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {jobName} - Chat
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 2,
                  alignItems: message.sender === senderName ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === senderName ? 'primary.main' : 'grey.100',
                    color: message.sender === senderName ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {message.sender}
                    {message.isDirect && message.recipient && ` → ${message.recipient}`}
                  </Typography>
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {message.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Message Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                size="small"
                value={selectedRecipient || ''}
                onChange={(e) => setSelectedRecipient(e.target.value || null)}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Group Chat</MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    Direct Message: {member.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSendMessage} color="primary">
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default JobChat; 