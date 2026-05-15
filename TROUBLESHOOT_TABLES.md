# 🔍 Troubleshooting Missing Tables

Let's check what tables you have and fix any missing ones.

## Step 1: Check What Tables You Currently Have

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Create a new query**
3. **Paste this SQL** to see all your tables:

```sql
-- Check all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

4. **Click "Run"**
5. **Tell me which tables you see** - this will help me identify what's missing

---

## Step 2: Check for Errors

If the SQL script had errors, let's check:

1. **In SQL Editor**, look at the **"History"** or **"Recent queries"** tab
2. **Check if there were any red error messages**
3. **Common errors**:
   - "relation does not exist" - means a table that should exist doesn't
   - "permission denied" - means you need admin access
   - "syntax error" - means the SQL wasn't copied correctly

---

## Step 3: Create Missing Tables Individually

If some tables are missing, we can create them one by one. Here are the 7 tables that should exist:

### ✅ Table 1: profiles

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### ✅ Table 2: projects

```sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (created_by = auth.uid());
```

### ✅ Table 3: teams

```sql
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (created_by = auth.uid());
```

### ✅ Table 4: team_members

```sql
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### ✅ Table 5: time_entries

```sql
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
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

CREATE POLICY "Users can create own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  USING (user_id = auth.uid());
```

### ✅ Table 6: notifications

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());
```

### ✅ Table 7: messages

```sql
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

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());
```

---

## Step 4: Create Indexes (Optional but Recommended)

After creating all tables, run this to add performance indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_team ON messages(team_id);
```

---

## Step 5: Verify All Tables Exist

Run this query again to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- ✅ profiles
- ✅ projects
- ✅ teams
- ✅ team_members
- ✅ time_entries
- ✅ notifications
- ✅ messages

---

## 🎯 Quick Fix: Run Everything at Once

If you want to try running the complete script again:

1. **Go to SQL Editor**
2. **Copy the ENTIRE** `SUPABASE_DATABASE_SETUP.sql` file
3. **Paste it** into SQL Editor
4. **Click "Run"**
5. **Check for errors** - if you see any, note which table failed

---

## ❓ Common Issues

### Issue: "relation auth.users does not exist"

**Solution**: This means Supabase Auth isn't set up. The tables reference `auth.users` which is created automatically by Supabase. If you see this error, make sure you're using a proper Supabase project (not a raw PostgreSQL database).

### Issue: "duplicate key value violates unique constraint"

**Solution**: This means the table already exists. That's OK! The `IF NOT EXISTS` clause should prevent this, but if you see it, the table is already created.

### Issue: "permission denied for schema public"

**Solution**: You need admin/owner permissions. Make sure you're logged in as the project owner.

---

## 📊 Expected Result

After running all the SQL, you should see in **Table Editor**:

```
Tables:
├── profiles
├── projects
├── teams
├── team_members
├── time_entries
├── notifications
└── messages
```

**Total: 7 tables** ✅

---

## 🆘 Still Having Issues?

Tell me:
1. **How many tables do you see?** (and which ones)
2. **Any error messages?** (copy and paste them)
3. **Did the SQL script run successfully?** (or did it stop with an error)

I'll help you fix the specific issue!

