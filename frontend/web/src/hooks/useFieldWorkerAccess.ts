import { useMemo } from 'react';
import { useAppSelector } from '../store';
import { useEmployees } from '../contexts/EmployeeContext';
import { isOffsiteWorker } from '../utils/offsiteWorkers';

/** Whether the signed-in user is a field / offsite worker (from roster or operations dept). */
export function useFieldWorkerAccess(): boolean {
  const { user } = useAppSelector((state) => state.auth);
  const { employees } = useEmployees();

  return useMemo(() => {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    if (email) {
      const match = employees.find((e) => e.email?.toLowerCase() === email);
      if (match) return isOffsiteWorker(match);
    }
    return user.department === 'operations';
  }, [user, employees]);
}
