/**
 * Example component showing how to use Supabase real-time features
 * This demonstrates real-time database subscriptions, presence, and broadcasts
 */

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useRealtimeTable, useRealtimePresence } from '../hooks/useRealtime';
import { useAppSelector } from '../store';

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export const RealtimeExample: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // Example 1: Real-time table subscription
  // This will automatically update when projects are inserted, updated, or deleted
  useRealtimeTable<Project>(
    'projects',
    (payload) => {
      console.log('Project changed:', payload);
      
      if (payload.eventType === 'INSERT') {
        setProjects((prev) => [...prev, payload.new!]);
        setMessage(`New project created: ${payload.new?.name}`);
      } else if (payload.eventType === 'UPDATE') {
        setProjects((prev) =>
          prev.map((p) => (p.id === payload.new?.id ? payload.new! : p))
        );
        setMessage(`Project updated: ${payload.new?.name}`);
      } else if (payload.eventType === 'DELETE') {
        setProjects((prev) => prev.filter((p) => p.id !== payload.old?.id));
        setMessage(`Project deleted: ${payload.old?.name}`);
      }
    }
  );

  // Example 2: Real-time presence (online/offline status)
  useRealtimePresence(
    'team-presence',
    user?.id || '',
    {
      name: user?.email || 'Anonymous',
      avatar: user?.avatar,
      lastSeen: new Date().toISOString(),
    },
    {
      onJoin: (userId, presence) => {
        console.log('User joined:', userId, presence);
        setOnlineUsers((prev) => {
          if (prev.find((u) => u.id === userId)) return prev;
          return [...prev, { id: userId, ...presence }];
        });
      },
      onLeave: (userId) => {
        console.log('User left:', userId);
        setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
      },
      onSync: () => {
        console.log('Presence synced');
      },
    }
  );

  // Load initial projects
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMessage('Supabase not configured. Add credentials to .env file.');
      return;
    }

    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setMessage('Error loading projects. Make sure the projects table exists.');
    }
  };

  const createProject = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase not configured');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: `Project ${Date.now()}`,
            status: 'active',
          },
        ])
        .select();

      if (error) throw error;
      console.log('Project created:', data);
      // The real-time subscription will automatically update the UI
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Check console for details.');
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Supabase Not Configured
        </Typography>
        <Typography variant="body2" color="text.secondary">
          To enable real-time features:
        </Typography>
        <ol>
          <li>Create a Supabase project at supabase.com</li>
          <li>Get your API keys from Settings → API</li>
          <li>Add them to frontend/web/.env file</li>
          <li>Enable Realtime for your tables in Supabase dashboard</li>
        </ol>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Real-Time Features Demo
      </Typography>

      {/* Online Users */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Online Users ({onlineUsers.length})
        </Typography>
        <List>
          {onlineUsers.map((user) => (
            <ListItem key={user.id}>
              <Chip label="●" color="success" size="small" sx={{ mr: 1 }} />
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Projects List */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Projects ({projects.length})</Typography>
          <Button variant="contained" onClick={createProject}>
            Create Project
          </Button>
        </Box>
        <List>
          {projects.map((project) => (
            <ListItem key={project.id}>
              <ListItemText
                primary={project.name}
                secondary={`Status: ${project.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Status Message */}
      {message && (
        <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
          <Typography variant="body2">{message}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>How it works:</strong>
          <br />
          1. Open this page in multiple browser tabs/windows
          <br />
          2. Create a project in one tab - it will appear in all tabs instantly
          <br />
          3. See online users update in real-time
          <br />
          4. All changes sync automatically across all connected clients
        </Typography>
      </Paper>
    </Box>
  );
};

