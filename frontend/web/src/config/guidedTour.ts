import type { DriveStep } from 'driver.js';

export const TOUR_COMPLETED_KEY = 'timelymate_tour_completed';
export const TOUR_AUTO_START_KEY = 'timelymate_tour_auto_started';

export type TourStep = DriveStep & { route?: string };

export const guidedTourSteps: TourStep[] = [
  {
    element: '[data-tour="status-clock-in"]',
    popover: {
      title: 'Start your workday',
      description:
        'Clock in here to unlock time tracking, projects, and team tools for this session. Most features stay gated until you are clocked in.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: 'Dashboard home',
      description:
        'Your command center — active workspaces, quick actions, metrics, and shortcuts to what matters today.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-hr"]',
    popover: {
      title: 'Build your team',
      description:
        'Open HR to import employees from Excel/CSV or add people manually. Demo roster data loads automatically when the list is empty.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-projects"]',
    popover: {
      title: 'Projects & tasks',
      description:
        'Create projects, assign teammates, track progress, and open project chat — everything delivery lives here.',
      side: 'right',
      align: 'start',
    },
  },
  {
    route: '/projects',
    element: '[data-tour="new-project"]',
    popover: {
      title: 'Spin up a project',
      description:
        'Tap New Project, add details, and pick team members from your roster. Assignments show on the card right away.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-messages"]',
    popover: {
      title: 'Team messages',
      description:
        'Direct-message anyone on your roster. Conversations persist locally so your demo flow stays intact between pages.',
      side: 'right',
      align: 'start',
    },
  },
  {
    route: '/messages',
    element: '[data-tour="new-message"]',
    popover: {
      title: 'New conversation',
      description:
        'Use the compose button to pick a teammate — great for announcements, task handoffs, or quick check-ins.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tour-guide-button"]',
    popover: {
      title: 'You are all set',
      description:
        'Replay this tour anytime from Tour guide in the top bar. Enjoy the demo — you are ready to impress.',
      side: 'bottom',
      align: 'end',
    },
  },
];
