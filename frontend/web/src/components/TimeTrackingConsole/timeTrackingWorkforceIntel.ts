import { buildWorkforceIntelligenceData } from '../../pages/WorkforceIntelligence/workforceIntelligenceMockData';
import type { WorkforceIntelligenceData } from '../../pages/WorkforceIntelligence/workforceIntelligenceMockData';

export type UtilizationHeat = 'low' | 'optimal' | 'high' | 'critical';

export interface LiveWorkforceEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'break' | 'offline';
  timerActive: boolean;
  utilization: number;
  heat: UtilizationHeat;
}

export interface LateCheckIn {
  id: string;
  name: string;
  department: string;
  expected: string;
  actual: string;
  minutesLate: number;
}

export interface AttendanceAnomaly {
  id: string;
  label: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DepartmentLoad {
  id: string;
  name: string;
  utilization: number;
  headcount: number;
  status: 'overloaded' | 'balanced' | 'underutilized';
}

export interface TimeTrackingWorkforceIntel {
  base: WorkforceIntelligenceData;
  activeEmployees: number;
  activeTimers: number;
  workforceUtilization: number;
  overtimeAlertCount: number;
  lateCheckInCount: number;
  anomalyCount: number;
  liveEmployees: LiveWorkforceEmployee[];
  lateCheckIns: LateCheckIn[];
  anomalies: AttendanceAnomaly[];
  departmentLoads: DepartmentLoad[];
}

function heatFromUtilization(u: number): UtilizationHeat {
  if (u >= 95) return 'critical';
  if (u >= 85) return 'high';
  if (u >= 55) return 'optimal';
  return 'low';
}

const heatColor: Record<UtilizationHeat, string> = {
  low: '#94a3b8',
  optimal: '#10b981',
  high: '#f59e0b',
  critical: '#ef4444',
};

export function utilizationHeatColor(heat: UtilizationHeat): string {
  return heatColor[heat];
}

export function buildTimeTrackingWorkforceIntel(
  employeeNames: string[] = [],
  activeTimerCount = 0
): TimeTrackingWorkforceIntel {
  const base = buildWorkforceIntelligenceData(employeeNames);
  const roster = base.workload.members;

  const liveEmployees: LiveWorkforceEmployee[] = roster.slice(0, 8).map((m, i) => ({
    id: m.id,
    name: m.name,
    role: ['Engineer', 'Ops Lead', 'Designer', 'Field Tech', 'Analyst', 'PM', 'Support', 'QA'][i % 8],
    department: m.department,
    status: (['active', 'active', 'break', 'active', 'offline', 'active', 'active', 'break'] as const)[i],
    timerActive: i < activeTimerCount || (i < 3 && activeTimerCount > 0),
    utilization: m.utilization,
    heat: heatFromUtilization(m.utilization),
  }));

  const activeEmployees = liveEmployees.filter((e) => e.status === 'active').length;
  const activeTimers = activeTimerCount > 0 ? activeTimerCount : liveEmployees.filter((e) => e.timerActive).length;

  const deptMap = new Map<string, { total: number; count: number }>();
  roster.forEach((m) => {
    const cur = deptMap.get(m.department) ?? { total: 0, count: 0 };
    deptMap.set(m.department, { total: cur.total + m.utilization, count: cur.count + 1 });
  });

  const departmentLoads: DepartmentLoad[] = Array.from(deptMap.entries()).map(([name, v], i) => {
    const utilization = Math.round(v.total / v.count);
    return {
      id: `dept-${i}`,
      name,
      utilization,
      headcount: v.count,
      status: utilization >= 90 ? 'overloaded' : utilization < 55 ? 'underutilized' : 'balanced',
    };
  });

  return {
    base,
    activeEmployees,
    activeTimers,
    workforceUtilization: Math.round(
      roster.reduce((s, m) => s + m.utilization, 0) / Math.max(1, roster.length)
    ),
    overtimeAlertCount: base.overtime.byMember.filter((o) => o.risk !== 'low').length,
    lateCheckInCount: base.attendance.late,
    anomalyCount: 3,
    liveEmployees,
    lateCheckIns: roster.slice(0, 4).map((m, i) => ({
      id: `late-${i}`,
      name: m.name,
      department: m.department,
      expected: '08:30',
      actual: ['08:47', '09:12', '08:55', '09:03'][i],
      minutesLate: [17, 42, 25, 33][i],
    })),
    anomalies: [
      {
        id: 'an-1',
        label: 'Geofence mismatch',
        detail: '2 check-ins outside approved site radius (Field ops).',
        severity: 'warning',
      },
      {
        id: 'an-2',
        label: 'Break compliance',
        detail: 'Team B skipped mandatory break window on 2 shifts.',
        severity: 'critical',
      },
      {
        id: 'an-3',
        label: 'Duplicate punch',
        detail: 'Overlapping timer detected for same employee ID.',
        severity: 'info',
      },
    ],
    departmentLoads,
  };
}
