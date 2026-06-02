export type LeaveEntitlement = {
  totalDays: number;
  usedDays: number;
};

export type EmployeeLeaveEntitlements = {
  annual: LeaveEntitlement;
  sick: LeaveEntitlement;
  personal: LeaveEntitlement;
  study: LeaveEntitlement;
  maternity: LeaveEntitlement;
};

export type EmployeePayslip = {
  id: string;
  month: string;
  year: number;
  amount: number;
  currency: string;
  issuedAt: string;
  documentUrl?: string;
};

export const DEFAULT_LEAVE_ENTITLEMENTS: EmployeeLeaveEntitlements = {
  annual: { totalDays: 21, usedDays: 0 },
  sick: { totalDays: 10, usedDays: 0 },
  personal: { totalDays: 5, usedDays: 0 },
  study: { totalDays: 3, usedDays: 0 },
  maternity: { totalDays: 90, usedDays: 0 },
};

export const LEAVE_ENTITLEMENT_LABELS: Record<keyof EmployeeLeaveEntitlements, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  study: 'Study Leave',
  maternity: 'Maternity / Parental Leave',
};

export function cloneLeaveEntitlements(): EmployeeLeaveEntitlements {
  return {
    annual: { ...DEFAULT_LEAVE_ENTITLEMENTS.annual },
    sick: { ...DEFAULT_LEAVE_ENTITLEMENTS.sick },
    personal: { ...DEFAULT_LEAVE_ENTITLEMENTS.personal },
    study: { ...DEFAULT_LEAVE_ENTITLEMENTS.study },
    maternity: { ...DEFAULT_LEAVE_ENTITLEMENTS.maternity },
  };
}

export type NewEmployeeFormState = {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  salary: number;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  benefits: string[];
  employmentType: 'permanent' | 'contract' | 'freelancer';
  workLocation: 'office' | 'offsite' | 'hybrid';
  leaveEntitlements: EmployeeLeaveEntitlements;
};

export function createEmptyNewEmployeeForm(): NewEmployeeFormState {
  return {
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    level: 'junior',
    benefits: [],
    employmentType: 'permanent',
    workLocation: 'office',
    leaveEntitlements: cloneLeaveEntitlements(),
  };
}
