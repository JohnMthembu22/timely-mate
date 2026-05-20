import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Driver } from 'driver.js';
import {
  guidedTourSteps,
  TOUR_AUTO_START_KEY,
  TOUR_COMPLETED_KEY,
} from '../config/guidedTour';

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

async function loadDriverModule() {
  await import('driver.js/dist/driver.css');
  const mod = await import('driver.js');
  return mod.driver;
}

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverRef = useRef<Driver | null>(null);
  const driverLoaderRef = useRef<ReturnType<typeof loadDriverModule> | null>(null);

  const ensureDriver = useCallback(async () => {
    if (driverRef.current) return driverRef.current;

    if (!driverLoaderRef.current) {
      driverLoaderRef.current = loadDriverModule();
    }
    const createDriver = await driverLoaderRef.current;

    driverRef.current = createDriver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.65,
      stagePadding: 8,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Finish',
      steps: guidedTourSteps,
      onHighlightStarted: (_el, _step, { state }) => {
        const config = guidedTourSteps[state.activeIndex];
        if (config?.route && window.location.pathname !== config.route) {
          navigate(config.route);
          window.setTimeout(() => driverRef.current?.refresh(), 350);
        }
      },
      onDestroyed: () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      },
    });

    return driverRef.current;
  }, [navigate]);

  const startTour = useCallback(
    (options?: { force?: boolean }) => {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
      if (completed && !options?.force) return;

      const run = async () => {
        try {
          const d = await ensureDriver();
          d.drive();
        } catch (err) {
          console.error('Guided tour failed to start:', err);
        }
      };

      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
        window.setTimeout(() => void run(), 400);
      } else {
        window.setTimeout(() => void run(), 200);
      }
    },
    [ensureDriver, location.pathname, navigate]
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
    return () => window.removeEventListener('tm:startTour', onStartTour);
  }, [startTour]);

  const value = useMemo(
    () => ({ startTour, isTourCompleted, resetTourProgress }),
    [startTour, isTourCompleted, resetTourProgress]
  );

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
};
