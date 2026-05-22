import React, { useEffect, useState } from 'react';
import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { shimmerKeyframes } from './projectsConsoleStyles';

export function AnimatedProgressBar({
  value,
  color,
  height = 6,
  warningAt = 90,
  sx,
}: {
  value: number;
  color: string;
  height?: number;
  warningAt?: number;
  sx?: SxProps<Theme>;
}) {
  const [width, setWidth] = useState(0);
  const hot = value >= warningAt;

  useEffect(() => {
    const t = requestAnimationFrame(() => setWidth(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(t);
  }, [value]);

  return (
    <Box
      sx={{
        height,
        borderRadius: 99,
        bgcolor: '#eef2f7',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 1px rgba(15,23,42,0.04)',
        ...sx,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${width}%`,
          borderRadius: 99,
          transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: hot
            ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
            : `linear-gradient(90deg, ${color}, ${alpha(color, 0.55)})`,
          boxShadow: hot ? `0 0 12px ${alpha('#ef4444', 0.35)}` : `0 0 10px ${alpha(color, 0.2)}`,
        }}
      />
    </Box>
  );
}

export function ShimmerBlock({
  height,
  width = '100%',
  radius = 1.5,
}: {
  height: number | string;
  width?: number | string;
  radius?: number;
}) {
  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e8edf4 40%, #f8fafc 60%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'console-shimmer 1.4s ease-in-out infinite',
        ...shimmerKeyframes,
      }}
    />
  );
}

const splitLayoutSkeletonSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' },
  gap: 1.5,
};

export function ConsoleLoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', xl: 'repeat(4,1fr)' },
          gap: 1.25,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
      <Box sx={splitLayoutSkeletonSx}>
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
        <StackSkeleton />
      </Box>
    </Box>
  );
}

function StackSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2.5 }} />
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2.5 }} />
    </Box>
  );
}

export function LiveIndicator({ label = 'Live' }: { label?: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: '0.5625rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#64748b',
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: '#10b981',
          boxShadow: '0 0 8px rgba(16,185,129,0.45)',
          animation: 'console-live-pulse 2.2s ease-in-out infinite',
          '@keyframes console-live-pulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.45, transform: 'scale(1.2)' },
          },
        }}
      />
      {label}
    </Box>
  );
}
