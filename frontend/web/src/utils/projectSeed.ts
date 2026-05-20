import type { Employee } from '../contexts/EmployeeContext';

export interface ProjectTeamMember {
  name: string;
  avatar: string;
  role: string;
}

export interface SeedProject {
  id: string;
  name: string;
  description: string;
  progress: number;
  color: string;
  team: ProjectTeamMember[];
  tasks: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  projectTasks: unknown[];
  notes: unknown[];
  createdAt?: string;
}

const PROJECT_NAMES: Record<string, string> = {
  Engineering: 'Platform Development',
  Design: 'UI/UX Redesign',
  Marketing: 'Brand Campaign',
  Sales: 'Revenue Optimization',
  Product: 'Feature Development',
  'Project Management': 'Process Improvement',
  HR: 'Employee Engagement',
  Finance: 'Financial Analysis',
};

const PROJECT_DESCRIPTIONS: Record<string, string> = {
  Engineering: 'Develop and maintain the core platform infrastructure and features',
  Design: 'Redesign user interfaces and improve user experience across all products',
  Marketing: 'Launch comprehensive brand awareness and lead generation campaigns',
  Sales: 'Optimize sales processes and increase revenue through strategic initiatives',
  Product: 'Develop new features and improve existing product functionality',
  'Project Management': 'Streamline project management processes and improve team efficiency',
  HR: 'Enhance employee satisfaction and retention through engagement initiatives',
  Finance: 'Analyze financial performance and optimize resource allocation',
};

/** Build starter projects from imported employees (one project per department). */
export function generateProjectsFromEmployees(employees: Employee[]): SeedProject[] {
  const departments = [...new Set(employees.map((emp) => emp.department))];
  return departments.map((dept, index) => {
    const deptEmployees = employees.filter((emp) => emp.department === dept);
    const team: ProjectTeamMember[] = deptEmployees.map((emp) => ({
      name: emp.name,
      avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`,
      role: emp.position,
    }));

    return {
      id: `dept-project-${dept.toLowerCase().replace(/\s+/g, '-')}`,
      name: PROJECT_NAMES[dept] || `${dept} Initiative`,
      description: PROJECT_DESCRIPTIONS[dept] || `Strategic initiative for ${dept} department`,
      progress: 35 + (index % 4) * 10,
      color: `hsl(${index * 45}, 70%, 50%)`,
      team,
      tasks: 8 + index,
      completedTasks: 3 + index,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      projectTasks: [],
      notes: [],
      createdAt: new Date().toISOString(),
    };
  });
}
