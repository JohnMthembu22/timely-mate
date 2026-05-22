import { useEffect, useState } from 'react';

function formatElapsedMs(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Isolated 1s timer — keeps parent trees from re-rendering on every tick. */
export function useElapsedTimer(
  isActive: boolean,
  startIso: string | null,
  baseMs = 0
): string {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!isActive || !startIso) {
      setElapsed('00:00:00');
      return;
    }

    const start = new Date(startIso);
    const tick = () => {
      setElapsed(formatElapsedMs(baseMs + (Date.now() - start.getTime())));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isActive, startIso, baseMs]);

  return elapsed;
}
