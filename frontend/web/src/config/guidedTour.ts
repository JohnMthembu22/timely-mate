import type { DriveStep } from 'driver.js';

export const TOUR_COMPLETED_KEY = 'timelymate_tour_completed';
export const TOUR_AUTO_START_KEY = 'timelymate_tour_auto_started';

export type TourStep = DriveStep & { route?: string };

export const guidedTourSteps: TourStep[] = [
  {
    element: '[data-tour="status-clock-in"]',
    popover: {
      title: 'Clock in to start',
      description:
        'Begin your workday here. Clocking in unlocks time tracking, projects, and team collaboration for your session.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: 'Your dashboard',
      description:
        'See active workspaces, quick actions, and team metrics at a glance. This is your home base.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-hr"]',
    popover: {
      title: 'Import your team',
      description:
        'Go to HR to import employees from Excel/CSV or add people manually. Demo data is loaded automatically if the roster is empty.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="nav-projects"]',
    popover: {
      title: 'Projects workspace',
      description:
        'Create projects, assign team members, track progress, and manage tasks. Open a project to chat with the team.',
      side: 'right',
    },
  },
  {
    route: '/projects',
    element: '[data-tour="new-project"]',
    popover: {
      title: 'Create a project',
      description:
        'Click New Project, fill in details, and select team members from your roster. Assignments appear on the project card immediately.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="nav-messages"]',
    popover: {
      title: 'Messages',
      description:
        'Send direct messages to teammates. Start a conversation from the + button and messages are saved for your demo session.',
      side: 'right',
    },
  },
  {
    route: '/messages',
    element: '[data-tour="new-message"]',
    popover: {
      title: 'Start chatting',
      description:
        'Pick a team member to message. Use this for announcements, task updates, or quick check-ins during your demo.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="tour-guide-button"]',
    popover: {
      title: 'Tour guide',
      description:
        'Replay this walkthrough anytime from the Tour Guide button in the top bar. Happy demonstrating!',
      side: 'bottom',
      align: 'end',
    },
  },
];
