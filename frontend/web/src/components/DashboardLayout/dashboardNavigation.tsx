import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Calendar,
  Video,
  Users,
  UserPlus,
  Building2,
  MessageSquare,
  BarChart3,
  HardHat,
  Puzzle,
  Receipt,
  ShoppingCart,
  GraduationCap,
  User,
  Settings,
} from 'lucide-react';
import type { UserPermissions } from '../../types/auth';

export type DashboardNavItem = {
  text: string;
  path: string;
  icon: LucideIcon;
  permission?: keyof UserPermissions;
  restricted?: boolean;
  description?: string;
};

export type DashboardNavGroup = {
  group: string;
  items: DashboardNavItem[];
};

/** Mirrors legacy flat navigation, structured into sidebar groups (matches product areas). */
export const dashboardNavigationGroups: DashboardNavGroup[] = [
  {
    group: 'Core',
    items: [
      { text: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'canAccessTimeTracking' },
      { text: 'Calendar', path: '/calendar', icon: Calendar, permission: 'canAccessTimeTracking' },
      { text: 'Meetings', path: '/meetings', icon: Video, permission: 'canAccessTimeTracking' },
      {
        text: 'Messages and Notifications',
        path: '/messages',
        icon: MessageSquare,
        permission: 'canAccessTimeTracking',
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
        restricted: true,
        description: 'View and manage project tasks',
      },
      { text: 'Offsite Work', path: '/offsite-work', icon: HardHat, permission: 'canAccessTimeTracking' },
      { text: 'Industry Modules', path: '/industry-modules', icon: Puzzle, permission: 'canAccessTimeTracking' },
    ],
  },
  {
    group: 'Workforce',
    items: [
      { text: 'Team', path: '/team', icon: Users, permission: 'canManageTeam' },
      { text: 'Freelancers', path: '/freelancers', icon: UserPlus, permission: 'canManageTeam' },
      { text: 'HR', path: '/hr', icon: Building2, permission: 'canAccessHR', restricted: true },
    ],
  },
  {
    group: 'Insights',
    items: [{ text: 'Reports', path: '/reports', icon: BarChart3, permission: 'canAccessTimeTracking' }],
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
      },
    ],
  },
  {
    group: 'Account',
    items: [
      { text: 'Profile', path: '/profile', icon: User, permission: 'canAccessTimeTracking' },
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
