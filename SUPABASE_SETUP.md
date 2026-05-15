# Supabase Setup Guide for Timely Mate

This guide will help you set up Supabase as your real-time database for Timely Mate.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: Timely Mate (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is perfect to start

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env` file in `frontend/web/`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Never commit `.env` to git (it's already in `.gitignore`)
- The `anon` key is safe to use in frontend code
- Never expose your `service_role` key in frontend

### 4. Enable Realtime for Tables

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable replication for tables you want real-time updates on:
   - `profiles` (user profiles)
   - `projects` (project data)
   - `time_entries` (time tracking)
   - `messages` (chat messages)
   - `notifications` (user notifications)
   - `team_members` (team data)

## 📊 Database Schema Examples

Here are some example tables you might want to create:

### Profiles Table

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  organization_name TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT DEFAULT 'general',
  permissions JSONB DEFAULT '{}',
  company_profile JSONB,
  selected_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Projects Table

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects they're assigned to
CREATE POLICY "Users can view assigned projects"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );
```

### Time Entries Table

```sql
CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  duration INTERVAL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time entries"
  ON time_entries FOR SELECT
  USING (user_id = auth.uid());
```

### Messages Table (for real-time chat)

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id),
  room_id TEXT, -- For group chats
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );
```

## 🔄 Real-Time Features

### Using Real-Time in Components

The app already has real-time hooks set up. Here's how to use them:

#### Example 1: Real-Time Project Updates

```typescript
import { useRealtimeTable } from '../hooks/useRealtime';

function ProjectsList() {
  const [projects, setProjects] = useState([]);

  // Subscribe to real-time changes in projects table
  useRealtimeTable(
    'projects',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => prev.map(p => 
          p.id === payload.new.id ? payload.new : p
        ));
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
      }
    }
  );

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

#### Example 2: Real-Time Presence (Online/Offline Status)

```typescript
import { useRealtimePresence } from '../hooks/useRealtime';

function TeamMembers() {
  const { user } = useAppSelector(state => state.auth);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useRealtimePresence(
    'team-presence',
    user?.id || '',
    { name: user?.name, avatar: user?.avatar },
    (userId, presence) => {
      // User joined
      setOnlineUsers(prev => [...prev, { id: userId, ...presence }]);
    },
    (userId) => {
      // User left
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    }
  );

  return (
    <div>
      {onlineUsers.map(user => (
        <div key={user.id}>
          {user.name} <span className="online-indicator">●</span>
        </div>
      ))}
    </div>
  );
}
```

#### Example 3: Real-Time Chat Messages

```typescript
import { useRealtimeTable } from '../hooks/useRealtime';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  // Subscribe to messages in this room
  useRealtimeTable(
    'messages',
    (payload) => {
      if (payload.eventType === 'INSERT' && payload.new.room_id === roomId) {
        setMessages(prev => [...prev, payload.new]);
      }
    },
    { column: 'room_id', value: roomId }
  );

  const sendMessage = async (content) => {
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      content
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

## 🛠️ Database Operations

### Insert Data

```typescript
import { supabase } from '../lib/supabase';

// Insert a new project
const { data, error } = await supabase
  .from('projects')
  .insert([
    { name: 'New Project', description: 'Project description' }
  ])
  .select();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Project created:', data);
}
```

### Update Data

```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId)
  .select();
```

### Delete Data

```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

### Query Data

```typescript
// Get all active projects
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

## 🔐 Authentication

Supabase handles authentication automatically. The app already has auth integration:

```typescript
import { supabase } from '../lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## 📱 Real-Time Use Cases in Timely Mate

1. **Live Time Tracking**: See when team members clock in/out in real-time
2. **Project Updates**: Get instant notifications when projects are updated
3. **Team Presence**: Show who's online/offline
4. **Chat Messages**: Real-time messaging between team members
5. **Notifications**: Instant notifications for important events
6. **Dashboard Updates**: Live updates to dashboard metrics
7. **Collaborative Editing**: Multiple users editing the same document

## 🚨 Security Best Practices

1. **Row Level Security (RLS)**: Always enable RLS on your tables
2. **Policies**: Create specific policies for each table
3. **Never expose service_role key**: Only use in backend/server code
4. **Validate data**: Use Supabase functions or triggers for validation
5. **Rate limiting**: Supabase has built-in rate limiting

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎯 Next Steps

1. Set up your Supabase project
2. Create the database tables
3. Enable Realtime for your tables
4. Add environment variables
5. Test real-time features
6. Implement real-time updates in your components

Your app is already set up to use Supabase - just add your credentials and start using real-time features!

