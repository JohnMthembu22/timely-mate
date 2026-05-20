import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Search,
  UserPlus,
  MoreVertical,
  X,
  Briefcase,
  Clock,
  Activity,
  TrendingUp,
} from 'lucide-react';

export type TeamMemberStatusLabel = 'Active Live' | 'On Break' | 'Offline';

export interface TeamDirectoryRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  email: string;
  performance: number;
  utilization: number;
  hoursLogged: string;
  status: TeamMemberStatusLabel;
  initials: string;
  avatarColor: string;
}

export interface TeamDirectoryConsoleProps {
  members: TeamDirectoryRow[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
  onInvite: () => void;
  onModifyAllocation?: (memberId: string) => void;
  onViewAudit?: (memberId: string) => void;
  onMemberMenu?: (event: React.MouseEvent<HTMLElement>, memberId: string) => void;
}

const statusStyles: Record<
  TeamMemberStatusLabel,
  { bg: string; color: string; border: string }
> = {
  'Active Live': { bg: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' },
  'On Break': { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
  Offline: { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
};

const TeamDirectoryConsole: React.FC<TeamDirectoryConsoleProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onInvite,
  onModifyAllocation,
  onViewAudit,
  onMemberMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.dept.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Action bar */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #f1f5f9',
          bgcolor: 'rgba(248, 250, 252, 0.4)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Quick search team directory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: 2,
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1 },
            },
          }}
        />
        <Button
          variant="contained"
          disableElevation
          startIcon={<UserPlus size={14} />}
          onClick={onInvite}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 2,
            py: 1,
            px: 2,
            bgcolor: '#0f172a',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          Invite Team Member
        </Button>
      </Box>

      {/* Split workspace — table and profile panel sit side by side (no overlay) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          minHeight: 500,
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: 'auto',
            order: { xs: 1, md: 0 },
          }}
        >
          <Table size="small" sx={{ width: '100%' }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: '#fff',
                  '& th': {
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid #f1f5f9',
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ pl: 2.5 }}>Team Member</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Core Performance</TableCell>
                <TableCell align="center">Utilization</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right" sx={{ pr: 2 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {members.length === 0
                        ? 'No team members yet. Invite someone to get started.'
                        : 'No members match your search.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  const pill = statusStyles[member.status];
                  return (
                    <TableRow
                      key={member.id}
                      hover
                      onClick={() => onSelectMember(member.id)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                        '&:hover': {
                          bgcolor: isSelected
                            ? 'rgba(59, 130, 246, 0.08)'
                            : 'rgba(248, 250, 252, 0.5)',
                        },
                        '& td': {
                          fontSize: '0.75rem',
                          borderBottom: '1px solid #f8fafc',
                          py: 1.25,
                        },
                        '&:hover .row-menu': { opacity: 1 },
                      }}
                    >
                      <TableCell sx={{ pl: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: member.avatarColor,
                              color: '#fff',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 2px rgba(15,23,42,0.1)',
                              flexShrink: 0,
                            }}
                          >
                            {member.initials}
                          </Box>
                          <Box>
                            <Typography
                              sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}
                            >
                              {member.name}
                            </Typography>
                            <Typography
                              sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 500, mt: 0.25 }}
                            >
                              {member.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.25,
                            fontSize: '0.625rem',
                            fontWeight: 500,
                            bgcolor: '#f1f5f9',
                            border: '1px solid rgba(226, 232, 240, 0.4)',
                            color: '#475569',
                            borderRadius: 1,
                          }}
                        >
                          {member.dept}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: member.performance >= 85 ? '#059669' : '#334155',
                              fontSize: '0.75rem',
                            }}
                          >
                            {member.performance}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={member.performance}
                            sx={{
                              width: 64,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: '#f1f5f9',
                              display: { xs: 'none', sm: 'block' },
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                bgcolor: member.performance >= 85 ? '#10b981' : '#94a3b8',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.75rem' }}>
                          {member.utilization}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            borderRadius: 0.5,
                            border: '1px solid',
                            bgcolor: pill.bg,
                            color: pill.color,
                            borderColor: pill.border,
                          }}
                        >
                          {member.status}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <IconButton
                          size="small"
                          className="row-menu"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMemberMenu?.(e, member.id);
                          }}
                          sx={{
                            opacity: 0,
                            color: '#94a3b8',
                            transition: 'opacity 120ms ease',
                            '&:hover': { color: '#475569', bgcolor: 'rgba(148, 163, 184, 0.12)' },
                          }}
                        >
                          <MoreVertical size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Work Profile panel — shares row with table on md+, stacks below on mobile */}
        {selectedMember && (
          <Paper
            elevation={0}
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 384 },
              maxWidth: '100%',
              order: { xs: 2, md: 1 },
              borderLeft: { xs: 'none', md: '1px solid #f1f5f9' },
              borderTop: { xs: '1px solid #f1f5f9', md: 'none' },
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: 'auto', md: 500 },
              boxShadow: { xs: 'none', md: 'inset 8px 0 24px -16px rgba(15, 23, 42, 0.06)' },
            }}
          >
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid #f1f5f9',
                  bgcolor: 'rgba(248, 250, 252, 0.5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Work Profile Overview
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onSelectMember(null)}
                  sx={{ color: '#94a3b8' }}
                >
                  <X size={16} />
                </IconButton>
              </Box>

              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: selectedMember.avatarColor,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    {selectedMember.initials}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>
                      {selectedMember.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                      {selectedMember.role}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        color: '#94a3b8',
                        mt: 0.5,
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedMember.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ borderTop: '1px solid #f1f5f9', pt: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      mb: 2,
                    }}
                  >
                    Operational Analytics
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(248, 250, 252, 0.8)',
                          border: '1px solid rgba(241, 245, 249, 0.6)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <TrendingUp size={12} /> Performance
                        </Typography>
                        <Typography
                          sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', mt: 0.5 }}
                        >
                          {selectedMember.performance}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(248, 250, 252, 0.8)',
                          border: '1px solid rgba(241, 245, 249, 0.6)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Activity size={12} /> Utilization
                        </Typography>
                        <Typography
                          sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', mt: 0.5 }}
                        >
                          {selectedMember.utilization}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: 'rgba(248, 250, 252, 0.3)',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                        <Clock size={14} />
                        Logged This Period
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {selectedMember.hoursLogged}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: 'rgba(248, 250, 252, 0.3)',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                        <Briefcase size={14} />
                        Department Squad
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: '#334155',
                          bgcolor: '#f1f5f9',
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.625rem',
                        }}
                      >
                        {selectedMember.dept}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                p: 2,
                borderTop: '1px solid #f1f5f9',
                bgcolor: 'rgba(248, 250, 252, 0.4)',
                display: 'flex',
                gap: 1,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onModifyAllocation?.(selectedMember.id)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  bgcolor: '#fff',
                }}
              >
                Modify Allocation
              </Button>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                onClick={() => onViewAudit?.(selectedMember.id)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                View Deep Audit
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Paper>
  );
};

export default TeamDirectoryConsole;
