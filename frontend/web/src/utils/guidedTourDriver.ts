import type { Driver } from 'driver.js';
import type { TourStep } from '../config/guidedTour';
import { isNavTourSelector, prepareNavTargetForTour } from './guidedTourNavPrep';

/** Re-measure highlights after SPA route changes or lazy mounts. */
export function scheduleTourRefresh(driver: Driver | null, attempts = 5, delayMs = 280): void {
  if (!driver?.isActive()) return;

  let attempt = 0;
  const tick = () => {
    if (!driver.isActive()) return;
    driver.refresh();
    attempt += 1;
    if (attempt < attempts) {
      window.setTimeout(tick, delayMs);
    }
  };

  window.setTimeout(tick, delayMs);
}

export function waitForTourTarget(
  selector: string,
  maxWaitMs = 8000,
  intervalMs = 100,
  requireVisible = true
): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const el = document.querySelector(selector);
      if (el && (!requireVisible || isElementVisible(el))) {
        resolve(el);
        return;
      }
      if (Date.now() - start >= maxWaitMs) {
        resolve(el);
        return;
      }
      window.setTimeout(check, intervalMs);
    };

    check();
  });
}

function isElementVisible(el: Element): boolean {
  const html = el as HTMLElement;
  if (!html.offsetParent && getComputedStyle(html).position !== 'fixed') {
    return false;
  }
  const rect = html.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function getStepSelector(step: TourStep | undefined): string | null {
  if (!step?.element) return null;
  return typeof step.element === 'string' ? step.element : null;
}

/** Prepare route + targets before driver advances (avoids mid-step navigation bugs). */
export async function prepareTourStep(
  step: TourStep,
  navigate: (path: string) => void
): Promise<void> {
  if (step.route === '/messages') {
    window.dispatchEvent(new CustomEvent('tm:tour:messages-tab'));
  }

  if (step.route && window.location.pathname !== step.route) {
    navigate(step.route);
    await new Promise((resolve) => setTimeout(resolve, 650));
  }

  const selector = getStepSelector(step);
  if (selector && isNavTourSelector(selector)) {
    await prepareNavTargetForTour();
    await waitForTourTarget(selector, 3000, 80, false);
    const el = document.querySelector(selector);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    return;
  }

  if (selector) {
    await waitForTourTarget(selector, 4000, 100);
    const el = document.querySelector(selector);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  } else if (step.route) {
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}
