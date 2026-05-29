import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Calendar,
  Video,
  Users,
  UserPlus,
  Brain,
  Building2,
  MessageSquare,
  BarChart3,
  HardHat,
  AlertTriangle,
  GraduationCap,
  User,
  Settings,
  Receipt,
  ShoppingCart,
} from 'lucide-react';
import type { UserPermissions } from '../../types/auth';

export type DashboardNavItem = {
  text: string;
  path: string;
  icon: LucideIcon;
  permission?: keyof UserPermissions;
  /** When set, nav item also requires this subscription feature */
  subscriptionFeature?: keyof import('../../types/subscription').PlanFeatures;
  restricted?: boolean;
  description?: string;
};

export type DashboardNavGroup = {
  group: string;
  items: DashboardNavItem[];
};

/** Employee-visible: dashboard, calendar, meetings, messages, time, projects (view), field ops*, incidents*, learning* */
export const dashboardNavigationGroups: DashboardNavGroup[] = [
  {
    group: 'Core',
    items: [
      { text: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'canAccessDashboard' },
      { text: 'Calendar', path: '/calendar', icon: Calendar, permission: 'canAccessCalendar' },
      { text: 'Meetings', path: '/meetings', icon: Video, permission: 'canAccessMeetings' },
      {
        text: 'Messages and Notifications',
        path: '/messages',
        icon: MessageSquare,
        permission: 'canAccessMessages',
        subscriptionFeature: 'messages',
      },
    ],
  },
  {
    group: 'Operations',
    items: [
      { text: 'Time Tracking', path: '/time-tracking', icon: Clock, permission: 'canAccessTimeTracking' },
      {
        text: 'Projects',
        path: '/projects',
        icon: Briefcase,
        permission: 'canAccessProjects',
        description: 'View assigned project work',
      },
      {
        text: 'Field Operations',
        path: '/offsite-work',
        icon: HardHat,
        permission: 'canAccessFieldOps',
        subscriptionFeature: 'offsiteWork',
      },
      {
        text: 'Incident Reports',
        path: '/offsite-work/incidents',
        icon: AlertTriangle,
        permission: 'canAccessIncidentReports',
        subscriptionFeature: 'offsiteWork',
      },
    ],
  },
  {
    group: 'Workforce',
    items: [
      { text: 'Team', path: '/team', icon: Users, permission: 'canManageTeam', subscriptionFeature: 'team' },
      {
        text: 'Workforce Intelligence',
        path: '/workforce-intelligence',
        icon: Brain,
        permission: 'canManageTeam',
      },
      {
        text: 'Freelancers',
        path: '/freelancers',
        icon: UserPlus,
        permission: 'canManageTeam',
        subscriptionFeature: 'freelancers',
      },
      { text: 'HR', path: '/hr', icon: Building2, permission: 'canAccessHR', restricted: true },
    ],
  },
  {
    group: 'Insights',
    items: [{ text: 'Reports', path: '/reports', icon: BarChart3, permission: 'canAccessReports' }],
  },
  {
    group: 'Finance',
    items: [
      {
        text: 'Expense Tracking',
        path: '/expense-tracking',
        icon: Receipt,
        permission: 'canAccessExpenses',
        restricted: true,
      },
      {
        text: 'Procurement',
        path: '/procurement',
        icon: ShoppingCart,
        permission: 'canAccessProcurement',
        restricted: true,
      },
    ],
  },
  {
    group: 'Learning',
    items: [
      {
        text: 'Learning Portal',
        path: '/learning-portal',
        icon: GraduationCap,
        permission: 'canAccessLearning',
        subscriptionFeature: 'learningPortal',
      },
    ],
  },
  {
    group: 'Account',
    items: [
      { text: 'Profile', path: '/profile', icon: User, permission: 'canAccessDashboard' },
      {
        text: 'Settings',
        path: '/settings',
        icon: Settings,
        permission: 'canModifySettings',
        restricted: true,
      },
    ],
  },
];
