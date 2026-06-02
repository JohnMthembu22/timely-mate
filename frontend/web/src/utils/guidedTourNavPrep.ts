/** Dispatched before a tour step targets a sidebar nav item. */
export const TOUR_PREPARE_NAV_EVENT = 'tm:tour:prepare-nav';

export function isNavTourSelector(selector?: string): boolean {
  return Boolean(selector?.includes('data-tour="nav-'));
}

/** Opens the mobile drawer / expands the desktop sidebar so nav targets are visible. */
export function dispatchPrepareNavForTour(): void {
  window.dispatchEvent(new CustomEvent(TOUR_PREPARE_NAV_EVENT));
}

export async function prepareNavTargetForTour(): Promise<void> {
  dispatchPrepareNavForTour();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 220));
}
