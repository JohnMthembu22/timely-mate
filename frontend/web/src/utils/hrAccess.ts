import type { Department, UserRole } from '../types/auth';

type HrAccessUser = {
  role?: UserRole | string;
  department?: Department | string;
} | null | undefined;

/** Only organization admins and HR department users may onboard employees and set leave/payroll fields. */
export function canOnboardEmployees(user: HrAccessUser): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.department === 'hr';
}
