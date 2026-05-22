import React from 'react';
import { Button, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, HardHat } from 'lucide-react';

const tabs = [
  { label: 'Field Operations', path: '/offsite-work', icon: HardHat },
  { label: 'Incident reports', path: '/offsite-work/incidents', icon: AlertTriangle },
] as const;

export function OffsiteWorkSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
      {tabs.map(({ label, path, icon: Icon }) => {
        const active =
          path === '/offsite-work'
            ? location.pathname === '/offsite-work'
            : location.pathname.startsWith(path);
        return (
          <Button
            key={path}
            size="small"
            onClick={() => navigate(path)}
            startIcon={<Icon size={14} />}
            variant={active ? 'contained' : 'outlined'}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: 2,
              color: active ? '#fff' : 'rgba(255,255,255,0.92)',
              borderColor: active ? 'transparent' : 'rgba(255,255,255,0.35)',
              bgcolor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
              boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              '&:hover': {
                bgcolor: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)',
                borderColor: 'rgba(255,255,255,0.45)',
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
