-- Create project_members table for adding users to projects by email
-- Run this in Supabase SQL Editor

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Store email for users not yet registered
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'declined'
  UNIQUE(project_id, user_id),
  UNIQUE(project_id, email)
);

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Make script re-runnable (idempotent)
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project admins can add members" ON project_members;
DROP POLICY IF EXISTS "Users can update own membership" ON project_members;

-- Policy: Users can view project members
CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Policy: Project owners/admins can add members
CREATE POLICY "Project admins can add members"
  ON project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Policy: Users can update their own membership
CREATE POLICY "Users can update own membership"
  ON project_members FOR UPDATE
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_email ON project_members(email);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime'
      AND c.relname = 'project_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
  END IF;
END $$;

