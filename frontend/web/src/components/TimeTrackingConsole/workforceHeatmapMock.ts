
export type HeatmapView =
  | 'department'
  | 'productivity'
  | 'active_hours'
  | 'peak_periods'
  | 'remote'
  | 'overtime'
  | 'workload';

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

export interface WorkforceHeatmapData {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  maxValue: number;
}

const HOURS = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function seededValue(seed: number, max: number) {
  return Math.round(((seed * 9301 + 49297) % 233280) / 233280 * max);
}

export function buildHeatmapData(view: HeatmapView): WorkforceHeatmapData {
  return { rows: [], cols: [], cells: [], maxValue: 0 };
  switch (view) {
    case 'department': {
      const rows = ['Engineering', 'UI/UX', 'Operations', 'Field', 'Creative'];
      const cols = DAYS;
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          cells.push({ row, col, value: seededValue(ri * 10 + ci, 100) });
        })
      );
      return { rows, cols, cells, maxValue: 100 };
    }
    case 'productivity': {
      const rows = ['Deep work', 'Meetings', 'Reviews', 'Support', 'Admin'];
      const cols = HOURS.slice(2, 10);
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          cells.push({ row, col: `${col}:00`, value: seededValue(ri * 7 + ci + 3, 95) });
        })
      );
      return { rows, cols, cells, maxValue: 95 };
    }
    case 'active_hours':
    case 'peak_periods': {
      const rows = ['Clocked in', 'On task', 'Idle', 'Break'];
      const cols = HOURS;
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          const peak = ci >= 3 && ci <= 11 ? 1.2 : 0.7;
          cells.push({ row, col: `${col}:00`, value: Math.min(100, Math.round(seededValue(ri * 14 + ci, 80) * peak)) });
        })
      );
      return { rows, cols, cells, maxValue: 100 };
    }
    case 'remote': {
      const rows = ['Office', 'Hybrid', 'Remote', 'Field site'];
      const cols = DAYS;
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          cells.push({ row, col, value: seededValue(ri * 8 + ci + 1, 100) });
        })
      );
      return { rows, cols, cells, maxValue: 100 };
    }
    case 'overtime': {
      const rows = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'];
      const cols = ['W1', 'W2', 'W3', 'W4'];
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          cells.push({ row, col, value: seededValue(ri * 5 + ci, 24) });
        })
      );
      return { rows, cols, cells, maxValue: 24 };
    }
    case 'workload':
    default: {
      const rows = ['Platform', 'Infra', 'Brand', 'Field roll', 'Support'];
      const cols = ['Low', 'Med', 'High', 'Critical'];
      const cells: HeatmapCell[] = [];
      rows.forEach((row, ri) =>
        cols.forEach((col, ci) => {
          cells.push({ row, col, value: seededValue(ri * 4 + ci, 100) });
        })
      );
      return { rows, cols, cells, maxValue: 100 };
    }
  }
}

export const HEATMAP_VIEW_LABELS: Record<HeatmapView, { label: string; subtitle: string }> = {
  department: { label: 'Department activity', subtitle: 'Activity index by squad and weekday' },
  productivity: { label: 'Productivity density', subtitle: 'Focus vs collaboration by hour' },
  active_hours: { label: 'Active workforce hours', subtitle: 'State distribution across the day' },
  peak_periods: { label: 'Peak operational periods', subtitle: 'Highest load windows highlighted' },
  remote: { label: 'Remote distribution', subtitle: 'Work location mix by day' },
  overtime: { label: 'Overtime clusters', subtitle: 'OT hours concentration by team' },
  workload: { label: 'Project workload density', subtitle: 'Allocation pressure by project' },
};
