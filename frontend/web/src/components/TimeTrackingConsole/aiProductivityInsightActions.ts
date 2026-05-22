import type { AiProductivityInsight } from './aiProductivityInsightsTypes';

export function handleProductivityInsightAction(
  actionId: string,
  insight: AiProductivityInsight,
  notify: (title: string, description: string, priority?: 'low' | 'medium' | 'high') => void
) {
  const apply = (title: string, description: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    notify(title, description, priority);
  };

  switch (actionId) {
    case 'focus-block':
    case 'block-calendar':
      apply('Focus time scheduled', insight.recommendation, 'medium');
      break;
    case 'notify-lead':
    case 'ot-alert':
    case 'wellness':
      apply('Team notification sent', `Alert dispatched for: ${insight.headline}`, 'high');
      break;
    case 'rebalance':
    case 'auto-assign':
    case 'auto-balance':
      apply('Workload rebalanced', insight.recommendation, 'high');
      break;
    case 'checkpoint':
    case 'scope-freeze':
      apply('Sprint governance updated', insight.recommendation, 'high');
      break;
    case 'recovery':
      apply('Recovery breaks mandated', insight.recommendation, 'high');
      break;
    case 'share-playbook':
      apply('Playbook shared', 'Field efficiency playbook sent to squad leads.', 'low');
      break;
    case 'auto-submit':
    case 'audit':
      apply('Workflow update', insight.recommendation, 'medium');
      break;
    case 'reminder':
    case 'geofence':
      apply('Attendance action', insight.recommendation, 'medium');
      break;
    default:
      apply('Insight action applied', insight.recommendation, 'low');
  }
}
