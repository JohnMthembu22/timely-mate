import type { Employee } from '../contexts/EmployeeContext';
import {
  DEFAULT_LEAVE_ENTITLEMENTS,
  EmployeeLeaveEntitlements,
  LEAVE_ENTITLEMENT_LABELS,
} from '../types/employeeHr';

export function findEmployeeByEmail(
  employees: Employee[],
  email: string | undefined | null
): Employee | undefined {
  if (!email?.trim()) return undefined;
  const normalized = email.trim().toLowerCase();
  return employees.find((emp) => emp.email?.trim().toLowerCase() === normalized);
}

export function getEmployeeLeaveEntitlements(employee: Employee | undefined): EmployeeLeaveEntitlements {
  return employee?.leaveEntitlements ?? DEFAULT_LEAVE_ENTITLEMENTS;
}

export function leaveEntitlementsForDisplay(entitlements: EmployeeLeaveEntitlements) {
  return (Object.keys(LEAVE_ENTITLEMENT_LABELS) as (keyof EmployeeLeaveEntitlements)[]).map(
    (key) => ({
      key,
      type: LEAVE_ENTITLEMENT_LABELS[key],
      total: entitlements[key].totalDays,
      used: entitlements[key].usedDays,
      remaining: Math.max(0, entitlements[key].totalDays - entitlements[key].usedDays),
    })
  );
}
