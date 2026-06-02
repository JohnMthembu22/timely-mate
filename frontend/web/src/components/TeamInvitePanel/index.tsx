import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { UserRole } from '../../types/auth';
import { emailService } from '../../services/emailService';
import { useAppSelector } from '../../store';
import { addTeamInvite, listTeamInvites, removeTeamInvite } from '../../utils/teamInviteStorage';

function buildSignupInviteLink(email: string, organizationName: string, role: UserRole): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    invite: email.trim().toLowerCase(),
    org: organizationName.trim(),
    role,
  });
  return `${base}/signup?${params.toString()}`;
}

const TeamInvitePanel: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const organizationName =
    user?.organizationName?.trim() || user?.name?.trim() || 'Your organization';

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [invites, setInvites] = useState(listTeamInvites);

  const refreshInvites = useCallback(() => {
    setInvites(listTeamInvites());
  }, []);

  const inviteLink = useMemo(() => {
    if (!email.trim()) return '';
    return buildSignupInviteLink(email, organizationName, role);
  }, [email, organizationName, role]);

  const handleCopyLink = async () => {
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Enter an email address first.' });
      return;
    }
    const link = buildSignupInviteLink(email, organizationName, role);
    addTeamInvite({
      email: email.trim().toLowerCase(),
      role,
      organizationName,
      createdBy: user?.email,
    });
    refreshInvites();
    try {
      await navigator.clipboard.writeText(link);
      setFeedback({ type: 'success', message: 'Invite link copied to clipboard.' });
    } catch {
      setFeedback({ type: 'success', message: `Invite link: ${link}` });
    }
  };

  const handleSendEmail = () => {
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Enter an email address first.' });
      return;
    }
    const link = buildSignupInviteLink(email, organizationName, role);
    addTeamInvite({
      email: email.trim().toLowerCase(),
      role,
      organizationName,
      createdBy: user?.email,
    });
    refreshInvites();
    const sent = emailService.sendEmployeeInvitation({
      to: email.trim().toLowerCase(),
      employeeName: email.split('@')[0] || 'Teammate',
      organizationName,
      position: role.replace(/_/g, ' '),
      department: role === 'admin' ? 'Executive' : 'General',
      invitationLink: link,
    });
    setFeedback({
      type: sent ? 'success' : 'error',
      message: sent
        ? 'Your email app should open with the invitation ready to send.'
        : 'Could not open your email client. Copy the link instead.',
    });
  };

  const handleRemove = (id: string) => {
    removeTeamInvite(id);
    refreshInvites();
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Invite team members
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Send a registration link so new teammates can sign up and join {organizationName}. They will
          complete signup with their email pre-filled.
        </Typography>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Teammate email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SendIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="invite-role-label">Role on signup</InputLabel>
            <Select
              labelId="invite-role-label"
              label="Role on signup"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="team_leader">Manager / Team Leader</MenuItem>
              <MenuItem value="admin">Admin / Executive</MenuItem>
            </Select>
          </FormControl>

          {inviteLink && (
            <TextField
              label="Registration link"
              fullWidth
              value={inviteLink}
              InputProps={{ readOnly: true }}
              size="small"
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => void handleCopyLink()}>
              Copy invite link
            </Button>
            <Button variant="outlined" startIcon={<SendIcon />} onClick={handleSendEmail}>
              Send via email
            </Button>
          </Stack>
        </Stack>

        {invites.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Pending invitations
            </Typography>
            <Stack spacing={1}>
              {invites.slice(0, 8).map((inv) => (
                <Stack
                  key={inv.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {inv.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inv.role.replace(/_/g, ' ')} · {new Date(inv.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Copy link again">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const link = buildSignupInviteLink(inv.email, inv.organizationName, inv.role);
                          void navigator.clipboard.writeText(link);
                          setFeedback({ type: 'success', message: 'Link copied.' });
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => handleRemove(inv.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamInvitePanel;
