import type { PopoverDOM, State } from 'driver.js';

const CHROME_CLASS = 'tm-tour-chrome';

export function renderTimelyMateTourChrome(
  popover: PopoverDOM,
  state: State,
  totalSteps: number
): void {
  const activeIndex = state.activeIndex ?? 0;
  const current = activeIndex + 1;
  const pct = Math.round((current / totalSteps) * 100);

  let chrome = popover.wrapper.querySelector<HTMLElement>(`.${CHROME_CLASS}`);
  if (!chrome) {
    chrome = document.createElement('div');
    chrome.className = CHROME_CLASS;
    chrome.innerHTML = `
      <div class="tm-tour-header">
        <div class="tm-tour-brand">
          <span class="tm-tour-logo" aria-hidden="true">T</span>
          <span class="tm-tour-brand-label">TimelyMate guided tour</span>
        </div>
        <span class="tm-tour-step-badge" data-tm-tour-badge></span>
      </div>
      <div class="tm-tour-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="tm-tour-progress-fill" data-tm-tour-progress></div>
      </div>
      <div class="tm-tour-body"></div>
    `;
    popover.wrapper.insertBefore(chrome, popover.wrapper.firstChild);
  }

  const badge = chrome.querySelector('[data-tm-tour-badge]');
  const fill = chrome.querySelector('[data-tm-tour-progress]') as HTMLElement | null;
  const track = chrome.querySelector('.tm-tour-progress-track');
  const body = chrome.querySelector('.tm-tour-body');

  if (badge) badge.textContent = `Step ${current} of ${totalSteps}`;
  if (fill) fill.style.width = `${pct}%`;
  if (track) {
    track.setAttribute('aria-valuenow', String(pct));
    track.setAttribute('aria-label', `Tour progress: step ${current} of ${totalSteps}`);
  }

  // Re-sync driver content each step (driver recreates title/description nodes).
  if (body) {
    body.replaceChildren(popover.title, popover.description);
  }

  popover.title.classList.add('tm-tour-title');
  popover.description.classList.add('tm-tour-description');
  popover.previousButton.classList.add('driver-popover-prev-btn');

  const isLast = current >= totalSteps;
  popover.nextButton.classList.remove('driver-popover-next-btn', 'driver-popover-done-btn');
  popover.nextButton.classList.add(isLast ? 'driver-popover-done-btn' : 'driver-popover-next-btn');
}
