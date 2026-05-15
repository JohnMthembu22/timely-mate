import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SubscriptionPlan, 
  UserSubscription, 
  CompanyProfile, 
  SUBSCRIPTION_PLANS,
  getRequiredPlanForEmployeeCount,
  getCompanyTier,
  PlanFeatures
} from '../types/subscription';
import { useAppSelector } from '../store';

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  subscription: UserSubscription | null;
  companyProfile: CompanyProfile | null;
  isLoading: boolean;
  
  // Feature Access Methods
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canAccessFeature: (feature: keyof PlanFeatures) => boolean;
  getFeatureLimit: (feature: keyof PlanFeatures) => number | boolean;
  
  // Subscription Management
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  updateSubscription: (planId: string) => Promise<boolean>;
  checkEmployeeLimit: (newEmployeeCount: number) => boolean;
  
  // UI Helpers
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading subscription data (replace with actual API calls)
      const mockCompanyProfile: CompanyProfile = {
        id: '1',
        name: 'Demo Company',
        industry: 'Technology',
        employeeCount: 3,
        country: 'South Africa',
        currency: 'ZAR',
        registrationDate: new Date().toISOString(),
        verificationStatus: 'verified'
      };

      const requiredPlan = getRequiredPlanForEmployeeCount(mockCompanyProfile.employeeCount);
      
      const mockSubscription: UserSubscription = {
        id: '1',
        userId: 'user1',
        planId: requiredPlan.id,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        companySize: {
          employees: mockCompanyProfile.employeeCount,
          tier: getCompanyTier(mockCompanyProfile.employeeCount),
          requiredPlan: requiredPlan.id as any
        }
      };

      setCompanyProfile(mockCompanyProfile);
      setSubscription(mockSubscription);
      setCurrentPlan(requiredPlan);
      
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      // Set default free plan
      setCurrentPlan(SUBSCRIPTION_PLANS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    // Admin users have access to all features
    if (user?.role === 'admin') {
      return true;
    }
    
    if (!currentPlan) return false;
    
    // Enterprise plan enables ALL features
    if (currentPlan.id === 'enterprise') {
      return true;
    }
    
    return currentPlan.features[feature] as boolean;
  };

  const canAccessFeature = (feature: keyof PlanFeatures): boolean => {
    return hasFeature(feature);
  };

  const getFeatureLimit = (feature: keyof PlanFeatures): number | boolean => {
    if (!currentPlan) return false;
    return currentPlan.features[feature];
  };

  const updateCompanyProfile = (profile: Partial<CompanyProfile>) => {
    if (!companyProfile) return;
    
    const updatedProfile = { ...companyProfile, ...profile };
    setCompanyProfile(updatedProfile);
    
    // Check if employee count changed and requires plan upgrade
    if (profile.employeeCount !== undefined) {
      const requiredPlan = getRequiredPlanForEmployeeCount(profile.employeeCount);
      const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentPlan?.id);
      const requiredPlanIndex = SUBSCRIPTION_PLANS.findIndex(p => p.id === requiredPlan.id);
      
      if (requiredPlanIndex > currentPlanIndex) {
        setShowUpgradePrompt(true);
      }
    }
  };

  const updateSubscription = async (planId: string): Promise<boolean> => {
    try {
      const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!newPlan) return false;

      // Simulate API call to update subscription
      setCurrentPlan(newPlan);
      
      if (subscription) {
        setSubscription({
          ...subscription,
          planId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      setShowUpgradePrompt(false);
      return true;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      return false;
    }
  };

  const checkEmployeeLimit = (newEmployeeCount: number): boolean => {
    if (!currentPlan) return false;
    if (currentPlan.maxEmployees === -1) return true; // unlimited
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
    showUpgradePrompt,
    setShowUpgradePrompt
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 