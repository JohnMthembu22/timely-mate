import React, { memo, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined';

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

type StatusBarCountdownProps = {
  isClockedIn: boolean;
  startTime: number;
  onClick: () => void;
  sx?: object;
};

/** Isolated 1s timer so the rest of the status bar does not re-render every second. */
const StatusBarCountdown: React.FC<StatusBarCountdownProps> = memo(function StatusBarCountdown({
  isClockedIn,
  startTime,
  onClick,
  sx,
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const { countdown, isLowTime } = useMemo(() => {
    if (!isClockedIn) {
      return { countdown: '08:00:00', isLowTime: false };
    }
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, 8 * 60 * 60 * 1000 - elapsedMs);
    return {
      countdown: formatCountdown(remainingMs),
      isLowTime: remainingMs <= 60 * 60 * 1000,
    };
  }, [isClockedIn, now, startTime]);

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      sx={{
        borderRadius: 12,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'white',
        cursor: 'pointer',
        ...sx,
      }}
    >
      <WatchLaterOutlined sx={{ color: isLowTime ? '#ff5a52' : 'white', opacity: 0.9, fontSize: 18 }} />
      <Typography
        variant="subtitle1"
        sx={{
          color: isLowTime ? '#ff5a52' : 'white',
          letterSpacing: { xs: 1, md: 2 },
          fontWeight: 700,
          fontSize: { xs: '0.75rem', md: '1rem' },
        }}
      >
        {countdown}
      </Typography>
    </Box>
  );
});

export default StatusBarCountdown;
