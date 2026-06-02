import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import type { Config, Driver } from 'driver.js';
import {
  TOUR_AUTO_START_KEY,
  TOUR_COMPLETED_KEY,
  getTourAutoStartKey,
  getTourCompletedKey,
  type TourStep,
} from '../config/guidedTour';
import { renderTimelyMateTourChrome } from '../utils/guidedTourPopover';
import { setTourNavHandlers } from '../utils/guidedTourActions';
import {
  getStepSelector,
  prepareTourStep,
  scheduleTourRefresh,
  waitForTourTarget,
} from '../utils/guidedTourDriver';
import { resolveGuidedTourSteps } from '../utils/guidedTourSteps';
import { useAppSelector } from '../store';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const driverRef = useRef<Driver | null>(null);
  const driverFactoryRef = useRef<Awaited<ReturnType<typeof loadDriverFactory>> | null>(null);
  const activeStepsRef = useRef<TourStep[]>(resolveGuidedTourSteps(false));
  const stepTransitionLockRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const prevAuthRef = useRef<boolean>(false);
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
    const driver = driverRef.current;
    if (!driver?.isActive()) return;

    const steps = activeStepsRef.current;
    const step = steps[targetIndex];
    if (!step) {
      driver.destroy();
      return;
    }

    if (stepTransitionLockRef.current === targetIndex) return;
    stepTransitionLockRef.current = targetIndex;

    try {
      await prepareTourStep(step, navigateRef.current);
      if (!driver.isActive()) return;
      activeIndexRef.current = targetIndex;
      driver.moveTo(targetIndex);
      scheduleTourRefresh(driver, 3, 100);
    } catch {
      /* allow retry on next click */
    } finally {
      if (stepTransitionLockRef.current === targetIndex) {
        stepTransitionLockRef.current = null;
      }
    }
  }, []);

  const handleTourDone = useCallback(() => {
    stepTransitionLockRef.current = null;
    const driver = driverRef.current;
    if (!driver?.isActive()) return;
    driver.destroy();
  }, []);

  const handleTourNext = useCallback(() => {
    const driver = driverRef.current;
    if (!driver?.isActive()) return;

    const current = activeIndexRef.current;
    const steps = activeStepsRef.current;
    if (current + 1 >= steps.length) {
      handleTourDone();
      return;
    }
    void transitionToStep(current + 1);
  }, [transitionToStep, handleTourDone]);

  const handleTourPrev = useCallback(() => {
    const driver = driverRef.current;
    if (!driver?.isActive()) return;

    const current = activeIndexRef.current;
    if (current <= 0) return;
    void transitionToStep(current - 1);
  }, [transitionToStep]);

  useEffect(() => {
    setTourNavHandlers({ onNext: handleTourNext, onPrev: handleTourPrev, onDone: handleTourDone });
    return () => setTourNavHandlers(null);
  }, [handleTourNext, handleTourPrev, handleTourDone]);

  const buildDriverConfig = useCallback((): Config => {
    const steps = resolveGuidedTourSteps(isMobile);
    activeStepsRef.current = steps;
    const totalSteps = steps.length;

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
      steps,
      onPopoverRender: (popover, { state }) => {
        activeIndexRef.current = state.activeIndex ?? 0;
        renderTimelyMateTourChrome(popover, state, totalSteps);
      },
      onHighlightStarted: (element, _step, { state }) => {
        const config = steps[state.activeIndex ?? 0];
        const selector = getStepSelector(config);
        if (!element && selector) {
          void waitForTourTarget(selector, 2500).then(() => {
            scheduleTourRefresh(driverRef.current, 3, 150);
          });
        }
      },
      onDestroyed: () => {
        localStorage.setItem(getTourCompletedKey(user?.id), 'true');
        driverRef.current = null;
        stepTransitionLockRef.current = null;
      },
    };
  }, [isMobile, user?.id]);

  const createDriverInstance = useCallback(async (): Promise<Driver> => {
    if (!driverFactoryRef.current) {
      driverFactoryRef.current = loadDriverFactory();
    }
    const createDriver = await driverFactoryRef.current;
    return createDriver(buildDriverConfig());
  }, [buildDriverConfig]);

  const startTour = useCallback(
    (options?: { force?: boolean }) => {
      const completed = localStorage.getItem(getTourCompletedKey(user?.id)) === 'true';
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
    [createDriverInstance, destroyDriver, location.pathname, navigate, user?.id]
  );

  const isTourCompleted = useCallback(
    () => localStorage.getItem(getTourCompletedKey(user?.id)) === 'true',
    [user?.id]
  );

  const resetTourProgress = useCallback(() => {
    localStorage.removeItem(getTourCompletedKey(user?.id));
    localStorage.removeItem(getTourAutoStartKey(user?.id));
  }, [user?.id]);

  // Auto-start once, on the first successful sign-in for this user.
  useEffect(() => {
    const wasAuthed = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (!user?.id) return;
    if (wasAuthed || !isAuthenticated) return;

    const autoKey = getTourAutoStartKey(user.id);
    const completedKey = getTourCompletedKey(user.id);
    const autoStarted = localStorage.getItem(autoKey) === 'true';
    const completed = localStorage.getItem(completedKey) === 'true';
    if (autoStarted || completed) return;

    localStorage.setItem(autoKey, 'true');
    const timer = window.setTimeout(() => startTour(), 900);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, startTour, user?.id]);

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
