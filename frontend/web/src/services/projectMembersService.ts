/**
 * Project Members Service
 * Handles adding users to projects by email with automatic notifications
 */

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

    // Check if user exists in profiles by email
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
      .maybeSingle();

    if (existingMember) {
      // Update existing member if needed
      if (existingMember.status === 'pending' && userId) {
        const { data: updatedMember, error: updateError } = await supabase
          .from('project_members')
          .update({
            user_id: userId,
            status: 'active',
            joined_at: new Date().toISOString(),
          })
          .eq('id', existingMember.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update member: ${updateError.message}`);
        }

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

