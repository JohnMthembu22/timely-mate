import type { Employee } from '../contexts/EmployeeContext';

export type WorkLocation = 'office' | 'offsite' | 'hybrid';

const OFFSITE_DEPT_PATTERN = /field|offsite|remote|site ops|logistics/i;

export function isOffsiteWorker(employee: Employee): boolean {
  if (employee.workLocation === 'offsite') return true;
  if (employee.workLocation === 'office') return false;
  if (employee.workLocation === 'hybrid') return true;
  return OFFSITE_DEPT_PATTERN.test(employee.department) || OFFSITE_DEPT_PATTERN.test(employee.position);
}

/** Roster shown only on the Field Operations page (field + hybrid workers) */
export function getOffsiteAssignableEmployees(employees: Employee[]): Employee[] {
  return employees.filter((e) => e.status === 'active' && (isOffsiteWorker(e) || e.workLocation === 'hybrid'));
}

/** Everyone except dedicated offsite-only workers — used on Tasks, Calendar, Time Tracking, etc. */
export function getOfficeAssignableEmployees(employees: Employee[]): Employee[] {
  return employees.filter((e) => e.status === 'active' && e.workLocation !== 'offsite' && !isOffsiteOnlyWorker(e));
}

function isOffsiteOnlyWorker(employee: Employee): boolean {
  return employee.workLocation === 'offsite' || (isOffsiteWorker(employee) && employee.workLocation !== 'hybrid');
}
