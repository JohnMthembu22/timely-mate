export interface AttendanceDay {
  label: string;
  present: number;
  late: number;
  absent: number;
}

export interface ProductivityPoint {
  week: string;
  score: number;
  target: number;
}

export interface OvertimeRow {
  id: string;
  name: string;
  department: string;
  hours: number;
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
}

export interface WorkloadMember {
  id: string;
  name: string;
  utilization: number;
  capacity: number;
  department: string;
}

export interface FatigueAlert {
  id: string;
  name: string;
  score: number;
  drivers: string[];
  severity: 'watch' | 'elevated' | 'critical';
}

export interface TopPerformer {
  id: string;
  name: string;
  role: string;
  score: number;
  delta: number;
  highlight: string;
}

export interface WorkforceAiRec {
  id: string;
  title: string;
  detail: string;
  impact: 'high' | 'medium' | 'low';
  category: 'attendance' | 'overtime' | 'workload' | 'productivity' | 'wellness';
}

export interface WorkforceIntelligenceData {
  attendance: {
    rate: number;
    onTime: number;
    late: number;
    absent: number;
    weekly: AttendanceDay[];
  };
  productivity: {
    current: number;
    delta: number;
    trend: ProductivityPoint[];
  };
  overtime: {
    totalHours: number;
    weekOverWeek: number;
    byMember: OvertimeRow[];
  };
  workload: {
    balanceIndex: number;
    overloaded: number;
    underutilized: number;
    members: WorkloadMember[];
  };
  teamHealth: {
    score: number;
    status: 'strong' | 'stable' | 'at_risk';
    factors: { label: string; value: number; max: number }[];
  };
  fatigue: FatigueAlert[];
  topPerformers: TopPerformer[];
  recommendations: WorkforceAiRec[];
}

const NAMES = [
  'Alex Rivera',
  'Jordan Kim',
  'Sam Patel',
  'Taylor Brooks',
  'Morgan Lee',
  'Casey Nguyen',
  'Riley Chen',
  'Jamie Ortiz',
];

export function buildWorkforceIntelligenceData(
  employeeNames: string[] = []
): WorkforceIntelligenceData {
  const roster = employeeNames.length > 0 ? employeeNames : NAMES;

  return {
    attendance: {
      rate: 94.2,
      onTime: 87,
      late: 7,
      absent: 6,
      weekly: [
        { label: 'Mon', present: 42, late: 3, absent: 2 },
        { label: 'Tue', present: 44, late: 2, absent: 1 },
        { label: 'Wed', present: 41, late: 4, absent: 2 },
        { label: 'Thu', present: 43, late: 2, absent: 2 },
        { label: 'Fri', present: 40, late: 5, absent: 2 },
      ],
    },
    productivity: {
      current: 82,
      delta: 4.6,
      trend: [
        { week: 'W1', score: 74, target: 78 },
        { week: 'W2', score: 76, target: 78 },
        { week: 'W3', score: 79, target: 80 },
        { week: 'W4', score: 81, target: 80 },
        { week: 'W5', score: 82, target: 82 },
      ],
    },
    overtime: {
      totalHours: 128,
      weekOverWeek: 12,
      byMember: roster.slice(0, 6).map((name, i) => ({
        id: `ot-${i}`,
        name,
        department: ['Engineering', 'Operations', 'Creative', 'Field'][i % 4],
        hours: [18, 14, 11, 9, 7, 5][i] ?? 4,
        trend: (['up', 'stable', 'down'] as const)[i % 3],
        risk: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
      })),
    },
    workload: {
      balanceIndex: 72,
      overloaded: 3,
      underutilized: 2,
      members: roster.slice(0, 8).map((name, i) => ({
        id: `wl-${i}`,
        name,
        utilization: [98, 92, 88, 76, 68, 55, 48, 42][i] ?? 50,
        capacity: 100,
        department: ['Engineering', 'Operations', 'Creative', 'Field'][i % 4],
      })),
    },
    teamHealth: {
      score: 78,
      status: 'stable',
      factors: [
        { label: 'Attendance', value: 88, max: 100 },
        { label: 'Productivity', value: 82, max: 100 },
        { label: 'Workload balance', value: 72, max: 100 },
        { label: 'Overtime control', value: 65, max: 100 },
        { label: 'Wellness / fatigue', value: 70, max: 100 },
      ],
    },
    fatigue: roster.slice(0, 5).map((name, i) => ({
      id: `fat-${i}`,
      name,
      score: [82, 74, 68, 61, 55][i] ?? 50,
      drivers: [
        ['3 late shifts', 'High OT last week'],
        ['Back-to-back deadlines'],
        ['Low break compliance'],
        ['Travel + field hours'],
        ['Coverage gaps'],
      ][i] ?? ['Elevated hours'],
      severity: (['critical', 'elevated', 'elevated', 'watch', 'watch'] as const)[i],
    })),
    topPerformers: roster.slice(0, 5).map((name, i) => ({
      id: `tp-${i}`,
      name,
      role: ['Lead Engineer', 'Ops Manager', 'Designer', 'Field Lead', 'Analyst'][i],
      score: [96, 93, 91, 89, 87][i] ?? 85,
      delta: [5, 3, 4, 2, 1][i] ?? 0,
      highlight: [
        'Closed 4 critical tasks ahead of schedule',
        'Zero missed handoffs this sprint',
        'Highest client sign-off rate',
        'Best on-site utilization',
        'Strong cross-team collaboration',
      ][i] ?? 'Consistent delivery',
    })),
    recommendations: [
      {
        id: 'rec-1',
        title: 'Rebalance Engineering workload',
        detail:
          'Two engineers are above 90% utilization while Creative has spare capacity. Shift one sprint task to reduce burnout risk.',
        impact: 'high',
        category: 'workload',
      },
      {
        id: 'rec-2',
        title: 'Cap overtime on night shifts',
        detail:
          'Overtime rose 12% week-over-week. Introduce a soft cap and approve only business-critical extensions.',
        impact: 'high',
        category: 'overtime',
      },
      {
        id: 'rec-3',
        title: 'Attendance coaching for late cluster',
        detail:
          'Tuesday and Friday show higher late arrivals. Send a lightweight reminder before shift start windows.',
        impact: 'medium',
        category: 'attendance',
      },
      {
        id: 'rec-4',
        title: 'Schedule recovery blocks',
        detail:
          'Fatigue scores are elevated for 3 people with consecutive deadline weeks. Add 2-hour focus recovery slots.',
        impact: 'high',
        category: 'wellness',
      },
      {
        id: 'rec-5',
        title: 'Recognize top performers publicly',
        detail:
          'Productivity trend is up 4.6%. Highlight top 3 contributors in the weekly ops standup to sustain momentum.',
        impact: 'medium',
        category: 'productivity',
      },
    ],
  };
}
