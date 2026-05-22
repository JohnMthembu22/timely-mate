import { createNotification } from '../../contexts/NotificationContext';
import type { Employee } from '../../contexts/EmployeeContext';
import type { AiOperationalInsight } from './offsiteOpsTypes';
import type { SiteLocation, SiteStatus } from './types';
import type { MobileWorkforceTool } from './mobileWorkforceTypes';

export interface AiInsightActionDeps {
  locations: SiteLocation[];
  offsiteWorkers: Employee[];
  onViewMap: (location: SiteLocation) => void;
  onAssignFieldWork: (input: {
    title: string;
    description?: string;
    siteId?: string;
    assigneeIds: string[];
    dueDate?: string;
  }) => void;
  onOpenMobileTool: (tool: MobileWorkforceTool) => void;
  onStatusChange: (id: string, status: SiteStatus) => void;
  addNotification: (notification: ReturnType<typeof createNotification.system>) => void;
}

function resolveSite(locations: SiteLocation[], insight: AiOperationalInsight): SiteLocation | undefined {
  if (insight.siteName) {
    const byName = locations.find(
      (l) => l.name === insight.siteName || l.name.includes(insight.siteName!)
    );
    if (byName) return byName;
  }
  return locations.find((l) => l.status === 'active') ?? locations[0];
}

function assigneeIds(workers: Employee[]): string[] {
  return workers.slice(0, 2).map((w) => w.id).filter(Boolean);
}

export function createAiInsightActionHandler(deps: AiInsightActionDeps) {
  const {
    locations,
    offsiteWorkers,
    onViewMap,
    onAssignFieldWork,
    onOpenMobileTool,
    onStatusChange,
    addNotification,
  } = deps;

  return (actionId: string, insight: AiOperationalInsight) => {
    const site = resolveSite(locations, insight);
    const ids = assigneeIds(offsiteWorkers);

    const notify = (title: string, description: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
      addNotification(createNotification.system(title, description, priority));
    };

    switch (actionId) {
      case 'preview':
        if (site) onViewMap(site);
        else notify('No site on map', 'Deploy a field site to preview routes on the map.', 'low');
        break;

      case 'apply-route':
        notify(
          'Route optimization applied',
          insight.detail + (site ? ` · Updated sequence for ${site.name}.` : ''),
          'high'
        );
        break;

      case 'rebalance':
      case 'dispatch':
      case 'add-crew':
        onAssignFieldWork({
          title: `[AI] ${insight.headline.slice(0, 48)}`,
          description: insight.recommendation,
          siteId: site?.id,
          assigneeIds: ids,
          dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        });
        break;

      case 'ai-assign':
        if (ids.length === 0) {
          notify('No field crew', 'Add field workers before AI auto-assign can run.', 'low');
          break;
        }
        onAssignFieldWork({
          title: `[AI Auto] ${insight.headline.slice(0, 40)}`,
          description: insight.recommendation,
          siteId: site?.id,
          assigneeIds: ids,
        });
        notify('AI auto-assign complete', `Briefed ${ids.length} crew member(s) from insight.`, 'high');
        break;

      case 'notify':
      case 'broadcast':
        notify(
          actionId === 'broadcast' ? 'Safety broadcast sent' : 'Supervisor notified',
          insight.recommendation,
          'high'
        );
        break;

      case 'reschedule':
        if (site) onStatusChange(site.id, 'pending');
        notify(
          'Work rescheduled',
          site
            ? `${site.name} moved to pending — exterior work deferred per weather insight.`
            : insight.recommendation,
          'medium'
        );
        break;

      case 'contingency':
        notify('Contingency plan set', insight.recommendation, 'medium');
        break;

      case 'order':
        onOpenMobileTool('logistics');
        notify('Procurement request', 'Logistics form opened — material order draft ready to submit.', 'medium');
        break;

      case 'escalate':
        onOpenMobileTool('escalate');
        notify('SLA escalation', insight.recommendation, 'high');
        break;

      case 'prioritize':
        if (site) onViewMap(site);
        const behind = locations.filter((l) => l.progress < 80 && l.status !== 'completed');
        behind.forEach((l) => {
          if (l.status === 'pending') onStatusChange(l.id, 'active');
        });
        notify(
          'Sites prioritized',
          behind.length
            ? `Activated ${behind.length} site(s) for close-out inspections.`
            : 'All sites on track — no prioritization needed.',
          'medium'
        );
        break;

      default:
        notify('Insight action', `${insight.recommendation}`, 'low');
    }
  };
}
