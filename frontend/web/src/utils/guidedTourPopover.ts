import type { PopoverDOM, State } from 'driver.js';
import { invokeTourDone, invokeTourNext, invokeTourPrev } from './guidedTourActions';

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
  const header = chrome.querySelector('.tm-tour-header');

  if (badge) badge.textContent = `Step ${current} of ${totalSteps}`;
  if (fill) fill.style.width = `${pct}%`;
  if (track) {
    track.setAttribute('aria-valuenow', String(pct));
    track.setAttribute('aria-label', `Tour progress: step ${current} of ${totalSteps}`);
  }

  // Move the close button into the header so it never overlaps driver content.
  if (header && popover.closeButton && !header.contains(popover.closeButton)) {
    popover.closeButton.setAttribute('aria-label', 'Close tour');
    popover.closeButton.classList.add('tm-tour-close-btn');
    header.appendChild(popover.closeButton);
  }

  // Re-sync driver content each step (driver recreates title/description nodes).
  if (body) {
    body.replaceChildren(popover.title, popover.description);
  }

  popover.title.classList.add('tm-tour-title');
  popover.description.classList.add('tm-tour-description');
  popover.previousButton.classList.add('driver-popover-prev-btn');

  const isLast = activeIndex >= totalSteps - 1;
  popover.nextButton.classList.remove('driver-popover-next-btn', 'driver-popover-done-btn');
  popover.nextButton.classList.add(isLast ? 'driver-popover-done-btn' : 'driver-popover-next-btn');
  popover.nextButton.textContent = isLast ? 'Got it' : 'Continue';
  popover.nextButton.disabled = false;
  popover.nextButton.classList.remove('driver-popover-btn-disabled');

  popover.footer.style.pointerEvents = 'auto';
  popover.nextButton.style.pointerEvents = 'auto';
  popover.previousButton.style.pointerEvents = 'auto';
  popover.nextButton.setAttribute('type', 'button');
  popover.previousButton.setAttribute('type', 'button');

  popover.nextButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLast) {
      invokeTourDone();
    } else {
      invokeTourNext();
    }
  };
  popover.previousButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    invokeTourPrev();
  };
}
