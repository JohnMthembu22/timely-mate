/**
 * Email Service for sending notifications and invitations
 * Uses Supabase Edge Functions or a third-party email service
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface EmailInvitation {
  to: string;
  employeeName: string;
  organizationName: string;
  position: string;
  department: string;
  invitationLink: string;
}

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

class EmailService {
  /**
   * Send employee invitation email
   */
  async sendEmployeeInvitation(invitation: EmailInvitation): Promise<boolean> {
    try {
      // If Supabase is configured, use Supabase Edge Function or database
      if (isSupabaseConfigured()) {
        try {
          // Option 1: Use Supabase Edge Function (recommended)
          // You'll need to create an edge function for sending emails
          // For now, we'll use the client-side fallback
          // Uncomment this when you have a Supabase Edge Function set up:
          /*
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'employee_invitation',
              to: invitation.to,
              subject: `You've been invited to join ${invitation.organizationName}`,
              template: 'employee_invitation',
              data: invitation
            }
          });

          if (error) {
            console.error('Supabase email error:', error);
            // Fallback to client-side email
            return this.sendEmailClientSide(invitation);
          }

          return true;
          */
          
          // For now, use client-side email as fallback
          return this.sendEmailClientSide(invitation);
        } catch (error) {
          console.error('Supabase email error:', error);
          // Fallback to client-side email
          return this.sendEmailClientSide(invitation);
        }
      }

      // Fallback: Client-side email (opens default email client)
      return this.sendEmailClientSide(invitation);
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // Fallback to client-side email
      return this.sendEmailClientSide(invitation);
    }
  }

  /**
   * Fallback: Open default email client with pre-filled invitation
   */
  private sendEmailClientSide(invitation: EmailInvitation): boolean {
    try {
      const subject = encodeURIComponent(`You've been invited to join ${invitation.organizationName} on Timely Mate`);
      const body = encodeURIComponent(this.getInvitationEmailBody(invitation));
      const mailtoLink = `mailto:${invitation.to}?subject=${subject}&body=${body}`;
      
      window.location.href = mailtoLink;
      return true;
    } catch (error) {
      console.error('Error opening email client:', error);
      return false;
    }
  }

  /**
   * Generate invitation email body
   */
  private getInvitationEmailBody(invitation: EmailInvitation): string {
    return `Hello ${invitation.employeeName},

You've been invited to join ${invitation.organizationName} on Timely Mate!

Your Details:
- Position: ${invitation.position}
- Department: ${invitation.department}

To get started, please register your account using this link:
${invitation.invitationLink}

Once registered, you'll be able to:
- Track your time and attendance
- Manage your projects
- Collaborate with your team
- Access all Timely Mate features

If you have any questions, please contact your administrator.

Welcome to the team!

Best regards,
Timely Mate Team`;
  }

  /**
   * Generate invitation link with employee email
   */
  generateInvitationLink(email: string): string {
    const baseUrl = window.location.origin;
    const encodedEmail = encodeURIComponent(email);
    return `${baseUrl}/signup?invite=${encodedEmail}`;
  }

  /**
   * Send project invitation email
   */
  async sendProjectInvitation(invitation: ProjectInvitationEmail): Promise<boolean> {
    try {
      if (isSupabaseConfigured()) {
        // Use Supabase Edge Function if available
        // For now, use client-side email
        return this.sendEmailClientSideGeneric(invitation.to, invitation.subject, invitation.body);
      }
      return this.sendEmailClientSideGeneric(invitation.to, invitation.subject, invitation.body);
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
        return this.sendEmailClientSideGeneric(welcome.to, welcome.subject, welcome.body);
      }
      return this.sendEmailClientSideGeneric(welcome.to, welcome.subject, welcome.body);
    } catch (error) {
      console.error('Error sending project welcome email:', error);
      return false;
    }
  }

  /**
   * Generic helper: Send email via client-side (mailto)
   */
  private sendEmailClientSideGeneric(to: string, subject: string, body: string): boolean {
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
}

export const emailService = new EmailService();

