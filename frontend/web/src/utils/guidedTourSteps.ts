import { guidedTourSteps, type TourStep } from '../config/guidedTour';
import { getStepSelector } from './guidedTourDriver';

const MOBILE_FINAL_STEP: TourStep = {
  popover: {
    title: 'You are all set',
    description:
      'Open your profile menu and choose Help & Support anytime to replay this tour. Enjoy TimelyMate.',
    side: 'bottom',
    align: 'center',
  },
};

/** Route steps use popover-only so driver never skips when a page target is slow to mount. */
function asRoutePopoverStep(step: TourStep): TourStep {
  if (!step.route) return step;
  const { element: _el, ...rest } = step;
  return rest;
}

function isStepTargetPresent(step: TourStep): boolean {
  const selector = getStepSelector(step);
  if (!selector) return true;
  return Boolean(document.querySelector(selector));
}

/** Build the step list for the current viewport and DOM (hidden nav items omitted). */
export function resolveGuidedTourSteps(isMobile: boolean): TourStep[] {
  let steps = guidedTourSteps
    .filter((step) => {
      if (isMobile && getStepSelector(step) === '[data-tour="tour-guide-button"]') {
        return false;
      }
      const selector = getStepSelector(step);
      if (!selector || step.route) return true;
      if (selector.includes('nav-')) return isStepTargetPresent(step);
      return isStepTargetPresent(step);
    })
    .map((step) => (step.route ? asRoutePopoverStep(step) : step));

  if (isMobile) {
    steps = [...steps, MOBILE_FINAL_STEP];
  }

  return steps;
}
