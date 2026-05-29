import type { PlanFeatures } from '../../types/subscription';

export type DisplayFeature = {
  key: keyof PlanFeatures;
  label: string;
};

export const PRICING_FEATURE_ROWS: DisplayFeature[] = [
  { key: 'timeTracking', label: 'Time tracking & attendance' },
  { key: 'teamManagement', label: 'Team management' },
  { key: 'projectTracking', label: 'Project tracking' },
  { key: 'advancedReporting', label: 'Advanced reports' },
  { key: 'mobileApp', label: 'Mobile & web apps' },
  { key: 'apiAccess', label: 'API access' },
  { key: 'prioritySupport', label: 'Priority support' },
];

export const PRICING_FAQ = [
  {
    question: 'What happens if my team grows?',
    answer:
      'Your recommended tier adjusts with headcount. If you exceed your plan limits, we prompt you to upgrade — no surprise lockouts mid-payroll.',
  },
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes. Upgrade or downgrade whenever you need. Changes apply immediately and billing is prorated on paid tiers.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Startup Free supports up to 5 employees forever. Paid plans include a 30-day trial so you can validate workflows before committing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Major cards, EFT, and South African bank transfers. International payments are processed through secure partners.',
  },
  {
    question: 'Do annual plans save money?',
    answer: 'Annual billing saves 15% versus paying monthly — one invoice, predictable costs for finance teams.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. Cancel with no penalty. You keep access through the end of your billing period.',
  },
] as const;

export const COMPANY_SIZE_TIERS = [
  { id: 'free', range: '0–5', label: 'Startup', plan: 'Startup Free', price: 'R0' },
  { id: 'starter', range: '5–25', label: 'Growing', plan: 'Basic', price: 'R59' },
  { id: 'professional', range: '25–100', label: 'Scale-up', plan: 'Professional', price: 'R199' },
  { id: 'enterprise', range: '100+', label: 'Enterprise', plan: 'Enterprise', price: 'R499' },
] as const;

export const PLAN_ACCENT: Record<
  string,
  { gradient: string; glow: string; iconBg: string }
> = {
  free: {
    gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    glow: 'rgba(100, 116, 139, 0.35)',
    iconBg: 'rgba(100, 116, 139, 0.15)',
  },
  starter: {
    gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    glow: 'rgba(56, 189, 248, 0.45)',
    iconBg: 'rgba(37, 99, 235, 0.12)',
  },
  professional: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    glow: 'rgba(129, 140, 248, 0.4)',
    iconBg: 'rgba(79, 70, 229, 0.12)',
  },
  enterprise: {
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
    iconBg: 'rgba(180, 83, 9, 0.12)',
  },
};
