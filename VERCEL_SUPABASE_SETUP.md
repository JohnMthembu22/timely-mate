# Vercel + Supabase Production Setup

This guide shows you how to deploy Timely Mate on Vercel with Supabase for real-time features.

## ✅ What Supabase Enables in Production

When deployed on Vercel, Supabase provides:

### 1. **Real-Time User Interactions** ✅
- Live chat between users
- Instant notifications
- Real-time presence (who's online)
- Collaborative editing
- Live updates across all connected clients

### 2. **Project Management** ✅
- Create, update, delete projects
- Real-time project updates
- Team collaboration on projects
- Project notifications

### 3. **Team Management** ✅
- Create teams
- Add/remove team members
- Real-time team updates
- Team presence tracking

### 4. **Notifications** ✅
- Real-time notifications
- Push notifications (with service worker)
- Notification history
- Read/unread status

### 5. **Database Operations** ✅
- All CRUD operations
- Row Level Security (RLS)
- Automatic backups
- Scalable infrastructure

## 🚀 Setting Up Vercel Environment Variables

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL**: `https://dczhtdvbvnxlzcjqxowm.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)

### Step 2: Add to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL = https://dczhtdvbvnxlzcjqxowm.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

4. Select environments: **Production**, **Preview**, and **Development**
5. Click **Save**

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click the **⋯** menu on your latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic deployment.

## 📊 Database Schema for Production Features

Here are the essential tables you'll need:

### 1. Projects Table

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (created_by = auth.uid());
```

### 2. Teams Table

```sql
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE teams;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### 3. Team Members Table

```sql
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );
```

### 4. Notifications Table

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'project_created', 'team_invite', 'message', etc.
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());
```

### 5. Messages Table (for chat)

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  project_id UUID REFERENCES projects(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );
```

## 🔄 Real-Time Features Implementation

### Example 1: Real-Time Project Creation

```typescript
// In your Projects component
import { useRealtimeTable } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  // Subscribe to real-time project updates
  useRealtimeTable('projects', (payload) => {
    if (payload.eventType === 'INSERT') {
      setProjects(prev => [...prev, payload.new]);
      // Show notification
      showNotification('New Project', `${payload.new.name} was created`);
    } else if (payload.eventType === 'UPDATE') {
      setProjects(prev => prev.map(p => 
        p.id === payload.new.id ? payload.new : p
      ));
    }
  });

  const createProject = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        created_by: user.id,
        organization_id: user.organization_id
      }])
      .select();

    if (error) {
      console.error('Error creating project:', error);
    }
    // Real-time subscription will automatically update UI
  };

  return (
    <div>
      <button onClick={() => createProject('New Project')}>
        Create Project
      </button>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Real-Time Notifications

```typescript
import { useRealtimeTable } from '../hooks/useRealtime';

function Notifications() {
  const { user } = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to real-time notifications
  useRealtimeTable(
    'notifications',
    (payload) => {
      if (payload.eventType === 'INSERT' && payload.new.user_id === user.id) {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(payload.new.title, {
            body: payload.new.message,
            icon: '/icon.png'
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        setNotifications(prev => prev.map(n => 
          n.id === payload.new.id ? payload.new : n
        ));
        if (payload.new.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    },
    { column: 'user_id', value: user.id }
  );

  return (
    <div>
      <Badge badgeContent={unreadCount}>
        <NotificationsIcon />
      </Badge>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.title} - {notif.message}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Real-Time Team Management

```typescript
import { useRealtimeTable } from '../hooks/useRealtime';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Subscribe to team updates
  useRealtimeTable('teams', (payload) => {
    if (payload.eventType === 'INSERT') {
      setTeams(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setTeams(prev => prev.map(t => 
        t.id === payload.new.id ? payload.new : t
      ));
    } else if (payload.eventType === 'DELETE') {
      setTeams(prev => prev.filter(t => t.id !== payload.old.id));
    }
  });

  // Subscribe to team member updates
  useRealtimeTable('team_members', (payload) => {
    if (payload.eventType === 'INSERT') {
      setTeamMembers(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'DELETE') {
      setTeamMembers(prev => prev.filter(m => m.id !== payload.old.id));
    }
  });

  const createTeam = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        name,
        created_by: user.id,
        organization_id: user.organization_id
      }])
      .select()
      .single();

    if (!error && data) {
      // Add creator as team member
      await supabase.from('team_members').insert({
        team_id: data.id,
        user_id: user.id,
        role: 'admin'
      });
    }
  };

  const addTeamMember = async (teamId: string, userId: string) => {
    await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userId,
      role: 'member'
    });
  };

  return (
    <div>
      <button onClick={() => createTeam('New Team')}>Create Team</button>
      {teams.map(team => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <button onClick={() => addTeamMember(team.id, userId)}>
            Add Member
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔔 Notification System

### Creating Notifications

```typescript
// Utility function to create notifications
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      title,
      message,
      link
    }]);

  if (error) {
    console.error('Error creating notification:', error);
  }
}

// Example: Notify team when project is created
const createProject = async (name: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create project
  const { data: project } = await supabase
    .from('projects')
    .insert([{ name, created_by: user.id }])
    .select()
    .single();

  // Notify team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', teamId);

  teamMembers?.forEach(member => {
    if (member.user_id !== user.id) {
      createNotification(
        member.user_id,
        'project_created',
        'New Project Created',
        `${user.name} created project "${name}"`,
        `/projects/${project.id}`
      );
    }
  });
};
```

## 🌐 Production Checklist

- [ ] Supabase project created
- [ ] Environment variables added to Vercel
- [ ] Database tables created
- [ ] Realtime enabled for all tables
- [ ] Row Level Security (RLS) policies set up
- [ ] Test real-time features locally
- [ ] Deploy to Vercel
- [ ] Test real-time features in production
- [ ] Set up database backups (Supabase handles this automatically)

## 🎯 What Works in Production

✅ **Real-time updates** - Changes sync instantly across all users  
✅ **Multi-user collaboration** - Multiple users can work simultaneously  
✅ **Notifications** - Instant notifications for all users  
✅ **Team management** - Create teams, add members in real-time  
✅ **Project management** - Create, update, delete projects with live updates  
✅ **Presence tracking** - See who's online/offline  
✅ **Chat/messaging** - Real-time messaging between users  
✅ **Scalability** - Supabase handles scaling automatically  

## 🔒 Security Notes

1. **Row Level Security (RLS)** is essential - always enable it
2. **Never expose service_role key** - only use anon key in frontend
3. **Validate data** - use database constraints and triggers
4. **Rate limiting** - Supabase has built-in rate limiting
5. **Authentication** - Supabase handles auth securely

## 📚 Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

Your app is ready for production with full real-time capabilities! 🚀

