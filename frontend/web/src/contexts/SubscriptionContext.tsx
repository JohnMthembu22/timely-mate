import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  SubscriptionPlan,
  UserSubscription,
  CompanyProfile,
  CompanySize,
  SUBSCRIPTION_PLANS,
  getRequiredPlanForEmployeeCount,
  getCompanyTier,
  PlanFeatures,
} from '../types/subscription';
import { useAppSelector } from '../store';
import { TESTING_MODE_UNLOCK_ALL } from '../config/testingMode';
import {
  readStoredEmployeeCount,
  readStoredSubscription,
  writeStoredSubscription,
} from '../utils/subscriptionStorage';

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  subscription: UserSubscription | null;
  companyProfile: CompanyProfile | null;
  isLoading: boolean;

  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canAccessFeature: (feature: keyof PlanFeatures) => boolean;
  getFeatureLimit: (feature: keyof PlanFeatures) => number | boolean;

  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  updateSubscription: (planId: string) => Promise<boolean>;
  checkEmployeeLimit: (newEmployeeCount: number) => boolean;
  refreshSubscriptionFromStorage: () => void;

  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

function resolvePlan(planId: string | undefined, employeeCount: number): SubscriptionPlan {
  const stored = planId ? SUBSCRIPTION_PLANS.find((p) => p.id === planId) : undefined;
  if (stored) return stored;
  return getRequiredPlanForEmployeeCount(employeeCount);
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const loadSubscriptionData = useCallback(() => {
    try {
      setIsLoading(true);

      const employeeCount = readStoredEmployeeCount();
      const stored = readStoredSubscription();
      const enterprisePlan =
        SUBSCRIPTION_PLANS.find((p) => p.id === 'enterprise') ?? SUBSCRIPTION_PLANS[SUBSCRIPTION_PLANS.length - 1];

      const effectivePlan = TESTING_MODE_UNLOCK_ALL
        ? enterprisePlan
        : resolvePlan(stored?.planId, employeeCount);

      const profile: CompanyProfile = {
        id: '1',
        name: 'Your organization',
        industry: '',
        employeeCount,
        country: '',
        currency: 'ZAR',
        registrationDate: new Date().toISOString(),
        verificationStatus: 'pending',
      };

      const mockSubscription: UserSubscription = {
        id: '1',
        userId: user?.id ?? 'user1',
        planId: effectivePlan.id,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        companySize: {
          employees: employeeCount,
          tier: TESTING_MODE_UNLOCK_ALL ? 'enterprise' : getCompanyTier(employeeCount),
          requiredPlan: effectivePlan.id as CompanySize['requiredPlan'],
        },
      };

      setCompanyProfile(profile);
      setSubscription(mockSubscription);
      setCurrentPlan(effectivePlan);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      const fallbackPlan =
        TESTING_MODE_UNLOCK_ALL
          ? SUBSCRIPTION_PLANS.find((p) => p.id === 'enterprise') ?? SUBSCRIPTION_PLANS[0]
          : SUBSCRIPTION_PLANS[0];
      setCurrentPlan(fallbackPlan);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'timelymate_employees' || e.key === 'timelymate_subscription') {
        loadSubscriptionData();
      }
    };
    const onEmployeesChanged = () => loadSubscriptionData();
    window.addEventListener('storage', onStorage);
    window.addEventListener('timelymate:employees-changed', onEmployeesChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('timelymate:employees-changed', onEmployeesChanged);
    };
  }, [loadSubscriptionData]);

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (TESTING_MODE_UNLOCK_ALL) return true;
    if (user?.role === 'admin') return true;
    if (!currentPlan) return false;
    if (currentPlan.id === 'enterprise') return true;
    return Boolean(currentPlan.features[feature]);
  };

  const canAccessFeature = (feature: keyof PlanFeatures): boolean => hasFeature(feature);

  const getFeatureLimit = (feature: keyof PlanFeatures): number | boolean => {
    if (!currentPlan) return false;
    return currentPlan.features[feature];
  };

  const updateCompanyProfile = (profile: Partial<CompanyProfile>) => {
    if (!companyProfile) return;

    const updatedProfile = { ...companyProfile, ...profile };
    setCompanyProfile(updatedProfile);

    if (profile.employeeCount !== undefined) {
      const requiredPlan = getRequiredPlanForEmployeeCount(profile.employeeCount);
      const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === currentPlan?.id);
      const requiredPlanIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.id === requiredPlan.id);

      if (requiredPlanIndex > currentPlanIndex) {
        setShowUpgradePrompt(true);
      }
    }
  };

  const updateSubscription = async (planId: string): Promise<boolean> => {
    try {
      const newPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!newPlan) return false;

      setCurrentPlan(newPlan);

      if (subscription) {
        setSubscription({
          ...subscription,
          planId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          companySize: {
            ...subscription.companySize,
            requiredPlan: planId as CompanySize['requiredPlan'],
          },
        });
      }

      writeStoredSubscription({
        planId,
        employeeCount: companyProfile?.employeeCount ?? readStoredEmployeeCount(),
      });

      setShowUpgradePrompt(false);
      return true;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      return false;
    }
  };

  const checkEmployeeLimit = (newEmployeeCount: number): boolean => {
    if (TESTING_MODE_UNLOCK_ALL) return true;
    if (!currentPlan) return false;
    if (currentPlan.maxEmployees === -1) return true;
    return newEmployeeCount <= currentPlan.maxEmployees;
  };

  const value: SubscriptionContextType = {
    currentPlan,
    subscription,
    companyProfile,
    isLoading,
    hasFeature,
    canAccessFeature,
    getFeatureLimit,
    updateCompanyProfile,
    updateSubscription,
    checkEmployeeLimit,
    refreshSubscriptionFromStorage: loadSubscriptionData,
    showUpgradePrompt,
    setShowUpgradePrompt,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
