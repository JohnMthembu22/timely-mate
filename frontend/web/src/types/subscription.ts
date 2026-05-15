export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in ZAR
  priceUSD: number; // for reference
  billing: 'monthly' | 'annually';
  maxEmployees: number;
  features: PlanFeatures;
  isPopular?: boolean;
  description: string;
  targetAudience: string;
}

export interface PlanFeatures {
  // Core Features
  timeTracking: boolean;
  basicReporting: boolean;
  mobileApp: boolean;
  webApp: boolean;
  
  // Team Management
  teamManagement: boolean;
  userRoles: boolean;
  attendance: boolean;
  schedules: boolean;
  
  // Advanced Features
  advancedReporting: boolean;
  projectTracking: boolean;
  invoicing: boolean;
  integrations: boolean;
  customFields: boolean;
  
  // Premium Features
  advancedAnalytics: boolean;
  apiAccess: boolean;
  whiteLabeling: boolean;
  ssoIntegration: boolean;
  prioritySupport: boolean;
  dedicatedAccountManager: boolean;
  
  // Page Access Features
  meetings: boolean;
  team: boolean;
  freelancers: boolean;
  messages: boolean;
  notifications: boolean;
  offsiteWork: boolean;
  industryModules: boolean;
  expenseTracking: boolean;
  procurement: boolean;
  learningPortal: boolean;
  
  // Storage & Limits
  storageGB: number;
  monthlyReports: number;
  integrationLimit: number;
}

export interface CompanySize {
  employees: number;
  tier: 'startup' | 'small' | 'medium' | 'enterprise';
  requiredPlan: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  paymentMethod?: string;
  nextBillingDate: string;
  cancelledAt?: string;
  companySize: CompanySize;
}

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  employeeCount: number;
  country: string;
  currency: 'ZAR' | 'USD' | 'EUR';
  registrationDate: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents?: {
    businessRegistration?: string;
    taxId?: string;
    vatNumber?: string;
  };
}

// South African Rand pricing tiers based on competitor analysis
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Startup Free',
    price: 0,
    priceUSD: 0,
    billing: 'monthly',
    maxEmployees: 5,
    description: 'Perfect for new startups and small teams getting started',
    targetAudience: '0-5 employees',
    features: {
      timeTracking: true,
      basicReporting: true,
      mobileApp: true,
      webApp: true,
      teamManagement: false,
      userRoles: false,
      attendance: true,
      schedules: false,
      advancedReporting: false,
      projectTracking: false,
      invoicing: false,
      integrations: false,
      customFields: false,
      advancedAnalytics: false,
      apiAccess: false,
      whiteLabeling: false,
      ssoIntegration: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
      meetings: false,
      team: false,
      freelancers: false,
      messages: false,
      notifications: false,
      offsiteWork: false,
      industryModules: false,
      expenseTracking: false,
      procurement: false,
      learningPortal: false,
      storageGB: 1,
      monthlyReports: 10,
      integrationLimit: 0
    }
  },
  {
    id: 'starter',
    name: 'Basic',
    price: 59, // R59 per user per month
    priceUSD: 3.20,
    billing: 'monthly',
    maxEmployees: 25,
    description: 'Essential features for growing small businesses',
    targetAudience: '5-25 employees',
    isPopular: true,
    features: {
      timeTracking: true,
      basicReporting: true,
      mobileApp: true,
      webApp: true,
      teamManagement: true,
      userRoles: true,
      attendance: true,
      schedules: true,
      advancedReporting: true,
      projectTracking: true,
      invoicing: true,
      integrations: true,
      customFields: true,
      advancedAnalytics: false,
      apiAccess: false,
      whiteLabeling: false,
      ssoIntegration: false,
      prioritySupport: true,
      dedicatedAccountManager: false,
      meetings: true,
      team: true,
      freelancers: true,
      messages: true,
      notifications: true,
      offsiteWork: true,
      industryModules: true,
      expenseTracking: true,
      procurement: true,
      learningPortal: true,
      storageGB: 10,
      monthlyReports: 100,
      integrationLimit: 5
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199, // R199 per month for 25-100 employees
    priceUSD: 10.80,
    billing: 'monthly',
    maxEmployees: 100,
    description: 'Advanced features for growing companies',
    targetAudience: '25-100 employees',
    features: {
      timeTracking: true,
      basicReporting: true,
      mobileApp: true,
      webApp: true,
      teamManagement: true,
      userRoles: true,
      attendance: true,
      schedules: true,
      advancedReporting: true,
      projectTracking: true,
      invoicing: true,
      integrations: true,
      customFields: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabeling: false,
      ssoIntegration: true,
      prioritySupport: true,
      dedicatedAccountManager: false,
      meetings: true,
      team: true,
      freelancers: true,
      messages: true,
      notifications: true,
      offsiteWork: true,
      industryModules: true,
      expenseTracking: true,
      procurement: true,
      learningPortal: true,
      storageGB: 50,
      monthlyReports: 500,
      integrationLimit: 15
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499, // R499 per user per month
    priceUSD: 27.00,
    billing: 'monthly',
    maxEmployees: -1, // unlimited
    description: 'Complete solution for large organizations',
    targetAudience: '100+ employees',
    features: {
      timeTracking: true,
      basicReporting: true,
      mobileApp: true,
      webApp: true,
      teamManagement: true,
      userRoles: true,
      attendance: true,
      schedules: true,
      advancedReporting: true,
      projectTracking: true,
      invoicing: true,
      integrations: true,
      customFields: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabeling: true,
      ssoIntegration: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      meetings: true,
      team: true,
      freelancers: true,
      messages: true,
      notifications: true,
      offsiteWork: true,
      industryModules: true,
      expenseTracking: true,
      procurement: true,
      learningPortal: true,
      storageGB: 500,
      monthlyReports: -1, // unlimited
      integrationLimit: -1 // unlimited
    }
  }
];

export const getRequiredPlanForEmployeeCount = (employeeCount: number): SubscriptionPlan => {
  if (employeeCount <= 5) {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === 'free')!;
  } else if (employeeCount <= 25) {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === 'starter')!;
  } else if (employeeCount <= 100) {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === 'professional')!;
  } else {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === 'enterprise')!;
  }
};

export const getCompanyTier = (employeeCount: number): CompanySize['tier'] => {
  if (employeeCount <= 5) return 'startup';
  if (employeeCount <= 25) return 'small';
  if (employeeCount <= 100) return 'medium';
  return 'enterprise';
}; 