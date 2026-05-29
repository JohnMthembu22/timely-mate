export type StaticPageKey =
  | 'features'
  | 'integrations'
  | 'updates'
  | 'about'
  | 'careers'
  | 'contact'
  | 'documentation'
  | 'help-center'
  | 'api'
  | 'community'
  | 'privacy'
  | 'terms'
  | 'security'
  | 'compliance';

export type StaticCategory = 'Product' | 'Company' | 'Resources' | 'Legal';

export type StaticPageContent = {
  key: StaticPageKey;
  title: string;
  eyebrow: StaticCategory;
  summary: string;
  sections: Array<{
    title: string;
    body?: string;
    bullets?: string[];
    highlight?: string;
  }>;
  cta?: { label: string; to: string };
};

export type CategoryNavLink = {
  label: string;
  path: string;
  pageKey?: StaticPageKey;
};

export const CATEGORY_NAV: Record<
  StaticCategory,
  { description: string; links: CategoryNavLink[] }
> = {
  Product: {
    description: 'Capabilities, plans, and platform connections',
    links: [
      { label: 'Features', path: '/features', pageKey: 'features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Integrations', path: '/integrations', pageKey: 'integrations' },
      { label: 'Updates', path: '/updates', pageKey: 'updates' },
    ],
  },
  Company: {
    description: 'Who we are and how to reach us',
    links: [
      { label: 'About', path: '/about', pageKey: 'about' },
      { label: 'Careers', path: '/careers', pageKey: 'careers' },
      { label: 'Contact', path: '/contact', pageKey: 'contact' },
    ],
  },
  Resources: {
    description: 'Guides, support, and developer tools',
    links: [
      { label: 'Documentation', path: '/documentation', pageKey: 'documentation' },
      { label: 'Help Center', path: '/help-center', pageKey: 'help-center' },
      { label: 'API', path: '/api', pageKey: 'api' },
      { label: 'Community', path: '/community', pageKey: 'community' },
    ],
  },
  Legal: {
    description: 'Policies, security, and compliance',
    links: [
      { label: 'Privacy', path: '/privacy', pageKey: 'privacy' },
      { label: 'Terms', path: '/terms', pageKey: 'terms' },
      { label: 'Security', path: '/security', pageKey: 'security' },
      { label: 'Compliance', path: '/compliance', pageKey: 'compliance' },
    ],
  },
};

export const PAGES: Record<StaticPageKey, StaticPageContent> = {
  features: {
    key: 'features',
    eyebrow: 'Product',
    title: 'Features',
    summary:
      'Timely Mate brings time tracking, projects, HR, workforce operations, and reporting into one workflow — with clear permissions and audit-friendly history.',
    sections: [
      {
        title: 'Core modules',
        body: 'Everything your operations team needs in a single, consistent interface.',
        bullets: [
          'Time tracking with break support and timesheet history',
          'Projects and workspaces with activity and health views',
          'HR roster, roles, and employee records',
          'Offsite workforce operations — sites, incidents, and field scanning',
          'Reports and exports for payroll and leadership',
        ],
      },
      {
        title: 'Admin & controls',
        highlight:
          'Role-based access keeps sensitive HR and payroll data visible only to the right people.',
        bullets: [
          'Role-based permissions and guarded routes',
          'Notifications and clear action feedback',
          'Configurable persistence — local-first today, API-backed when you connect a backend',
        ],
      },
    ],
    cta: { label: 'View pricing', to: '/pricing' },
  },
  integrations: {
    key: 'integrations',
    eyebrow: 'Product',
    title: 'Integrations',
    summary:
      'Connect Timely Mate to the tools your team already uses. Start local-only, then wire your backend when you are ready for production.',
    sections: [
      {
        title: 'Supported patterns',
        bullets: [
          'Supabase for authentication and messaging when configured',
          'REST API via your backend (`VITE_API_URL`)',
          'Local storage fallback for offline and local-first workflows',
        ],
      },
      {
        title: 'Integration status',
        body:
          'This environment can store integration settings on-device. For production, keep secrets on a secure backend and use server-side token exchange.',
        highlight: 'Never expose API keys or service role tokens in the browser.',
      },
    ],
    cta: { label: 'Explore industry modules', to: '/industry-modules' },
  },
  updates: {
    key: 'updates',
    eyebrow: 'Product',
    title: 'Updates',
    summary: 'Release notes, improvements, and migration guidance as the platform evolves.',
    sections: [
      {
        title: 'What to expect',
        bullets: [
          'New feature releases and UX improvements',
          'Security and performance updates',
          'Migration notes when behavior changes',
        ],
      },
      {
        title: 'Changelog',
        body:
          'This page is ready for structured release notes. Connect a CMS or changelog API to publish updates automatically.',
      },
    ],
    cta: { label: 'See features', to: '/features' },
  },
  about: {
    key: 'about',
    eyebrow: 'Company',
    title: 'About Timely Mate',
    summary:
      'We build software that reduces operational overhead — clear workflows, consistent UI, and visibility without spreadsheet chaos.',
    sections: [
      {
        title: 'Our focus',
        bullets: [
          'Operational visibility for distributed and on-site teams',
          'Fast onboarding with intentional empty states',
          'Audit-friendly actions and confirmations',
        ],
      },
      {
        title: 'Built for growing teams',
        body:
          'From five-person startups to enterprise field operations, Timely Mate scales with permissions and plan tiers that match how you work.',
      },
    ],
    cta: { label: 'Contact us', to: '/contact' },
  },
  careers: {
    key: 'careers',
    eyebrow: 'Company',
    title: 'Careers',
    summary: 'Help us build modern operations software for teams that cannot afford friction.',
    sections: [
      {
        title: 'Open roles',
        body:
          'We are not listing open roles in-app yet. When hiring opens up, roles will appear here or link to your jobs board.',
      },
      {
        title: 'How to apply',
        bullets: [
          'Send a short introduction and your portfolio or CV',
          'Mention the role or area you are most interested in',
          'Include links to work you are proud of',
        ],
      },
    ],
    cta: { label: 'Get in touch', to: '/contact' },
  },
  contact: {
    key: 'contact',
    eyebrow: 'Company',
    title: 'Contact',
    summary: 'Sales, support, and partnership inquiries — we aim to respond within one business day.',
    sections: [
      {
        title: 'Support',
        bullets: [
          'Use the Help Center for common questions and setup guides',
          'For bugs, include the page, steps to reproduce, and screenshots',
        ],
      },
      {
        title: 'Sales & partnerships',
        bullets: [
          'Share your organization size and primary use case',
          'Tell us which modules you want to adopt first',
        ],
        highlight: 'Enterprise and field-ops teams: ask about SSO, compliance, and custom integrations.',
      },
    ],
    cta: { label: 'Visit Help Center', to: '/help-center' },
  },
  documentation: {
    key: 'documentation',
    eyebrow: 'Resources',
    title: 'Documentation',
    summary: 'Setup guides, roles, data flows, and configuration reference for administrators and developers.',
    sections: [
      {
        title: 'Getting started',
        bullets: [
          'Create an account and sign in',
          'Add employees (HR) and create workspaces and projects',
          'Track time and review timesheets',
        ],
      },
      {
        title: 'Configuration',
        bullets: [
          'App settings and organization profile',
          'Permissions and access control',
          'Backend and Supabase integration',
        ],
      },
    ],
    cta: { label: 'Open Help Center', to: '/help-center' },
  },
  'help-center': {
    key: 'help-center',
    eyebrow: 'Resources',
    title: 'Help Center',
    summary: 'Self-serve articles and troubleshooting for the most common questions.',
    sections: [
      {
        title: 'Popular topics',
        bullets: ['Login and account access', 'Data persistence and exports', 'Reports and timesheets'],
      },
      {
        title: 'Still stuck?',
        body: 'If you hit a bug, include the page, the action you took, and any console error message. Screenshots help us resolve issues faster.',
      },
    ],
    cta: { label: 'Read documentation', to: '/documentation' },
  },
  api: {
    key: 'api',
    eyebrow: 'Resources',
    title: 'API',
    summary: 'Integration guidance for connecting Timely Mate to your backend and third-party systems.',
    sections: [
      {
        title: 'Current state',
        body:
          'The app is local-first by default. When you connect a backend (`VITE_API_URL`), expose your API reference and OpenAPI spec here.',
      },
      {
        title: 'Recommended approach',
        bullets: [
          'Use a single HTTP client with auth interceptors',
          'Centralize domain services (projects, employees, timesheets)',
          'Return consistent error shapes for clear UX feedback',
        ],
      },
    ],
    cta: { label: 'View integrations', to: '/integrations' },
  },
  community: {
    key: 'community',
    eyebrow: 'Resources',
    title: 'Community',
    summary: 'Share feedback, request features, and report issues with the product team.',
    sections: [
      {
        title: 'How to contribute feedback',
        bullets: ['Feature requests with context and impact', 'Bug reports with reproduction steps', 'Usability and workflow feedback'],
      },
      {
        title: 'Guidelines',
        bullets: ['Be specific about the problem you are solving', 'Include repro steps and environment details', 'Share screenshots when possible'],
      },
    ],
    cta: { label: 'Contact us', to: '/contact' },
  },
  privacy: {
    key: 'privacy',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    summary: 'How we handle data in Timely Mate and what you should know for production deployments.',
    sections: [
      {
        title: 'Local-first data',
        bullets: [
          'Many features store operational data in browser or device storage by default',
          'Clearing site data removes locally stored records',
        ],
      },
      {
        title: 'Authentication',
        body:
          'Authentication may run via Supabase when configured, or local-only mode during development. Production should use a secure auth provider.',
      },
      {
        title: 'Cookies & tracking',
        body:
          'The app primarily uses localStorage for session persistence. If you add analytics cookies, document purpose, duration, and consent here.',
      },
    ],
  },
  terms: {
    key: 'terms',
    eyebrow: 'Legal',
    title: 'Terms of Service',
    summary: 'General terms governing use of Timely Mate.',
    sections: [
      {
        title: 'Use of service',
        bullets: [
          'Keep credentials confidential',
          'Do not misuse the service or attempt unauthorized access',
          'Respect role-based access control within your organization',
        ],
      },
      {
        title: 'Availability',
        body: 'Uptime and service levels depend on your hosting environment and backend configuration.',
      },
    ],
  },
  security: {
    key: 'security',
    eyebrow: 'Legal',
    title: 'Security',
    summary: 'Security posture, recommended configuration, and how to report vulnerabilities.',
    sections: [
      {
        title: 'Recommendations',
        bullets: [
          'Enable a production auth provider (Supabase, SSO, or equivalent)',
          'Store secrets server-side — never in client bundles',
          'Serve the application over HTTPS in production',
        ],
        highlight: 'Treat employee and payroll data as sensitive at every layer.',
      },
      {
        title: 'Reporting',
        body: 'Report security issues privately with clear reproduction steps. We take responsible disclosure seriously.',
      },
    ],
  },
  compliance: {
    key: 'compliance',
    eyebrow: 'Legal',
    title: 'Compliance',
    summary: 'Guidance for audit readiness, retention, and regulatory alignment.',
    sections: [
      {
        title: 'Audit trail',
        bullets: [
          'Prefer server-side logging for production environments',
          'Maintain change history for sensitive HR and payroll records',
        ],
      },
      {
        title: 'Data retention',
        body: 'Define retention periods based on your jurisdiction, industry, and internal policy. Export regularly where required.',
      },
    ],
    cta: { label: 'Read privacy policy', to: '/privacy' },
  },
};

const PATH_MAP: Record<string, StaticPageKey> = {
  '/features': 'features',
  '/integrations': 'integrations',
  '/updates': 'updates',
  '/about': 'about',
  '/careers': 'careers',
  '/contact': 'contact',
  '/documentation': 'documentation',
  '/help-center': 'help-center',
  '/api': 'api',
  '/community': 'community',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/security': 'security',
  '/compliance': 'compliance',
};

export function pathToKey(pathname: string): StaticPageKey | null {
  const p = pathname.replace(/\/+$/, '');
  return PATH_MAP[p] ?? null;
}
