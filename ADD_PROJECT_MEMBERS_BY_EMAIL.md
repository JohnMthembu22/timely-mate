# 📧 Add People to Projects/Tasks by Email with Notifications

This guide shows you how to add users to projects and tasks via email and automatically send them email notifications.

## 📋 Database Setup

First, we need a table to track project members. Run this SQL in Supabase:

```sql
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_email ON project_members(email);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
```

## 🔧 Implementation

### Step 1: Create Project Member Service

Create a new file: `frontend/web/src/services/projectMembersService.ts`

```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { emailService } from './emailService';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string | null;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by: string;
  invited_at: string;
  joined_at: string | null;
  status: 'pending' | 'active' | 'declined';
}

export interface AddMemberByEmailParams {
  projectId: string;
  email: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  projectName: string;
  projectDescription?: string;
  inviterName: string;
  inviterEmail: string;
}

class ProjectMembersService {
  /**
   * Add a user to a project by email
   * If user exists, adds them directly. If not, creates a pending invitation.
   */
  async addMemberByEmail(params: AddMemberByEmailParams): Promise<ProjectMember> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { projectId, email, role = 'member', projectName, projectDescription, inviterName, inviterEmail } = params;

    // Get current user (inviter)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user exists in auth.users by email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    let userId: string | null = null;
    let status: 'pending' | 'active' = 'pending';

    if (existingUser) {
      // User exists - add them directly
      userId = existingUser.id;
      status = 'active';
    }

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .or(`user_id.eq.${userId || 'null'},email.eq.${email.toLowerCase().trim()}`)
      .single();

    if (existingMember) {
      // Update existing member if needed
      if (existingMember.status === 'pending' && userId) {
        const { data: updatedMember } = await supabase
          .from('project_members')
          .update({
            user_id: userId,
            status: 'active',
            joined_at: new Date().toISOString(),
          })
          .eq('id', existingMember.id)
          .select()
          .single();

        if (updatedMember) {
          // Send welcome email
          await this.sendProjectWelcomeEmail({
            email,
            projectName,
            projectDescription,
            inviterName,
            memberName: existingUser?.email || email,
            projectId,
            isNewUser: false,
          });

          return updatedMember as ProjectMember;
        }
      }
      throw new Error('User is already a member of this project');
    }

    // Create new project member
    const { data: newMember, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: currentUser.id,
        status,
        joined_at: userId ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }

    // Send notification email
    await this.sendProjectInvitationEmail({
      email,
      projectName,
      projectDescription,
      inviterName,
      inviterEmail,
      projectId,
      isNewUser: !userId,
    });

    // Create in-app notification if user exists
    if (userId) {
      await this.createNotification(userId, projectId, projectName, inviterName);
    }

    return newMember as ProjectMember;
  }

  /**
   * Send project invitation email
   */
  private async sendProjectInvitationEmail(params: {
    email: string;
    projectName: string;
    projectDescription?: string;
    inviterName: string;
    inviterEmail: string;
    projectId: string;
    isNewUser: boolean;
  }): Promise<void> {
    const { email, projectName, projectDescription, inviterName, inviterEmail, projectId, isNewUser } = params;

    const baseUrl = window.location.origin;
    const invitationLink = isNewUser
      ? `${baseUrl}/signup?invite=${encodeURIComponent(email)}&project=${projectId}`
      : `${baseUrl}/projects/${projectId}`;

    const subject = `${inviterName} added you to project: ${projectName}`;
    const body = this.getProjectInvitationEmailBody({
      email,
      projectName,
      projectDescription,
      inviterName,
      inviterEmail,
      invitationLink,
      isNewUser,
    });

    // Use email service
    await emailService.sendProjectInvitation({
      to: email,
      subject,
      body,
      projectName,
      inviterName,
      invitationLink,
    });
  }

  /**
   * Send welcome email for existing users
   */
  private async sendProjectWelcomeEmail(params: {
    email: string;
    projectName: string;
    projectDescription?: string;
    inviterName: string;
    memberName: string;
    projectId: string;
    isNewUser: boolean;
  }): Promise<void> {
    const { email, projectName, projectDescription, inviterName, memberName, projectId } = params;

    const baseUrl = window.location.origin;
    const projectLink = `${baseUrl}/projects/${projectId}`;

    const subject = `Welcome to project: ${projectName}`;
    const body = this.getProjectWelcomeEmailBody({
      memberName,
      projectName,
      projectDescription,
      inviterName,
      projectLink,
    });

    await emailService.sendProjectWelcome({
      to: email,
      subject,
      body,
      projectName,
      inviterName,
      projectLink,
    });
  }

  /**
   * Generate invitation email body
   */
  private getProjectInvitationEmailBody(params: {
    email: string;
    projectName: string;
    projectDescription?: string;
    inviterName: string;
    inviterEmail: string;
    invitationLink: string;
    isNewUser: boolean;
  }): string {
    const { projectName, projectDescription, inviterName, invitationLink, isNewUser } = params;

    return `Hello,

${inviterName} has added you to the project "${projectName}" on Timely Mate.

${projectDescription ? `Project Description: ${projectDescription}` : ''}

${isNewUser ? 'To get started, please create your account using the link below:' : 'Click the link below to view the project:'}

${invitationLink}

${isNewUser ? 'Once you create your account, you\'ll automatically be added to the project and can start collaborating with your team.' : 'You can now access the project and collaborate with your team members.'}

If you have any questions, please contact ${inviterName} or your project administrator.

Best regards,
Timely Mate Team`;
  }

  /**
   * Generate welcome email body
   */
  private getProjectWelcomeEmailBody(params: {
    memberName: string;
    projectName: string;
    projectDescription?: string;
    inviterName: string;
    projectLink: string;
  }): string {
    const { memberName, projectName, projectDescription, inviterName, projectLink } = params;

    return `Hello ${memberName},

Welcome to the project "${projectName}" on Timely Mate!

${projectDescription ? `Project Description: ${projectDescription}` : ''}

You've been added to this project by ${inviterName}. Click the link below to view and start working on the project:

${projectLink}

You can now:
- View project details and tasks
- Collaborate with team members
- Track time and progress
- Access all project resources

If you have any questions, please contact ${inviterName} or your project administrator.

Best regards,
Timely Mate Team`;
  }

  /**
   * Create in-app notification
   */
  private async createNotification(
    userId: string,
    projectId: string,
    projectName: string,
    inviterName: string
  ): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'project_assigned',
      title: 'Added to Project',
      message: `${inviterName} added you to project "${projectName}"`,
      link: `/projects/${projectId}`,
      read: false,
    });
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching project members:', error);
      return [];
    }

    return (data || []) as ProjectMember[];
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, memberId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }
}

export const projectMembersService = new ProjectMembersService();
```

### Step 2: Enhance Email Service

Add these methods to `frontend/web/src/services/emailService.ts`:

```typescript
export interface ProjectInvitationEmail {
  to: string;
  subject: string;
  body: string;
  projectName: string;
  inviterName: string;
  invitationLink: string;
}

export interface ProjectWelcomeEmail {
  to: string;
  subject: string;
  body: string;
  projectName: string;
  inviterName: string;
  projectLink: string;
}

// Add these methods to the EmailService class:

/**
 * Send project invitation email
 */
async sendProjectInvitation(invitation: ProjectInvitationEmail): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      // Use Supabase Edge Function if available
      // For now, use client-side email
      return this.sendEmailClientSide(invitation.to, invitation.subject, invitation.body);
    }
    return this.sendEmailClientSide(invitation.to, invitation.subject, invitation.body);
  } catch (error) {
    console.error('Error sending project invitation email:', error);
    return false;
  }
}

/**
 * Send project welcome email
 */
async sendProjectWelcome(welcome: ProjectWelcomeEmail): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      return this.sendEmailClientSide(welcome.to, welcome.subject, welcome.body);
    }
    return this.sendEmailClientSide(welcome.to, welcome.subject, welcome.body);
  } catch (error) {
    console.error('Error sending project welcome email:', error);
    return false;
  }
}

/**
 * Helper: Send email via client-side (mailto)
 */
private sendEmailClientSide(to: string, subject: string, body: string): boolean {
  try {
    const subjectEncoded = encodeURIComponent(subject);
    const bodyEncoded = encodeURIComponent(body);
    const mailtoLink = `mailto:${to}?subject=${subjectEncoded}&body=${bodyEncoded}`;
    window.location.href = mailtoLink;
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
}
```

## 🎯 Usage Example

### In Your Projects Component

```typescript
import { projectMembersService } from '../services/projectMembersService';
import { useState } from 'react';

function AddMemberDialog({ projectId, projectName, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const handleAddMember = async () => {
    if (!email.trim()) return;

    setLoading(true);
    try {
      await projectMembersService.addMemberByEmail({
        projectId,
        email: email.trim(),
        role,
        projectName,
        inviterName: user?.name || user?.email || 'Team Member',
        inviterEmail: user?.email || '',
      });

      // Show success message
      alert(`Invitation sent to ${email}!`);
      setEmail('');
      onClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Add Member to Project</DialogTitle>
      <DialogContent>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="user@example.com"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddMember} disabled={loading || !email.trim()}>
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## ✅ Features

- ✅ Add users by email (even if they don't have an account yet)
- ✅ Automatic email notifications
- ✅ In-app notifications for existing users
- ✅ Pending invitations for new users
- ✅ Welcome emails for existing users
- ✅ Role-based access (owner, admin, member, viewer)
- ✅ Real-time updates via Supabase

## 🚀 Next Steps

1. Run the SQL to create the `project_members` table
2. Create the `projectMembersService.ts` file
3. Update `emailService.ts` with new methods
4. Integrate into your Projects component
5. Test by adding a member via email!

