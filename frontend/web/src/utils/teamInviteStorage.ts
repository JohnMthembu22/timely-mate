import type { UserRole } from '../types/auth';

export type TeamInviteRecord = {
  id: string;
  email: string;
  role: UserRole;
  organizationName: string;
  createdAt: string;
  createdBy?: string;
};

const STORAGE_KEY = 'tm_team_invites';

function readAll(): TeamInviteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeamInviteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(invites: TeamInviteRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

export function listTeamInvites(): TeamInviteRecord[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addTeamInvite(
  invite: Omit<TeamInviteRecord, 'id' | 'createdAt'>
): TeamInviteRecord {
  const record: TeamInviteRecord = {
    ...invite,
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...readAll().filter((i) => i.email.toLowerCase() !== invite.email.toLowerCase())];
  writeAll(next);
  return record;
}

export function removeTeamInvite(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
}

export function findInviteByEmail(email: string): TeamInviteRecord | undefined {
  return readAll().find((i) => i.email.toLowerCase() === email.trim().toLowerCase());
}
