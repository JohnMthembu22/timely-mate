import { useEffect, useState } from 'react';

export function useAnimatedNumber(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = value;
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate toward new target only
  }, [target, durationMs]);

  return value;
}
