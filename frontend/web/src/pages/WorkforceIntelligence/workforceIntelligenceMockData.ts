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

import { EMPTY_WORKFORCE_INTELLIGENCE } from '../../utils/emptyData';

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

export function buildWorkforceIntelligenceData(): WorkforceIntelligenceData {
  return EMPTY_WORKFORCE_INTELLIGENCE;
}
