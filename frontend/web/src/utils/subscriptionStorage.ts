const SUBSCRIPTION_STORAGE_KEY = 'timelymate_subscription';

export type StoredSubscription = {
  planId: string;
  employeeCount?: number;
  updatedAt?: string;
};

export function readStoredSubscription(): StoredSubscription | null {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSubscription;
    if (!parsed?.planId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredSubscription(data: StoredSubscription): void {
  try {
    localStorage.setItem(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify({ ...data, updatedAt: new Date().toISOString() })
    );
  } catch {
    /* ignore quota errors */
  }
}

export function readStoredEmployeeCount(): number {
  try {
    const raw = localStorage.getItem('timelymate_employees');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}
