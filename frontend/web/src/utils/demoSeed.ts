import type { Employee } from '../contexts/EmployeeContext';

/** Demo roster for presentations when HR has not imported anyone yet. */
export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'demo-emp-1',
    name: 'Alex Morgan',
    position: 'Engineering Lead',
    department: 'Engineering',
    joinDate: '2024-01-15',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=demo-emp-1',
    salary: 95000,
    benefits: ['Health', 'Remote'],
    level: 'lead',
    email: 'alex.morgan@demo.timelymate.app',
    phone: '+1 555 0101',
    employmentType: 'permanent',
  },
  {
    id: 'demo-emp-2',
    name: 'Jordan Lee',
    position: 'Product Designer',
    department: 'Design',
    joinDate: '2024-03-01',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=demo-emp-2',
    salary: 82000,
    benefits: ['Health'],
    level: 'senior',
    email: 'jordan.lee@demo.timelymate.app',
    employmentType: 'permanent',
  },
  {
    id: 'demo-emp-3',
    name: 'Sam Rivera',
    position: 'Project Manager',
    department: 'Project Management',
    joinDate: '2023-11-20',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=demo-emp-3',
    salary: 88000,
    benefits: ['Health', 'Bonus'],
    level: 'senior',
    email: 'sam.rivera@demo.timelymate.app',
    employmentType: 'permanent',
  },
  {
    id: 'demo-emp-4',
    name: 'Taylor Kim',
    position: 'Marketing Specialist',
    department: 'Marketing',
    joinDate: '2024-06-10',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=demo-emp-4',
    salary: 72000,
    benefits: ['Health'],
    level: 'mid',
    email: 'taylor.kim@demo.timelymate.app',
    employmentType: 'permanent',
  },
  {
    id: 'demo-emp-5',
    name: 'Casey Brooks',
    position: 'Full Stack Developer',
    department: 'Engineering',
    joinDate: '2024-02-28',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=demo-emp-5',
    salary: 90000,
    benefits: ['Health', 'Learning'],
    level: 'mid',
    email: 'casey.brooks@demo.timelymate.app',
    employmentType: 'permanent',
  },
];

export const DEMO_SEED_FLAG = 'timelymate_demo_seeded';

export function seedDemoEmployeesIfEmpty(
  employees: Employee[],
  addEmployees: (list: Employee[]) => void
): boolean {
  if (employees.length > 0) return false;
  addEmployees(DEMO_EMPLOYEES);
  localStorage.setItem(DEMO_SEED_FLAG, 'true');
  return true;
}
