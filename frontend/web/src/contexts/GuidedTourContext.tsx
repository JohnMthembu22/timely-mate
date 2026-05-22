import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Config, Driver } from 'driver.js';
import {
  guidedTourSteps,
  TOUR_AUTO_START_KEY,
  TOUR_COMPLETED_KEY,
} from '../config/guidedTour';
import { renderTimelyMateTourChrome } from '../utils/guidedTourPopover';
import {
  getStepSelector,
  prepareTourStep,
  scheduleTourRefresh,
  waitForTourTarget,
} from '../utils/guidedTourDriver';

type GuidedTourContextValue = {
  startTour: (options?: { force?: boolean }) => void;
  isTourCompleted: () => boolean;
  resetTourProgress: () => void;
};

const GuidedTourContext = createContext<GuidedTourContextValue | undefined>(undefined);

export function useGuidedTour(): GuidedTourContextValue {
  const ctx = useContext(GuidedTourContext);
  if (!ctx) {
    throw new Error('useGuidedTour must be used within GuidedTourProvider');
  }
  return ctx;
}

async function loadDriverFactory() {
  await import('driver.js/dist/driver.css');
  await import('../styles/guidedTour.css');
  const mod = await import('driver.js');
  return mod.driver;
}

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverRef = useRef<Driver | null>(null);
  const driverFactoryRef = useRef<Awaited<ReturnType<typeof loadDriverFactory>> | null>(null);
  const navigatingRef = useRef(false);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const destroyDriver = useCallback(() => {
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch {
        /* already torn down */
      }
      driverRef.current = null;
    }
  }, []);

  const transitionToStep = useCallback(async (targetIndex: number) => {
    if (navigatingRef.current) return;

    const driver = driverRef.current;
    if (!driver?.isActive()) return;

    const step = guidedTourSteps[targetIndex];
    if (!step) {
      driver.destroy();
      return;
    }

    navigatingRef.current = true;
    try {
      await prepareTourStep(step, navigateRef.current);
      if (!driver.isActive()) return;
      driver.moveTo(targetIndex);
      scheduleTourRefresh(driver, 4, 220);
    } finally {
      navigatingRef.current = false;
    }
  }, []);

  const buildDriverConfig = useCallback((): Config => {
    const totalSteps = guidedTourSteps.length;

    return {
      showProgress: false,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      popoverClass: 'tm-guided-tour-popover',
      popoverOffset: 14,
      overlayColor: '#0f172a',
      overlayOpacity: 0.72,
      stagePadding: 10,
      stageRadius: 12,
      nextBtnText: 'Continue',
      prevBtnText: 'Back',
      doneBtnText: 'Got it',
      steps: guidedTourSteps,
      onPopoverRender: (popover, { state }) => {
        renderTimelyMateTourChrome(popover, state, totalSteps);
      },
      onHighlightStarted: (element, _step, { state }) => {
        const config = guidedTourSteps[state.activeIndex ?? 0];
        const selector = getStepSelector(config);
        if (!element && selector) {
          void waitForTourTarget(selector, 2500).then(() => {
            scheduleTourRefresh(driverRef.current, 3, 150);
          });
        }
      },
      onNextClick: (_element, _step, { state }) => {
        const driver = driverRef.current;
        if (!driver?.isActive()) return;

        const current = state.activeIndex ?? 0;
        if (current >= guidedTourSteps.length - 1) {
          driver.destroy();
          return;
        }

        void transitionToStep(current + 1);
      },
      onPrevClick: (_element, _step, { state }) => {
        const driver = driverRef.current;
        if (!driver?.isActive()) return;

        const current = state.activeIndex ?? 0;
        if (current <= 0) return;

        void transitionToStep(current - 1);
      },
      onDestroyed: () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        driverRef.current = null;
        navigatingRef.current = false;
      },
    };
  }, [transitionToStep]);

  const createDriverInstance = useCallback(async (): Promise<Driver> => {
    if (!driverFactoryRef.current) {
      driverFactoryRef.current = loadDriverFactory();
    }
    const createDriver = await driverFactoryRef.current;
    return createDriver(buildDriverConfig());
  }, [buildDriverConfig]);

  const startTour = useCallback(
    (options?: { force?: boolean }) => {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
      if (completed && !options?.force) return;

      const run = async () => {
        try {
          destroyDriver();
          const driver = await createDriverInstance();
          driverRef.current = driver;
          driver.drive(0);
        } catch (err) {
          console.error('Guided tour failed to start:', err);
          destroyDriver();
        }
      };

      const begin = () => void run();

      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
        window.setTimeout(begin, 550);
      } else {
        window.setTimeout(begin, 320);
      }
    },
    [createDriverInstance, destroyDriver, location.pathname, navigate]
  );

  const isTourCompleted = useCallback(
    () => localStorage.getItem(TOUR_COMPLETED_KEY) === 'true',
    []
  );

  const resetTourProgress = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_AUTO_START_KEY);
  }, []);

  useEffect(() => {
    const onStartTour = () => startTour({ force: true });
    window.addEventListener('tm:startTour', onStartTour);
    return () => {
      window.removeEventListener('tm:startTour', onStartTour);
      destroyDriver();
    };
  }, [destroyDriver, startTour]);

  const value = useMemo(
    () => ({ startTour, isTourCompleted, resetTourProgress }),
    [startTour, isTourCompleted, resetTourProgress]
  );

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
};
