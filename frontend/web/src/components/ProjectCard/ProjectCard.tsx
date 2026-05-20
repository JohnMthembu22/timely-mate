import React from 'react';
import { Box, IconButton, Typography, LinearProgress } from '@mui/material';
import { Briefcase, MoreVertical, Calendar } from 'lucide-react';

export interface ProjectCardProps {
  title: string;
  department: string;
  progress: number;
  dueDate: string;
  teamSize: number;
  onCardClick?: () => void;
  onMenuClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const SURFACE = {
  bgcolor: '#fff',
  border: '1px solid #f1f5f9',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
} as const;

/** Workspace / project tile — Tailwind-style spec implemented with MUI. */
export function ProjectCard({
  title,
  department,
  progress,
  dueDate,
  teamSize,
  onCardClick,
  onMenuClick,
}: ProjectCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onCardClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick();
    }
  };

  return (
    <Box
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      sx={{
        ...SURFACE,
        p: 2.5,
        minHeight: 192,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onCardClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        outline: 'none',
        '&:hover': onCardClick
          ? {
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
              borderColor: '#e2e8f0',
            }
          : {},
        '&:focus-visible': onCardClick
          ? {
              boxShadow: '0 0 0 2px #fff, 0 0 0 4px #3b82f6',
              borderColor: '#93c5fd',
            }
          : {},
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                color: '#475569',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <Briefcase size={20} strokeWidth={2} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#1e293b',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                {department}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.(e);
            }}
            sx={{ color: '#94a3b8', '&:hover': { color: '#475569', bgcolor: '#f8fafc' } }}
            aria-label="More actions"
          >
            <MoreVertical size={16} strokeWidth={2} />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Progress</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f8fafc',
          pt: 1.5,
          mt: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Calendar size={14} strokeWidth={2} color="#94a3b8" />
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{dueDate}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: '#f8fafc',
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            border: '1px solid rgba(241, 245, 249, 0.9)',
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{teamSize}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>allocated</Typography>
        </Box>
      </Box>
    </Box>
  );
}
